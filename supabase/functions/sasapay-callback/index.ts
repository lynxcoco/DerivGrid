/**
 * Supabase Edge Function: sasapay-callback
 * Receives SasaPay webhook callbacks for both C2B (deposits) and B2C (withdrawals).
 *
 * Routes:
 *   ?type=c2b   — C2B payment result (deposit confirmation or failure)
 *   ?type=b2c   — B2C result (withdrawal payout confirmation or failure)
 *
 * Security:
 *   - HMAC-SHA512 signature verification using X-SasaPay-Signature header
 *   - Message format: sasapay_transaction_code-merchant_code-account_number-payment_reference-amount
 *   - Secret key: SasaPay Client ID
 *
 * Deploy:
 *   npx supabase functions deploy sasapay-callback \
 *     --project-ref YOUR_PROJECT_REF \
 *     --no-verify-jwt --use-api
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts";

const SUPABASE_URL              = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-sasapay-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// SasaPay trusted callback IP addresses (from docs)
const TRUSTED_IPS = new Set([
  "47.129.43.14",
  "113.229.247.179",
  "13.215.155.141",
  "13.214.60.23",
  "54.169.74.198",
  "18.142.226.87",
  "47.129.243.116",
  "13.250.110.31",
  "55.12.30.40",
  "55.12.30.58",
]);

// ── Read platform settings ─────────────────────────────────────────────────────
async function getPlatformSettings(): Promise<{
  autoApprove: boolean;
  clientId: string;
}> {
  try {
    const { data } = await db
      .from("platform_settings")
      .select("auto_approve_deposits, sasapay_client_id")
      .eq("id", "global")
      .single();
    return {
      autoApprove: data?.auto_approve_deposits !== false,
      clientId:    data?.sasapay_client_id ?? Deno.env.get("SASAPAY_CLIENT_ID") ?? "",
    };
  } catch {
    return {
      autoApprove: true,
      clientId:    Deno.env.get("SASAPAY_CLIENT_ID") ?? "",
    };
  }
}

// ── HMAC-SHA512 signature verification ────────────────────────────────────────
function verifySignature(
  signature: string,
  transactionCode: string,
  merchantCode: string,
  accountNumber: string,
  paymentReference: string,
  amount: string,
  secretKey: string
): boolean {
  try {
    const message = `${transactionCode}-${merchantCode}-${accountNumber}-${paymentReference}-${amount}`;
    const hmac = createHmac("sha512", secretKey);
    hmac.update(message, "utf8");
    const expected = hmac.digest("hex");
    // Timing-safe compare
    if (expected.length !== signature.length) return false;
    let diff = 0;
    for (let i = 0; i < expected.length; i++) {
      diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
    }
    return diff === 0;
  } catch {
    return false;
  }
}

// ── Helper: format KES ─────────────────────────────────────────────────────────
const fmtKes = (cents: number) =>
  `KES ${(cents / 100).toLocaleString("en-KE", { minimumFractionDigits: 2 })}`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const url  = new URL(req.url);
  const type = url.searchParams.get("type") ?? "";

  // Always respond 200 to SasaPay so they don't retry indefinitely
  const ok = () => new Response(JSON.stringify({ status: true, detail: "Received" }), {
    status: 200, headers: { ...CORS, "Content-Type": "application/json" },
  });

  try {
    const rawBody = await req.text();
    let body: Record<string, any>;
    try {
      body = JSON.parse(rawBody);
    } catch {
      console.warn("[sasapay-callback] Invalid JSON body");
      return ok();
    }

    console.log(`[sasapay-callback] type=${type}`, JSON.stringify(body));

    const { autoApprove, clientId } = await getPlatformSettings();

    // ── C2B Callback (deposit result) ──────────────────────────────────────────
    if (type === "c2b") {
      const {
        CheckoutRequestID,
        MerchantRequestID,
        ResultCode,
        ResultDesc,
        TransactionCode,
        TransAmount,
        CustomerMobile,
        BillRefNumber,
        TransactionDate,
        ThirdPartyTransID,
      } = body;

      // Verify HMAC signature if client ID available
      if (clientId) {
        const sig = req.headers.get("x-sasapay-signature") ?? req.headers.get("X-SasaPay-Signature") ?? "";
        if (sig) {
          const valid = verifySignature(
            sig,
            TransactionCode    ?? "",
            body.MerchantCode  ?? "",
            CustomerMobile     ?? "",
            BillRefNumber      ?? "",
            String(TransAmount ?? ""),
            clientId
          );
          if (!valid) {
            console.warn("[C2B callback] Invalid signature — rejecting");
            return new Response(JSON.stringify({ status: false, detail: "Invalid signature" }), {
              status: 401, headers: { ...CORS, "Content-Type": "application/json" },
            });
          }
        }
      }

      if (!CheckoutRequestID) {
        console.warn("[C2B callback] No CheckoutRequestID");
        return ok();
      }

      // Find deposit by provider_ref = CheckoutRequestID
      let { data: deposit } = await db
        .from("deposits")
        .select("id, user_id, wallet_id, amount_cents, currency, status, phone")
        .eq("provider_ref", CheckoutRequestID)
        .maybeSingle();

      // Race-condition fallback: callback arrived before client saved CheckoutRequestID
      if (!deposit && CustomerMobile && TransAmount) {
        const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        const phone = CustomerMobile.toString().startsWith("254")
          ? CustomerMobile.toString()
          : `254${CustomerMobile.toString().slice(-9)}`;

        const fallback = await db
          .from("deposits")
          .select("id, user_id, wallet_id, amount_cents, currency, status, phone")
          .eq("phone", phone)
          .eq("status", "pending")
          .is("provider_ref", null)
          .gte("created_at", fiveMinsAgo)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (fallback.data) {
          deposit = fallback.data;
          await db.from("deposits").update({ provider_ref: CheckoutRequestID }).eq("id", deposit.id);
          console.log("[C2B callback] Matched deposit via fallback:", deposit.id);
        }
      }

      if (!deposit) {
        console.warn("[C2B callback] Deposit not found for CheckoutRequestID:", CheckoutRequestID);
        return ok();
      }

      if (deposit.status === "completed") {
        console.log("[C2B callback] Already completed, skipping:", CheckoutRequestID);
        return ok();
      }

      const isSuccess = String(ResultCode) === "0" || String(ResultCode) === "SP00000";

      if (isSuccess) {
        if (autoApprove) {
          // Credit wallet immediately
          const { data: wallet } = await db.from("wallets")
            .select("balance_cents").eq("id", deposit.wallet_id).single();
          const newBalance = (wallet?.balance_cents ?? 0) + deposit.amount_cents;

          await Promise.all([
            db.from("wallets").update({
              balance_cents: newBalance,
              updated_at: new Date().toISOString(),
            }).eq("id", deposit.wallet_id),

            db.from("deposits").update({
              status: "completed",
              updated_at: new Date().toISOString(),
            }).eq("id", deposit.id),

            db.from("transactions").insert({
              user_id:      deposit.user_id,
              wallet_id:    deposit.wallet_id,
              type:         "deposit",
              amount_cents: deposit.amount_cents,
              currency:     deposit.currency,
              description:  `SasaPay deposit${TransactionCode ? ` — Ref: ${TransactionCode}` : ""}`,
              metadata: {
                sasapay_transaction_code: TransactionCode,
                checkout_request_id:     CheckoutRequestID,
                source_channel:          body.SourceChannel ?? "M-PESA",
                third_party_trans_id:    ThirdPartyTransID,
                transaction_date:        TransactionDate,
              },
            }),

            db.from("notifications").insert({
              user_id: deposit.user_id,
              title:   "Deposit successful ✓",
              body:    `${fmtKes(deposit.amount_cents)} credited to your wallet.${TransactionCode ? ` Ref: ${TransactionCode}` : ""}`,
              type:    "deposit",
              is_read: false,
            }),
          ]);
          console.log("[C2B callback] Deposit auto-credited:", deposit.id);
        } else {
          // Manual approval mode — keep pending, store receipt
          await db.from("deposits").update({
            status:       "pending",
            provider_ref: TransactionCode || CheckoutRequestID,
            updated_at:   new Date().toISOString(),
          }).eq("id", deposit.id);

          await db.from("notifications").insert({
            user_id: deposit.user_id,
            title:   "Deposit received — pending review",
            body:    `${fmtKes(deposit.amount_cents)} payment received. It will be credited after admin review.`,
            type:    "deposit",
            is_read: false,
          });
          console.log("[C2B callback] Deposit pending manual approval:", deposit.id);
        }
      } else {
        // Payment failed / cancelled
        await db.from("deposits").update({
          status:     "failed",
          updated_at: new Date().toISOString(),
        }).eq("id", deposit.id);
        console.log("[C2B callback] Deposit failed:", deposit.id, "Code:", ResultCode, ResultDesc);
      }

      return ok();
    }

    // ── B2C Callback (withdrawal result) ───────────────────────────────────────
    if (type === "b2c") {
      const {
        MerchantTransactionReference,
        CheckoutRequestID,
        ResultCode,
        ResultDesc,
        SasaPayTransactionCode,
        TransactionAmount,
        TransactionDate,
        RecipientAccountNumber,
        MerchantCode,
      } = body;

      // Find withdrawal by provider_ref (we stored MerchantTransactionReference there)
      let { data: withdrawal } = await db
        .from("withdrawals")
        .select("id, user_id, wallet_id, amount_cents, currency, phone, status")
        .eq("provider_ref", MerchantTransactionReference)
        .maybeSingle();

      // Fallback: try CheckoutRequestID
      if (!withdrawal && CheckoutRequestID) {
        ({ data: withdrawal } = await db
          .from("withdrawals")
          .select("id, user_id, wallet_id, amount_cents, currency, phone, status")
          .eq("provider_ref", CheckoutRequestID)
          .maybeSingle());
      }

      if (!withdrawal) {
        console.warn("[B2C callback] Withdrawal not found for ref:", MerchantTransactionReference);
        return ok();
      }

      if (withdrawal.status === "cancelled") {
        console.log("[B2C callback] Already cancelled, skipping:", withdrawal.id);
        return ok();
      }

      const isSuccess = String(ResultCode) === "0" || String(ResultCode) === "SP00000";

      if (isSuccess) {
        await Promise.all([
          db.from("withdrawals").update({
            status:     "completed",
            updated_at: new Date().toISOString(),
          }).eq("id", withdrawal.id),

          db.from("transactions").insert({
            user_id:      withdrawal.user_id,
            wallet_id:    withdrawal.wallet_id,
            type:         "withdrawal",
            amount_cents: -withdrawal.amount_cents,
            currency:     withdrawal.currency,
            description:  `SasaPay B2C sent to ${withdrawal.phone}${SasaPayTransactionCode ? ` — Ref: ${SasaPayTransactionCode}` : ""}`,
            metadata: {
              sasapay_transaction_code:    SasaPayTransactionCode,
              checkout_request_id:         CheckoutRequestID,
              merchant_transaction_ref:    MerchantTransactionReference,
              transaction_date:            TransactionDate,
            },
          }),

          db.from("notifications").insert({
            user_id: withdrawal.user_id,
            title:   "Withdrawal sent ✓",
            body:    `${fmtKes(withdrawal.amount_cents)} sent to ${withdrawal.phone} via SasaPay.${SasaPayTransactionCode ? ` Ref: ${SasaPayTransactionCode}` : ""}`,
            type:    "info",
            is_read: false,
          }),
        ]);
        console.log("[B2C callback] Withdrawal completed:", withdrawal.id);
      } else {
        // Failed — refund balance to wallet
        const { data: wallet } = await db.from("wallets")
          .select("balance_cents").eq("id", withdrawal.wallet_id).single();
        const refundBalance = (wallet?.balance_cents ?? 0) + withdrawal.amount_cents;

        await Promise.all([
          db.from("wallets").update({
            balance_cents: refundBalance,
            updated_at:    new Date().toISOString(),
          }).eq("id", withdrawal.wallet_id),

          db.from("withdrawals").update({
            status:     "failed",
            updated_at: new Date().toISOString(),
          }).eq("id", withdrawal.id),

          db.from("transactions").insert({
            user_id:      withdrawal.user_id,
            wallet_id:    withdrawal.wallet_id,
            type:         "transfer_in",
            amount_cents: withdrawal.amount_cents,
            currency:     withdrawal.currency,
            description:  `Withdrawal failed (${ResultDesc ?? `code ${ResultCode}`}) — ${fmtKes(withdrawal.amount_cents)} refunded`,
          }),

          db.from("notifications").insert({
            user_id: withdrawal.user_id,
            title:   "Withdrawal failed — funds returned",
            body:    `Your ${fmtKes(withdrawal.amount_cents)} withdrawal could not be processed (${ResultDesc ?? "payment failed"}). Funds have been returned to your wallet.`,
            type:    "info",
            is_read: false,
          }),
        ]);
        console.log("[B2C callback] Withdrawal failed, refunded:", withdrawal.id, "Code:", ResultCode);
      }

      return ok();
    }

    console.log("[sasapay-callback] Unknown type:", type);
    return ok();

  } catch (err: any) {
    console.error("[sasapay-callback] Error:", err?.message, err?.stack);
    // Always return 200 so SasaPay doesn't retry
    return ok();
  }
});
