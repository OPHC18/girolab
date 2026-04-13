-- ============================================================
-- MIGRACIÓN: MercadoPago — Membresías, pagos y suscripciones
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- 1. Extender menter_memberships con columnas de suscripción MP
ALTER TABLE menter_memberships
  ADD COLUMN IF NOT EXISTS mp_subscription_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS mp_payer_id        TEXT,
  ADD COLUMN IF NOT EXISTS trial_ends_at      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS next_billing_date  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS downgrade_reason   TEXT;   -- 'payment_failed' | 'cancelled' | 'admin'

-- 2. Extender appointments con referencia a preferencia MP
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS mp_preference_id TEXT;

-- 3. Extender event_registrations con referencia a preferencia MP
ALTER TABLE event_registrations
  ADD COLUMN IF NOT EXISTS mp_preference_id TEXT;

-- 4. Tabla de pagos (audit trail de todas las transacciones)
CREATE TABLE IF NOT EXISTS payments (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  mp_payment_id       TEXT        NOT NULL UNIQUE,
  mp_status           TEXT        NOT NULL,         -- 'approved' | 'rejected' | 'pending' | 'in_process'
  mp_status_detail    TEXT,
  type                TEXT        NOT NULL,         -- 'appointment' | 'event_reg' | 'subscription'
  reference_id        UUID,                         -- FK a appointments.id o event_registrations.id
  menter_id           UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  user_id             UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  amount              NUMERIC(10,2),
  currency            TEXT        DEFAULT 'USD',
  payer_email         TEXT,
  external_reference  TEXT,
  raw_payload         JSONB,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS payments_reference_id_idx ON payments (reference_id);
CREATE INDEX IF NOT EXISTS payments_mp_status_idx    ON payments (mp_status);
CREATE INDEX IF NOT EXISTS payments_user_id_idx      ON payments (user_id);
CREATE INDEX IF NOT EXISTS payments_menter_id_idx    ON payments (menter_id);

-- RLS: cada usuario ve sus propios pagos; escritura solo desde service role
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payments_select_own" ON payments;
CREATE POLICY "payments_select_own" ON payments
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = menter_id);
-- INSERT/UPDATE solo desde service role key (webhook handler)
