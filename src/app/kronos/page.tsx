// @ts-nocheck
"use client";


import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip, 
  Legend, ResponsiveContainer, AreaChart, Area, ReferenceLine 
} from 'recharts';
import { TrendingUp, Percent, Trash2, Plus } from 'lucide-react';

// ── CONSTANTES DE DISEÑO ──
const BROWN = '#4A2E1F';
const COPPER = '#D27D2D';

// ── FUNCIONES FORMATEADORAS ──
const fmt = (v) => `S/ ${Number(v).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtK = (v) => `S/ ${(Number(v) / 1000).toFixed(0)}k`;
const pct = (v) => `${(Number(v) * 100).toFixed(1)}%`;

// ── SUBCOMPONENTES AUXILIARES ──
// Celda editable interactiva
const EditableCell = ({ value, onChange, prefix = '', suffix = '', type = 'number' }) => {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);

  useEffect(() => { setVal(value); }, [value]);

  if (editing) {
    return (
      <input
        type={type}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={() => { setEditing(false); onChange(val); }}
        onKeyDown={(e) => { if (e.key === 'Enter') { setEditing(false); onChange(val); } }}
        autoFocus
        style={{ width: '80px', padding: '2px 5px', borderRadius: '4px', border: `1px solid ${COPPER}`, fontSize: '13px' }}
      />
    );
  }
  return (
    <span onClick={() => setEditing(true)} style={{ cursor: 'pointer', borderBottom: '1px dashed #ccc', paddingBottom: '1px' }}>
      {prefix}{value}{suffix}
    </span>
  );
};

// Tooltip explicativo de fórmulas financieras
const FormulaTooltip = ({ formula, result, explanation }) => (
  <span style={{ cursor: 'help', marginLeft: '4px', color: '#9ca3af', fontSize: '12px' }} title={`Fórmula:\n${formula}\n\nResultado: ${result}\n\n${explanation}`}>
    ⓘ
  </span>
);

// Botones de control estándar
const deleteBtn = (onClick) => (
  <button onClick={onClick} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center' }}>
    <Trash2 size={16} />
  </button>
);

const addRowBtn = (onClick) => (
  <button onClick={onClick} style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px', background: 'white', border: `1.5px dashed ${COPPER}`, color: COPPER, padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
    <Plus size={14} /> Añadir Fila
  </button>
);


// ── COMPONENTE PRINCIPAL ──
export default function SimuladorFinanciero() {
  const [tab, setTab] = useState("escenarios");
  const [scenarioActive, setScenarioActive] = useState("base");
  const [modoCompra, setModoCompra] = useState(false);
  
  // Estados de Base de Datos (Supabase)
  const [distritos, setDistritos] = useState([]);
  const [scenarios, setScenarios] = useState({});
  const [loading, setLoading] = useState(true);

  // Estados de simulación global
  const [ventasMes, setVentasMes] = useState(60000);
  const [tasaInversor, setTasaInversor] = useState(25);
  const [tasaInput, setTasaInput] = useState("25");

  // Carga inicial en paralelo de ambas tablas de Supabase
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        setLoading(true);
        
        // 1. Cargar Distritos
        const resDistritos = await supabase.from('distritos').select('*').order('created_at', { ascending: true });
        if (resDistritos.error) throw resDistritos.error;
        setDistritos(resDistritos.data || []);

        // 2. Cargar Escenarios de Venta
        const resEscenarios = await supabase.from('escenarios_venta').select('*');
        if (resEscenarios.error) throw resEscenarios.error;
        
        const escenariosObj = {};
        resEscenarios.data.forEach(item => {
          escenariosObj[item.id] = {
            label: item.label,
            desc: item.desc_text,
            ticket: item.ticket,
            margen: item.margen,
            tickets: item.tickets_be,
            color: item.color
          };
        });
        setScenarios(escenariosObj);

      } catch (error) {
        console.error("Error cargando datos del simulador:", error.message);
      } finally {
        setLoading(false);
      }
    };

    cargarDatosIniciales();
  }, []);

  // ── LOGICA CRUD: DISTRITOS ──
  const addDistrito = async () => {
    const nuevo = { name: "Nuevo Distrito", alquiler: 2000, compra: 450000 };
    try {
      const { data, error } = await supabase.from('distritos').insert([nuevo]).select();
      if (error) throw error;
      if (data) setDistritos([...distritos, data[0]]);
    } catch (error) { console.error("Error al añadir distrito:", error.message); }
  };

  const updateDistrito = async (id, field, value) => {
    const parsedValue = field === "name" ? value : parseFloat(value) || 0;
    setDistritos(distritos.map(d => d.id === id ? { ...d, [field]: parsedValue } : d)); // UI Optimista
    try {
      const { error } = await supabase.from('distritos').update({ [field]: parsedValue }).eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error("Error al actualizar distrito:", error.message);
      const res = await supabase.from('distritos').select('*').order('created_at', { ascending: true });
      setDistritos(res.data || []);
    }
  };

  const deleteDistrito = async (id) => {
    try {
      const { error } = await supabase.from('distritos').delete().eq('id', id);
      if (error) throw error;
      setDistritos(distritos.filter(d => d.id !== id));
    } catch (error) { console.error("Error al eliminar distrito:", error.message); }
  };

  // ── LOGICA CRUD: ESCENARIOS DE VENTA ──
  const updateEscenario = async (scenarioId, field, value) => {
    const parsedValue = field === "label" || field === "desc" ? value : parseFloat(value) || 0;
    
    setScenarios(prev => ({
      ...prev,
      [scenarioId]: { ...prev[scenarioId], [field]: parsedValue }
    })); // UI Optimista

    const dbField = field === 'tickets' ? 'tickets_be' : field === 'desc' ? 'desc_text' : field;

    try {
      const { error } = await supabase.from('escenarios_venta').update({ [dbField]: parsedValue }).eq('id', scenarioId);
      if (error) throw error;
    } catch (error) {
      console.error("Error al guardar el escenario:", error.message);
    }
  };

  // ── CÁLCULOS FINANCIEROS DERIVADOS (CURVA J / ROI) ──
  const sc = scenarios[scenarioActive] || { ticket: 0, margen: 0, tickets: 0, color: BROWN };
  const margenPct = sc.margen / 100;
  const capexTotal = 95000;  // Inversión fija base estimación
  const copexMensual = 14000; // Costo operativo mensual base estimación
  const flujoMensualBase = (ventasMes * margenPct) - copexMensual;

  // Generación dinámica de la Curva J (60 meses con rampa de maduración inicial)
  let cajaAcumulada = -capexTotal;
  let valleMes = 0;
  let valleVal = -capexTotal;
  let paybackMes = ">60";

  const curvaData = Array.from({ length: 61 }, (_, i) => {
    if (i > 0) {
      // Simulación de maduración del negocio los primeros meses
      const factorRampa = i < 6 ? (i / 6) : 1; 
      const flujoMesActual = ((ventasMes * factorRampa) * margenPct) - copexMensual;
      cajaAcumulada += flujoMesActual;
    }
    if (cajaAcumulada < valleVal) {
      valleVal = cajaAcumulada;
      valleMes = i;
    }
    if (paybackMes === ">60" && cajaAcumulada >= 0 && i > 0) {
      paybackMes = i.toString();
    }
    return { mes: i, flujo: Math.round(cajaAcumulada) };
  });

  // Métricas de Retorno para el Inversor (ROI / TIR simplificado sobre proyecciones)
  const flujosAnuales = Array.from({ length: 5 }, (_, i) => flujoMensualBase * 12 * (1 + (i * 0.05))); // 5% crecimiento anual c/u
  const flujosTotales = flujosAnuales.reduce((a, b) => a + b, 0);
  const roi5 = ((flujosTotales - capexTotal) / capexTotal) * 100;
  const multiple = flujosTotales / capexTotal;
  
  // Simulación TIR por aproximación lineal rápida
  let tirEstimada = (flujoMensualBase * 12 / capexTotal) * 100 - 5;
  tirEstimada = isNaN(tirEstimada) || tirEstimada < 0 ? 0 : tirEstimada;
  
  const vpnEstimado = flujosAnuales.reduce((acc, f, idx) => acc + (f / Math.pow(1 + (tasaInversor / 100), idx + 1)), -capexTotal);
  const flujoReq = (capexTotal * (tasaInversor / 100)) / (1 - Math.pow(1 + (tasaInversor / 100), -5));
  const ventasReq = ((flujoReq / 12) + copexMensual) / (margenPct || 1);

  const roiMetrics = {
    tir: tirEstimada,
    vpn: vpnEstimado,
    roi5: roi5 < 0 ? 0 : roi5,
    multiple: multiple < 0 ? 0 : multiple,
    flujoReq: flujoReq,
    ventasReq: ventasReq,
    flujos: flujosAnuales
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: BROWN, fontWeight: 600 }}>Cargando ecosistema financiero de Supabase...</div>;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 20, fontFamily: "system-ui, sans-serif", backgroundColor: "#fcfbfa", minHeight: "100vh" }}>
      
      {/* NAVEGACIÓN DE PESTAÑAS */}
      <div style={{ display: "flex", gap: 8, borderBottom: "1px solid #e5e7eb", marginBottom: 24, paddingBottom: 2 }}>
        {["escenarios", "realestate", "curva", "roi"].map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "10px 16px", border: "none", background: "none", cursor: "pointer", fontSize: 14, fontWeight: tab === t ? 600 : 400, color: tab === t ? COPPER : "#6b7280", borderBottom: tab === t ? `2px solid ${COPPER}` : "2px solid transparent", textTransform: "capitalize" }}>
            {t === "realestate" ? "Bienes Raíces" : t === "curva" ? "Curva J" : t}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 20 }}>
        
        {/* ── SECCIÓN: SIMULADOR DE ESCENARIOS ── */}
        {tab === "escenarios" && (
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: BROWN, margin: "0 0 4px" }}>Simulador de Escenarios</h1>
            <p style={{ color: "#9ca3af", margin: "0 0 20px", fontSize: 14 }}>Impacto del mix de ventas en indicadores clave · <span style={{ color: COPPER, fontWeight: 500 }}>Valores Editables</span></p>
            
            <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
              {Object.entries(scenarios).map(([k, v]) => (
                <button key={k} onClick={() => setScenarioActive(k)} style={{ padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: scenarioActive === k ? 600 : 400, background: scenarioActive === k ? v.color : "white", color: scenarioActive === k ? "white" : "#6b7280", border: `1.5px solid ${scenarioActive === k ? v.color : "#e5e7eb"}`, cursor: "pointer", textAlign: "left" }}>
                  {v.label}<div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>{v.desc}</div>
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
              {/* Ticket Promedio Editable */}
              <div style={{ flex: 1, minWidth: 155, background: "white", borderRadius: 14, border: `1.5px solid ${sc.color}22`, padding: "18px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
                <p style={{ margin: "0 0 6px", fontSize: 12, color: "#9ca3af" }}>Ticket Promedio</p>
                <p style={{ margin: 0, fontSize: 30, fontWeight: 700, color: sc.color, letterSpacing: "-1px" }}>
                  <EditableCell value={sc.ticket} onChange={v => updateEscenario(scenarioActive, "ticket", v)} prefix="S/ " />
                </p>
                <p style={{ margin: "3px 0 0", fontSize: 11, color: "#9ca3af" }}>Click para cambiar precio base</p>
              </div>

              {/* Margen Contribución Editable */}
              <div style={{ flex: 1, minWidth: 155, background: "white", borderRadius: 14, border: `1.5px solid ${sc.color}22`, padding: "18px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
                <p style={{ margin: "0 0 6px", fontSize: 12, color: "#9ca3af" }}>Margen Contribución</p>
                <p style={{ margin: 0, fontSize: 30, fontWeight: 700, color: sc.color, letterSpacing: "-1px" }}>
                  <EditableCell value={sc.margen} onChange={v => updateEscenario(scenarioActive, "margen", v)} suffix="%" />
                </p>
                <p style={{ margin: "3px 0 0", fontSize: 11, color: "#9ca3af" }}>Ponderado del mix de ventas</p>
              </div>

              {/* Meta Diaria Editable */}
              <div style={{ flex: 1, minWidth: 155, background: "white", borderRadius: 14, border: `1.5px solid ${sc.color}22`, padding: "18px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
                <p style={{ margin: "0 0 6px", fontSize: 12, color: "#9ca3af" }}>Meta diaria de tickets</p>
                <p style={{ margin: 0, fontSize: 30, fontWeight: 700, color: sc.color, letterSpacing: "-1px" }}>
                  <EditableCell value={sc.tickets} onChange={v => updateEscenario(scenarioActive, "tickets", v)} />
                </p>
                <p style={{ margin: "3px 0 0", fontSize: 11, color: "#9ca3af" }}>Objetivo mínimo de equilibrio</p>
              </div>
            </div>

            <div style={{ background: "white", borderRadius: 14, border: "1px solid #f0ede8", padding: 20 }}>
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={Object.values(scenarios).map(v => ({ name: v.label, ticket: v.ticket, tickets_be: v.tickets }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <RechartTooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="ticket" name="Ticket (S/)" fill={COPPER} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="tickets_be" name="Tickets BE/día" fill={BROWN} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── SECCIÓN: BIENES RAÍCES ── */}
        {tab === "realestate" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: BROWN, margin: 0 }}>Bienes Raíces</h1>
                <p style={{ color: "#9ca3af", margin: "5px 0 0", fontSize: 14 }}>Click en cualquier valor para editarlo · Cambios guardados en Supabase</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: "white", border: "1px solid #e5e7eb", borderRadius: 10, padding: "7px 12px" }}>
                <span style={{ fontSize: 13, color: modoCompra ? "#9ca3af" : BROWN, fontWeight: modoCompra ? 400 : 600 }}>Alquiler</span>
                <div onClick={() => setModoCompra(!modoCompra)} style={{ width: 44, height: 24, borderRadius: 12, background: modoCompra ? COPPER : "#e5e7eb", cursor: "pointer", position: "relative", transition: "background .3s" }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: "white", position: "absolute", top: 3, left: modoCompra ? 23 : 3, transition: "left .3s" }} />
                </div>
                <span style={{ fontSize: 13, color: modoCompra ? BROWN : "#9ca3af", fontWeight: modoCompra ? 600 : 400 }}>Compra</span>
              </div>
            </div>
            <div style={{ background: "white", borderRadius: 14, border: "1px solid #f0ede8", padding: 20, marginBottom: 16 }}>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={distritos.map(d => ({ name: d.name, valor: modoCompra ? d.compra : d.alquiler }))} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={v => modoCompra ? fmtK(v) : fmt(v)} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: BROWN, fontWeight: 500 }} axisLine={false} tickLine={false} width={90} />
                  <RechartTooltip formatter={(v) => modoCompra ? fmtK(v) : fmt(v)} />
                  <Bar dataKey="valor" fill={modoCompra ? BROWN : COPPER} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ background: "white", borderRadius: 14, border: "1px solid #f0ede8", padding: 20 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr>
                    {["Distrito", "Alquiler/mes", "Precio compra", ""].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "7px 8px", color: "#9ca3af", fontWeight: 500, borderBottom: "1px solid #f0ede8" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {distritos.map(d => (
                    <tr key={d.id} style={{ borderBottom: "1px solid #f9fafb" }}>
                      <td style={{ padding: "10px 8px", fontWeight: 600, color: BROWN }}><EditableCell value={d.name} type="text" onChange={v => updateDistrito(d.id, "name", v)} /></td>
                      <td style={{ padding: "10px 8px", color: COPPER, fontWeight: 600 }}><EditableCell value={d.alquiler} onChange={v => updateDistrito(d.id, "alquiler", v)} prefix="S/ " /></td>
                      <td style={{ padding: "10px 8px", color: BROWN }}><EditableCell value={d.compra} onChange={v => updateDistrito(d.id, "compra", v)} prefix="S/ " /></td>
                      <td style={{ padding: "10px 8px" }}>{deleteBtn(() => deleteDistrito(d.id))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {addRowBtn(addDistrito)}
            </div>
          </div>
        )}

        {/* ── SECCIÓN: CURVA J ── */}
        {tab === "curva" && (
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: BROWN, margin: "0 0 4px" }}>Máquina del Tiempo Financiera</h1>
            <p style={{ color: "#9ca3af", margin: "0 0 20px", fontSize: 14 }}>Flujo de Caja Acumulado · 60 meses · CAPEX {fmt(capexTotal)}</p>
            <div style={{ background: "white", borderRadius: 14, border: "1px solid #f0ede8", padding: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>Ventas mensuales proyectadas</p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 3 }}>
                    <span style={{ fontSize: 24, fontWeight: 700, color: COPPER, letterSpacing: "-0.5px" }}>{fmt(ventasMes)}</span>
                    <span style={{ fontSize: 12, color: "#9ca3af" }}>/mes</span>
                    <FormulaTooltip
                      formula={`Flujo mensual = Ventas × Margen% − COPEX\n= ${fmt(ventasMes)} × ${pct(margenPct)} − ${fmt(copexMensual)}\n= ${fmt((ventasMes * margenPct) - copexMensual)}`}
                      result={fmt((ventasMes * margenPct) - copexMensual) + "/mes"}
                      explanation="Cada mes este flujo se acumula sobre el CAPEX inicial negativo hasta cruzar cero (payback)."
                    />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 20 }}>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ margin: "0 0 3px", fontSize: 11, color: "#9ca3af" }}>Payback</p>
                    <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: paybackMes === ">60" ? "#ef4444" : "#16a34a" }}>Mes {paybackMes}</p>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ margin: "0 0 3px", fontSize: 11, color: "#9ca3af" }}>Flujo neto/mes</p>
                    <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: flujoMensualBase >= 0 ? "#16a34a" : COPPER }}>{fmt(flujoMensualBase)}</p>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, background: "#fdf4ef", borderRadius: 10, padding: "10px 14px" }}>
                <TrendingUp size={14} color={COPPER} />
                <span style={{ fontSize: 12, color: "#6b7280" }}>S/ 40k</span>
                <input type="range" min={40000} max={120000} step={1000} value={ventasMes} onChange={e => setVentasMes(+e.target.value)} style={{ flex: 1, accentColor: COPPER }} />
                <span style={{ fontSize: 12, color: "#6b7280" }}>S/ 120k</span>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={curvaData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                  <defs>
                    <linearGradient id="gNeg2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COPPER} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={COPPER} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={v => fmtK(Math.abs(v)) + (v < 0 ? "(-)" : "")} />
                  <RechartTooltip formatter={(v) => fmt(v)} labelFormatter={l => `Mes ${l}`} />
                  <ReferenceLine y={0} stroke="#16a34a" strokeWidth={2} strokeDasharray="6 3" label={{ value: "↑ Punto de retorno", position: "insideTopRight", fontSize: 11, fill: "#16a34a", fontWeight: 600 }} />
                  <ReferenceLine x={valleMes} stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4 3" label={{ value: `Valle (Mes ${valleMes})`, position: "insideTopLeft", fontSize: 11, fill: "#ef4444", fontWeight: 600 }} />
                  {paybackMes !== ">60" && (
                    <ReferenceLine x={paybackMes} stroke="#2563eb" strokeWidth={2} label={{ value: `Payback Mes ${paybackMes}`, position: "insideTopRight", fontSize: 11, fill: "#2563eb", fontWeight: 600 }} />
                  )}
                  <Area type="monotone" dataKey="flujo" stroke={COPPER} strokeWidth={2.5} fill="url(#gNeg2)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", gap: 16, marginTop: 12, padding: "10px 14px", background: "#fafafa", borderRadius: 10, flexWrap: "wrap" }}>
                {[
                  { color: COPPER, label: "Desembolso inicial", desc: `Mes 0 · ${fmt(-capexTotal)}` },
                  { color: "#ef4444", label: "Valle de la muerte", desc: `Mes ${valleMes} · mínimo ${fmt(valleVal)}` },
                  { color: "#16a34a", label: "Punto de retorno", desc: "Flujo acumulado cruza cero" },
                  { color: "#2563eb", label: "Payback total", desc: `Mes ${paybackMes} · inversión recuperada` },
                ].map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 7 }}>
                    <div style={{ width: 3, height: 32, background: s.color, borderRadius: 2, marginTop: 2 }} />
                    <div>
                      <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: s.color }}>{s.label}</p>
                      <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── SECCIÓN: ROI / TIR ── */}
        {tab === "roi" && (
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: BROWN, margin: "0 0 4px" }}>Métricas para el Inversor</h1>
            <p style={{ color: "#9ca3af", margin: "0 0 20px", fontSize: 14 }}>Ajusta ventas y tasa — todos los indicadores se recalculan en tiempo real</p>

            <div style={{ background: "white", borderRadius: 14, border: `2px solid ${COPPER}44`, padding: "20px 24px", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <Percent size={16} color={COPPER} />
                <span style={{ fontSize: 14, fontWeight: 600, color: BROWN }}>Simulador del inversor</span>
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>Ventas mensuales proyectadas</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: COPPER }}>{fmt(ventasMes)}/mes</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 12, color: "#9ca3af"}}>S/40k</span>
                  <input type="range" min={40000} max={120000} step={1000} value={ventasMes} onChange={e => setVentasMes(+e.target.value)} style={{ flex: 1, accentColor: COPPER }} />
                  <span style={{ fontSize: 12, color: "#9ca3af" }}>S/120k</span>
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>Retorno anual esperado por el inversor</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <input type="number" min={1} max={200} value={tasaInput} onChange={e => { setTasaInput(e.target.value); const v = parseFloat(e.target.value); if (!isNaN(v) && v > 0) setTasaInversor(Math.min(v, 200)); }} style={{ width: 56, padding: "3px 7px", borderRadius: 7, border: `1.5px solid ${COPPER}`, fontSize: 14, fontWeight: 700, color: COPPER, textAlign: "center" }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: COPPER }}>%</span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: "#9ca3af" }}>5%</span>
                  <input type="range" min={5} max={80} step={1} value={tasaInversor} onChange={e => { setTasaInversor(+e.target.value); setTasaInput(e.target.value); }} style={{ flex: 1, accentColor: BROWN }} />
                  <span style={{ fontSize: 12, color: "#9ca3af" }}>80%</span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {[10, 15, 20, 25, 30].map(t => (
                    <button key={t} onClick={() => { setTasaInversor(t); setTasaInput(String(t)); }} style={{ padding: "4px 11px", borderRadius: 20, fontSize: 12, background: tasaInversor === t ? COPPER : "#f3f4f6", color: tasaInversor === t ? "white" : "#6b7280", border: "none", cursor: "pointer", fontWeight: tasaInversor === t ? 600 : 400 }}>{t}%</button>
                  ))}
                </div>
              </div>
              <div style={{ padding: "10px 14px", background: "#fdf4ef", borderRadius: 8, fontSize: 13, color: "#6b7280", borderLeft: `3px solid ${COPPER}` }}>
                Con <strong style={{ color: COPPER }}>{fmt(ventasMes)}/mes</strong> y tasa de <strong style={{ color: COPPER }}>{tasaInversor}%</strong> → necesitas flujo mínimo de <strong style={{ color: BROWN }}>{fmt(roiMetrics.flujoReq)}/año</strong> = ventas de <strong style={{ color: BROWN }}>{fmt(roiMetrics.ventasReq)}/mes</strong>
                {roiMetrics.ventasReq <= ventasMes
                  ? <span style={{ color: "#16a34a", fontWeight: 600 }}> ✓ Tu escenario lo cumple.</span>
                  : <span style={{ color: "#ef4444", fontWeight: 600 }}> ✗ Necesitas +{pct((roiMetrics.ventasReq / ventasMes) - 1)} en ventas.</span>}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
              {[
                { label: "TIR Anual", value: roiMetrics.tir.toFixed(1) + "%", sub: "Tasa Interna de Retorno", color: roiMetrics.tir > tasaInversor ? "#16a34a" : COPPER, formula: `Tasa que hace VPN = 0`, explanation: "Si TIR > tu tasa esperada, el proyecto te conviene." },
                { label: `VPN (${tasaInversor}%)`, value: fmtK(roiMetrics.vpn), sub: "Valor Presente Neto", color: roiMetrics.vpn > 0 ? "#16a34a" : "#ef4444", formula: `Σ [Flujo ÷ (1+k)ⁿ] − CAPEX`, explanation: "Si es positivo, el proyecto genera más de lo exigido." },
                { label: "ROI 5 años", value: roiMetrics.roi5.toFixed(1) + "%", sub: (roiMetrics.roi5 / 5).toFixed(1) + "% anual promedio", color: COPPER, formula: `(Flujos − CAPEX) ÷ CAPEX`, explanation: "Rentabilidad total absoluta sobre la inversión." },
                { label: "Múltiple Capital", value: roiMetrics.multiple.toFixed(2) + "x", sub: "Por cada S/ 1 invertido", color: roiMetrics.multiple > 1 ? "#16a34a" : "#ef4444", formula: `Flujos totales ÷ CAPEX`, explanation: "Un múltiplo de 2x significa que doblas tu capital de vuelta." },
                { label: "Payback", value: "Mes " + paybackMes, sub: "Recupero total", color: paybackMes === ">60" ? "#ef4444" : "#2563eb", formula: `Mes acumulado ≥ 0`, explanation: "El tiempo que tarda el negocio en devolverte la inversión." },
              ].map((m, i) => (
                <div key={i} style={{ flex: 1, minWidth: 145, background: "white", borderRadius: 14, border: "1px solid #f0ede8", padding: "16px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 5 }}>
                    <span style={{ fontSize: 11, color: "#9ca3af" }}>{m.label}</span>
                    <FormulaTooltip formula={m.formula} result={m.value} explanation={m.explanation} />
                  </div>
                  <p style={{ margin: "0 0 3px", fontSize: 24, fontWeight: 700, color: m.color, letterSpacing: "-1px" }}>{m.value}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>{m.sub}</p>
                </div>
              ))}
            </div>

            <div style={{ background: `linear-gradient(135deg, ${BROWN} 0%, #4a2e1f 100%)`, borderRadius: 14, padding: "20px 24px" }}>
              <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 600, color: "white" }}>Benchmark frente a tu tasa del {tasaInversor}%</h3>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                {[
                  { label: `TIR ${roiMetrics.tir.toFixed(1)}% vs tasa ${tasaInversor}%`, bueno: roiMetrics.tir > tasaInversor, nota: roiMetrics.tir > tasaInversor ? `${(roiMetrics.tir - tasaInversor).toFixed(1)}pts de colchón sobre tu tasa` : "Por debajo de tu tasa objetivo" },
                  { label: "VPN positivo", bueno: roiMetrics.vpn > 0, nota: roiMetrics.vpn > 0 ? "El proyecto crea valor a tu tasa" : "No viable a esta tasa" },
                  { label: "Múltiple > 1x", bueno: roiMetrics.multiple > 1, nota: `${roiMetrics.multiple.toFixed(2)}x retorno sobre capital` },
                  { label: "Payback < 60 meses", bueno: paybackMes !== ">60", nota: paybackMes !== ">60" ? `Recupero en mes ${paybackMes}` : "Fuera del horizonte" },
                ].map((b, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, flex: 1, minWidth: 175 }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: b.bueno ? "#16a34a" : "#ef4444", display: "flex", alignItems: "center", justifyValue: "center", justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                      <span style={{ color: "white", fontSize: 11, fontWeight: 700 }}>{b.bueno ? "✓" : "✗"}</span>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>{b.label}</p>
                      <p style={{ margin: "2px 0 0", fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{b.nota}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}