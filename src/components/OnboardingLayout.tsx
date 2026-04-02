'use client'

import { DotLottieReact } from '@lottiefiles/dotlottie-react'

interface OnboardingLayoutProps {
  children: React.ReactNode
  step?: number
  totalSteps?: number
}

export default function OnboardingLayout({ children, step, totalSteps }: OnboardingLayoutProps) {
  return (
    <main
      className="min-h-screen flex flex-col items-center p-8 relative"
      style={{
        backgroundImage: "url('/Pantallas.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Overlay multiply */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: '#421869',
          mixBlendMode: 'multiply',
          opacity: 0.9,
        }}
      />

      {/* Contenido */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-lg">

        {/* Lottie logo arriba centrado */}
        <div className="mt-8 mb-6">
          <DotLottieReact
            src="https://lottie.host/af470ece-482e-4ab8-bb0f-487a0fac67b4/SBuCRKGYwc.lottie"
            autoplay
            loop
            style={{ width: 70, height: 70 }}
          />
        </div>

        {/* Barra de progreso (opcional) */}
        {step && totalSteps && (
          <div className="w-full mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-white/60 text-xs font-mono tracking-widest uppercase">
                Paso {step} de {totalSteps}
              </span>
              <span className="text-[#ffa719] text-xs font-mono font-bold">
                {Math.round((step / totalSteps) * 100)}%
              </span>
            </div>
            <div className="w-full h-1 bg-white/20 rounded-full">
              <div
                className="h-1 rounded-full transition-all duration-500"
                style={{
                  width: `${(step / totalSteps) * 100}%`,
                  backgroundColor: '#ffa719',
                }}
              />
            </div>
          </div>
        )}

        {/* Contenido de cada paso */}
        {children}
      </div>
    </main>
  )
}