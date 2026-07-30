/*
# Migration 009: Fix candle_players missing columns

The resolve-bet Edge Function reads and writes several columns on candle_players
that were never added to the schema migrations. Without these columns the
house-edge algorithm silently fails and player stats are never tracked correctly.

## Columns added
- micro_win_cooldown           — countdown (bets) before next micro-win is allowed
- micro_wins_this_cycle        — count of micro-wins in the current cycle
- daily_micro_win_profit_cents — cumulative micro-win profit credited today
- last_authorized_win_date     — date of most recent full authorized win (used for drought multiplier)
- lifetime_deposits_cents      — total confirmed deposits (drives T-threshold)
- lifetime_withdrawals_cents   — total confirmed withdrawals (drives withdrawal multiplier)
- max_single_deposit_cents     — largest single deposit (used to set dynamic T base)

## Also fixes
- Welcome notification trigger updated to say "DerivGrid" instead of "SmartDeriv"
*/

-- ── candle_players missing columns ──────────────────────────────────────────
alter table candle_players
  add column if not exists micro_win_cooldown           integer default 0 not null,
  add column if not exists micro_wins_this_cycle        integer default 0 not null,
  add column if not exists daily_micro_win_profit_cents bigint  default 0 not null,
  add column if not exists last_authorized_win_date     date,
  add column if not exists lifetime_deposits_cents      bigint  default 0 not null,
  add column if not exists lifetime_withdrawals_cents   bigint  default 0 not null,
  add column if not exists max_single_deposit_cents     bigint  default 0 not null;

-- ── Fix handle_new_user() trigger — correct branding ────────────────────────
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Profile
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');

  -- Wallets (main + trading)
  insert into public.wallets (user_id, wallet_type, currency)
  values
    (new.id, 'main',    'KES'),
    (new.id, 'trading', 'KES');

  -- Default user role
  insert into public.user_roles (user_id, role) values (new.id, 'user');

  -- Candle player record
  insert into public.candle_players (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  -- Welcome notification
  insert into public.notifications (user_id, title, body, type)
  values (new.id,
    'Welcome to DerivGrid!',
    'Your account is set up and ready. Make your first deposit to start trading.',
    'info');

  return new;
end;
$$;

-- ── Keep trigger pointed at updated function ────────────────────────────────
-- (trigger already exists; replace function is sufficient)
