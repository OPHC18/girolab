-- ============================================================
-- ROLLBACK de 20260803_evaluacion_links.sql
-- Ejecutar SOLO si hay que deshacer la migración.
-- Deja la base exactamente como estaba antes.
-- ============================================================
--
-- OJO: borra los links de evaluación y sus participantes creados
-- DESPUÉS de la migración. No toca nada anterior: las sesiones,
-- resultados, créditos y perfiles de puesto quedan intactos.
-- ============================================================

BEGIN;

-- 1. Vista
DROP VIEW IF EXISTS v_link_participantes;

-- 2. Columnas agregadas a tablas existentes
ALTER TABLE assessment_sessions
  DROP COLUMN IF EXISTS participante_id,
  DROP COLUMN IF EXISTS link_id;

ALTER TABLE job_profiles
  DROP COLUMN IF EXISTS candidatos;

ALTER TABLE instrumento_compras
  DROP COLUMN IF EXISTS otorgado_por,
  DROP COLUMN IF EXISTS nota;

-- 3. Tablas nuevas (CASCADE limpia sus policies e índices)
DROP TABLE IF EXISTS assessment_link_participants CASCADE;
DROP TABLE IF EXISTS assessment_links CASCADE;

-- 4. Funciones de créditos
DROP FUNCTION IF EXISTS consumir_creditos(UUID, INT);
DROP FUNCTION IF EXISTS ajustar_creditos(UUID, INT);

-- 5. Índice único de créditos
--    Se deja comentado a propósito: es inofensivo y puede haber existido
--    antes de esta migración (los upserts con onConflict lo necesitan).
-- DROP INDEX IF EXISTS idx_instrumento_creditos_empresa;

COMMIT;
