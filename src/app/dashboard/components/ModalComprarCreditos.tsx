// src/app/dashboard/components/ModalComprarCreditos.tsx
// Modal de compra de créditos, compartido por los tabs de Instrumentos
// de Menter y de Empresa.

'use client';

import { useState } from 'react';
import { CREDIT_PACKS } from '@/lib/creditos';

export default function ModalComprarCreditos({ onClose }: { onClose: () => void }) {
  const [comprando, setComprando] = useState<string | null>(null);
  const [error, setError]         = useState<string | null>(null);

  const handleComprar = async (packId: string) => {
    setComprando(packId);
    setError(null);
    try {
      const res = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pack_id: packId }),
      });
      const data = await res.json();
      if (!data.approve_url) throw new Error();
      sessionStorage.setItem('paypal_order_id', data.order_id);
      window.location.href = data.approve_url;
    } catch {
      setError('Error al iniciar el pago. Intenta de nuevo.');
      setComprando(null);
    }
  };

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>
        <button aria-label="Cerrar" style={s.closeBtn} onClick={onClose}>✕</button>
        <h3 style={s.title}>Comprar créditos de evaluación</h3>
        <p style={s.sub}>
          Cada crédito te permite generar un link de evaluación. Un mismo link puede
          incluir varios instrumentos y ser respondido por varias personas.
        </p>
        <div style={s.packsGrid}>
          {CREDIT_PACKS.map(pack => (
            <button key={pack.id}
              style={{ ...s.packCard, ...(comprando === pack.id ? s.packCardActive : {}) }}
              onClick={() => handleComprar(pack.id)}
              disabled={!!comprando}>
              <div style={s.packCreditos}>{pack.creditos}</div>
              <div style={s.packLabel}>{pack.label}</div>
              <div style={s.packPrecio}>${pack.precio} USD</div>
              {pack.ahorro && <div style={s.packAhorro}>{pack.ahorro}</div>}
              {comprando === pack.id && <div style={s.packLoading}>Redirigiendo…</div>}
            </button>
          ))}
        </div>
        {error && <p style={s.error}>{error}</p>}
        <p style={s.nota}>Pago seguro vía PayPal. No se requiere cuenta PayPal.</p>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  overlay:        { position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:10000 },
  modal:          { background:'#fff', borderRadius:24, padding:32, maxWidth:480, width:'90%', position:'relative', maxHeight:'90vh', overflowY:'auto' },
  closeBtn:       { position:'absolute', top:16, right:16, background:'none', border:'none', fontSize:18, cursor:'pointer', color:'#888', lineHeight:1 },
  title:          { fontSize:18, fontWeight:700, color:'#1a1a2e', margin:'0 0 8px' },
  sub:            { fontSize:13, color:'#666', marginBottom:24, lineHeight:1.6 },
  packsGrid:      { display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 },
  packCard:       { border:'2px solid #e0e0e0', borderRadius:16, padding:'16px 12px', textAlign:'center', cursor:'pointer', background:'white', transition:'all 0.15s', position:'relative' },
  packCardActive: { border:'2px solid #421869', background:'#f3e8ff' },
  packCreditos:   { fontSize:32, fontWeight:900, color:'#421869', lineHeight:1, fontFamily:'Raleway, sans-serif' },
  packLabel:      { fontSize:12, color:'#555', margin:'4px 0' },
  packPrecio:     { fontSize:18, fontWeight:700, color:'#2d2926', margin:'4px 0' },
  packAhorro:     { fontSize:11, background:'#e8f5e9', color:'#2e7d32', borderRadius:99, padding:'2px 8px', display:'inline-block', fontWeight:600 },
  packLoading:    { fontSize:11, color:'#421869', marginTop:6 },
  error:          { textAlign:'center', color:'#c62828', fontSize:13, marginTop:12 },
  nota:           { textAlign:'center', fontSize:11, color:'#aaa', marginTop:12 },
};
