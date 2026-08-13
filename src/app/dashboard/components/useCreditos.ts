// src/app/dashboard/components/useCreditos.ts
// Saldo de créditos de evaluación. Solo lee: todo movimiento (compra, cobro
// al generar un link, asignación del admin) ocurre server-side.

'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/app/lib/supabase';

export function useCreditos(userId: string, habilitado = true) {
  const [creditos, setCreditos] = useState<number | null>(null);
  const [mensaje, setMensaje]   = useState<string | null>(null);

  const leerSaldo = useCallback(async () => {
    const { data } = await supabase
      .from('instrumento_creditos')
      .select('creditos')
      .eq('empresa_id', userId)
      .maybeSingle();
    return data?.creditos ?? 0;
  }, [userId]);

  const recargar = useCallback(async () => {
    if (!habilitado || !userId) return;
    setCreditos(await leerSaldo());
  }, [habilitado, userId, leerSaldo]);

  useEffect(() => {
    if (!habilitado || !userId) return;
    let cancelado = false;
    leerSaldo().then(saldo => { if (!cancelado) setCreditos(saldo); });
    return () => { cancelado = true; };
  }, [habilitado, userId, leerSaldo]);

  // Vuelta de PayPal: capturar la orden y acreditar
  useEffect(() => {
    if (!habilitado) return;
    if (new URLSearchParams(window.location.search).get('pp') !== 'ok') return;

    const orderId = sessionStorage.getItem('paypal_order_id');
    if (!orderId) return;
    sessionStorage.removeItem('paypal_order_id');

    fetch('/api/paypal/capture-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: orderId }),
    })
      .then(r => r.json())
      .then(d => {
        if (!d.ok) return;
        setCreditos(d.creditos_nuevos);
        setMensaje('¡Créditos acreditados!');
      })
      .catch(() => {});
  }, [habilitado]);

  return { creditos, setCreditos, mensaje, setMensaje, recargar };
}
