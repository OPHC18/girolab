-- ============================================================
-- MIGRACIÓN: Links de evaluación multiuso + multi-instrumento
--            y gestión atómica de créditos
-- Ejecutar en Supabase SQL Editor
-- ============================================================
--
-- Qué resuelve:
--   1. Los créditos solo se podían obtener comprando por PayPal y el
--      descuento se hacía desde el navegador (manipulable). Ahora todo
--      movimiento de créditos pasa por funciones atómicas server-side,
--      y el admin puede asignarlos a mano.
--   2. Un link de evaluación era UNA sesión: lo usaba una sola persona.
--      Ahora un link es una plantilla reutilizable (como un formulario);
--      cada persona que entra genera su propio participante y sus propias
--      sesiones, quede registrada o no en la plataforma.
--   3. Un link llevaba un solo instrumento. Ahora lleva varios y la
--      persona los rinde encadenados desde una única URL.
--
-- Compatibilidad: no se toca create_assessment_link ni las sesiones
-- existentes. Los links ya repartidos siguen funcionando igual.
--
-- Todo corre dentro de una transacción: si cualquier sentencia falla,
-- Postgres revierte el bloque completo y la base queda como estaba.
-- ============================================================

BEGIN;


-- ============================================================
-- 1. CRÉDITOS — movimientos atómicos y auditoría
-- ============================================================

-- ON CONFLICT (empresa_id) necesita un índice único sobre esa columna.
CREATE UNIQUE INDEX IF NOT EXISTS idx_instrumento_creditos_empresa
  ON instrumento_creditos (empresa_id);

-- Auditoría: instrumento_compras pasa a ser el libro mayor de créditos.
-- Las asignaciones del admin se registran con pack_id = 'admin_grant'.
ALTER TABLE instrumento_compras
  ADD COLUMN IF NOT EXISTS nota         TEXT,
  ADD COLUMN IF NOT EXISTS otorgado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Suma (o resta, con delta negativo) créditos. Nunca deja el saldo bajo cero.
-- Devuelve el saldo resultante.
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
  VALUES (p_user_id, GREATEST(0, p_delta), now())
  ON CONFLICT (empresa_id) DO UPDATE
    SET creditos   = GREATEST(0, instrumento_creditos.creditos + p_delta),
        updated_at = now()
  RETURNING creditos INTO v_saldo;

  RETURN v_saldo;
END;
$$;

-- Descuenta créditos solo si alcanzan. Si no, aborta la transacción con
-- CREDITOS_INSUFICIENTES — así el cobro y la creación del link son atómicos.
CREATE OR REPLACE FUNCTION consumir_creditos(p_user_id UUID, p_cantidad INT)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_saldo INT;
BEGIN
  IF p_cantidad <= 0 THEN
    RAISE EXCEPTION 'CANTIDAD_INVALIDA';
  END IF;

  UPDATE instrumento_creditos
     SET creditos   = creditos - p_cantidad,
         updated_at = now()
   WHERE empresa_id = p_user_id
     AND creditos  >= p_cantidad
  RETURNING creditos INTO v_saldo;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'CREDITOS_INSUFICIENTES';
  END IF;

  RETURN v_saldo;
END;
$$;

-- Ninguna de las dos se expone al cliente: solo service_role las ejecuta.
REVOKE EXECUTE ON FUNCTION ajustar_creditos(UUID, INT)   FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION consumir_creditos(UUID, INT)  FROM PUBLIC, anon, authenticated;


-- ============================================================
-- 2. LINKS DE EVALUACIÓN (plantilla reutilizable)
-- ============================================================

CREATE TABLE IF NOT EXISTS assessment_links (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  token             TEXT        NOT NULL UNIQUE,
  owner_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_tipo        TEXT        NOT NULL CHECK (owner_tipo IN ('menter', 'empresa')),
  -- Instrumentos que la persona debe rendir, en orden de presentación
  instrument_ids    TEXT[]      NOT NULL CHECK (
                                  array_length(instrument_ids, 1) BETWEEN 1 AND 10
                                ),
  titulo            TEXT,
  mensaje           TEXT,       -- nota opcional del Menter/Empresa al evaluado
  job_profile_id    UUID        REFERENCES job_profiles(id) ON DELETE SET NULL,
  contexto          TEXT,       -- 'seleccion_talento' | 'menter_share' | ...
  max_usos          INT         CHECK (max_usos IS NULL OR max_usos > 0), -- NULL = ilimitado
  expires_at        TIMESTAMPTZ,
  activo            BOOLEAN     NOT NULL DEFAULT true,
  creditos_cobrados INT         NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assessment_links_owner
  ON assessment_links (owner_id, created_at DESC);


-- ============================================================
-- 3. PARTICIPANTES (una fila por persona que entra al link)
-- ============================================================
-- persona_id NULL = anónimo. El registro es independiente en ambos casos.

CREATE TABLE IF NOT EXISTS assessment_link_participants (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id            UUID        NOT NULL REFERENCES assessment_links(id) ON DELETE CASCADE,
  participante_token TEXT        NOT NULL UNIQUE,
  persona_id         UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  nombre             TEXT,
  email              TEXT,
  -- true cuando la fila se creó al invitar por correo, antes de que entre
  invitado           BOOLEAN     NOT NULL DEFAULT false,
  invitado_at        TIMESTAMPTZ,
  iniciado_at        TIMESTAMPTZ,
  completado_at      TIMESTAMPTZ,
  metadata           JSONB       NOT NULL DEFAULT '{}'::JSONB,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_link_participants_link
  ON assessment_link_participants (link_id, created_at DESC);

-- Reanudar en vez de duplicar cuando la misma persona vuelve al link
CREATE INDEX IF NOT EXISTS idx_link_participants_email
  ON assessment_link_participants (link_id, lower(email))
  WHERE email IS NOT NULL;


-- ============================================================
-- 4. SESIONES: enganche con link y participante
-- ============================================================

ALTER TABLE assessment_sessions
  ADD COLUMN IF NOT EXISTS link_id        UUID REFERENCES assessment_links(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS participante_id UUID REFERENCES assessment_link_participants(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_assessment_sessions_participante
  ON assessment_sessions (participante_id);


-- ============================================================
-- 5. PERFIL DE PUESTO: correos de los postulantes a evaluar
-- ============================================================
-- Array de objetos {nombre, email}; precarga la lista de destinatarios
-- al generar un link para ese puesto.

ALTER TABLE job_profiles
  ADD COLUMN IF NOT EXISTS candidatos JSONB NOT NULL DEFAULT '[]'::JSONB;


-- ============================================================
-- 6. VISTA: progreso de cada participante
-- ============================================================
-- Una vista corre con los permisos de su dueño, no con el RLS de quien
-- consulta, así que el filtro por dueño va DENTRO de la vista — misma
-- convención que v_menter_assessment_results.

CREATE OR REPLACE VIEW v_link_participantes AS
SELECT
  p.id,
  p.link_id,
  l.owner_id,
  l.owner_tipo,
  l.titulo            AS link_titulo,
  l.token             AS link_token,
  l.instrument_ids,
  p.participante_token,
  p.persona_id,
  p.nombre,
  p.email,
  (p.persona_id IS NOT NULL)                          AS es_registrado,
  p.invitado,
  p.iniciado_at,
  p.completado_at,
  p.created_at,
  COALESCE(array_length(l.instrument_ids, 1), 0)      AS total_tests,
  COUNT(r.id)                                          AS tests_completados
FROM assessment_link_participants p
JOIN assessment_links     l ON l.id = p.link_id
LEFT JOIN assessment_sessions s ON s.participante_id = p.id
LEFT JOIN assessment_results  r ON r.session_id = s.id
WHERE l.owner_id = auth.uid()
   OR p.persona_id = auth.uid()
GROUP BY p.id, l.id;


-- ============================================================
-- 7. RLS
-- ============================================================
-- El acceso público al link va siempre por las API routes con service
-- role (validan vigencia, cupo y créditos). El cliente autenticado solo
-- lee/administra lo suyo.

ALTER TABLE assessment_links             ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_link_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "links_owner_select" ON assessment_links;
CREATE POLICY "links_owner_select" ON assessment_links
  FOR SELECT USING (auth.uid() = owner_id);

-- El alta cobra créditos, así que solo se hace server-side.
DROP POLICY IF EXISTS "links_owner_update" ON assessment_links;
CREATE POLICY "links_owner_update" ON assessment_links
  FOR UPDATE USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "links_owner_delete" ON assessment_links;
CREATE POLICY "links_owner_delete" ON assessment_links
  FOR DELETE USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "participants_owner_select" ON assessment_link_participants;
CREATE POLICY "participants_owner_select" ON assessment_link_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM assessment_links l
       WHERE l.id = assessment_link_participants.link_id
         AND l.owner_id = auth.uid()
    )
    OR persona_id = auth.uid()
  );

GRANT SELECT ON v_link_participantes TO authenticated;

COMMIT;
