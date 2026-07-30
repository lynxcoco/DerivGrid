-- ═══════════════════════════════════════════════════════════════════════════════
-- SmartDeriv — FULL DATABASE SCHEMA
-- Creates all tables, enums, functions, triggers, and RLS policies.
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── Extensions ───────────────────────────────────────────────────────────────
create extension if not exists http with schema extensions;

-- ─── Enums ────────────────────────────────────────────────────────────────────
create type app_role         as enum ('user', 'admin', 'support');
create type wallet_type      as enum ('main', 'trading');
create type transaction_type as enum ('deposit', 'withdrawal', 'transfer_in', 'transfer_out', 'trade_profit', 'trade_loss', 'fee');
create type payment_method   as enum ('mpesa', 'card', 'bank');
create type payment_status   as enum ('pending', 'processing', 'completed', 'failed', 'cancelled');
create type asset_category   as enum ('forex', 'synthetic', 'volatility', 'commodity', 'crypto', 'stock', 'index');
create type trade_side       as enum ('buy', 'sell');
create type position_status  as enum ('open', 'closed', 'cancelled');
create type alert_condition  as enum ('above', 'below');
create type ticket_status    as enum ('open', 'pending', 'resolved', 'closed');
create type ticket_priority  as enum ('low', 'medium', 'high', 'urgent');

-- ─── Profiles ─────────────────────────────────────────────────────────────────
create table profiles (
  id            uuid references auth.users on delete cascade primary key,
  full_name     text,
  avatar_url    text,
  phone         text,
  country       text,
  referral_code text unique default upper(substring(gen_random_uuid()::text from 1 for 8)),
  referred_by   text,
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null
);
alter table profiles enable row level security;
create policy "Users can view own profile"   on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- ─── User Roles ───────────────────────────────────────────────────────────────
create table user_roles (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users on delete cascade not null,
  role       app_role not null,
  created_at timestamptz default now() not null,
  unique (user_id, role)
);
alter table user_roles enable row level security;
create policy "read_own_role" on user_roles for select using (auth.uid() = user_id);

-- SECURITY DEFINER function to check roles (avoids RLS recursion)
create or replace function has_role(_user_id uuid, _role app_role)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from user_roles where user_id = _user_id and role = _role
  );
$$;

-- ─── Wallets ──────────────────────────────────────────────────────────────────
create table wallets (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users on delete cascade not null,
  wallet_type   wallet_type not null,
  balance_cents bigint default 0 not null check (balance_cents >= 0),
  currency      text default 'KES' not null,
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null,
  unique (user_id, wallet_type)
);
alter table wallets enable row level security;
create policy "Users can view own wallets"   on wallets for select using (auth.uid() = user_id);
create policy "Users can update own wallets" on wallets for update using (auth.uid() = user_id);

-- ─── Transactions ─────────────────────────────────────────────────────────────
create table transactions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users on delete cascade not null,
  wallet_id     uuid references wallets on delete cascade not null,
  type          transaction_type not null,
  amount_cents  bigint not null,
  currency      text default 'KES' not null,
  description   text,
  metadata      jsonb,
  created_at    timestamptz default now() not null
);
alter table transactions enable row level security;
create policy "Users can view own transactions"   on transactions for select using (auth.uid() = user_id);
create policy "Users can insert own transactions" on transactions for insert with check (auth.uid() = user_id);
create index on transactions (user_id, created_at desc);

-- ─── Deposits ─────────────────────────────────────────────────────────────────
create table deposits (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users on delete cascade not null,
  wallet_id     uuid references wallets on delete cascade not null,
  amount_cents  bigint not null,
  currency      text default 'KES' not null,
  method        payment_method not null,
  status        payment_status default 'pending' not null,
  provider_ref  text,
  phone         text,
  payload       jsonb,
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null
);
alter table deposits enable row level security;
create policy "Users can view own deposits"    on deposits for select using (auth.uid() = user_id);
create policy "Users can insert own deposits"  on deposits for insert with check (auth.uid() = user_id);
create policy "Users can update own deposits"  on deposits for update using (auth.uid() = user_id);
create index on deposits (user_id, created_at desc);
create index on deposits (provider_ref);

-- ─── Withdrawals ──────────────────────────────────────────────────────────────
create table withdrawals (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users on delete cascade not null,
  wallet_id       uuid references wallets on delete cascade not null,
  amount_cents    bigint not null,
  currency        text default 'KES' not null,
  method          payment_method not null,
  status          payment_status default 'pending' not null,
  provider_ref    text,
  phone           text,
  account_details jsonb,
  payload         jsonb,
  created_at      timestamptz default now() not null,
  updated_at      timestamptz default now() not null
);
alter table withdrawals enable row level security;
create policy "Users can view own withdrawals"    on withdrawals for select using (auth.uid() = user_id);
create policy "Users can insert own withdrawals"  on withdrawals for insert with check (auth.uid() = user_id);
create policy "Users can update own withdrawals"  on withdrawals for update using (auth.uid() = user_id);
create index on withdrawals (user_id, created_at desc);

-- ─── Assets ───────────────────────────────────────────────────────────────────
create table assets (
  id            uuid primary key default gen_random_uuid(),
  symbol        text unique not null,
  name          text not null,
  category      asset_category not null,
  is_active     boolean default true not null,
  pip_size      numeric default 0.0001 not null,
  contract_size numeric default 100000 not null,
  created_at    timestamptz default now() not null
);
alter table assets enable row level security;
create policy "Anyone can view active assets" on assets for select using (is_active = true);

-- Seed default assets
insert into assets (symbol, name, category, pip_size, contract_size) values
  ('EUR/USD',      'Euro / US Dollar',            'forex',     0.0001, 100000),
  ('GBP/USD',      'Pound / US Dollar',           'forex',     0.0001, 100000),
  ('USD/JPY',      'US Dollar / Yen',             'forex',     0.01,   100000),
  ('AUD/USD',      'Australian Dollar / USD',     'forex',     0.0001, 100000),
  ('USD/CAD',      'US Dollar / Canadian Dollar', 'forex',     0.0001, 100000),
  ('XAU/USD',      'Gold / US Dollar',            'commodity', 0.01,   100),
  ('XAG/USD',      'Silver / US Dollar',          'commodity', 0.001,  1000),
  ('BTC/USD',      'Bitcoin / US Dollar',         'crypto',    0.01,   1),
  ('ETH/USD',      'Ethereum / US Dollar',        'crypto',    0.01,   1),
  ('Volatility 75',  'Volatility 75 Index',       'synthetic', 0.01,   1),
  ('Volatility 100', 'Volatility 100 Index',      'synthetic', 0.01,   1),
  ('AAPL',         'Apple Inc.',                  'stock',     0.01,   1),
  ('MSFT',         'Microsoft Corp.',             'stock',     0.01,   1),
  ('US500',        'S&P 500 Index',               'index',     0.01,   1);

-- ─── Positions ────────────────────────────────────────────────────────────────
create table positions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users on delete cascade not null,
  asset_id     text not null,
  side         trade_side not null,
  lot_size     numeric not null,
  entry_price  numeric not null,
  exit_price   numeric,
  take_profit  numeric,
  stop_loss    numeric,
  status       position_status default 'open' not null,
  pnl_cents    bigint,
  opened_at    timestamptz default now() not null,
  closed_at    timestamptz
);
alter table positions enable row level security;
create policy "Users can manage own positions" on positions for all using (auth.uid() = user_id);
create index on positions (user_id, status, opened_at desc);

-- ─── Price Alerts ─────────────────────────────────────────────────────────────
create table price_alerts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users on delete cascade not null,
  asset_id     text not null,
  target_price numeric not null,
  condition    alert_condition not null,
  is_triggered boolean default false not null,
  note         text,
  created_at   timestamptz default now() not null,
  triggered_at timestamptz
);
alter table price_alerts enable row level security;
create policy "Users can manage own alerts" on price_alerts for all using (auth.uid() = user_id);

-- ─── Watchlist ────────────────────────────────────────────────────────────────
create table watchlist (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users on delete cascade not null,
  asset_id   uuid references assets not null,
  created_at timestamptz default now() not null,
  unique (user_id, asset_id)
);
alter table watchlist enable row level security;
create policy "Users can manage own watchlist" on watchlist for all using (auth.uid() = user_id);

-- ─── Support Tickets ──────────────────────────────────────────────────────────
create table support_tickets (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users on delete cascade not null,
  subject    text not null,
  status     ticket_status   default 'open'   not null,
  priority   ticket_priority default 'medium' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
alter table support_tickets enable row level security;
create policy "Users can manage own tickets" on support_tickets for all using (auth.uid() = user_id);

create table ticket_messages (
  id         uuid primary key default gen_random_uuid(),
  ticket_id  uuid references support_tickets on delete cascade not null,
  user_id    uuid references auth.users on delete cascade not null,
  body       text not null,
  is_staff   boolean default false not null,
  created_at timestamptz default now() not null
);
alter table ticket_messages enable row level security;
create policy "Users can view messages on own tickets" on ticket_messages for select using (
  exists (select 1 from support_tickets t where t.id = ticket_id and t.user_id = auth.uid())
);
create policy "Users can insert messages on own tickets" on ticket_messages for insert with check (
  auth.uid() = user_id and
  exists (select 1 from support_tickets t where t.id = ticket_id and t.user_id = auth.uid())
);

-- ─── Notifications ────────────────────────────────────────────────────────────
create table notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users on delete cascade not null,
  title      text not null,
  body       text not null,
  type       text default 'info' not null,
  is_read    boolean default false not null,
  metadata   jsonb,
  created_at timestamptz default now() not null
);
alter table notifications enable row level security;
create policy "Users can manage own notifications" on notifications for all using (auth.uid() = user_id);
create index on notifications (user_id, is_read, created_at desc);

-- ─── Platform Settings ────────────────────────────────────────────────────────
create table if not exists platform_settings (
  id                        text primary key default 'global',
  min_deposit_cents         bigint default 100 not null,
  max_deposit_cents         bigint default 15000000 not null,
  min_withdrawal_cents      bigint default 1000 not null,
  max_withdrawal_cents      bigint default 30000000 not null,
  auto_approve_deposits     boolean default true not null,
  require_admin_withdrawals boolean default true not null,
  maintenance_mode          boolean default false not null,
  email_notifications       boolean default true not null,
  updated_by                uuid references auth.users,
  updated_at                timestamptz default now() not null
);
alter table platform_settings enable row level security;
create policy "Admins can manage platform settings" on platform_settings
  for all using (has_role(auth.uid(), 'admin'::app_role));
create policy "Anyone can read platform settings"   on platform_settings
  for select using (true);
insert into platform_settings (id) values ('global') on conflict (id) do nothing;

-- ─── Candle Prediction Game ───────────────────────────────────────────────────
create table if not exists candle_players (
  id                        uuid primary key default gen_random_uuid(),
  user_id                   uuid references auth.users on delete cascade not null unique,
  lifetime_deposits_cents   bigint default 0 not null,
  lifetime_withdrawals_cents bigint default 0 not null,
  session_losses_cents      bigint default 0 not null,
  max_single_deposit_cents  bigint default 0 not null,
  loss_streak_counter       integer default 0 not null,
  micro_win_flag            boolean default false not null,
  pending_authorized_win    boolean default false not null,
  first_bet_today           boolean default true not null,
  last_midnight_check       date,
  created_at                timestamptz default now() not null,
  updated_at                timestamptz default now() not null
);
alter table candle_players enable row level security;
create policy "Users can read own candle profile"   on candle_players for select using (auth.uid() = user_id);

create table if not exists candle_bets (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid references auth.users on delete cascade not null,
  bet_amount_cents   bigint not null,
  prediction         text not null check (prediction in ('up', 'down')),
  outcome            text not null check (outcome in ('win', 'loss')),
  multiplier         numeric(6,2) not null,
  gross_return_cents bigint not null,
  net_profit_cents   bigint not null,
  silent_bonus_cents bigint default 0 not null,
  message            text,
  created_at         timestamptz default now() not null
);
alter table candle_bets enable row level security;
create policy "Users can read own candle bets"  on candle_bets for select using (auth.uid() = user_id);
create index on candle_bets (user_id, created_at desc);

-- ─── IntaSend STK Push RPC ────────────────────────────────────────────────────
create or replace function initiate_stk_push(
  _amount_kes numeric,
  _phone      text,
  _api_ref    text
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  _response extensions.http_response;
  _secret   text := 'ISSecretKey_test_e14b0e78-e85a-4846-b1cb-7be02cb5852d';
  _pub_key  text := 'ISPubKey_test_a9e87764-738d-4812-9585-e5a51a4e2bed';
  _body     json;
begin
  _body := json_build_object(
    'public_key',   _pub_key,
    'amount',       _amount_kes,
    'phone_number', _phone,
    'narrative',    'SmartDeriv Deposit',
    'api_ref',      _api_ref
  );
  select * into _response
  from extensions.http((
    'POST',
    'https://sandbox.intasend.com/api/v1/payment/mpesa-stk-push/',
    ARRAY[
      extensions.http_header('Authorization', 'Bearer ' || _secret),
      extensions.http_header('X-IntaSend-Public-Key', _pub_key),
      extensions.http_header('Content-Type', 'application/json')
    ],
    'application/json',
    _body::text
  )::extensions.http_request);
  return _response.content::json;
end;
$$;

create or replace function check_payment_status(_invoice_id text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  _response extensions.http_response;
  _secret   text := 'ISSecretKey_test_e14b0e78-e85a-4846-b1cb-7be02cb5852d';
  _pub_key  text := 'ISPubKey_test_a9e87764-738d-4812-9585-e5a51a4e2bed';
begin
  select * into _response
  from extensions.http((
    'GET',
    'https://sandbox.intasend.com/api/v1/payment/collection/?invoice_id=' || _invoice_id,
    ARRAY[
      extensions.http_header('Authorization', 'Bearer ' || _secret),
      extensions.http_header('X-IntaSend-Public-Key', _pub_key)
    ],
    'application/json',
    NULL
  )::extensions.http_request);
  return _response.content::json;
end;
$$;

grant execute on function initiate_stk_push(numeric, text, text) to authenticated;
grant execute on function check_payment_status(text) to authenticated;

-- ─── Trigger: Auto-create profile + wallets + role on signup ─────────────────
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');

  insert into public.wallets (user_id, wallet_type, currency)
  values
    (new.id, 'main',    'KES'),
    (new.id, 'trading', 'KES');

  insert into public.user_roles (user_id, role) values (new.id, 'user');

  insert into public.candle_players (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  insert into public.notifications (user_id, title, body, type)
  values (new.id,
    'Welcome to SmartDeriv!',
    'Your account is set up and ready. Make your first deposit to start trading.',
    'info');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Now add admin-scoped policies (has_role exists at this point)
create policy "Admins can view all profiles" on profiles for select using (has_role(auth.uid(), 'admin'::app_role));
create policy "Admins can view all wallets"  on wallets for select using (has_role(auth.uid(), 'admin'::app_role));
create policy "Admins can update all wallets" on wallets for update using (has_role(auth.uid(), 'admin'::app_role));
create policy "Admins can view all transactions" on transactions for select using (has_role(auth.uid(), 'admin'::app_role));
create policy "Admins can insert transactions" on transactions for insert with check (has_role(auth.uid(), 'admin'::app_role));
create policy "Admins can view all deposits" on deposits for select using (has_role(auth.uid(), 'admin'::app_role));
create policy "Admins can update all deposits" on deposits for update using (has_role(auth.uid(), 'admin'::app_role));
create policy "Admins can view all withdrawals" on withdrawals for select using (has_role(auth.uid(), 'admin'::app_role));
create policy "Admins can update all withdrawals" on withdrawals for update using (has_role(auth.uid(), 'admin'::app_role));
create policy "Admins can manage assets" on assets for all using (has_role(auth.uid(), 'admin'::app_role));
create policy "Admins can view all positions" on positions for select using (has_role(auth.uid(), 'admin'::app_role));
create policy "Admins can view all tickets" on support_tickets for select using (has_role(auth.uid(), 'admin'::app_role));
create policy "Admins can update all tickets" on support_tickets for update using (has_role(auth.uid(), 'admin'::app_role));
create policy "Admins can view all ticket messages" on ticket_messages for select using (has_role(auth.uid(), 'admin'::app_role));
create policy "Admins can insert ticket messages" on ticket_messages for insert with check (has_role(auth.uid(), 'admin'::app_role));
create policy "Admins can insert notifications" on notifications for insert with check (has_role(auth.uid(), 'admin'::app_role));
create policy "Admins can view all notifications" on notifications for select using (has_role(auth.uid(), 'admin'::app_role));
create policy "Admins can delete notifications" on notifications for delete using (has_role(auth.uid(), 'admin'::app_role));
create policy "Admins can read all candle players" on candle_players for select using (has_role(auth.uid(), 'admin'::app_role));
create policy "Admins can read all candle bets" on candle_bets for select using (has_role(auth.uid(), 'admin'::app_role));