-- ============================================================
-- MIGRACIÓN: cobro por test terminado + perfil de puesto con tests
-- Ejecutar en Supabase SQL Editor (después de 20260803_evaluacion_links.sql)
-- ============================================================
--
-- Cambia la regla de negocio decidida por Omar:
--   · Generar un link es GRATIS.
--   · Se cobra 1 crédito por cada test que una persona TERMINA.
--     3 tests rendidos por 1 persona = 3 créditos.
--   · Un test abandonado a la mitad NO cobra.
--   · El link NUNCA deja de funcionar por falta de créditos: si el saldo
--     llega a cero se le avisa al dueño por correo, pero las personas
--     pueden seguir respondiendo. Por eso el saldo puede quedar negativo:
--     es la deuda pendiente, y es información que Omar necesita ver.
--
-- Además, el perfil de puesto pasa a guardar qué tests incluye y el link
-- que se generó para esa vacante.
-- ============================================================

BEGIN;

-- ============================================================
-- 1. CRÉDITOS
-- ============================================================

-- Marca de cuándo se avisó por correo que se acabaron los créditos,
-- para no repetir el aviso en cada test.
ALTER TABLE instrumento_creditos
  ADD COLUMN IF NOT EXISTS aviso_sin_creditos_at TIMESTAMPTZ;

-- Cobro por test terminado. A diferencia de consumir_creditos, este NO
-- falla ni se detiene en cero: la persona ya rindió el test y no se le
-- puede quitar el resultado. El saldo negativo refleja lo que se debe.
CREATE OR REPLACE FUNCTION consumir_credito_test(p_user_id UUID, p_cantidad INT DEFAULT 1)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_saldo INT;
BEGIN
  INSERT INTO instrumento_creditos (empresa_id, creditos, updated_at)
  VALUES (p_user_id, -p_cantidad, now())
  ON CONFLICT (empresa_id) DO UPDATE
    SET creditos   = instrumento_creditos.creditos - p_cantidad,
        updated_at = now()
  RETURNING creditos INTO v_saldo;

  RETURN v_saldo;
END;
$$;

-- ajustar_creditos deja de aplastar el saldo a cero: si alguien quedó en
-- -3 y se le acreditan 5, debe terminar en 2, no en 5. Aplastar a cero
-- perdonaba deuda en silencio.
-- Al volver a saldo positivo se limpia el aviso, para que el próximo
-- agotamiento vuelva a notificarse.
CREATE OR REPLACE FUNCTION ajustar_creditos(p_user_id UUID, p_delta INT)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_saldo INT;
BEGIN
  INSERT INTO instrumento_creditos (empresa_id, creditos, updated_at)
  VALUES (p_user_id, p_delta, now())
  ON CONFLICT (empresa_id) DO UPDATE
    SET creditos   = instrumento_creditos.creditos + p_delta,
        updated_at = now()
  RETURNING creditos INTO v_saldo;

  IF v_saldo > 0 THEN
    UPDATE instrumento_creditos
       SET aviso_sin_creditos_at = NULL
     WHERE empresa_id = p_user_id;
  END IF;

  RETURN v_saldo;
END;
$$;

REVOKE EXECUTE ON FUNCTION consumir_credito_test(UUID, INT) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION ajustar_creditos(UUID, INT)      FROM PUBLIC, anon, authenticated;


-- ============================================================
-- 2. IDEMPOTENCIA DEL COBRO
-- ============================================================
-- Sin esta marca, un reintento al guardar el resultado (o un doble clic)
-- cobraría el mismo test dos veces.

ALTER TABLE assessment_sessions
  ADD COLUMN IF NOT EXISTS credito_cobrado_at TIMESTAMPTZ;


-- ============================================================
-- 3. PERFIL DE PUESTO: qué tests incluye y su link
-- ============================================================

ALTER TABLE job_profiles
  ADD COLUMN IF NOT EXISTS instrument_ids TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS link_id        UUID REFERENCES assessment_links(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_job_profiles_link ON job_profiles (link_id);

-- job_profiles YA tiene RLS activo y políticas de lectura/alta que funcionan
-- (verificado: el anónimo no ve filas y el dashboard crea perfiles sin
-- problema). No se tocan. Solo se agregan los permisos que faltaban para
-- las funciones nuevas de editar y eliminar, acotados al dueño.
-- Las políticas permisivas se suman a las existentes, nunca las restringen.

DROP POLICY IF EXISTS "job_profiles_owner_update" ON job_profiles;
CREATE POLICY "job_profiles_owner_update" ON job_profiles
  FOR UPDATE
  USING      (auth.uid() = empresa_id OR auth.uid() = menter_id)
  WITH CHECK (auth.uid() = empresa_id OR auth.uid() = menter_id);

DROP POLICY IF EXISTS "job_profiles_owner_delete" ON job_profiles;
CREATE POLICY "job_profiles_owner_delete" ON job_profiles
  FOR DELETE
  USING (auth.uid() = empresa_id OR auth.uid() = menter_id);

COMMIT;
