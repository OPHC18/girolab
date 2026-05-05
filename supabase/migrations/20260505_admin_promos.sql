-- ============================================================
-- MIGRACIÓN: Admin Promos — Trials y promociones manuales
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- 1. Añadir columna de nota promo a menter_memberships
ALTER TABLE menter_memberships
  ADD COLUMN IF NOT EXISTS promo_nota TEXT;

-- 2. Tabla de promociones globales
CREATE TABLE IF NOT EXISTS promos (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre        TEXT        NOT NULL,
  tipo          TEXT        NOT NULL DEFAULT 'trial',
  -- tipo: 'trial' = extiende días de prueba en nuevas suscripciones
  --       'acceso' = admin da acceso manual a un plan por N días
  trial_dias    INT         NOT NULL DEFAULT 20,
  aplica_plan   TEXT,       -- null = cualquier plan, o 'starter' | 'premium' | 'master'
  is_active     BOOLEAN     NOT NULL DEFAULT false,
  starts_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at    TIMESTAMPTZ,
  nota          TEXT,
  created_by    UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Solo una promo activa a la vez por tipo (constraint funcional via trigger o enforced en app)
CREATE INDEX IF NOT EXISTS idx_promos_active ON promos (tipo, is_active) WHERE is_active = true;

-- RLS: tabla solo accesible con service role
ALTER TABLE promos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "promos_service_role_only" ON promos;
CREATE POLICY "promos_service_role_only" ON promos
  USING (false) WITH CHECK (false);
