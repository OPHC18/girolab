// src/components/assessments/PageShell.tsx
// Fondo institucional con círculos animados para las pantallas de evaluación.

'use client';

const CIRCLES = [
  { left: '25%', size: 80, delay: 0, dur: 25 },
  { left: '10%', size: 20, delay: 2, dur: 12 },
  { left: '70%', size: 20, delay: 4, dur: 25 },
  { left: '40%', size: 60, delay: 8, dur: 20 },
  { left: '85%', size: 30, delay: 1, dur: 18 },
];

export default function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: '#421869', minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
      <ul style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', margin: 0, padding: 0, zIndex: 0, pointerEvents: 'none', listStyle: 'none' }}>
        {CIRCLES.map((c, i) => (
          <li key={i} style={{ position: 'absolute', display: 'block', width: c.size, height: c.size, background: 'rgba(255,255,255,0.05)', bottom: -150, left: c.left, borderRadius: '50%', animation: `animateUp ${c.dur}s linear ${c.delay}s infinite` }} />
        ))}
      </ul>
      <style>{`@keyframes animateUp{0%{transform:translateY(0) rotate(0deg);opacity:1}100%{transform:translateY(-110vh) rotate(720deg);opacity:0}}`}</style>
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ width: '100%', maxWidth: 640, background: 'white', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
