/**
 * Supabase Edge Function: cloudpay-callback
 * Receives CloudPay webhook callbacks for M-Pesa deposits.
 *
 * Security:
 *   - HMAC-SHA256 signature verification using X-CloudPay-Signature header
 *   - Idempotency: same reference never processed twice
 *
 * Deploy:
 *   npx supabase functions deploy cloudpay-callback \
 *     --project-ref oevuqograxqkensvqxzt \
 *     --no-verify-jwt
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL              = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cloudpay-signature, x-cloudpay-event",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

class Logger {
  private ctx: string;
  constructor(ctx = "cloudpay-callback") { this.ctx = ctx; }
  private log(level: string, msg: string, d?: any) {
    const line = `[${new Date().toISOString()}] [${level.toUpperCase()}] [${this.ctx}] ${msg}`;
    d ? console.log(`${line}\n${JSON.stringify(d, null, 2)}`) : console.log(line);
  }
  info(m: string, d?: any)  { this.log("info",  m, d); }
  warn(m: string, d?: any)  { this.log("warn",  m, d); }
  error(m: string, d?: any) { this.log("error", m, d); }
  debug(m: string, d?: any) { this.log("debug", m, d); }
}
const log = new Logger();

// ── Platform settings ─────────────────────────────────────────────────────────
async function getSettings() {
  try {
    const { data } = await db.from("platform_settings")
      .select("auto_approve_deposits, cloudpay_signing_secret")
      .eq("id", "global").single();
    return {
      autoApprove:   data?.auto_approve_deposits !== false,
      signingSecret: data?.cloudpay_signing_secret ?? Deno.env.get("CLOUDPAY_SIGNING_SECRET") ?? "",
    };
  } catch {
    return { autoApprove: true, signingSecret: Deno.env.get("CLOUDPAY_SIGNING_SECRET") ?? "" };
  }
}

// ── HMAC-SHA256 ───────────────────────────────────────────────────────────────
async function verifySignature(rawBody: string, signature: string, secret: string): Promise<boolean> {
  if (!secret) { log.warn("No signing secret — skipping"); return true; }
  if (!signature) { log.warn("No signature header"); return false; }
  try {
    const enc  = new TextEncoder();
    const key  = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const sig  = await crypto.subtle.sign("HMAC", key, enc.encode(rawBody));
    const expected = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
    if (expected.length !== signature.length) return false;
    let diff = 0;
    for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
    return diff === 0;
  } catch { return false; }
}

const fmtKes = (c: number) => `KES ${(c / 100).toLocaleString("en-KE", { minimumFractionDigits: 2 })}`;

async function logToDB(table: string, data: any) {
  try { await db.from(table).insert({ ...data, created_at: new Date().toISOString() }); }
  catch (e: any) { log.warn(`DB log failed (${table})`, { error: e.message }); }
}

// ── Credit campaign bonus ─────────────────────────────────────────────────────
async function creditBonus(deposit: any) {
  if (!deposit.bonus_cents || deposit.bonus_cents <= 0) return;
  const { data: existing } = await db.from("campaign_bonuses")
    .select("id").eq("deposit_id", deposit.id).eq("status", "credited").maybeSingle();
  if (existing) return;
  if (!deposit.campaign_id) return;

  const { data: camp } = await db.from("campaigns")
    .select("is_active, starts_at, ends_at, max_bonus_cents").eq("id", deposit.campaign_id).single();
  if (!camp) return;

  const now = new Date();
  const active = camp.is_active &&
    (!camp.starts_at || new Date(camp.starts_at) <= now) &&
    (!camp.ends_at   || new Date(camp.ends_at)   >  now);
  if (!active) {
    await db.from("campaign_bonuses").insert({ campaign_id: deposit.campaign_id, user_id: deposit.user_id, deposit_id: deposit.id, bonus_amount_cents: deposit.bonus_cents, status: "cancelled", metadata: { reason: "Campaign not active" } });
    return;
  }
  const amount = Math.min(deposit.bonus_cents, camp.max_bonus_cents);
  await db.from("transactions").insert({ user_id: deposit.user_id, wallet_id: deposit.wallet_id, type: "deposit", amount_cents: amount, currency: deposit.currency, description: "Deposit doubling bonus", metadata: { deposit_id: deposit.id, campaign_id: deposit.campaign_id, bonus: true } });
  await db.from("campaign_bonuses").insert({ campaign_id: deposit.campaign_id, user_id: deposit.user_id, deposit_id: deposit.id, bonus_amount_cents: amount, status: "credited", credited_at: new Date().toISOString() });
}

// ── Referral bonus ────────────────────────────────────────────────────────────
async function processReferral(userId: string) {
  const { count } = await db.from("deposits").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "completed");
  if (count !== 1) return;
  const { data: ref } = await db.from("referrals").select("id, referrer_id").eq("referred_id", userId).eq("status", "pending").maybeSingle();
  if (!ref) return;
  const { data: camp } = await db.from("campaigns").select("id, referral_bonus_cents, is_active, starts_at, ends_at").eq("type", "referral_bonus").eq("is_active", true).maybeSingle();
  if (!camp) return;
  const now = new Date();
  if (!camp.is_active || (camp.starts_at && new Date(camp.starts_at) > now) || (camp.ends_at && new Date(camp.ends_at) <= now)) return;
  const bonus = camp.referral_bonus_cents;
  const credit = async (uid: string, desc: string) => {
    const { data: w } = await db.from("wallets").select("id, balance_cents").eq("user_id", uid).eq("wallet_type", "main").single();
    if (!w) return;
    await db.from("wallets").update({ balance_cents: w.balance_cents + bonus, updated_at: new Date().toISOString() }).eq("id", w.id);
    await db.from("transactions").insert({ user_id: uid, wallet_id: w.id, type: "deposit", amount_cents: bonus, currency: "KES", description: desc, metadata: { campaign_id: camp.id, bonus: true } });
  };
  await credit(ref.referrer_id, "Referral bonus for referring a friend");
  await credit(userId, "Welcome bonus for using referral code");
  await db.from("referrals").update({ status: "completed", bonus_cents: bonus, completed_at: new Date().toISOString() }).eq("id", ref.id);
}

// ── Main ──────────────────────────────────────────────────────────────────────
serve(async (req) => {
  const rid = crypto.randomUUID();
  const t0  = Date.now();

  log.info("Webhook received", { rid, method: req.method, url: req.url });

  if (req.method === "OPTIONS") return new Response("ok", { status: 200, headers: CORS });
  if (req.method !== "POST")    return new Response("Method not allowed", { status: 405, headers: CORS });

  const ok = () => new Response("ok", { status: 200, headers: CORS });

  try {
    const rawBody = await req.text();
    let body: any;
    try { body = JSON.parse(rawBody); } catch { log.warn("Invalid JSON", { rid }); return ok(); }

    log.debug("Webhook payload", { rid, event: body.event, ref: body.reference, status: body.status, amount: body.amount });

    const { autoApprove, signingSecret } = await getSettings();

    // Signature
    const sig = req.headers.get("x-cloudpay-signature") ?? "";
    if (signingSecret && sig) {
      const valid = await verifySignature(rawBody, sig, signingSecret);
      if (!valid) { log.warn("Invalid signature", { rid }); return ok(); }
    }

    const event     = req.headers.get("x-cloudpay-event") ?? body.event ?? "";
    const { reference, status, amount, phone, receipt, channel, resultCode } = body;

    if (!["payment.completed", "payment.failed", "deposit.completed"].includes(event)) {
      log.info("Ignoring event", { rid, event }); return ok();
    }
    if (!reference) { log.warn("No reference", { rid }); return ok(); }

    await logToDB("payment_logs", { request_id: rid, type: "webhook_received", reference, status, amount, phone, receipt, channel, metadata: { event, resultCode, rawBody: rawBody.slice(0, 500) } });

    // Find deposit
    let deposit: any = null;
    const { data: d1 } = await db.from("deposits")
      .select("id, user_id, wallet_id, amount_cents, bonus_cents, campaign_id, currency, status, phone")
      .eq("provider_ref", reference).maybeSingle();
    if (d1) deposit = d1;

    if (!deposit && phone && amount) {
      const cutoff  = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const norm    = String(phone).replace(/^0/, "254").replace(/^\+/, "");
      const { data: d2 } = await db.from("deposits")
        .select("id, user_id, wallet_id, amount_cents, bonus_cents, campaign_id, currency, status, phone")
        .eq("phone", norm).eq("status", "pending").is("provider_ref", null)
        .gte("created_at", cutoff).order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (d2) {
        deposit = d2;
        await db.from("deposits").update({ provider_ref: reference }).eq("id", deposit.id);
        log.info("Fallback match", { rid, depositId: deposit.id });
      }
    }

    if (!deposit) { log.warn("Deposit not found", { rid, reference }); return ok(); }
    if (deposit.status === "completed" || deposit.status === "failed") { log.info("Already processed", { rid, depositId: deposit.id }); return ok(); }

    const isSuccess = status === "COMPLETED" || status === "SUCCESS";

    if (isSuccess) {
      if (autoApprove) {
        const { data: wallet } = await db.from("wallets").select("balance_cents").eq("id", deposit.wallet_id).single();
        const totalCredit = deposit.amount_cents + (deposit.bonus_cents || 0);
        const newBalance  = (wallet?.balance_cents ?? 0) + totalCredit;

        await Promise.all([
          db.from("wallets").update({ balance_cents: newBalance, updated_at: new Date().toISOString() }).eq("id", deposit.wallet_id),
          db.from("deposits").update({ status: "completed", updated_at: new Date().toISOString() }).eq("id", deposit.id),
          db.from("transactions").insert({ user_id: deposit.user_id, wallet_id: deposit.wallet_id, type: "deposit", amount_cents: deposit.amount_cents, currency: deposit.currency ?? "KES", description: `CloudPay M-Pesa deposit${receipt ? ` — Receipt: ${receipt}` : ""}`, metadata: { cloudpay_reference: reference, receipt, channel, event } }),
          db.from("notifications").insert({ user_id: deposit.user_id, title: "Deposit successful ✓", body: `${fmtKes(deposit.amount_cents)} credited to your wallet.${(deposit.bonus_cents || 0) > 0 ? ` Plus ${fmtKes(deposit.bonus_cents)} bonus!` : ""}${receipt ? ` Receipt: ${receipt}` : ""}`, type: "deposit", is_read: false }),
        ]);

        await creditBonus(deposit);
        await processReferral(deposit.user_id);

        log.info("Deposit completed", { rid, depositId: deposit.id, amount: deposit.amount_cents, duration: `${Date.now() - t0}ms` });
      } else {
        await db.from("deposits").update({ status: "pending", provider_ref: receipt || reference, updated_at: new Date().toISOString() }).eq("id", deposit.id);
        await db.from("notifications").insert({ user_id: deposit.user_id, title: "Deposit received — pending review", body: `${fmtKes(deposit.amount_cents)} M-Pesa payment received. It will be credited after admin review.${receipt ? ` Receipt: ${receipt}` : ""}`, type: "deposit", is_read: false });
        log.info("Deposit pending manual review", { rid, depositId: deposit.id });
      }
    } else {
      await db.from("deposits").update({ status: "failed", updated_at: new Date().toISOString() }).eq("id", deposit.id);
      log.warn("Deposit failed", { rid, depositId: deposit.id, status, resultCode });
    }

    return ok();
  } catch (e: any) {
    log.error("Unhandled error", { rid, error: e.message, stack: e.stack });
    return ok();
  }
});
