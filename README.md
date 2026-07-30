# DerivGrid

A professional online trading platform built with TanStack Start, Supabase, and SasaPay.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TanStack Start, TailwindCSS v4, shadcn/ui |
| Backend | Supabase (PostgreSQL, Auth, Realtime, Edge Functions) |
| Payments | SasaPay (C2B STK Push + B2C disbursements via M-PESA, Airtel, T-Kash) |
| Charts | Lightweight Charts (TradingView library) |
| Deployment | Lovable / Cloudflare (frontend) + Supabase (backend) |

---

## Quick Start (Local Development)

### Prerequisites

- Node.js 20+ (or Bun)
- A Supabase project — [supabase.com](https://supabase.com)
- A SasaPay Developer account — [developer.sasapay.app](https://developer.sasapay.app)

### 1. Clone and install

```bash
git clone <your-repo-url>
cd project
npm install
```

### 2. Set up environment variables

Edit `.env` and fill in your keys:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key   # same value, different alias
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key        # required for edge functions locally
```

> Never commit real credentials. The `.env` file is gitignored.

### 3. Run database migrations

In the **Supabase SQL Editor**, run these files **in order**:

1. `supabase/migrations/001_full_schema.sql` — complete DB schema
2. `supabase/migrations/004_production_patches.sql` — marketer role + payment config columns
3. `supabase/migrations/005_admin_roles_fix.sql` — admin role management RPCs
4. `supabase/migrations/006_sasapay_config.sql` — SasaPay credential columns
5. `supabase/migrations/20260730082338_007_fix_function_security.sql` — security hardening
6. `supabase/migrations/20260730082431_008_revoke_public_execute.sql` — revoke public execute
7. `supabase/migrations/20260730212834_009_candle_players_missing_columns.sql` — fix candle game columns
8. `supabase/migrations/20260730212835_010_candle_players_sync_triggers.sql` — auto-sync player stats
9. `supabase/migrations/003_make_admin.sql` — **edit the UUID** to your user ID first

> The timestamped migrations (20260724*) are duplicates of 001/004/005/006 for Supabase's migration tracker — do not run both sets if using `supabase db push`.

### 4. Deploy Edge Functions

```bash
export SUPABASE_ACCESS_TOKEN="your_supabase_management_token"

npx supabase functions deploy sasapay-proxy   --project-ref YOUR_PROJECT_REF --no-verify-jwt --use-api
npx supabase functions deploy sasapay-callback --project-ref YOUR_PROJECT_REF --no-verify-jwt --use-api
npx supabase functions deploy resolve-bet      --project-ref YOUR_PROJECT_REF --no-verify-jwt --use-api
```

### 5. Configure SasaPay credentials

Start the dev server:
```bash
npm run dev
```

Log in → Admin → **Payment Config** → enter your SasaPay credentials → Save.

See [`PAYMENTS.md`](./PAYMENTS.md) for the complete SasaPay setup guide.

### 6. Grant yourself admin access

After registering, find your user UUID in **Supabase → Auth → Users**, then run
`003_make_admin.sql` (with your UUID) in the SQL Editor.

---

## Project Structure

```
src/
  routes/
    _authenticated/         ← All protected pages (requires login)
      admin/                ← Admin-only pages
        overview.tsx        ← Admin dashboard with KPIs
        users.tsx           ← User management + role assignment
        deposits.tsx        ← Deposit review / approval
        withdrawals.tsx     ← Withdrawal processing (SasaPay B2C)
        trades.tsx          ← Candle Predict bet history
        reports.tsx         ← Finance reports with CSV export
        announcements.tsx   ← Broadcast notifications to all users
        tickets.tsx         ← Support ticket management
        assets.tsx          ← Enable/disable tradeable assets
        audit.tsx           ← Platform event audit log
        payment-config.tsx  ← SasaPay credentials UI
        platform-settings.tsx ← Limits, toggles, maintenance mode
      candle-trade.tsx      ← Candle Predict game (10s binary prediction)
      trade.tsx             ← Pro Trader terminal (forex/crypto/indices)
      wallet.deposit.tsx    ← M-Pesa deposit (SasaPay STK push)
      wallet.withdraw.tsx   ← M-Pesa withdrawal request
      wallet.tsx            ← Wallet overview + transaction history
      dashboard.tsx         ← User dashboard
      history.tsx           ← Trade and transaction history
      alerts.tsx            ← Price alerts
      notifications.tsx     ← In-app notifications
      profile.tsx           ← Profile management
      settings.tsx          ← User preferences
      support.tsx           ← Support tickets + FAQ
    auth.tsx                ← Login / Register (email + Google OAuth)
    forgot-password.tsx     ← Password reset request
    reset-password.tsx      ← Password reset completion
    index.tsx               ← Landing page

supabase/
  functions/
    sasapay-proxy/          ← SasaPay API proxy (C2B STK push + B2C)
    sasapay-callback/       ← SasaPay webhook handler (deposit + withdrawal results)
    resolve-bet/            ← Candle Predict house-edge algorithm
    daraja-proxy/           ← Legacy Daraja proxy (kept, not used)
    daraja-callback/        ← Legacy Daraja callback (kept, not used)
  migrations/
    001_full_schema.sql     ← Complete DB schema (run once)
    003_make_admin.sql      ← Grant admin role (edit UUID first)
    004_production_patches.sql ← Marketer role + payment config
    005_admin_roles_fix.sql ← Admin role management RPCs
    006_sasapay_config.sql  ← SasaPay credential columns
    007_fix_function_security.sql ← Security hardening
    008_revoke_public_execute.sql ← Revoke public execute
    009_candle_players_missing_columns.sql ← Candle game fixes
    010_candle_players_sync_triggers.sql   ← Auto-sync player stats
```

---

## Features

- **Candle Predict** — 10-second binary prediction game with live simulated candlestick chart. Sophisticated house-edge algorithm. Separate "marketer" mode for demo accounts.
- **Pro Trader** — Full-featured order terminal with multiple assets, TP/SL, position tracking
- **M-Pesa Deposits** — STK Push via SasaPay C2B, wallet credited automatically on confirmation
- **M-Pesa Withdrawals** — B2C payout via SasaPay, admin-approved
- **Admin Panel** — Full platform management: users, deposits, withdrawals, trades, reports, announcements, support tickets, assets, audit log, payment config, platform settings
- **Maintenance Mode** — Toggle from Admin → Platform Settings, no redeploy needed (reads from DB)
- **Real-time Balance** — Wallet updates instantly via Supabase Realtime
- **Price Alerts** — Set target prices, get in-app notifications when triggered
- **Support System** — Full ticket system with message threads for users and admin staff

---

## Payment Architecture

```
User (browser)
    │
    ├─ Deposit: sasapay-proxy (C2B STK push) → SasaPay → STK to phone
    │                                                │
    │                                    SasaPay fires callback
    │                                                │
    └─ sasapay-callback ← credits wallet + notifies user

Admin (browser)
    │
    └─ Approve withdrawal → sasapay-proxy (B2C) → SasaPay → money to phone
                                                        │
                                            SasaPay fires callback
                                                        │
                                        sasapay-callback updates withdrawal status
```

See [`PAYMENTS.md`](./PAYMENTS.md) for full setup instructions and production deployment.

---

## Environment Variables Reference

| Variable | Used by | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Frontend | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Frontend | Supabase anon/publishable key |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Frontend | Alias for anon key (some tooling uses this name) |
| `SUPABASE_URL` | Edge Functions | Supabase project URL |
| `SUPABASE_ANON_KEY` | Edge Functions | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge Functions | Service role key — bypasses RLS. **Never expose to browser.** |
| `SASAPAY_*` | Edge Functions (secrets) | SasaPay credentials — set via Admin → Payment Config or `supabase secrets set` |

---

## Admin Setup

1. Register an account at `/auth`
2. Find your user UUID in Supabase → Auth → Users
3. Edit `003_make_admin.sql` with your UUID and run it in the SQL Editor
4. Log in — you'll be redirected to Admin Overview automatically
5. Go to Admin → Payment Config → enter your SasaPay credentials
6. Go to Admin → Platform Settings → configure limits and toggles

---

## Security

- RLS (Row Level Security) enabled on all tables
- All SasaPay secrets stored in Supabase DB (admin-only RLS) or edge function secrets
- No credentials in source code or browser
- HMAC-SHA512 signature verification on all SasaPay callbacks
- Idempotency checks prevent double-crediting on duplicate callbacks
- SECURITY DEFINER functions have pinned `search_path` to prevent hijacking
- Public execute revoked from internal helper functions

---

*DerivGrid — Professional trading, SasaPay payments, enterprise grade.*
