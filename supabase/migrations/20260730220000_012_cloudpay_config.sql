/*
# Migration 012: CloudPay Payment Configuration
Adds CloudPay credential columns to platform_settings.
CloudPay replaces SasaPay as the primary payment provider.
*/

alter table platform_settings
  add column if not exists cloudpay_base_url       text default 'https://pay.cloud.or.ke/api',
  add column if not exists cloudpay_consumer_key   text,
  add column if not exists cloudpay_consumer_secret text,
  add column if not exists cloudpay_callback_url   text,
  add column if not exists cloudpay_signing_secret  text;

-- Set live credentials immediately
update platform_settings set
  cloudpay_base_url        = 'https://pay.cloud.or.ke/api',
  cloudpay_consumer_key    = '826e0a3fa7573665df054ce2f4cc310b',
  cloudpay_consumer_secret = 'a9770a9356fe74d7f9404682878ba1c66ae920b1612e8390',
  cloudpay_callback_url    = 'https://oevuqograxqkensvqxzt.supabase.co/functions/v1/cloudpay-callback',
  updated_at               = now()
where id = 'global';
