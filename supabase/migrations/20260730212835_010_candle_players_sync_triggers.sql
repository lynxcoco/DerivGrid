/*
# Migration 010: Auto-sync candle_players lifetime stats

The resolve-bet algorithm uses lifetime_deposits_cents, lifetime_withdrawals_cents,
and max_single_deposit_cents on candle_players to calculate the house-edge T-threshold.
Without these being updated, the algorithm always sees zeroes and the threshold logic
never fires correctly.

This migration adds triggers that keep these columns in sync automatically
whenever a deposit or withdrawal is marked "completed".
*/

-- ── Trigger function: update candle_players on deposit completed ─────────────
create or replace function sync_candle_player_on_deposit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Only act when status transitions TO completed
  if NEW.status = 'completed' and (OLD.status is distinct from 'completed') then
    insert into candle_players (user_id, lifetime_deposits_cents, max_single_deposit_cents)
    values (NEW.user_id, NEW.amount_cents, NEW.amount_cents)
    on conflict (user_id) do update
      set lifetime_deposits_cents = candle_players.lifetime_deposits_cents + NEW.amount_cents,
          max_single_deposit_cents = greatest(candle_players.max_single_deposit_cents, NEW.amount_cents),
          updated_at = now();
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_deposit_sync_candle_player on deposits;
create trigger trg_deposit_sync_candle_player
  after update on deposits
  for each row execute procedure sync_candle_player_on_deposit();

-- ── Trigger function: update candle_players on withdrawal completed ──────────
create or replace function sync_candle_player_on_withdrawal()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Only act when status transitions TO completed
  if NEW.status = 'completed' and (OLD.status is distinct from 'completed') then
    insert into candle_players (user_id, lifetime_withdrawals_cents)
    values (NEW.user_id, NEW.amount_cents)
    on conflict (user_id) do update
      set lifetime_withdrawals_cents = candle_players.lifetime_withdrawals_cents + NEW.amount_cents,
          updated_at = now();
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_withdrawal_sync_candle_player on withdrawals;
create trigger trg_withdrawal_sync_candle_player
  after update on withdrawals
  for each row execute procedure sync_candle_player_on_withdrawal();

-- ── Backfill existing completed data ────────────────────────────────────────
-- Recalculate lifetime stats from all existing completed deposits/withdrawals.
-- Safe to run multiple times (uses absolute recalculation, not increments).
with dep_totals as (
  select user_id,
         sum(amount_cents)  as total_deposits,
         max(amount_cents)  as max_deposit
  from deposits
  where status = 'completed'
  group by user_id
),
wd_totals as (
  select user_id,
         sum(amount_cents) as total_withdrawals
  from withdrawals
  where status = 'completed'
  group by user_id
)
insert into candle_players (user_id, lifetime_deposits_cents, max_single_deposit_cents, lifetime_withdrawals_cents)
select
  coalesce(d.user_id, w.user_id)            as user_id,
  coalesce(d.total_deposits, 0)             as lifetime_deposits_cents,
  coalesce(d.max_deposit, 0)                as max_single_deposit_cents,
  coalesce(w.total_withdrawals, 0)          as lifetime_withdrawals_cents
from dep_totals d
full outer join wd_totals w on d.user_id = w.user_id
on conflict (user_id) do update
  set lifetime_deposits_cents   = excluded.lifetime_deposits_cents,
      max_single_deposit_cents  = excluded.max_single_deposit_cents,
      lifetime_withdrawals_cents = excluded.lifetime_withdrawals_cents,
      updated_at = now();
