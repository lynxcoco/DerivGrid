# DerivGrid

A professional online trading platform built with TanStack Start, Supabase, and CloudPay.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TanStack Start, TailwindCSS v4, shadcn/ui |
| Backend | Supabase (PostgreSQL, Auth, Realtime, Edge Functions) |
| Payments | CloudPay (M-Pesa STK Push via `www.pay.cloud.or.ke`) |
| Charts | Lightweight Charts (TradingView library) |
| Deployment | Vercel (frontend via Nitro) + Supabase (backend) |

---

## Quick Start (Local Development)

### Prerequisites
- Node.js 20+
- A Supabase project — [supabase.com](https://supabase.com)
- A CloudPay account — [pay.cloud.or.ke](https://pay.cloud.or.ke)

### 1. Clone and install
```bash
git clone https://github.com/lynxcoco/DerivGrid.git
cd DerivGrid
npm install
```

### 2. Set up environment variables
Copy `.env.example` to `.env` and fill in your Supabase keys:
```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Run database migration
In the **Supabase SQL Editor**, run:
1. `supabase/migrations/001_master_schema.sql` — full schema, all tables, RLS, triggers
2. `supabase/migrations/003_make_admin.sql` — edit with your UUID first, then run

### 4. Deploy Edge Functions
```bash
export SUPABASE_ACCESS_TOKEN="your_supabase_access_token"
npx supabase functions deploy cloudpay-proxy    --project-ref YOUR_REF --no-verify-jwt --use-api
npx supabase functions deploy cloudpay-callback --project-ref YOUR_REF --no-verify-jwt --use-api
npx supabase functions deploy resolve-bet       --project-ref YOUR_REF --no-verify-jwt --use-api
npx supabase functions deploy sasapay-callback  --project-ref YOUR_REF --no-verify-jwt --use-api
```

### 5. Configure CloudPay
Start the dev server: `npm run dev`

Log in → **Admin → Payment Config** and enter:
- CloudPay Base URL: `https://www.pay.cloud.or.ke/api` (live) or `https://pay.cloud.or.ke/sandbox/api` (sandbox)
- Consumer Key & Secret from your CloudPay dashboard
- Callback URL: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/cloudpay-callback`
- Webhook Signing Secret from your CloudPay dashboard

---

## Project Structure

```
src/
  routes/
    _authenticated/         ← All protected pages
      admin/                ← Admin-only pages
        overview.tsx        ← Admin dashboard (Real vs Demo stats)
        users.tsx           ← User management + role assignment
        deposits.tsx        ← Deposit review (Real vs Demo tabs, pagination)
        withdrawals.tsx     ← Withdrawal processing (Real vs Demo tabs, pagination)
        trades.tsx          ← Candle Predict bet history
        reports.tsx         ← Finance reports with Real/Demo filter + CSV export
        announcements.tsx   ← Broadcast notifications
        tickets.tsx         ← Support ticket management
        assets.tsx          ← Enable/disable tradeable assets
        audit.tsx           ← Platform event audit log
        payment-config.tsx  ← CloudPay credentials UI
        platform-settings.tsx ← Limits, toggles, maintenance mode
        campaigns.tsx       ← Campaign management
      candle-trade.tsx      ← Candle Predict game (10s binary prediction)
      trade.tsx             ← Pro Trader terminal
      wallet.deposit.tsx    ← M-Pesa deposit (CloudPay STK push)
      wallet.withdraw.tsx   ← M-Pesa withdrawal request
      wallet.tsx            ← Wallet overview + transaction history
      dashboard.tsx         ← User dashboard
    auth.tsx                ← Login / Register (email + Google OAuth)
    forgot-password.tsx
    reset-password.tsx
    index.tsx               ← Landing page

supabase/
  functions/
    cloudpay-proxy/         ← CloudPay API proxy (STK push + token test)
    cloudpay-callback/      ← CloudPay webhook handler
    resolve-bet/            ← Candle Predict house-edge + marketer algorithms
    sasapay-callback/       ← Legacy SasaPay callback (kept for existing deposits)
    sasapay-proxy/          ← Legacy SasaPay proxy (kept for reference)
  migrations/
    001_master_schema.sql   ← Complete DB schema — run this ONCE on fresh project
    003_make_admin.sql      ← Grant admin role (edit UUID first)
```

---

## Features

- **Candle Predict** — 10-second binary prediction game. House-edge algorithm for traders, 85% win-rate algorithm for marketers
- **Pro Trader** — Full-featured order terminal with live charts, TP/SL, positions
- **M-Pesa Deposits** — CloudPay STK push, wallet credited automatically via webhook
- **M-Pesa Withdrawals** — Admin-approved via admin panel
- **Campaigns & Bonuses** — Deposit doubling bonuses, referral bonuses
- **Admin Panel** — Full platform management with Real vs Demo separation
- **Pagination** — 50 rows per page on all admin tables
- **Maintenance Mode** — Toggle from Admin → Platform Settings, reads from DB

---

## Payment Architecture (CloudPay)

```
User deposits:
  Browser → cloudpay-proxy (STK push) → CloudPay → STK to phone
                                              ↓
                                    CloudPay webhook fires
                                              ↓
  cloudpay-callback → credits wallet + sends notification

Admin withdrawals:
  Admin approves → funds sent via M-Pesa (dashboard)
```

**Important:** CloudPay's live base URL must include `www`:
- ✅ `https://www.pay.cloud.or.ke/api`
- ❌ `https://pay.cloud.or.ke/api` (causes 301 redirect → GET → 404)

---

## Admin Setup

1. Register at `/auth`
2. Copy your UUID from Supabase → Auth → Users
3. Edit `003_make_admin.sql` with your UUID and run it in the SQL Editor
4. Log in — you'll be redirected to Admin Overview automatically
5. Go to **Admin → Payment Config** → enter CloudPay credentials → Test → Save

---

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/publishable key |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Alias for anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (edge functions only, never browser) |

CloudPay credentials are stored in `platform_settings` table via Admin → Payment Config.

---

*DerivGrid — Professional trading, CloudPay M-Pesa payments, enterprise grade.*
