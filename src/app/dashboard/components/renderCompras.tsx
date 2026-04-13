'use client'
// src/app/dashboard/components/renderCompras.tsx
// Historial unificado de adquisiciones: sesiones, eventos, membresías

import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase'

// ── Tipos ──────────────────────────────────────────────────────────────────────
type TipoCompra = 'sesion' | 'evento' | 'membresia'

interface Compra {
  id:          string
  tipo:        TipoCompra
  titulo:      string
  subtitulo:   string
  fecha:       string        // ISO string
  monto:       number | null
  moneda:      string
  estado:      string        // 'pagado' | 'pendiente' | 'gratis' | 'activa' | 'cancelada' | 'rechazado'
  extra?:      string        // info adicional (modalidad, plan, etc.)
}

// ── Helpers visuales ───────────────────────────────────────────────────────────
const TIPO_CONFIG: Record<TipoCompra, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  sesion: {
    label: 'Sesión',
    color: '#1565c0',
    bg:    '#e3f2fd',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#1565c0">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
      </svg>
    ),
  },
  evento: {
    label: 'Evento',
    color: '#6a1b9a',
    bg:    '#f3e5f5',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#6a1b9a">
        <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/>
      </svg>
    ),
  },
  membresia: {
    label: 'Membresía',
    color: '#e65100',
    bg:    '#fff3e0',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#e65100">
        <path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
      </svg>
    ),
  },
}

const ESTADO_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  pagado:    { bg: '#e8f5e9', color: '#2e7d32', label: 'Pagado'    },
  gratis:    { bg: '#e8f5e9', color: '#2e7d32', label: 'Gratis'    },
  activa:    { bg: '#e8f5e9', color: '#2e7d32', label: 'Activa'    },
  pendiente: { bg: '#fff8e1', color: '#f57f17', label: 'Pendiente' },
  rechazado: { bg: '#ffebee', color: '#b71c1c', label: 'Rechazado' },
  cancelada: { bg: '#f5f5f5', color: '#757575', label: 'Cancelada' },
  trial:     { bg: '#e3f2fd', color: '#1565c0', label: 'En prueba' },
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-PE', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

// ── Componente principal ───────────────────────────────────────────────────────
interface Props {
  userId:   string
  isMenter: boolean
}

export default function RenderCompras({ userId, isMenter }: Props) {
  const [compras, setCompras]   = useState<Compra[]>([])
  const [loading, setLoading]   = useState(true)
  const [filtro, setFiltro]     = useState<TipoCompra | 'todo'>('todo')

  useEffect(() => {
    fetchAll()
  }, [userId])

  const fetchAll = async () => {
    const lista: Compra[] = []

    // ── 1. Sesiones agendadas como cliente ──────────────────────────────────
    const { data: citas } = await supabase
      .from('appointments')
      .select('id, menter_name, date, start_time, price, payment_status, status, modality')
      .eq('client_id', userId)
      .order('date', { ascending: false })

    for (const c of citas || []) {
      const estado = c.payment_status === 'pagado' ? 'pagado'
        : c.payment_status === 'gratis' ? 'gratis'
        : c.status === 'cancelada' ? 'cancelada'
        : 'pendiente'
      lista.push({
        id:        c.id,
        tipo:      'sesion',
        titulo:    `Sesión con ${c.menter_name}`,
        subtitulo: `${formatFecha(c.date)} · ${c.start_time?.slice(0, 5)} · ${c.modality === 'online' ? 'Online' : 'Presencial'}`,
        fecha:     c.date,
        monto:     c.price,
        moneda:    'USD',
        estado,
      })
    }

    // ── 2. Eventos registrados ───────────────────────────────────────────────
    const { data: regs } = await supabase
      .from('event_registrations')
      .select('id, total_price, payment_status, quantity, created_at, event:event_id(title, date)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    for (const r of regs || []) {
      const evento = r.event as any
      const estado = r.payment_status === 'pagado' ? 'pagado'
        : r.payment_status === 'gratis' ? 'gratis'
        : 'pendiente'
      lista.push({
        id:        r.id,
        tipo:      'evento',
        titulo:    evento?.title || 'Evento',
        subtitulo: evento?.date ? formatFecha(evento.date) : '',
        fecha:     r.created_at,
        monto:     r.total_price,
        moneda:    'USD',
        estado,
        extra:     r.quantity > 1 ? `${r.quantity} entradas` : '1 entrada',
      })
    }

    // ── 3. Membresía (solo Menters) ─────────────────────────────────────────
    if (isMenter) {
      const { data: mem } = await supabase
        .from('menter_memberships')
        .select('plan, billing_cycle, starts_at, expires_at, is_active, trial_ends_at, downgrade_reason, mp_subscription_id')
        .eq('menter_id', userId)
        .single()

      if (mem && mem.plan !== 'free') {
        const trialEnds    = mem.trial_ends_at ? new Date(mem.trial_ends_at) : null
        const enTrial      = trialEnds && trialEnds > new Date()
        const planLabel    = mem.plan === 'starter' ? 'Starter' : mem.plan === 'premium' ? 'Premium' : 'Master'
        const cicloLabel   = mem.billing_cycle === 'annual' ? 'Anual' : mem.billing_cycle === 'monthly' ? 'Mensual' : mem.billing_cycle

        const estado = enTrial ? 'trial'
          : mem.is_active ? 'activa'
          : mem.downgrade_reason ? 'cancelada'
          : 'cancelada'

        lista.push({
          id:        `mem-${userId}`,
          tipo:      'membresia',
          titulo:    `Plan ${planLabel}`,
          subtitulo: cicloLabel ? `Ciclo ${cicloLabel}` : '',
          fecha:     mem.starts_at || new Date().toISOString(),
          monto:     null,
          moneda:    'USD',
          estado,
          extra:     enTrial
            ? `Prueba gratuita hasta ${formatFecha(mem.trial_ends_at)}`
            : mem.expires_at
              ? `Vence ${formatFecha(mem.expires_at)}`
              : mem.is_active ? 'Suscripción activa' : 'Cancelada',
        })
      }
    }

    // ── 4. Pagos procesados (tabla payments) ────────────────────────────────
    const { data: pagos } = await supabase
      .from('payments')
      .select('id, mp_status, type, amount, currency, created_at, external_reference')
      .eq('user_id', userId)
      .eq('mp_status', 'approved')
      .order('created_at', { ascending: false })

    // Los pagos aprobados ya están reflejados en citas/eventos arriba,
    // pero los mostramos si no tienen referencia duplicada
    const idsYaListados = new Set(lista.map(c => c.id))
    for (const p of pagos || []) {
      if (p.type === 'subscription') {
        // Suscripciones cobradas — no duplicar con la membresía
        continue
      }
      const refId = p.external_reference?.split(':')?.[1]
      if (refId && idsYaListados.has(refId)) continue // ya listado desde appointments/regs

      lista.push({
        id:        p.id,
        tipo:      p.type === 'appointment' ? 'sesion' : 'evento',
        titulo:    p.type === 'appointment' ? 'Sesión' : 'Evento',
        subtitulo: `Pago confirmado`,
        fecha:     p.created_at,
        monto:     p.amount,
        moneda:    p.currency || 'USD',
        estado:    'pagado',
      })
    }

    // Ordenar por fecha desc
    lista.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    setCompras(lista)
    setLoading(false)
  }

  const filtradas = filtro === 'todo' ? compras : compras.filter(c => c.tipo === filtro)

  const totalPagado = compras
    .filter(c => c.estado === 'pagado' && c.monto)
    .reduce((s, c) => s + (c.monto || 0), 0)

  if (loading) return <div style={s.loading}>Cargando historial…</div>

  return (
    <div style={s.container}>
      <h2 style={s.titulo}>Historial de Compras</h2>
      <p style={s.subtitulo}>Todas tus adquisiciones en Giro Lab</p>

      {/* Resumen */}
      <div style={s.statsRow}>
        <div style={s.statCard}>
          <span style={s.statNum}>{compras.length}</span>
          <span style={s.statLabel}>Total adquisiciones</span>
        </div>
        <div style={s.statCard}>
          <span style={s.statNum}>{compras.filter(c => c.tipo === 'sesion').length}</span>
          <span style={s.statLabel}>Sesiones</span>
        </div>
        <div style={s.statCard}>
          <span style={s.statNum}>{compras.filter(c => c.tipo === 'evento').length}</span>
          <span style={s.statLabel}>Eventos</span>
        </div>
        {totalPagado > 0 && (
          <div style={s.statCard}>
            <span style={s.statNum}>${totalPagado.toFixed(0)}</span>
            <span style={s.statLabel}>Total pagado</span>
          </div>
        )}
      </div>

      {/* Filtros */}
      <div style={s.filtros}>
        {(['todo', 'sesion', 'evento', 'membresia'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            style={{
              ...s.filtroBtn,
              background: filtro === f ? '#421869' : '#f0f0f0',
              color:      filtro === f ? '#fff' : '#555',
              fontWeight: filtro === f ? 700 : 500,
            }}
          >
            {f === 'todo' ? 'Todo' : TIPO_CONFIG[f].label + 's'}
          </button>
        ))}
      </div>

      {/* Lista */}
      {filtradas.length === 0 ? (
        <div style={s.empty}>
          <p style={s.emptyTitle}>Sin adquisiciones{filtro !== 'todo' ? ` de ${TIPO_CONFIG[filtro as TipoCompra]?.label}` : ''}</p>
          <p style={s.emptyText}>Tus compras y reservas aparecerán aquí.</p>
        </div>
      ) : (
        <div style={s.lista}>
          {filtradas.map(compra => {
            const tc = TIPO_CONFIG[compra.tipo]
            const es = ESTADO_STYLE[compra.estado] || ESTADO_STYLE.pendiente
            return (
              <div key={compra.id} style={s.card}>
                {/* Ícono tipo */}
                <div style={{ ...s.iconWrap, background: tc.bg }}>
                  {tc.icon}
                </div>

                {/* Info */}
                <div style={s.info}>
                  <div style={s.cardTop}>
                    <span style={{ ...s.tipoBadge, background: tc.bg, color: tc.color }}>
                      {tc.label}
                    </span>
                    <span style={{ ...s.estadoBadge, background: es.bg, color: es.color }}>
                      {es.label}
                    </span>
                  </div>
                  <p style={s.cardTitulo}>{compra.titulo}</p>
                  <p style={s.cardSub}>{compra.subtitulo}</p>
                  {compra.extra && (
                    <p style={s.cardExtra}>{compra.extra}</p>
                  )}
                </div>

                {/* Monto + fecha */}
                <div style={s.right}>
                  {compra.monto !== null && compra.monto > 0 ? (
                    <p style={s.monto}>${compra.monto.toFixed(2)} <span style={s.moneda}>{compra.moneda}</span></p>
                  ) : compra.monto === 0 ? (
                    <p style={{ ...s.monto, color: '#2e7d32' }}>Gratis</p>
                  ) : null}
                  <p style={s.fecha}>{formatFecha(compra.fecha)}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Estilos ───────────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  container:   { padding: '24px 0', fontFamily: 'DM Sans, sans-serif' },
  titulo:      { fontSize: 22, fontWeight: 700, color: '#1a1a2e', margin: '0 0 4px', fontFamily: 'Raleway, sans-serif' },
  subtitulo:   { fontSize: 14, color: '#888', margin: '0 0 24px' },
  loading:     { textAlign: 'center', color: '#888', padding: 60 },

  statsRow:    { display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' },
  statCard:    { flex: '1 1 100px', background: '#f8f8fb', borderRadius: 12, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 4, minWidth: 80 },
  statNum:     { fontSize: 24, fontWeight: 800, color: '#421869' },
  statLabel:   { fontSize: 11, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5 },

  filtros:     { display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  filtroBtn:   { padding: '8px 18px', borderRadius: 30, border: 'none', fontSize: 13, cursor: 'pointer', transition: 'all 0.18s', fontFamily: 'DM Sans, sans-serif' },

  empty:       { textAlign: 'center', padding: '48px 0' },
  emptyTitle:  { fontSize: 17, fontWeight: 700, color: '#1a1a2e', margin: '0 0 8px' },
  emptyText:   { fontSize: 14, color: '#aaa', margin: 0 },

  lista:       { display: 'flex', flexDirection: 'column', gap: 12 },
  card:        { display: 'flex', alignItems: 'flex-start', gap: 16, background: '#fff', borderRadius: 16, padding: '18px 20px', border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },

  iconWrap:    { width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  info:        { flex: 1, minWidth: 0 },
  cardTop:     { display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center', flexWrap: 'wrap' },
  tipoBadge:   { fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: 0.5 },
  estadoBadge: { fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 999 },
  cardTitulo:  { fontSize: 15, fontWeight: 700, color: '#1a1a2e', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  cardSub:     { fontSize: 13, color: '#888', margin: '0 0 2px' },
  cardExtra:   { fontSize: 12, color: '#aaa', margin: 0 },

  right:       { textAlign: 'right', flexShrink: 0 },
  monto:       { fontSize: 16, fontWeight: 800, color: '#1a1a2e', margin: '0 0 4px' },
  moneda:      { fontSize: 11, fontWeight: 400, color: '#aaa' },
  fecha:       { fontSize: 11, color: '#bbb', margin: 0 },
}
