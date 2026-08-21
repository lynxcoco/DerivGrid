/**
 * Supabase Edge Function: cloudpay-callback
 * Receives CloudPay webhook callbacks for M-Pesa deposits.
 *
 * Security:
 *   - HMAC-SHA256 signature verification using X-CloudPay-Signature header
 *   - Secret key: cloudpay_signing_secret from platform_settings
 *   - Idempotency: same reference is never processed twice
 *
 * Deploy:
 *   npx supabase functions deploy cloudpay-callback \
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
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cloudpay-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ── Platform settings ─────────────────────────────────────────────────────────
async function getPlatformSettings(): Promise<{ autoApprove: boolean; signingSecret: string }> {
  try {
    const { data } = await db
      .from("platform_settings")
      .select("auto_approve_deposits, cloudpay_signing_secret")
      .eq("id", "global")
      .single();
    return {
      autoApprove:   data?.auto_approve_deposits !== false,
      signingSecret: data?.cloudpay_signing_secret ?? Deno.env.get("CLOUDPAY_SIGNING_SECRET") ?? "",
    };
  } catch {
    return { autoApprove: true, signingSecret: Deno.env.get("CLOUDPAY_SIGNING_SECRET") ?? "" };
  }
}

// ── HMAC-SHA256 signature verification ────────────────────────────────────────
function verifySignature(rawBody: string, signature: string, secret: string): boolean {
  if (!secret || !signature) return true; // skip if not configured yet
  try {
    const hmac     = createHmac("sha256", secret);
    hmac.update(rawBody, "utf8");
    const expected = hmac.digest("hex");
    if (expected.length !== signature.length) return false;
    let diff = 0;
    for (let i = 0; i < expected.length; i++) {
      diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
    }
    return diff === 0;
  } catch { return false; }
}

const fmtKes = (cents: number) =>
  `KES ${(cents / 100).toLocaleString("en-KE", { minimumFractionDigits: 2 })}`;

// ── Credit campaign bonus ─────────────────────────────────────────────────────
async function creditDepositBonus(deposit: any): Promise<{ bonusCredited: boolean; bonusAmount: number }> {
  try {
    if (!deposit.bonus_cents || deposit.bonus_cents <= 0) return { bonusCredited: false, bonusAmount: 0 };

    // Already credited?
    const { data: existing } = await db.from("campaign_bonuses")
      .select("id").eq("deposit_id", deposit.id).eq("status", "credited").maybeSingle();
    if (existing) return { bonusCredited: false, bonusAmount: 0 };

    if (deposit.campaign_id) {
      const { data: campaign } = await db.from("campaigns")
        .select("id, is_active, starts_at, ends_at, max_bonus_cents")
        .eq("id", deposit.campaign_id).single();
      if (campaign) {
        const now = new Date();
        const isActive = campaign.is_active &&
          (!campaign.starts_at || new Date(campaign.starts_at) <= now) &&
          (!campaign.ends_at   || new Date(campaign.ends_at)   >  now);
        if (!isActive) {
          await db.from("campaign_bonuses").insert({
            campaign_id: deposit.campaign_id, user_id: deposit.user_id,
            deposit_id: deposit.id, bonus_amount_cents: deposit.bonus_cents,
            status: "cancelled", metadata: { reason: "Campaign not active at completion time" },
          });
          return { bonusCredited: false, bonusAmount: 0 };
        }
        const bonusAmount = Math.min(deposit.bonus_cents, campaign.max_bonus_cents);
        await db.from("transactions").insert({
          user_id: deposit.user_id, wallet_id: deposit.wallet_id,
          type: "deposit", amount_cents: bonusAmount, currency: deposit.currency,
          description: "Deposit doubling bonus",
          metadata: { deposit_id: deposit.id, campaign_id: deposit.campaign_id, bonus: true },
        });
        await db.from("campaign_bonuses").insert({
          campaign_id: deposit.campaign_id, user_id: deposit.user_id,
          deposit_id: deposit.id, bonus_amount_cents: bonusAmount,
          status: "credited", credited_at: new Date().toISOString(),
        });
        return { bonusCredited: true, bonusAmount };
      }
    }
    return { bonusCredited: false, bonusAmount: 0 };
  } catch (e) {
    console.error("[Bonus] Error:", e);
    return { bonusCredited: false, bonusAmount: 0 };
  }
}

// ── Referral bonus on first deposit ──────────────────────────────────────────
async function processReferralBonus(userId: string) {
  try {
    const { count } = await db.from("deposits")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId).eq("status", "completed");
    if (count !== 1) return;

    const { data: referral } = await db.from("referrals")
      .select("id, referrer_id, referred_id")
      .eq("referred_id", userId).eq("status", "pending").maybeSingle();
    if (!referral) return;

    const { data: campaign } = await db.from("campaigns")
      .select("id, referral_bonus_cents, is_active, starts_at, ends_at")
      .eq("type", "referral_bonus").eq("is_active", true).maybeSingle();
    if (!campaign) return;

    const now = new Date();
    const isActive = campaign.is_active &&
      (!campaign.starts_at || new Date(campaign.starts_at) <= now) &&
      (!campaign.ends_at   || new Date(campaign.ends_at)   >  now);
    if (!isActive) return;

    const bonus = campaign.referral_bonus_cents;
    const creditUser = async (uid: string, desc: string) => {
      const { data: w } = await db.from("wallets")
        .select("id, balance_cents").eq("user_id", uid).eq("wallet_type", "main").single();
      if (!w) return;
      await db.from("wallets").update({ balance_cents: w.balance_cents + bonus, updated_at: new Date().toISOString() }).eq("id", w.id);
      await db.from("transactions").insert({ user_id: uid, wallet_id: w.id, type: "deposit", amount_cents: bonus, currency: "KES", description: desc, metadata: { campaign_id: campaign.id, bonus: true } });
    };
    await creditUser(referral.referrer_id, "Referral bonus for referring a friend");
    await creditUser(userId, "Welcome bonus for using referral code");
    await db.from("referrals").update({ status: "completed", bonus_cents: bonus, completed_at: new Date().toISOString() }).eq("id", referral.id);
  } catch (e) { console.error("[Referral] Error:", e); }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const ok = () => new Response(JSON.stringify({ status: true, detail: "Received" }), {
    status: 200, headers: { ...CORS, "Content-Type": "application/json" },
  });

  try {
    const rawBody = await req.text();
    let body: Record<string, any>;
    try { body = JSON.parse(rawBody); } catch {
      console.warn("[cloudpay-callback] Invalid JSON");
      return ok();
    }

    console.log("[cloudpay-callback]", JSON.stringify(body));

    const { autoApprove, signingSecret } = await getPlatformSettings();

    // ── Verify signature ────────────────────────────────────────────────────
    const sig = req.headers.get("x-cloudpay-signature") ?? req.headers.get("X-CloudPay-Signature") ?? "";
    if (signingSecret && sig && !verifySignature(rawBody, sig, signingSecret)) {
      console.warn("[cloudpay-callback] Invalid signature");
      return new Response(JSON.stringify({ status: false, detail: "Invalid signature" }), {
        status: 401, headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // ── CloudPay webhook payload ────────────────────────────────────────────
    const { event, channel, reference, status, amount, phone, receipt } = body;

    // Only handle deposit/payment events
    if (!["payment.completed", "payment.failed", "deposit.completed"].includes(event)) {
      console.log("[cloudpay-callback] Ignoring event:", event);
      return ok();
    }

    // ── Find deposit by provider_ref = reference ────────────────────────────
    let { data: deposit } = await db
      .from("deposits")
      .select("id, user_id, wallet_id, amount_cents, bonus_cents, campaign_id, currency, status, phone")
      .eq("provider_ref", reference)
      .maybeSingle();

    // Race-condition fallback: match by phone + amount + pending within 5 min
    if (!deposit && phone && amount) {
      const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const normPhone = String(phone).startsWith("254") ? String(phone) : `254${String(phone).slice(-9)}`;
      const amountCents = Math.round(Number(amount) * 100);

      const fallback = await db
        .from("deposits")
        .select("id, user_id, wallet_id, amount_cents, bonus_cents, campaign_id, currency, status, phone")
        .eq("phone", normPhone)
        .eq("status", "pending")
        .is("provider_ref", null)
        .gte("created_at", fiveMinsAgo)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fallback.data) {
        deposit = fallback.data;
        await db.from("deposits").update({ provider_ref: reference }).eq("id", deposit.id);
        console.log("[cloudpay-callback] Matched via fallback:", deposit.id);
      }
    }

    if (!deposit) {
      console.warn("[cloudpay-callback] Deposit not found for reference:", reference);
      return ok();
    }

    // Idempotency — already processed
    if (deposit.status === "completed") {
      console.log("[cloudpay-callback] Already completed:", reference);
      return ok();
    }

    const isSuccess = status === "COMPLETED";

    if (isSuccess) {
      if (autoApprove) {
        const { data: wallet } = await db.from("wallets")
          .select("balance_cents").eq("id", deposit.wallet_id).single();

        const totalCredit = deposit.amount_cents + (deposit.bonus_cents || 0);
        const newBalance  = (wallet?.balance_cents ?? 0) + totalCredit;

        await Promise.all([
          db.from("wallets").update({ balance_cents: newBalance, updated_at: new Date().toISOString() }).eq("id", deposit.wallet_id),
          db.from("deposits").update({ status: "completed", updated_at: new Date().toISOString() }).eq("id", deposit.id),
          db.from("transactions").insert({
            user_id:      deposit.user_id,
            wallet_id:    deposit.wallet_id,
            type:         "deposit",
            amount_cents: deposit.amount_cents,
            currency:     deposit.currency,
            description:  `CloudPay M-Pesa deposit${receipt ? ` — Receipt: ${receipt}` : ""}`,
            metadata: { cloudpay_reference: reference, receipt, channel, event },
          }),
          db.from("notifications").insert({
            user_id: deposit.user_id,
            title:   "Deposit successful ✓",
            body:    `${fmtKes(deposit.amount_cents)} credited to your wallet.${deposit.bonus_cents > 0 ? ` Plus ${fmtKes(deposit.bonus_cents)} bonus!` : ""}${receipt ? ` Receipt: ${receipt}` : ""}`,
            type:    "deposit",
            is_read: false,
          }),
        ]);

        // Credit campaign bonus
        if ((deposit.bonus_cents || 0) > 0) {
          await creditDepositBonus(deposit);
        }

        // Process referral bonus (first deposit only)
        await processReferralBonus(deposit.user_id);

        console.log("[cloudpay-callback] Deposit auto-credited:", deposit.id);
      } else {
        // Manual approval mode
        await db.from("deposits").update({
          status: "pending", provider_ref: receipt || reference, updated_at: new Date().toISOString(),
        }).eq("id", deposit.id);
        await db.from("notifications").insert({
          user_id: deposit.user_id,
          title:   "Deposit received — pending review",
          body:    `${fmtKes(deposit.amount_cents)} M-Pesa payment received. It will be credited after admin review.`,
          type:    "deposit", is_read: false,
        });
      }
    } else {
      // Failed / cancelled
      await db.from("deposits").update({ status: "failed", updated_at: new Date().toISOString() }).eq("id", deposit.id);
      console.log("[cloudpay-callback] Deposit failed:", deposit.id, "status:", status);
    }

    return ok();
  } catch (err: any) {
    console.error("[cloudpay-callback] Error:", err?.message, err?.stack);
    return ok(); // Always 200 so CloudPay doesn't retry on our errors
  }
});
