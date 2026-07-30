# SmartDerivs — Production Payment Integration Guide

## Overview

SmartDeriv uses **SasaPay** for all payment collection and disbursement:

- **Deposits** — SasaPay C2B (STK Push via M-PESA, Airtel, T-Kash, or SasaPay Wallet)
- **Withdrawals** — SasaPay B2C (Business to Customer) — funds sent directly to customer phone

All API credentials are stored as **Supabase Edge Function secrets** or in the
`platform_settings` DB table (editable from Admin → Payment Config without redeploying).
No credentials are ever hardcoded in source code or exposed to the browser.

---

## Architecture

```
User (browser)
    │
    ├─ Deposit: calls sasapay-proxy → SasaPay C2B API → STK push to customer phone
    │                                         │
    │                               SasaPay fires callback
    │                                         │
    └─ sasapay-callback ← Supabase Edge Function
              │
              └── Credits wallet + marks deposit "completed"

Admin (browser)
    │
    └─ Approve withdrawal → sasapay-proxy → SasaPay B2C API → money sent to phone
                                                    │
                                          SasaPay fires callback
                                                    │
                                      sasapay-callback updates withdrawal status
```

---

## Prerequisites

1. A **SasaPay Merchant Account** — register at [sasapay.app](https://sasapay.app)
2. A **SasaPay Developer Portal** account — [developer.sasapay.app](https://developer.sasapay.app)
3. A **Sandbox Application** created in the portal (for testing)
4. A **Production Application** created in the portal (for go-live)

---

## Step 1 — Get Your SasaPay Credentials

### Sandbox (testing)

1. Log in to the [SasaPay Developer Portal](https://developer.sasapay.app)
2. Go to **Applications** → **Create New App**
3. Note your **Client ID** and **Client Secret**
4. Use the sandbox base URL: `https://sandbox.sasapay.app`

### Production (go-live)

1. Complete KYB (Know Your Business) verification on the SasaPay portal
2. Create a **Production Application**
3. Note your production **Client ID** and **Client Secret**
4. Use the production base URL: `https://api.sasapay.app`

---

## Step 2 — Get Your Merchant Code

Your Merchant Code is assigned when your SasaPay merchant account is approved.
It is used in every C2B and B2C API request.

| Environment | Merchant Code Source |
|---|---|
| Sandbox | Provided by SasaPay in your sandbox app details |
| Production | Your live Paybill or Till number registered with SasaPay |

---

## Step 3 — Network Codes

Choose the mobile money channel customers will use for STK push deposits:

| Network | Code |
|---|---|
| M-PESA | `63902` (recommended — widest coverage) |
| Airtel Money | `63903` |
| T-Kash | `63907` |
| SasaPay Wallet | `0` |

The default is **63902 (M-PESA)**. This is configured in Admin → Payment Config.

---

## Step 4 — Set Supabase Edge Function Secrets

Run this once with your production values. Replace every placeholder:

```bash
npx supabase secrets set \
  SASAPAY_BASE_URL="https://api.sasapay.app" \
  SASAPAY_CLIENT_ID="YOUR_PRODUCTION_CLIENT_ID" \
  SASAPAY_CLIENT_SECRET="YOUR_PRODUCTION_CLIENT_SECRET" \
  SASAPAY_MERCHANT_CODE="YOUR_MERCHANT_CODE" \
  SASAPAY_NETWORK_CODE="63902" \
  SASAPAY_CALLBACK_BASE="https://YOUR_PROJECT_REF.supabase.co/functions/v1/sasapay-callback" \
  --project-ref YOUR_SUPABASE_PROJECT_REF
```

> Never put real credentials in source code, `.env`, or commit them to Git.

Alternatively, configure everything from **Admin → Payment Config** in the UI —
no CLI or redeploy needed.

---

## Step 5 — Run the Database Migration

In the Supabase SQL Editor ([supabase.com/dashboard](https://supabase.com/dashboard) →
your project → SQL Editor), run:

```
supabase/migrations/006_sasapay_config.sql
```

This adds the SasaPay credential columns to `platform_settings`.

---

## Step 6 — Deploy the Edge Functions

```bash
export SUPABASE_ACCESS_TOKEN="your_supabase_management_api_token"

# SasaPay proxy (handles C2B STK push + B2C disbursements)
npx supabase functions deploy sasapay-proxy \
  --project-ref YOUR_PROJECT_REF \
  --no-verify-jwt --use-api

# SasaPay callback (receives SasaPay webhooks)
npx supabase functions deploy sasapay-callback \
  --project-ref YOUR_PROJECT_REF \
  --no-verify-jwt --use-api
```

---

## Step 7 — Configure Callback URL in SasaPay Portal

1. Log in to the SasaPay Developer Portal
2. Go to your application → **Settings** / **Callbacks**
3. Set your **IPN URL** to a dedicated endpoint if you need to support manual payments.
   For automated flows the callback URL is passed per-request so this step is optional.
4. Whitelist your Supabase Edge Function URL as needed

> **Important:** SasaPay sends both the IPN URL and the per-request `CallBackURL`
> on successful payins. To avoid double-crediting, the `sasapay-callback` function
> uses an idempotency check — a deposit with `status: completed` is never processed twice.

---

## Step 8 — Update Admin Settings

After deployment, log in as admin and go to **Admin → Payment Config**:

1. Set **SasaPay Base URL** — Sandbox or Production
2. Enter your **Client ID** and **Client Secret**
3. Enter your **Merchant Code**
4. Select **Network Code** (63902 for M-PESA)
5. Set **Callback Base URL** to:
   `https://YOUR_PROJECT_REF.supabase.co/functions/v1/sasapay-callback`
6. Click **Test connection** to verify credentials
7. Click **Save configuration**

Then go to **Admin → Platform Settings**:
- Set Min/Max Deposit and Withdrawal limits
- Toggle **Auto-approve deposits** as needed

---

## Step 9 — Test in Sandbox

Before going live:

1. **Deposit test** — make a small deposit (e.g. KES 100) with a real M-PESA number
   - STK prompt should arrive within 5 seconds
   - After entering PIN, wallet should credit within 30 seconds
   - Check transaction history: `SasaPay deposit — Ref: XXXXXXXXX`

2. **Withdrawal test** — submit a withdrawal, approve from Admin → Withdrawals
   - Click **Approve & Send**
   - B2C dispatched message should appear
   - Funds should arrive on phone via M-PESA within 2 minutes

3. **Timeout test** — initiate a deposit and let it expire without entering PIN
   - Should show "Confirmation timed out" screen
   - Wallet should NOT be credited

---

## Callback Security

SasaPay callbacks include an `X-SasaPay-Signature` header for HMAC-SHA512 verification.

- **Message format:** `transactionCode-merchantCode-accountNumber-paymentReference-amount`
- **Secret key:** Your SasaPay **Client ID**
- The `sasapay-callback` Edge Function verifies this signature automatically

Trusted SasaPay callback IP addresses (for additional network-level filtering):

```
47.129.43.14
113.229.247.179
13.215.155.141
13.214.60.23
54.169.74.198
18.142.226.87
47.129.243.116
13.250.110.31
55.12.30.40
55.12.30.58
```

---

## Troubleshooting

### STK push not arriving on phone
- Verify phone number is in format `2547XXXXXXXX`
- Check `sasapay-proxy` logs: Supabase Dashboard → Edge Functions → sasapay-proxy → Logs
- Confirm `SASAPAY_MERCHANT_CODE` is correct and active on your SasaPay account

### Deposit paid but wallet not credited
- Check `sasapay-callback` logs for the `CheckoutRequestID`
- If "Deposit not found" — the client may not have saved the deposit record yet.
  The callback function has a 5-minute fallback lookup by phone + amount.
- Manually credit via Supabase SQL Editor if needed

### B2C ResultCode non-zero / failed
- Check the `ResultDesc` in `sasapay-callback` logs for the specific error
- Common codes: see SasaPay Result Codes documentation
- Funds are automatically refunded to the user's wallet on failure

### "Invalid credentials" on test connection
- Verify `SASAPAY_CLIENT_ID` and `SASAPAY_CLIENT_SECRET` are correct
- Ensure you are using the right base URL (sandbox vs production)
- Sandbox credentials do NOT work against `https://api.sasapay.app`

### Double-credit concern
- The callback function checks `deposit.status === "completed"` before crediting
- A deposit is only credited once regardless of how many callbacks SasaPay sends
- If you configure an IPN URL, use a different endpoint from the per-request callback URL

---

## File Structure

```
supabase/
  functions/
    sasapay-proxy/index.ts      ← All SasaPay API calls (C2B STK push + B2C)
    sasapay-callback/index.ts   ← Webhook handler (C2B + B2C results)
    daraja-proxy/index.ts       ← Legacy Daraja proxy (kept, not used)
    daraja-callback/index.ts    ← Legacy Daraja callback (kept, not used)
    resolve-bet/index.ts        ← Candle Predict game algorithm
  migrations/
    001_full_schema.sql         ← Complete DB schema (run once)
    002_reset_data.sql          ← Clear all data (dev/testing only)
    003_make_admin.sql          ← Grant admin role
    004_production_patches.sql  ← Platform settings + marketer role
    005_admin_roles_fix.sql     ← Admin roles fix
    006_sasapay_config.sql      ← SasaPay credential columns (run this)

src/routes/_authenticated/
  wallet.deposit.tsx            ← Deposit UI (SasaPay C2B STK push)
  wallet.withdraw.tsx           ← Withdrawal request UI
  admin/withdrawals.tsx         ← Admin approval panel (SasaPay B2C dispatch)
  admin/payment-config.tsx      ← SasaPay credentials admin UI
```

---

## Security Notes

- No API keys in source code, `.env` files, or Git history
- All SasaPay secrets stored in Supabase Edge Function secrets (encrypted at rest)
  OR in `platform_settings` DB table (RLS admin-only, never exposed to browser)
- Callback HMAC-SHA512 signature verified on every incoming webhook
- Service role key never exposed to browser
- RLS (Row Level Security) enabled on all tables
- Idempotency checks prevent double-crediting on duplicate callbacks

---

## Sandbox Credentials (Development Only)

> ⚠️ Rotate these immediately — they were shared in setup and should be replaced.

| Field | Value |
|---|---|
| Base URL | `https://sandbox.sasapay.app` |
| Client ID | `AwObCKd1H18dIlpEau6jsF1FiDHqqHnFdjIpkcaL` |
| Merchant Code | `600980` (sandbox default) |
| Network Code | `63902` (M-PESA) |

Set production credentials via **Admin → Payment Config** or Supabase secrets before going live.

---

*SmartDeriv — Real payments via SasaPay. Real security.*
