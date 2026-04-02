// @ts-nocheck
"use client";


import { useState, useMemo, useRef, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from "recharts";
import {
  TrendingUp, DollarSign, Clock, Target, MapPin, Coffee,
  ChevronRight, Plus, X, BarChart2, Home, Sliders, Database,
  Percent, Info, Check, Trash2, Edit3,
} from "lucide-react";

// ── DESIGN TOKENS ────────────────────────────────────────────────────────────
const BROWN  = "#2C1E16";
const COPPER = "#C56133";
const BG     = "#F9FAFB";
const fmt    = (n) => "S/ " + Math.round(n).toLocaleString("es-PE");
const fmtK   = (n) => n >= 1_000_000 ? "S/ "+(n/1_000_000).toFixed(2)+"M" : n >= 1_000 ? "S/ "+Math.round(n/1_000)+"k" : "S/ "+Math.round(n);
const pct    = (n) => (n*100).toFixed(1)+"%";

// ── TOOLTIP DE FÓRMULA ────────────────────────────────────────────────────────
function FormulaTooltip({ formula, result, explanation }) {
  const [show, setShow] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setShow(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  return (
    <span ref={ref} style={{ position:"relative", display:"inline-flex", alignItems:"center", marginLeft:6, cursor:"pointer" }}
      onMouseEnter={()=>setShow(true)} onMouseLeave={()=>setShow(false)} onClick={()=>setShow(s=>!s)}>
      <Info size={13} color={COPPER} />
      {show && (
        <div style={{ position:"absolute", left:"50%", bottom:"calc(100% + 8px)", transform:"translateX(-50%)", background:BROWN, color:"white", borderRadius:10, padding:"12px 14px", width:280, zIndex:1000, boxShadow:"0 8px 24px rgba(0,0,0,0.18)", fontSize:12, lineHeight:1.6 }}>
          <div style={{ fontWeight:600, color:COPPER, marginBottom:6, fontSize:13 }}>Fórmula</div>
          <div style={{ background:"rgba(255,255,255,0.08)", borderRadius:6, padding:"6px 10px", fontFamily:"monospace", fontSize:11, marginBottom:8, whiteSpace:"pre-wrap" }}>{formula}</div>
          {result && <div style={{ color:"#16a34a", fontWeight:600, marginBottom:6 }}>= {result}</div>}
          <div style={{ color:"rgba(255,255,255,0.65)", fontSize:11 }}>{explanation}</div>
          <div style={{ position:"absolute", bottom:-6, left:"50%", transform:"translateX(-50%)", width:12, height:12, background:BROWN, rotate:"45deg", borderRadius:2 }}/>
        </div>
      )}
    </span>
  );
}

// ── CELDA EDITABLE INLINE ─────────────────────────────────────────────────────
function EditableCell({ value, onChange, type = "number", prefix = "", style = {} }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef(null);
  useEffect(() => { if (editing && inputRef.current) inputRef.current.focus(); }, [editing]);
  const commit = () => {
    const parsed = type === "number" ? parseFloat(draft) : draft;
    if (type === "number" && !isNaN(parsed) && parsed >= 0) onChange(parsed);
    else if (type === "text" && draft.trim()) onChange(draft.trim());
    else setDraft(String(value));
    setEditing(false);
  };
  if (editing) return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4 }}>
      <input ref={inputRef} value={draft} onChange={e=>setDraft(e.target.value)}
        onBlur={commit} onKeyDown={e=>{ if(e.key==="Enter") commit(); if(e.key==="Escape"){setDraft(String(value));setEditing(false);} }}
        style={{ width: type==="number" ? 90 : 140, padding:"3px 7px", borderRadius:6, border:`1.5px solid ${COPPER}`, fontSize:13, fontWeight:600, color:COPPER, textAlign:type==="number"?"right":"left", ...style }}/>
      <Check size={13} color="#16a34a" style={{ cursor:"pointer" }} onClick={commit}/>
    </span>
  );
  return (
    <span onClick={()=>{ setDraft(String(value)); setEditing(true); }}
      style={{ cursor:"pointer", borderBottom:`1px dashed ${COPPER}44`, paddingBottom:1, display:"inline-flex", alignItems:"center", gap:4, ...style }}>
      {prefix}{type==="number" ? Number(value).toLocaleString("es-PE") : value}
      <Edit3 size={11} color={COPPER} opacity={0.5}/>
    </span>
  );
}

// ── ESTADO INICIAL DE DATOS ────────────────────────────────────────────────────
const INIT_VENTAS = [
  { id:1, producto:"Café",          precio:8,  unidades:2700, costoVar:0.35 },
  { id:2, producto:"Comidas",       precio:25, unidades:800,  costoVar:0.45 },
  { id:3, producto:"Postres",       precio:15, unidades:600,  costoVar:0.40 },
  { id:4, producto:"Sandwich",      precio:15, unidades:600,  costoVar:0.00 },
  { id:5, producto:"Otras Bebidas", precio:12, unidades:500,  costoVar:0.30 },
  { id:6, producto:"Retail",        precio:20, unidades:200,  costoVar:0.01 },
  { id:7, producto:"Vending",       precio:5,  unidades:300,  costoVar:0.20 },
];

const INIT_CAPEX = [
  { id:1,  cat:"Maquinaria",      item:"Tostadora 3kg Drum Roaster",    monto:28900 },
  { id:2,  cat:"Maquinaria",      item:"Espresso 2 Grupos Volumétrica", monto:22100 },
  { id:3,  cat:"Maquinaria",      item:"Vending Módulo To-Go",          monto:17000 },
  { id:4,  cat:"Infraestructura", item:"Obra Civil",                    monto:85000 },
  { id:5,  cat:"Infraestructura", item:"Barra Técnica",                 monto:15300 },
  { id:6,  cat:"Infraestructura", item:"Extracción HVAC",               monto:6120  },
  { id:7,  cat:"Pre-Operativo",   item:"Branding",                      monto:6800  },
  { id:8,  cat:"Pre-Operativo",   item:"Licencias",                     monto:5100  },
  { id:9,  cat:"Mobiliario",      item:"Sillas + Mesas + Barra",        monto:21210 },
  { id:10, cat:"Menaje",          item:"Menaje completo",               monto:8490  },
  { id:11, cat:"Cocina/Equipo",   item:"Cocina industrial completa",    monto:269264},
];

const INIT_COPEX = [
  { id:1,  cat:"Personal",       item:"Head Barista/Tostador x2", monto:4080, tipo:"Fijo"     },
  { id:2,  cat:"Personal",       item:"Cocinero x4",              monto:3060, tipo:"Fijo"     },
  { id:3,  cat:"Personal",       item:"Sandwichero",              monto:2380, tipo:"Fijo"     },
  { id:4,  cat:"Personal",       item:"Ayudante Cocina",          monto:2040, tipo:"Fijo"     },
  { id:5,  cat:"Personal",       item:"Meseros",                  monto:1700, tipo:"Fijo"     },
  { id:6,  cat:"Personal",       item:"Limpieza",                 monto:1360, tipo:"Fijo"     },
  { id:7,  cat:"Personal",       item:"Volantero",                monto:900,  tipo:"Variable" },
  { id:8,  cat:"Administrativo", item:"Contabilidad Externa",     monto:510,  tipo:"Fijo"     },
  { id:9,  cat:"Ocupación",      item:"Servicios Luz/Agua",       monto:1870, tipo:"Variable" },
  { id:10, cat:"Ocupación",      item:"Internet/Telefonía",       monto:340,  tipo:"Fijo"     },
  { id:11, cat:"Ocupación",      item:"Mantenimiento Local",      monto:340,  tipo:"Fijo"     },
  { id:12, cat:"Insumos COGS",   item:"Café Verde",               monto:4080, tipo:"Variable" },
  { id:13, cat:"Insumos COGS",   item:"Leche/Bebidas Veg.",       monto:2720, tipo:"Variable" },
  { id:14, cat:"Insumos COGS",   item:"Panadería/Comida",         monto:3060, tipo:"Variable" },
  { id:15, cat:"Insumos COGS",   item:"Empaques/Vasos ToGo",      monto:2040, tipo:"Variable" },
  { id:16, cat:"Insumos",        item:"Gas GLP",                  monto:450,  tipo:"Variable" },
  { id:17, cat:"Insumos",        item:"Perecibles Menú",          monto:5100, tipo:"Variable" },
  { id:18, cat:"Marketing",      item:"Pauta Digital",            monto:3400, tipo:"Variable" },
  { id:19, cat:"Marketing",      item:"Software POS",             monto:170,  tipo:"Fijo"     },
  { id:20, cat:"Otros",          item:"Mantenimiento Máquinas",   monto:510,  tipo:"Variable" },
];

const INIT_DISTRITOS = [
  { id:1, name:"San Isidro", alquiler:11900, compra:1_000_000 },
  { id:2, name:"Miraflores", alquiler:10880, compra:1_400_000 },
  { id:3, name:"Barranco",   alquiler:9180,  compra:737_000   },
  { id:4, name:"Surco",      alquiler:6800,  compra:688_000   },
];

const CAPEX_COLORS = { "Maquinaria":COPPER, "Infraestructura":BROWN, "Pre-Operativo":"#8B6952", "Mobiliario":"#C4A882", "Menaje":"#A0785A", "Cocina/Equipo":"#6B4226" };
const SCENARIOS = {
  cafeteria:  { label:"Cafetería Pura", desc:"70% Bebida · 20% Comida · 10% Retail", ticket:28, margen:72, tickets:55, color:COPPER   },
  balanceado: { label:"Balanceado",     desc:"50% Bebida · 40% Comida · 10% Retail", ticket:34, margen:65, tickets:67, color:"#8B6952" },
  restocafe:  { label:"Resto-Café",     desc:"30% Bebida · 60% Comida · 10% Retail", ticket:42, margen:58, tickets:79, color:BROWN     },
};

function calcTIR(flujos, capex) {
  let lo=-0.99, hi=10, tir=0;
  for(let i=0;i<80;i++){
    tir=(lo+hi)/2;
    flujos.reduce((acc,f,j)=>acc+f/Math.pow(1+tir,j+1),-capex)>0?(lo=tir):(hi=tir);
  }
  return tir;
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab,        setTab]        = useState("home");
  const [scenario,   setScenario]   = useState("balanceado");
  const [modoCompra, setModoCompra] = useState(false);
  const [ventasMes,  setVentasMes]  = useState(65600);
  const [tasaInversor,setTasaInversor]=useState(20);
  const [tasaInput,  setTasaInput]  = useState("20");

  // Estados editables
  const [ventas,    setVentas]    = useState(INIT_VENTAS);
  const [capexItems,setCapexItems]= useState(INIT_CAPEX);
  const [copexItems,setCopexItems]= useState(INIT_COPEX);
  const [distritos, setDistritos] = useState(INIT_DISTRITOS);

  // Totales derivados de estado
  const ventasTotal  = useMemo(()=> ventas.reduce((a,r)=>a+r.precio*r.unidades,0), [ventas]);
  const margenTotal  = useMemo(()=> ventas.reduce((a,r)=>a+r.precio*r.unidades*(1-r.costoVar),0), [ventas]);
  const margenPct    = ventasTotal > 0 ? margenTotal/ventasTotal : 0;
  const capexTotal   = useMemo(()=> capexItems.reduce((a,r)=>a+r.monto,0), [capexItems]);
  const copexMensual = useMemo(()=> copexItems.reduce((a,r)=>a+r.monto,0), [copexItems]);
  const flujoMensualBase = ventasMes * margenPct - copexMensual;

  // Curva J
  const curvaData = useMemo(()=>{
    const data=[{mes:0,flujo:-capexTotal}]; let acum=-capexTotal;
    for(let m=1;m<=60;m++){
      const r=m<=3?0.6+(m-1)*0.1:m<=6?0.8+(m-4)*0.05:1.0;
      acum+=ventasMes*r*margenPct-copexMensual;
      data.push({mes:m,flujo:Math.round(acum)});
    }
    return data;
  },[ventasMes,margenPct,capexTotal,copexMensual]);

  const paybackMes = useMemo(()=>{ const i=curvaData.findIndex(d=>d.flujo>=0); return i===-1?">60":i; },[curvaData]);
  const valleIdx   = useMemo(()=> curvaData.reduce((mi,d,i,a)=>d.flujo<a[mi].flujo?i:mi,0),[curvaData]);
  const valleMes   = curvaData[valleIdx]?.mes;
  const valleVal   = curvaData[valleIdx]?.flujo;

  // ROI metrics
  const roiMetrics = useMemo(()=>{
    const rampas=[0.7,0.88,1.0,1.05,1.08];
    const flujos=rampas.map(r=>(ventasMes*r*margenPct-copexMensual)*12);
    const tir=calcTIR(flujos,capexTotal);
    const tasaDesc=tasaInversor/100;
    const vpn=flujos.reduce((acc,f,i)=>acc+f/Math.pow(1+tasaDesc,i+1),-capexTotal);
    const totalF=flujos.reduce((a,b)=>a+b,0);
    const roi5=(totalF-capexTotal)/capexTotal*100;
    const multiple=totalF/capexTotal;
    const flujoReq=capexTotal*tasaDesc;
    const ventasReq=(flujoReq+copexMensual)/margenPct/12;
    const acum=flujos.reduce((acc,f,i)=>{acc.push((acc[i-1]??-capexTotal)+f);return acc;},[]);
    return {flujos,tir:tir*100,vpn,roi5,multiple,acum,flujoReq,ventasReq};
  },[ventasMes,margenPct,capexTotal,copexMensual,tasaInversor]);

  // Helpers edición
  const updateVenta   = (id,field,val) => setVentas(p=>p.map(r=>r.id===id?{...r,[field]:val}:r));
  const deleteVenta   = (id) => setVentas(p=>p.filter(r=>r.id!==id));
  const addVenta      = () => setVentas(p=>[...p,{id:Date.now(),producto:"Nuevo producto",precio:10,unidades:100,costoVar:0.30}]);
  const updateCapex   = (id,field,val) => setCapexItems(p=>p.map(r=>r.id===id?{...r,[field]:val}:r));
  const deleteCapex   = (id) => setCapexItems(p=>p.filter(r=>r.id!==id));
  const addCapex      = () => setCapexItems(p=>[...p,{id:Date.now(),cat:"Otro",item:"Nuevo ítem",monto:0}]);
  const updateCopex   = (id,field,val) => setCopexItems(p=>p.map(r=>r.id===id?{...r,[field]:val}:r));
  const deleteCopex   = (id) => setCopexItems(p=>p.filter(r=>r.id!==id));
  const addCopex      = () => setCopexItems(p=>[...p,{id:Date.now(),cat:"Otro",item:"Nuevo ítem",monto:0,tipo:"Fijo"}]);
  const updateDistrito= (id,field,val) => setDistritos(p=>p.map(r=>r.id===id?{...r,[field]:val}:r));
  const deleteDistrito= (id) => setDistritos(p=>p.filter(r=>r.id!==id));
  const addDistrito   = () => setDistritos(p=>[...p,{id:Date.now(),name:"Nuevo distrito",alquiler:0,compra:0}]);

  const sc = SCENARIOS[scenario];

  const tabs=[
    {id:"home",       label:"Resumen",    icon:Home      },
    {id:"ventas",     label:"Ventas",     icon:BarChart2 },
    {id:"costos",     label:"Costos",     icon:DollarSign},
    {id:"escenarios", label:"Simulador",  icon:Sliders   },
    {id:"realestate", label:"Inmuebles",  icon:MapPin    },
    {id:"curva",      label:"Curva J",    icon:TrendingUp},
    {id:"roi",        label:"ROI / TIR",  icon:Percent   },
  ];

  const kpi = (icon, label, value, sub, color, formulaProps=null) => (
    <div style={{background:"white",borderRadius:14,border:"1px solid #f0ede8",padding:"18px 20px",flex:1,minWidth:155}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
        <div style={{width:32,height:32,borderRadius:8,background:"#fdf4ef",display:"flex",alignItems:"center",justifyContent:"center"}}>{icon}</div>
        <span style={{fontSize:12,color:"#9ca3af"}}>{label}</span>
        {formulaProps && <FormulaTooltip {...formulaProps}/>}
      </div>
      <div style={{fontSize:23,fontWeight:700,color:color||BROWN,letterSpacing:"-0.5px"}}>{value}</div>
      {sub && <div style={{fontSize:12,color:"#9ca3af",marginTop:3}}>{sub}</div>}
    </div>
  );

  const addRowBtn = (onClick) => (
    <button onClick={onClick} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 14px",borderRadius:8,background:"#fdf4ef",color:COPPER,border:`1px dashed ${COPPER}`,fontSize:12,fontWeight:500,cursor:"pointer",marginTop:8}}>
      <Plus size={13}/> Agregar fila
    </button>
  );

  const deleteBtn = (onClick) => (
    <button onClick={onClick} style={{background:"none",border:"none",cursor:"pointer",color:"#d1d5db",padding:3,display:"flex",alignItems:"center"}}><Trash2 size={13}/></button>
  );

  return (
    <div style={{fontFamily:"'Inter','Roboto',sans-serif",background:BG,minHeight:"100vh",color:BROWN}}>
      {/* Header */}
      <div style={{background:"white",borderBottom:"1px solid #f0ede8",padding:"0 20px",display:"flex",alignItems:"center",justifyContent:"space-between",height:56,flexWrap:"wrap",gap:6}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <Coffee size={19} color={COPPER}/>
          <span style={{fontSize:15,fontWeight:700,color:BROWN}}>Kronos Café</span>
          <span style={{fontSize:11,color:"#9ca3af",background:"#f3f4f6",padding:"2px 8px",borderRadius:20}}>Deck Inversor 2025</span>
        </div>
        <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",alignItems:"center",gap:4,padding:"5px 10px",borderRadius:7,fontSize:12,fontWeight:tab===t.id?600:400,background:tab===t.id?"#fdf4ef":"transparent",color:tab===t.id?COPPER:"#6b7280",border:`1px solid ${tab===t.id?"#f5d5c0":"transparent"}`,cursor:"pointer"}}>
              <t.icon size={12}/>{t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{padding:"22px 26px",maxWidth:1100,margin:"0 auto"}}>

        {/* ── HOME ── */}
        {tab==="home" && (
          <div>
            <h1 style={{fontSize:24,fontWeight:700,color:BROWN,margin:"0 0 4px"}}>Resumen Ejecutivo</h1>
            <p style={{color:"#9ca3af",margin:"0 0 20px",fontSize:14}}>Cafetería de especialidad · Lima, Perú · To-Go / Salón / Talleres</p>
            <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:20}}>
              {kpi(<DollarSign size={13} color={COPPER}/>, "CAPEX Total", fmt(capexTotal), "Inversión inicial", COPPER,
                {formula:`Suma de todos los ítems de inversión\n= ${fmt(capexTotal)}`, result:fmt(capexTotal), explanation:"Todo lo que se desembolsa antes de abrir: maquinaria, obra civil, mobiliario, licencias."})}
              {kpi(<BarChart2 size={13} color={COPPER}/>, "COPEX Mensual", fmt(copexMensual), `${copexItems.length} ítems operativos`, null,
                {formula:`Suma de costos fijos + variables\n= ${fmt(copexMensual)}/mes`, result:fmt(copexMensual), explanation:"Lo que cuesta operar el negocio cada mes, con o sin ventas."})}
              {kpi(<TrendingUp size={13} color={COPPER}/>, "Ventas Base/mes", fmt(ventasTotal), `${ventas.length} líneas de negocio`, null,
                {formula:`Σ (Precio × Unidades) por línea\n= ${fmt(ventasTotal)}/mes`, result:fmt(ventasTotal), explanation:"Suma de ingresos brutos de todas las líneas de negocio en el modelo base."})}
              {kpi(<Target size={13} color="#16a34a"/>, "Margen Bruto", fmt(margenTotal), pct(margenPct)+" ponderado", "#16a34a",
                {formula:`Ventas × (1 − Costo Variable %)\n= ${fmt(ventasTotal)} × ${pct(margenPct)}\n= ${fmt(margenTotal)}`, result:fmt(margenTotal), explanation:"Lo que queda después de insumos directos. No incluye COPEX fijo."})}
              {kpi(<Clock size={13} color={flujoMensualBase>=0?"#16a34a":"#ef4444"}/>, "Flujo Neto/mes", fmt(flujoMensualBase), "Margen − COPEX", flujoMensualBase>=0?"#16a34a":"#ef4444",
                {formula:`Margen Bruto − COPEX mensual\n= ${fmt(margenTotal)} − ${fmt(copexMensual)}\n= ${fmt(flujoMensualBase)}`, result:fmt(flujoMensualBase), explanation:"Lo que sobra cada mes después de pagar todos los costos. Si es negativo, el negocio consume caja."})}
              {kpi(<Target size={13} color="#7c3aed"/>, "Ventas P.E.", fmt(copexMensual/margenPct), "Punto de equilibrio", "#7c3aed",
                {formula:`COPEX ÷ Margen%\n= ${fmt(copexMensual)} ÷ ${pct(margenPct)}\n= ${fmt(copexMensual/margenPct)}`, result:fmt(copexMensual/margenPct), explanation:"Las ventas mínimas para cubrir todos los costos. Por encima de esto, el negocio genera utilidad."})}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              <div style={{background:"white",borderRadius:14,border:"1px solid #f0ede8",padding:20}}>
                <h3 style={{margin:"0 0 12px",fontSize:14,fontWeight:600,color:BROWN}}>Distribución CAPEX · {fmt(capexTotal)}</h3>
                <ResponsiveContainer width="100%" height={190}>
                  <PieChart>
                    <Pie data={Object.entries(capexItems.reduce((a,r)=>{a[r.cat]=(a[r.cat]||0)+r.monto;return a},{})).map(([k,v])=>({name:k,value:v}))}
                      cx="50%" cy="50%" innerRadius={52} outerRadius={82} paddingAngle={2} dataKey="value">
                      {Object.keys(CAPEX_COLORS).map((k,i)=><Cell key={i} fill={CAPEX_COLORS[k]||COPPER}/>)}
                    </Pie>
                    <RechartTooltip formatter={(v)=>fmt(v)}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{background:"white",borderRadius:14,border:"1px solid #f0ede8",padding:20}}>
                <h3 style={{margin:"0 0 12px",fontSize:14,fontWeight:600,color:BROWN}}>Ventas vs Margen por línea</h3>
                <ResponsiveContainer width="100%" height={190}>
                  <BarChart data={ventas.map(r=>({producto:r.producto,ventas:r.precio*r.unidades,margen:Math.round(r.precio*r.unidades*(1-r.costoVar))}))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/>
                    <XAxis dataKey="producto" tick={{fontSize:9,fill:"#9ca3af"}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fontSize:9,fill:"#9ca3af"}} axisLine={false} tickLine={false} tickFormatter={v=>"S/"+v/1000+"k"}/>
                    <RechartTooltip formatter={(v)=>fmt(v)}/>
                    <Legend wrapperStyle={{fontSize:11}}/>
                    <Bar dataKey="ventas" name="Ventas" fill={COPPER} radius={[4,4,0,0]}/>
                    <Bar dataKey="margen" name="Margen" fill={BROWN}  radius={[4,4,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* ── VENTAS (editable) ── */}
        {tab==="ventas" && (
          <div>
            <h1 style={{fontSize:24,fontWeight:700,color:BROWN,margin:"0 0 4px"}}>Ventas por Línea de Negocio</h1>
            <p style={{color:"#9ca3af",margin:"0 0 6px",fontSize:14}}>Haz click en cualquier valor para editarlo. Los cambios actualizan todos los cálculos.</p>
            <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:20}}>
              {kpi(<DollarSign size={13} color={COPPER}/>, "Ventas totales/mes", fmt(ventasTotal), `${ventas.reduce((a,r)=>a+r.unidades,0).toLocaleString()} unidades`)}
              {kpi(<TrendingUp size={13} color="#16a34a"/>, "Margen bruto/mes", fmt(margenTotal), pct(margenPct)+" ponderado", "#16a34a")}
              {kpi(<BarChart2 size={13} color="#7c3aed"/>, "Ticket promedio", "S/ "+Math.round(ventasTotal/ventas.reduce((a,r)=>a+r.unidades,0)), "por transacción", "#7c3aed")}
            </div>
            <div style={{background:"white",borderRadius:14,border:"1px solid #f0ede8",padding:22}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead>
                  <tr>{["Producto","Precio (S/)","Unid/mes","Ventas/mes","Costo Var%","Margen","% Margen",""].map(h=>(
                    <th key={h} style={{textAlign:"left",padding:"8px 6px",color:"#9ca3af",fontWeight:500,borderBottom:"1px solid #f0ede8",fontSize:12}}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {ventas.map(r=>{
                    const v=r.precio*r.unidades, m=v*(1-r.costoVar);
                    return (
                      <tr key={r.id} style={{borderBottom:"1px solid #f9fafb"}}>
                        <td style={{padding:"9px 6px"}}><EditableCell value={r.producto} type="text" onChange={v=>updateVenta(r.id,"producto",v)}/></td>
                        <td style={{padding:"9px 6px"}}><EditableCell value={r.precio} onChange={v=>updateVenta(r.id,"precio",v)} prefix="S/ "/></td>
                        <td style={{padding:"9px 6px"}}><EditableCell value={r.unidades} onChange={v=>updateVenta(r.id,"unidades",v)}/></td>
                        <td style={{padding:"9px 6px",fontWeight:500}}>{fmt(v)}</td>
                        <td style={{padding:"9px 6px"}}><EditableCell value={Math.round(r.costoVar*100)} onChange={v=>updateVenta(r.id,"costoVar",v/100)} prefix=""/><span style={{fontSize:11,color:"#9ca3af"}}>%</span></td>
                        <td style={{padding:"9px 6px",fontWeight:600,color:"#16a34a"}}>{fmt(m)}</td>
                        <td style={{padding:"9px 6px"}}>
                          <div style={{display:"flex",alignItems:"center",gap:5}}>
                            <div style={{height:5,width:50,background:"#f3f4f6",borderRadius:3}}>
                              <div style={{height:5,width:(m/v*50)+"px",background:COPPER,borderRadius:3}}/>
                            </div>
                            <span style={{fontSize:11,color:"#9ca3af"}}>{(m/v*100).toFixed(0)}%</span>
                          </div>
                        </td>
                        <td style={{padding:"9px 6px"}}>{deleteBtn(()=>deleteVenta(r.id))}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr style={{borderTop:"2px solid #f0ede8"}}>
                    <td colSpan={3} style={{padding:"10px 6px",fontWeight:700,color:BROWN}}>TOTALES</td>
                    <td style={{padding:"10px 6px",fontWeight:700,color:BROWN}}>{fmt(ventasTotal)}</td>
                    <td/>
                    <td style={{padding:"10px 6px",fontWeight:700,color:"#16a34a"}}>{fmt(margenTotal)}</td>
                    <td style={{padding:"10px 6px",fontWeight:700,color:COPPER}}>{pct(margenPct)}</td>
                    <td/>
                  </tr>
                </tfoot>
              </table>
              {addRowBtn(addVenta)}
            </div>
          </div>
        )}

        {/* ── COSTOS (editable) ── */}
        {tab==="costos" && (
          <div>
            <h1 style={{fontSize:24,fontWeight:700,color:BROWN,margin:"0 0 4px"}}>Estructura de Costos</h1>
            <p style={{color:"#9ca3af",margin:"0 0 20px",fontSize:14}}>Click en cualquier valor para editarlo. Los totales se recalculan en tiempo real.</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,marginBottom:18}}>

              {/* CAPEX */}
              <div style={{background:"white",borderRadius:14,border:"1px solid #f0ede8",padding:20}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                  <div>
                    <h3 style={{margin:0,fontSize:14,fontWeight:600,color:BROWN}}>CAPEX</h3>
                    <p style={{margin:"2px 0 0",fontSize:12,color:"#9ca3af"}}>Total: <strong style={{color:COPPER}}>{fmt(capexTotal)}</strong></p>
                  </div>
                </div>
                <div style={{maxHeight:380,overflowY:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                    <thead><tr>
                      <th style={{textAlign:"left",padding:"5px 4px",color:"#9ca3af",fontWeight:500,borderBottom:"1px solid #f0ede8"}}>Categoría</th>
                      <th style={{textAlign:"left",padding:"5px 4px",color:"#9ca3af",fontWeight:500,borderBottom:"1px solid #f0ede8"}}>Ítem</th>
                      <th style={{textAlign:"right",padding:"5px 4px",color:"#9ca3af",fontWeight:500,borderBottom:"1px solid #f0ede8"}}>Monto</th>
                      <th/>
                    </tr></thead>
                    <tbody>
                      {capexItems.map(r=>(
                        <tr key={r.id} style={{borderBottom:"1px solid #f9fafb"}}>
                          <td style={{padding:"8px 4px"}}><EditableCell value={r.cat} type="text" onChange={v=>updateCapex(r.id,"cat",v)}/></td>
                          <td style={{padding:"8px 4px"}}><EditableCell value={r.item} type="text" onChange={v=>updateCapex(r.id,"item",v)}/></td>
                          <td style={{padding:"8px 4px",textAlign:"right",fontWeight:600,color:BROWN}}><EditableCell value={r.monto} onChange={v=>updateCapex(r.id,"monto",v)} prefix="S/ "/></td>
                          <td style={{padding:"8px 4px"}}>{deleteBtn(()=>deleteCapex(r.id))}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot><tr style={{borderTop:"2px solid #f0ede8"}}>
                      <td colSpan={2} style={{padding:"8px 4px",fontWeight:700,color:BROWN}}>TOTAL</td>
                      <td style={{padding:"8px 4px",textAlign:"right",fontWeight:700,color:COPPER}}>{fmt(capexTotal)}</td>
                      <td/>
                    </tr></tfoot>
                  </table>
                </div>
                {addRowBtn(addCapex)}
              </div>

              {/* COPEX */}
              <div style={{background:"white",borderRadius:14,border:"1px solid #f0ede8",padding:20}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                  <div>
                    <h3 style={{margin:0,fontSize:14,fontWeight:600,color:BROWN}}>COPEX Mensual</h3>
                    <p style={{margin:"2px 0 0",fontSize:12,color:"#9ca3af"}}>Total: <strong style={{color:COPPER}}>{fmt(copexMensual)}</strong></p>
                  </div>
                </div>
                <div style={{maxHeight:380,overflowY:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                    <thead><tr>
                      <th style={{textAlign:"left",padding:"5px 4px",color:"#9ca3af",fontWeight:500,borderBottom:"1px solid #f0ede8"}}>Categoría</th>
                      <th style={{textAlign:"left",padding:"5px 4px",color:"#9ca3af",fontWeight:500,borderBottom:"1px solid #f0ede8"}}>Ítem</th>
                      <th style={{textAlign:"right",padding:"5px 4px",color:"#9ca3af",fontWeight:500,borderBottom:"1px solid #f0ede8"}}>Monto</th>
                      <th/>
                    </tr></thead>
                    <tbody>
                      {copexItems.map(r=>(
                        <tr key={r.id} style={{borderBottom:"1px solid #f9fafb"}}>
                          <td style={{padding:"8px 4px"}}><EditableCell value={r.cat} type="text" onChange={v=>updateCopex(r.id,"cat",v)}/></td>
                          <td style={{padding:"8px 4px"}}><EditableCell value={r.item} type="text" onChange={v=>updateCopex(r.id,"item",v)}/></td>
                          <td style={{padding:"8px 4px",textAlign:"right",fontWeight:600,color:BROWN}}><EditableCell value={r.monto} onChange={v=>updateCopex(r.id,"monto",v)} prefix="S/ "/></td>
                          <td style={{padding:"8px 4px"}}>{deleteBtn(()=>deleteCopex(r.id))}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot><tr style={{borderTop:"2px solid #f0ede8"}}>
                      <td colSpan={2} style={{padding:"8px 4px",fontWeight:700,color:BROWN}}>TOTAL</td>
                      <td style={{padding:"8px 4px",textAlign:"right",fontWeight:700,color:COPPER}}>{fmt(copexMensual)}</td>
                      <td/>
                    </tr></tfoot>
                  </table>
                </div>
                {addRowBtn(addCopex)}
              </div>
            </div>
          </div>
        )}

        {/* ── SIMULADOR ── */}
        {tab==="escenarios" && (
          <div>
            <h1 style={{fontSize:24,fontWeight:700,color:BROWN,margin:"0 0 4px"}}>Simulador de Escenarios</h1>
            <p style={{color:"#9ca3af",margin:"0 0 20px",fontSize:14}}>Impacto del mix de ventas en indicadores clave</p>
            <div style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap"}}>
              {Object.entries(SCENARIOS).map(([k,v])=>(
                <button key={k} onClick={()=>setScenario(k)} style={{padding:"10px 20px",borderRadius:10,fontSize:13,fontWeight:scenario===k?600:400,background:scenario===k?v.color:"white",color:scenario===k?"white":"#6b7280",border:`1.5px solid ${scenario===k?v.color:"#e5e7eb"}`,cursor:"pointer"}}>
                  {v.label}<div style={{fontSize:11,opacity:0.7,marginTop:2}}>{v.desc}</div>
                </button>
              ))}
            </div>
            <div style={{display:"flex",gap:14,marginBottom:20,flexWrap:"wrap"}}>
              {[
                {label:"Ticket Promedio",value:`S/ ${sc.ticket}`,sub:"por cliente"},
                {label:"Margen Contribución",value:`${sc.margen}%`,sub:"ponderado"},
                {label:"Meta diaria de tickets",value:sc.tickets,sub:"para punto de equilibrio"},
              ].map((c,i)=>(
                <div key={i} style={{flex:1,minWidth:155,background:"white",borderRadius:14,border:`1.5px solid ${sc.color}22`,padding:"18px 20px"}}>
                  <p style={{margin:"0 0 6px",fontSize:12,color:"#9ca3af"}}>{c.label}</p>
                  <p style={{margin:0,fontSize:30,fontWeight:700,color:sc.color,letterSpacing:"-1px"}}>{c.value}</p>
                  <p style={{margin:"3px 0 0",fontSize:12,color:"#9ca3af"}}>{c.sub}</p>
                </div>
              ))}
            </div>
            <div style={{background:"white",borderRadius:14,border:"1px solid #f0ede8",padding:20}}>
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={Object.values(SCENARIOS).map(v=>({name:v.label,ticket:v.ticket,tickets_be:v.tickets}))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/>
                  <XAxis dataKey="name" tick={{fontSize:12,fill:"#9ca3af"}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:11,fill:"#9ca3af"}} axisLine={false} tickLine={false}/>
                  <RechartTooltip/>
                  <Legend wrapperStyle={{fontSize:12}}/>
                  <Bar dataKey="ticket"     name="Ticket (S/)"    fill={COPPER} radius={[4,4,0,0]}/>
                  <Bar dataKey="tickets_be" name="Tickets BE/día" fill={BROWN}  radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── REAL ESTATE (editable) ── */}
        {tab==="realestate" && (
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
              <div>
                <h1 style={{fontSize:24,fontWeight:700,color:BROWN,margin:0}}>Bienes Raíces</h1>
                <p style={{color:"#9ca3af",margin:"5px 0 0",fontSize:14}}>Click en cualquier valor para editarlo</p>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10,background:"white",border:"1px solid #e5e7eb",borderRadius:10,padding:"7px 12px"}}>
                <span style={{fontSize:13,color:modoCompra?"#9ca3af":BROWN,fontWeight:modoCompra?400:600}}>Alquiler</span>
                <div onClick={()=>setModoCompra(!modoCompra)} style={{width:44,height:24,borderRadius:12,background:modoCompra?COPPER:"#e5e7eb",cursor:"pointer",position:"relative",transition:"background .3s"}}>
                  <div style={{width:18,height:18,borderRadius:"50%",background:"white",position:"absolute",top:3,left:modoCompra?23:3,transition:"left .3s"}}/>
                </div>
                <span style={{fontSize:13,color:modoCompra?BROWN:"#9ca3af",fontWeight:modoCompra?600:400}}>Compra</span>
              </div>
            </div>
            <div style={{background:"white",borderRadius:14,border:"1px solid #f0ede8",padding:20,marginBottom:16}}>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={distritos.map(d=>({name:d.name,valor:modoCompra?d.compra:d.alquiler}))} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false}/>
                  <XAxis type="number" tick={{fontSize:11,fill:"#9ca3af"}} axisLine={false} tickLine={false} tickFormatter={v=>modoCompra?fmtK(v):fmt(v)}/>
                  <YAxis dataKey="name" type="category" tick={{fontSize:12,fill:BROWN,fontWeight:500}} axisLine={false} tickLine={false} width={90}/>
                  <RechartTooltip formatter={(v)=>modoCompra?fmtK(v):fmt(v)}/>
                  <Bar dataKey="valor" fill={modoCompra?BROWN:COPPER} radius={[0,6,6,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{background:"white",borderRadius:14,border:"1px solid #f0ede8",padding:20}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead><tr>
                  {["Distrito","Alquiler/mes","Precio compra",""].map(h=>(
                    <th key={h} style={{textAlign:"left",padding:"7px 8px",color:"#9ca3af",fontWeight:500,borderBottom:"1px solid #f0ede8"}}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {distritos.map(d=>(
                    <tr key={d.id} style={{borderBottom:"1px solid #f9fafb"}}>
                      <td style={{padding:"10px 8px",fontWeight:600,color:BROWN}}><EditableCell value={d.name} type="text" onChange={v=>updateDistrito(d.id,"name",v)}/></td>
                      <td style={{padding:"10px 8px",color:COPPER,fontWeight:600}}><EditableCell value={d.alquiler} onChange={v=>updateDistrito(d.id,"alquiler",v)} prefix="S/ "/></td>
                      <td style={{padding:"10px 8px",color:BROWN}}><EditableCell value={d.compra} onChange={v=>updateDistrito(d.id,"compra",v)} prefix="S/ "/></td>
                      <td style={{padding:"10px 8px"}}>{deleteBtn(()=>deleteDistrito(d.id))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {addRowBtn(addDistrito)}
            </div>
          </div>
        )}

        {/* ── CURVA J ── */}
        {tab==="curva" && (
          <div>
            <h1 style={{fontSize:24,fontWeight:700,color:BROWN,margin:"0 0 4px"}}>Máquina del Tiempo Financiera</h1>
            <p style={{color:"#9ca3af",margin:"0 0 20px",fontSize:14}}>Flujo de Caja Acumulado · 60 meses · CAPEX {fmt(capexTotal)}</p>
            <div style={{background:"white",borderRadius:14,border:"1px solid #f0ede8",padding:22}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:12}}>
                <div>
                  <p style={{margin:0,fontSize:12,color:"#9ca3af"}}>Ventas mensuales proyectadas</p>
                  <div style={{display:"flex",alignItems:"baseline",gap:6,marginTop:3}}>
                    <span style={{fontSize:24,fontWeight:700,color:COPPER,letterSpacing:"-0.5px"}}>{fmt(ventasMes)}</span>
                    <span style={{fontSize:12,color:"#9ca3af"}}>/mes</span>
                    <FormulaTooltip
                      formula={`Flujo mensual = Ventas × Margen% − COPEX\n= ${fmt(ventasMes)} × ${pct(margenPct)} − ${fmt(copexMensual)}\n= ${fmt(ventasMes*margenPct-copexMensual)}`}
                      result={fmt(ventasMes*margenPct-copexMensual)+"/mes"}
                      explanation="Cada mes este flujo se acumula sobre el CAPEX inicial negativo hasta cruzar cero (payback)."
                    />
                  </div>
                </div>
                <div style={{display:"flex",gap:20}}>
                  <div style={{textAlign:"center"}}>
                    <p style={{margin:"0 0 3px",fontSize:11,color:"#9ca3af"}}>Payback</p>
                    <p style={{margin:0,fontSize:20,fontWeight:700,color:paybackMes===">60"?"#ef4444":"#16a34a"}}>Mes {paybackMes}</p>
                  </div>
                  <div style={{textAlign:"center"}}>
                    <p style={{margin:"0 0 3px",fontSize:11,color:"#9ca3af"}}>Flujo neto/mes</p>
                    <p style={{margin:0,fontSize:20,fontWeight:700,color:flujoMensualBase>=0?"#16a34a":COPPER}}>{fmt(flujoMensualBase)}</p>
                  </div>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16,background:"#fdf4ef",borderRadius:10,padding:"10px 14px"}}>
                <TrendingUp size={14} color={COPPER}/>
                <span style={{fontSize:12,color:"#6b7280"}}>S/ 40k</span>
                <input type="range" min={40000} max={120000} step={1000} value={ventasMes} onChange={e=>setVentasMes(+e.target.value)} style={{flex:1,accentColor:COPPER}}/>
                <span style={{fontSize:12,color:"#6b7280"}}>S/ 120k</span>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={curvaData} margin={{top:20,right:30,left:20,bottom:10}}>
                  <defs>
                    <linearGradient id="gNeg2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COPPER} stopOpacity={0.15}/>
                      <stop offset="95%" stopColor={COPPER} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/>
                  <XAxis dataKey="mes" tick={{fontSize:11,fill:"#9ca3af"}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:10,fill:"#9ca3af"}} axisLine={false} tickLine={false} tickFormatter={v=>fmtK(Math.abs(v))+(v<0?"(-)":"")}/>
                  <RechartTooltip formatter={(v)=>fmt(v)} labelFormatter={l=>`Mes ${l}`}/>
                  <ReferenceLine y={0} stroke="#16a34a" strokeWidth={2} strokeDasharray="6 3"
                    label={{value:"↑ Punto de retorno",position:"insideTopRight",fontSize:11,fill:"#16a34a",fontWeight:600}}/>
                  <ReferenceLine x={valleMes} stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4 3"
                    label={{value:`Valle (Mes ${valleMes})`,position:"insideTopLeft",fontSize:11,fill:"#ef4444",fontWeight:600}}/>
                  {paybackMes!==">60" && (
                    <ReferenceLine x={paybackMes} stroke="#2563eb" strokeWidth={2}
                      label={{value:`Payback Mes ${paybackMes}`,position:"insideTopRight",fontSize:11,fill:"#2563eb",fontWeight:600}}/>
                  )}
                  <Area type="monotone" dataKey="flujo" stroke={COPPER} strokeWidth={2.5} fill="url(#gNeg2)" dot={false}/>
                </AreaChart>
              </ResponsiveContainer>
              <div style={{display:"flex",gap:16,marginTop:12,padding:"10px 14px",background:"#fafafa",borderRadius:10,flexWrap:"wrap"}}>
                {[
                  {color:COPPER,    label:"Desembolso inicial", desc:`Mes 0 · ${fmt(capexTotal)}`},
                  {color:"#ef4444", label:"Valle de la muerte",  desc:`Mes ${valleMes} · mínimo ${fmt(valleVal)}`},
                  {color:"#16a34a", label:"Punto de retorno",    desc:"Flujo acumulado cruza cero"},
                  {color:"#2563eb", label:"Payback total",       desc:`Mes ${paybackMes} · inversión recuperada`},
                ].map((s,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"flex-start",gap:7}}>
                    <div style={{width:3,height:32,background:s.color,borderRadius:2,marginTop:2}}/>
                    <div>
                      <p style={{margin:0,fontSize:12,fontWeight:600,color:s.color}}>{s.label}</p>
                      <p style={{margin:0,fontSize:11,color:"#9ca3af"}}>{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── ROI / TIR ── */}
        {tab==="roi" && (
          <div>
            <h1 style={{fontSize:24,fontWeight:700,color:BROWN,margin:"0 0 4px"}}>Métricas para el Inversor</h1>
            <p style={{color:"#9ca3af",margin:"0 0 20px",fontSize:14}}>Ajusta ventas y tasa — todos los indicadores se recalculan en tiempo real</p>

            {/* Controles */}
            <div style={{background:"white",borderRadius:14,border:`2px solid ${COPPER}44`,padding:"20px 24px",marginBottom:18}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
                <Percent size={16} color={COPPER}/>
                <span style={{fontSize:14,fontWeight:600,color:BROWN}}>Simulador del inversor</span>
              </div>
              <div style={{marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <span style={{fontSize:12,color:"#6b7280",fontWeight:500}}>Ventas mensuales proyectadas</span>
                  <span style={{fontSize:14,fontWeight:700,color:COPPER}}>{fmt(ventasMes)}/mes</span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:12,color:"#9ca3af"}}>S/40k</span>
                  <input type="range" min={40000} max={120000} step={1000} value={ventasMes} onChange={e=>setVentasMes(+e.target.value)} style={{flex:1,accentColor:COPPER}}/>
                  <span style={{fontSize:12,color:"#9ca3af"}}>S/120k</span>
                </div>
              </div>
              <div style={{marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <span style={{fontSize:12,color:"#6b7280",fontWeight:500}}>Retorno anual esperado por el inversor</span>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <input type="number" min={1} max={200} value={tasaInput}
                      onChange={e=>{setTasaInput(e.target.value);const v=parseFloat(e.target.value);if(!isNaN(v)&&v>0)setTasaInversor(Math.min(v,200));}}
                      style={{width:56,padding:"3px 7px",borderRadius:7,border:`1.5px solid ${COPPER}`,fontSize:14,fontWeight:700,color:COPPER,textAlign:"center"}}/>
                    <span style={{fontSize:13,fontWeight:700,color:COPPER}}>%</span>
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                  <span style={{fontSize:12,color:"#9ca3af"}}>5%</span>
                  <input type="range" min={5} max={80} step={1} value={tasaInversor} onChange={e=>{setTasaInversor(+e.target.value);setTasaInput(e.target.value);}} style={{flex:1,accentColor:BROWN}}/>
                  <span style={{fontSize:12,color:"#9ca3af"}}>80%</span>
                </div>
                <div style={{display:"flex",gap:6}}>
                  {[10,15,20,25,30].map(t=>(
                    <button key={t} onClick={()=>{setTasaInversor(t);setTasaInput(String(t));}} style={{padding:"4px 11px",borderRadius:20,fontSize:12,background:tasaInversor===t?COPPER:"#f3f4f6",color:tasaInversor===t?"white":"#6b7280",border:"none",cursor:"pointer",fontWeight:tasaInversor===t?600:400}}>{t}%</button>
                  ))}
                </div>
              </div>
              <div style={{padding:"10px 14px",background:"#fdf4ef",borderRadius:8,fontSize:13,color:"#6b7280",borderLeft:`3px solid ${COPPER}`}}>
                Con <strong style={{color:COPPER}}>{fmt(ventasMes)}/mes</strong> y tasa de <strong style={{color:COPPER}}>{tasaInversor}%</strong> → necesitas flujo mínimo de <strong style={{color:BROWN}}>{fmt(roiMetrics.flujoReq)}/año</strong> = ventas de <strong style={{color:BROWN}}>{fmt(roiMetrics.ventasReq)}/mes</strong>
                {roiMetrics.ventasReq<=ventasMes
                  ? <span style={{color:"#16a34a",fontWeight:600}}> ✓ Tu escenario lo cumple.</span>
                  : <span style={{color:"#ef4444",fontWeight:600}}> ✗ Necesitas +{pct(roiMetrics.ventasReq/ventasMes-1)} en ventas.</span>}
              </div>
            </div>

            {/* KPIs con tooltips */}
            <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:18}}>
              {[
                { label:"TIR Anual", value:roiMetrics.tir.toFixed(1)+"%", sub:"Tasa Interna de Retorno", color:roiMetrics.tir>tasaInversor?"#16a34a":COPPER,
                  formula:`Tasa que hace VPN = 0\nEncontrada por bisección numérica\nTIR = ${roiMetrics.tir.toFixed(1)}%`,
                  explanation:"Si TIR > tu tasa esperada, el proyecto te conviene. Si es menor, no compensa el riesgo." },
                { label:`VPN (${tasaInversor}%)`, value:fmtK(roiMetrics.vpn), sub:"Valor Presente Neto", color:roiMetrics.vpn>0?"#16a34a":"#ef4444",
                  formula:`Σ [Flujo año n ÷ (1+${tasaInversor/100})ⁿ] − CAPEX\n= ${fmtK(roiMetrics.vpn)}`,
                  explanation:"Si es positivo, el proyecto genera más que tu tasa exigida. Si es negativo, no llega a tu umbral." },
                { label:"ROI 5 años", value:roiMetrics.roi5.toFixed(1)+"%", sub:(roiMetrics.roi5/5).toFixed(1)+"% anual promedio", color:COPPER,
                  formula:`(Flujos totales − CAPEX) ÷ CAPEX × 100\n= (${fmtK(roiMetrics.flujos.reduce((a,b)=>a+b,0))} − ${fmtK(capexTotal)}) ÷ ${fmtK(capexTotal)}\n= ${roiMetrics.roi5.toFixed(1)}%`,
                  explanation:"Rentabilidad total sobre la inversión en 5 años, sin considerar el valor del tiempo." },
                { label:"Múltiple Capital", value:roiMetrics.multiple.toFixed(2)+"x", sub:"Por cada S/ 1 invertido", color:roiMetrics.multiple>1?"#16a34a":"#ef4444",
                  formula:`Flujos totales 5 años ÷ CAPEX\n= ${fmtK(roiMetrics.flujos.reduce((a,b)=>a+b,0))} ÷ ${fmtK(capexTotal)}\n= ${roiMetrics.multiple.toFixed(2)}x`,
                  explanation:"Un múltiplo de 2x significa que por cada S/ 1 invertido recibes S/ 2 de vuelta. Referencia: 1.5x–2x es aceptable para negocios físicos." },
                { label:"Payback", value:"Mes "+paybackMes, sub:"Recupero total", color:paybackMes===">60"?"#ef4444":"#2563eb",
                  formula:`Mes en que Flujo Acumulado ≥ 0\nCAPEX = ${fmt(capexTotal)}\nFlujo neto/mes = ${fmt(flujoMensualBase)}`,
                  explanation:"El tiempo que tarda el negocio en devolverte toda la inversión inicial. Un inversor ángel típicamente busca payback en 3–5 años." },
              ].map((m,i)=>(
                <div key={i} style={{flex:1,minWidth:145,background:"white",borderRadius:14,border:"1px solid #f0ede8",padding:"16px 18px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:5}}>
                    <span style={{fontSize:11,color:"#9ca3af"}}>{m.label}</span>
                    <FormulaTooltip formula={m.formula} result={m.value} explanation={m.explanation}/>
                  </div>
                  <p style={{margin:"0 0 3px",fontSize:24,fontWeight:700,color:m.color,letterSpacing:"-1px"}}>{m.value}</p>
                  <p style={{margin:0,fontSize:11,color:"#9ca3af"}}>{m.sub}</p>
                </div>
              ))}
            </div>

            {/* Benchmark */}
            <div style={{background:`linear-gradient(135deg,${BROWN} 0%,#4a2e1f 100%)`,borderRadius:14,padding:"20px 24px"}}>
              <h3 style={{margin:"0 0 14px",fontSize:14,fontWeight:600,color:"white"}}>Benchmark frente a tu tasa del {tasaInversor}%</h3>
              <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
                {[
                  {label:`TIR ${roiMetrics.tir.toFixed(1)}% vs tasa ${tasaInversor}%`, bueno:roiMetrics.tir>tasaInversor, nota:roiMetrics.tir>tasaInversor?`${(roiMetrics.tir-tasaInversor).toFixed(1)}pts de colchón sobre tu tasa`:"Por debajo de tu tasa objetivo"},
                  {label:"VPN positivo",       bueno:roiMetrics.vpn>0,              nota:roiMetrics.vpn>0?"El proyecto crea valor a tu tasa":"No viable a esta tasa"},
                  {label:"Múltiple > 1x",      bueno:roiMetrics.multiple>1,         nota:`${roiMetrics.multiple.toFixed(2)}x retorno sobre capital`},
                  {label:"Payback < 60 meses", bueno:paybackMes!==">60",            nota:paybackMes!==">60"?`Recupero en mes ${paybackMes}`:"Fuera del horizonte"},
                ].map((b,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,flex:1,minWidth:175}}>
                    <div style={{width:20,height:20,borderRadius:"50%",background:b.bueno?"#16a34a":"#ef4444",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2}}>
                      <span style={{color:"white",fontSize:11,fontWeight:700}}>{b.bueno?"✓":"✗"}</span>
                    </div>
                    <div>
                      <p style={{margin:0,fontSize:12,color:"rgba(255,255,255,0.9)",fontWeight:500}}>{b.label}</p>
                      <p style={{margin:"2px 0 0",fontSize:11,color:"rgba(255,255,255,0.5)"}}>{b.nota}</p>
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