-- 20260412_paypal_subscriptions.sql
-- Migra menter_memberships de MercadoPago a PayPal

ALTER TABLE menter_memberships
  ADD COLUMN IF NOT EXISTS paypal_subscription_id TEXT UNIQUE;

-- Índice para lookups por webhook
CREATE INDEX IF NOT EXISTS idx_menter_memberships_paypal_sub
  ON menter_memberships(paypal_subscription_id)
  WHERE paypal_subscription_id IS NOT NULL;
