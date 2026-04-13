'use client'

import { DotLottieReact } from '@lottiefiles/dotlottie-react'

export default function DashboardLoading() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        background: 'white',
      }}
    >
      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.15} }
        .blink { animation: blink 1.5s ease-in-out infinite }
      `}</style>
      <DotLottieReact
        src="https://lottie.host/fc37eb39-3bb0-41db-b866-99ac7449ef1d/rpkq6ZVATl.lottie"
        loop
        autoplay
        style={{ width: 120, height: 120 }}
      />
      <p
        className="blink"
        style={{
          color: '#421869',
          fontWeight: 600,
          letterSpacing: '0.15em',
          fontSize: 12,
          textTransform: 'uppercase',
        }}
      >
        Cargando tu Giro...
      </p>
    </div>
  )
}
