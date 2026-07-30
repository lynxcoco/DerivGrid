-- ═══════════════════════════════════════════════════════════════════════════════
-- Migration 004: Production Patches
-- Replaces platform_settings with typed columns, adds marketer role,
-- adds Daraja payment config columns, and min_bet_cents setting.
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── Part A: Rebuild platform_settings with typed columns ─────────────────────
drop policy if exists "Admins can manage platform settings" on platform_settings;
drop policy if exists "Anyone can read platform settings" on platform_settings;

alter table platform_settings
  add column if not exists min_deposit_cents         bigint  default 10000   not null,
  add column if not exists max_deposit_cents         bigint  default 15000000 not null,
  add column if not exists min_withdrawal_cents      bigint  default 20000   not null,
  add column if not exists max_withdrawal_cents      bigint  default 30000000 not null,
  add column if not exists min_bet_cents             bigint  default 10000   not null;

-- Re-create admin policy with explicit cast
create policy "Admins can manage platform settings"
  on platform_settings for all
  using (exists (select 1 from user_roles where user_id = auth.uid() and role = 'admin'));

create policy "Authenticated users can read platform settings"
  on platform_settings for select
  using (auth.role() = 'authenticated');

-- ─── Part B: Marketer role + candle_players columns ──────────────────────────
alter type app_role add value if not exists 'marketer';

alter table candle_players
  add column if not exists mktr_bets_since_cluster  integer default 0 not null,
  add column if not exists mktr_losses_remaining    integer default 0 not null,
  add column if not exists mktr_wins_until_cluster  integer default 7 not null;

-- ─── Part C: Daraja payment config columns ───────────────────────────────────
alter table platform_settings
  add column if not exists daraja_base_url            text,
  add column if not exists daraja_consumer_key        text,
  add column if not exists daraja_consumer_secret     text,
  add column if not exists stk_shortcode              text,
  add column if not exists stk_passkey                text,
  add column if not exists stk_transaction_type       text default 'CustomerPayBillOnline',
  add column if not exists b2c_shortcode              text,
  add column if not exists b2c_initiator_name         text,
  add column if not exists daraja_security_credential text,
  add column if not exists daraja_callback_base       text;