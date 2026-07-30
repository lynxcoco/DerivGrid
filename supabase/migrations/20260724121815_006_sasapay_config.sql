-- ═══════════════════════════════════════════════════════════════════════════════
-- Migration 006: SasaPay Payment Configuration
-- Adds SasaPay credential columns to platform_settings.
-- ═══════════════════════════════════════════════════════════════════════════════

alter table platform_settings
  add column if not exists sasapay_base_url      text default 'https://sandbox.sasapay.app',
  add column if not exists sasapay_client_id     text,
  add column if not exists sasapay_client_secret text,
  add column if not exists sasapay_merchant_code text,
  add column if not exists sasapay_network_code  text default '63902',
  add column if not exists sasapay_callback_base text;