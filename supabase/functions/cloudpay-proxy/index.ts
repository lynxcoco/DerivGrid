/**
 * Supabase Edge Function: cloudpay-proxy
 * Proxies CloudPay API calls server-side.
 * Handles: M-Pesa STK Push (deposit) + status check + token test
 *
 * Deploy:
 *   npx supabase functions deploy cloudpay-proxy \
 *     --project-ref oevuqograxqkensvqxzt \
 *     --no-verify-jwt
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Max-Age": "86400",
};

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

class Logger {
  private context: string;
  constructor(context = "cloudpay-proxy") { this.context = context; }
  private log(level: string, message: string, data?: any) {
    const ts = new Date().toISOString();
    const line = `[${ts}] [${level.toUpperCase()}] [${this.context}] ${message}`;
    data ? console.log(`${line}\n${JSON.stringify(data, null, 2)}`) : console.log(line);
  }
  info(msg: string, d?: any)  { this.log("info",  msg, d); }
  warn(msg: string, d?: any)  { this.log("warn",  msg, d); }
  error(msg: string, d?: any) { this.log("error", msg, d); }
  debug(msg: string, d?: any) { this.log("debug", msg, d); }
}
const log = new Logger();

// ── Get CloudPay token ─────────────────────────────────────────────────────────
async function getCloudPayToken(baseUrl: string, consumerKey: string, consumerSecret: string): Promise<string> {
  const credentials = btoa(`${consumerKey}:${consumerSecret}`);
  log.info("Getting token", { baseUrl, key: consumerKey.slice(0, 8) + "…" });

  // CloudPay: POST /oauth/token with JSON body
  const res = await fetch(`${baseUrl}/oauth/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${credentials}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({ consumerKey, consumerSecret }),
  });

  const text = await res.text();
  log.debug("Token response", { status: res.status, body: text.slice(0, 300) });

  if (!res.ok) {
    throw new Error(`Token HTTP ${res.status}: ${text.slice(0, 200)}`);
  }

  let data: any;
  try { data = JSON.parse(text); } catch { throw new Error(`Non-JSON token response: ${text.slice(0, 100)}`); }

  const token = data.access_token ?? data.data?.access_token;
  if (!token) throw new Error(`No access_token in response: ${JSON.stringify(data)}`);

  log.info("Token OK", { preview: token.slice(0, 10) + "…" });
  return token;
}

function formatPhone(phone: string): string {
  let c = String(phone).replace(/[\s\-()]/g, "");
  if (c.startsWith("0"))   c = "254" + c.slice(1);
  if (!c.startsWith("254")) c = "254" + c;
  return c;
}

async function logToDB(table: string, data: any) {
  try {
    await db.from(table).insert({ ...data, created_at: new Date().toISOString() });
  } catch (e: any) { log.warn(`DB log failed (${table})`, { error: e.message }); }
}

// ── Config: env > DB ──────────────────────────────────────────────────────────
let _cfg: Record<string, string> | null = null;
async function getConfig() {
  if (_cfg) return _cfg;
  const { data } = await db.from("platform_settings")
    .select("cloudpay_consumer_key, cloudpay_consumer_secret, cloudpay_base_url, cloudpay_callback_url")
    .eq("id", "global").single();
  _cfg = data ?? {};
  return _cfg!;
}
async function cfg(envKey: string, dbKey: string): Promise<string> {
  const v = Deno.env.get(envKey);
  if (v) return v;
  const c = await getConfig();
  return c[dbKey] ?? "";
}

// ── Main ──────────────────────────────────────────────────────────────────────
serve(async (req) => {
  const rid = crypto.randomUUID();
  const t0  = Date.now();

  if (req.method === "OPTIONS") return new Response("ok", { status: 200, headers: CORS });
  if (req.method !== "POST")    return jsonResponse({ error: "Use POST" }, 405);

  try {
    const url    = new URL(req.url);
    const action = url.searchParams.get("action") ?? "";

    const CONSUMER_KEY = await cfg("CLOUDPAY_CONSUMER_KEY",    "cloudpay_consumer_key");
    const CONSUMER_SEC = await cfg("CLOUDPAY_CONSUMER_SECRET", "cloudpay_consumer_secret");
    const BASE_URL     = (await cfg("CLOUDPAY_BASE_URL",       "cloudpay_base_url")) || "https://www.pay.cloud.or.ke/api";
    const CALLBACK_URL = await cfg("CLOUDPAY_CALLBACK_URL",    "cloudpay_callback_url");

    // ── test-token ──────────────────────────────────────────────────────────
    if (action === "test-token") {
      let body: any = {};
      try { body = await req.json(); } catch { /* ok */ }

      const testKey  = body.consumer_key    || CONSUMER_KEY;
      const testSec  = body.consumer_secret || CONSUMER_SEC;
      const testBase = body.base_url        || BASE_URL;

      if (!testKey || !testSec) {
        return jsonResponse({ ok: false, error: "Missing Consumer Key or Secret" }, 400);
      }
      try {
        const token = await getCloudPayToken(testBase, testKey, testSec);
        return jsonResponse({ ok: true, token: token.slice(0, 20) + "…", message: "Token obtained successfully" });
      } catch (e: any) {
        return jsonResponse({ ok: false, error: e.message }, 400);
      }
    }

    // ── stk-push ────────────────────────────────────────────────────────────
    if (action === "stk-push") {
      if (!CONSUMER_KEY || !CONSUMER_SEC) {
        return jsonResponse({ error: "CloudPay not configured. Set credentials in Admin → Payment Config." }, 500);
      }

      let body: any;
      try { body = await req.json(); } catch { return jsonResponse({ error: "Invalid JSON body" }, 400); }

      const { phone, amount, transactionReference, description } = body;
      if (!phone)              return jsonResponse({ error: "phone is required" }, 400);
      if (!amount || amount <= 0) return jsonResponse({ error: "Valid amount is required" }, 400);

      const cleanPhone = formatPhone(phone);
      log.info("STK push", { rid, phone: cleanPhone, amount, ref: transactionReference });

      const token = await getCloudPayToken(BASE_URL, CONSUMER_KEY, CONSUMER_SEC);

      const stkBody: any = {
        phone:                cleanPhone,
        amount:               Math.round(Number(amount)),
        transactionReference: transactionReference || `DG-${Date.now()}`,
        description:          description || "DerivGrid Deposit",
      };
      if (CALLBACK_URL) stkBody.callbackUrl = CALLBACK_URL;

      const stkRes  = await fetch(`${BASE_URL}/payments/mpesa/stkpush`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(stkBody),
      });

      const stkText = await stkRes.text();
      log.debug("STK response", { status: stkRes.status, body: stkText.slice(0, 300) });

      let data: any;
      try { data = JSON.parse(stkText); } catch {
        return jsonResponse({ error: `Invalid response: ${stkText.slice(0, 100)}` }, 502);
      }

      if (!stkRes.ok) {
        log.warn("STK failed", { status: stkRes.status, data });
        await logToDB("payment_logs", { request_id: rid, type: "stk_push", phone: cleanPhone, amount, status: "failed", metadata: { error: data } });
        return jsonResponse({ error: data.message ?? data.error ?? "STK push failed", details: data }, stkRes.status);
      }

      const payload   = data?.data ?? data;
      const reference = payload?.reference;
      if (!reference) {
        log.error("No reference returned", { data });
        return jsonResponse({ error: "No reference returned from CloudPay", details: data }, 500);
      }

      await logToDB("payment_logs", {
        request_id: rid, type: "stk_push", phone: cleanPhone, amount, reference, status: "sent",
        metadata: { ref: stkBody.transactionReference, checkoutRequestId: payload.checkoutRequestId },
      });

      log.info("STK success", { rid, reference, duration: `${Date.now() - t0}ms` });
      return jsonResponse({ status: "success", reference, checkoutRequestId: payload.checkoutRequestId, phone: cleanPhone, amount, requestId: rid });
    }

    // ── status ──────────────────────────────────────────────────────────────
    if (action === "status") {
      if (!CONSUMER_KEY || !CONSUMER_SEC) return jsonResponse({ error: "CloudPay not configured" }, 500);
      let body: any;
      try { body = await req.json(); } catch { return jsonResponse({ error: "Invalid JSON body" }, 400); }
      const { reference } = body;
      if (!reference) return jsonResponse({ error: "reference is required" }, 400);

      const token   = await getCloudPayToken(BASE_URL, CONSUMER_KEY, CONSUMER_SEC);
      const res     = await fetch(`${BASE_URL}/payments/status/${reference}`, {
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" },
      });
      const data    = await res.json();
      return jsonResponse({ ...data, requestId: rid });
    }

    return jsonResponse({ error: `Unknown action: ${action}`, available: ["test-token", "stk-push", "status"] }, 400);

  } catch (e: any) {
    log.error("Unhandled error", { rid, error: e.message, stack: e.stack });
    return jsonResponse({ error: "Internal server error", details: e.message, requestId: rid }, 500);
  }
});
