/**
 * Supabase Edge Function: sasapay-proxy
 * Proxies SasaPay API calls server-side.
 * Handles: C2B STK Push (deposit) + B2C (withdrawal payout) + token test
 *
 * ── Configuration priority ────────────────────────────────────────────────────
 * 1. Supabase Secrets (Deno.env) — set via CLI or dashboard
 * 2. platform_settings DB table  — set via the Admin > Payment Config UI
 *
 * ── Deployment ────────────────────────────────────────────────────────────────
 * npx supabase functions deploy sasapay-proxy \
 *   --project-ref YOUR_PROJECT_REF \
 *   --no-verify-jwt --use-api
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ── DB config cache (reset after every transaction) ────────────────────────────
let _dbConfig: Record<string, string> | null = null;

async function getDbConfig(): Promise<Record<string, string>> {
  if (_dbConfig) return _dbConfig;
  const supabaseUrl    = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const client = createClient(supabaseUrl, serviceRoleKey);
  const { data } = await client
    .from("platform_settings")
    .select(
      "sasapay_client_id, sasapay_client_secret, sasapay_merchant_code, " +
      "sasapay_network_code, sasapay_callback_base, sasapay_base_url"
    )
    .eq("id", "global")
    .single();
  _dbConfig = (data as Record<string, string>) ?? {};
  return _dbConfig;
}

async function cfg(envKey: string, dbKey: string): Promise<string> {
  const fromEnv = Deno.env.get(envKey);
  if (fromEnv) return fromEnv;
  const db = await getDbConfig();
  return db[dbKey] ?? "";
}

// ── OAuth token (SasaPay uses GET with Basic Auth) ────────────────────────────
async function getToken(baseUrl: string, clientId: string, clientSecret: string): Promise<string> {
  const credentials = btoa(`${clientId}:${clientSecret}`);
  const res = await fetch(
    `${baseUrl}/api/v1/auth/token/?grant_type=client_credentials`,
    {
      method: "GET",
      headers: { "Authorization": `Basic ${credentials}` },
    }
  );
  const data = await res.json();
  if (!data.access_token) {
    throw new Error(`SasaPay token error: ${data.detail ?? JSON.stringify(data)}`);
  }
  return data.access_token as string;
}

// ── Main handler ───────────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST")   return new Response("Method not allowed", { status: 405, headers: CORS });

  const url    = new URL(req.url);
  const action = url.searchParams.get("action") ?? "";

  try {
    // Load all config (env > DB)
    const BASE_URL       = (await cfg("SASAPAY_BASE_URL",       "sasapay_base_url"))       || "https://sandbox.sasapay.app";
    const CLIENT_ID      = await cfg("SASAPAY_CLIENT_ID",      "sasapay_client_id");
    const CLIENT_SECRET  = await cfg("SASAPAY_CLIENT_SECRET",  "sasapay_client_secret");
    const MERCHANT_CODE  = await cfg("SASAPAY_MERCHANT_CODE",  "sasapay_merchant_code");
    const NETWORK_CODE   = (await cfg("SASAPAY_NETWORK_CODE",  "sasapay_network_code")) || "63902"; // default M-PESA
    const CALLBACK_BASE  = await cfg("SASAPAY_CALLBACK_BASE",  "sasapay_callback_base");

    // ── Test token connection ───────────────────────────────────────────────────
    if (action === "test-token") {
      let body: Record<string, string> = {};
      try { body = await req.json(); } catch { /* no body */ }
      const testBase   = body.base_url       || BASE_URL;
      const testId     = body.client_id      || CLIENT_ID;
      const testSecret = body.client_secret  || CLIENT_SECRET;

      if (!testId || !testSecret) {
        return new Response(JSON.stringify({ ok: false, error: "Missing Client ID or Client Secret" }), {
          status: 400, headers: { ...CORS, "Content-Type": "application/json" },
        });
      }
      try {
        const token = await getToken(testBase, testId, testSecret);
        return new Response(JSON.stringify({ ok: true, token: token.slice(0, 8) + "…" }), {
          status: 200, headers: { ...CORS, "Content-Type": "application/json" },
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ ok: false, error: err?.message }), {
          status: 400, headers: { ...CORS, "Content-Type": "application/json" },
        });
      }
    }

    // Validate required config for real API calls
    const missing = [
      !CLIENT_ID      && "CLIENT_ID",
      !CLIENT_SECRET  && "CLIENT_SECRET",
      !MERCHANT_CODE  && "MERCHANT_CODE",
      !CALLBACK_BASE  && "CALLBACK_BASE",
    ].filter(Boolean);

    if (missing.length) {
      console.error("[sasapay-proxy] Missing config:", missing.join(", "));
      return new Response(
        JSON.stringify({ error: `Missing configuration: ${missing.join(", ")}. Set these in Admin → Payment Config.` }),
        { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    const token = await getToken(BASE_URL, CLIENT_ID, CLIENT_SECRET);

    // ── C2B STK Push (deposit) ──────────────────────────────────────────────────
    if (action === "stk-push") {
      const { phone, amount, accountRef, transDesc } = await req.json();

      const body = {
        MerchantCode:       MERCHANT_CODE,
        NetworkCode:        NETWORK_CODE,
        Currency:           "KES",
        Amount:             String(Math.round(Number(amount))),
        CallBackURL:        `${CALLBACK_BASE}?type=c2b`,
        PhoneNumber:        phone,
        TransactionDesc:    transDesc  ?? "SmartDeriv Deposit",
        AccountReference:   accountRef ?? "SmartDeriv",
      };

      console.log("[C2B STK] Request:", JSON.stringify({ ...body }));

      const res = await fetch(`${BASE_URL}/api/v1/payments/request-payment/`, {
        method:  "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const data = await res.json();
      console.log("[C2B STK] Response:", res.status, JSON.stringify(data));

      _dbConfig = null; // reset cache
      return new Response(JSON.stringify(data), {
        status: res.ok ? 200 : 400,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // ── B2C Payment (withdrawal disbursement) ───────────────────────────────────
    if (action === "b2c") {
      const { phone, amount, reason, merchantTransRef } = await req.json();

      const body = {
        MerchantCode:                MERCHANT_CODE,
        MerchantTransactionReference: merchantTransRef ?? `SD-B2C-${Date.now()}`,
        Amount:                      String(Math.round(Number(amount))),
        Currency:                    "KES",
        ReceiverNumber:              phone,
        Channel:                     "0",  // SasaPay channel (can also be 63902 for M-PESA direct)
        Reason:                      reason ?? "SmartDeriv withdrawal",
        CallBackURL:                 `${CALLBACK_BASE}?type=b2c`,
      };

      console.log("[B2C] Request:", JSON.stringify({ ...body }));

      const res = await fetch(`${BASE_URL}/api/v1/payments/b2c/`, {
        method:  "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const data = await res.json();
      console.log("[B2C] Response:", res.status, JSON.stringify(data));

      _dbConfig = null; // reset cache
      return new Response(JSON.stringify(data), {
        status: res.ok ? 200 : 400,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
      status: 400, headers: { ...CORS, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("[sasapay-proxy] Error:", err?.message);
    return new Response(JSON.stringify({ error: err?.message ?? "Internal error" }), {
      status: 500, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
