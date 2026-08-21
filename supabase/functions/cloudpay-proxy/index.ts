/**
 * Supabase Edge Function: cloudpay-proxy
 * Proxies CloudPay API calls server-side.
 * Handles: M-Pesa STK Push (deposit) + status check
 *
 * Live base URL:    https://pay.cloud.or.ke/api
 * Sandbox base URL: https://pay.cloud.or.ke/sandbox/api
 *
 * ── Config priority ───────────────────────────────────────────────────────────
 * 1. Supabase Secrets (Deno.env)
 * 2. platform_settings DB table (Admin → Payment Config)
 *
 * Deploy:
 *   npx supabase functions deploy cloudpay-proxy \
 *     --project-ref YOUR_PROJECT_REF \
 *     --no-verify-jwt --use-api
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ── DB config cache ────────────────────────────────────────────────────────────
let _dbConfig: Record<string, string> | null = null;

async function getDbConfig(): Promise<Record<string, string>> {
  if (_dbConfig) return _dbConfig;
  const supabaseUrl    = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const client = createClient(supabaseUrl, serviceRoleKey);
  const { data } = await client
    .from("platform_settings")
    .select("cloudpay_consumer_key, cloudpay_consumer_secret, cloudpay_base_url, cloudpay_callback_url, cloudpay_signing_secret")
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

// ── Get CloudPay access token ─────────────────────────────────────────────────
async function getToken(baseUrl: string, consumerKey: string, consumerSecret: string): Promise<string> {
  const credentials = btoa(`${consumerKey}:${consumerSecret}`);

  // Try 1: HTTP Basic auth with form body (as per CloudPay docs)
  const res = await fetch(`${baseUrl}/oauth/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (res.ok) {
    const data = await res.json();
    if (data.access_token) return data.access_token as string;
  }

  // Try 2: JSON body (CloudPay docs alternative)
  const res2 = await fetch(`${baseUrl}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ consumerKey, consumerSecret }),
  });
  const data2 = await res2.json();
  if (data2.access_token) return data2.access_token as string;
  throw new Error(`CloudPay token error: ${data2.message ?? JSON.stringify(data2)}`);
}

// ── Main handler ───────────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST")   return new Response("Method not allowed", { status: 405, headers: CORS });

  const url    = new URL(req.url);
  const action = url.searchParams.get("action") ?? "";

  try {
    const BASE_URL      = (await cfg("CLOUDPAY_BASE_URL",       "cloudpay_base_url")) || "https://pay.cloud.or.ke/api";
    const CONSUMER_KEY  = await cfg("CLOUDPAY_CONSUMER_KEY",    "cloudpay_consumer_key");
    const CONSUMER_SEC  = await cfg("CLOUDPAY_CONSUMER_SECRET", "cloudpay_consumer_secret");
    const CALLBACK_URL  = await cfg("CLOUDPAY_CALLBACK_URL",    "cloudpay_callback_url");

    // ── Test connection ─────────────────────────────────────────────────────
    if (action === "test-token") {
      let body: Record<string, string> = {};
      try { body = await req.json(); } catch { /* no body */ }
      const testBase = body.base_url       || BASE_URL;
      const testKey  = body.consumer_key   || CONSUMER_KEY;
      const testSec  = body.consumer_secret || CONSUMER_SEC;

      if (!testKey || !testSec) {
        return new Response(JSON.stringify({ ok: false, error: "Missing Consumer Key or Secret" }), {
          status: 400, headers: { ...CORS, "Content-Type": "application/json" },
        });
      }
      try {
        const token = await getToken(testBase, testKey, testSec);
        return new Response(JSON.stringify({ ok: true, token: token.slice(0, 8) + "…" }), {
          status: 200, headers: { ...CORS, "Content-Type": "application/json" },
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ ok: false, error: err?.message }), {
          status: 400, headers: { ...CORS, "Content-Type": "application/json" },
        });
      }
    }

    // Validate required config for real calls
    const missing = [
      !CONSUMER_KEY && "CONSUMER_KEY",
      !CONSUMER_SEC && "CONSUMER_SECRET",
    ].filter(Boolean);

    if (missing.length) {
      return new Response(
        JSON.stringify({ error: `Missing CloudPay config: ${missing.join(", ")}. Set these in Admin → Payment Config.` }),
        { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    const token = await getToken(BASE_URL, CONSUMER_KEY, CONSUMER_SEC);

    // ── STK Push (M-Pesa deposit) ───────────────────────────────────────────
    if (action === "stk-push") {
      const { phone, amount, transactionReference, description } = await req.json();

      const body = {
        phone:                String(phone),
        amount:               Math.round(Number(amount)),
        transactionReference: transactionReference ?? `DG-${Date.now()}`,
        description:          description ?? "DerivGrid Deposit",
      };

      console.log("[CloudPay STK] Request:", JSON.stringify({ ...body }));

      const res = await fetch(`${BASE_URL}/payments/mpesa/stkpush`, {
        method:  "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type":  "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      console.log("[CloudPay STK] Response:", res.status, JSON.stringify(data));

      _dbConfig = null; // reset cache
      return new Response(JSON.stringify(data), {
        status: res.ok ? 200 : 400,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // ── Status check ────────────────────────────────────────────────────────
    if (action === "status") {
      const { reference } = await req.json();
      const res = await fetch(`${BASE_URL}/payments/status/${reference}`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        status: res.ok ? 200 : 400,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
      status: 400, headers: { ...CORS, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("[cloudpay-proxy] Error:", err?.message);
    return new Response(JSON.stringify({ error: err?.message ?? "Internal error" }), {
      status: 500, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
