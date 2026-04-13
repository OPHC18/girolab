'use client'

import { useEffect, useRef } from 'react'

interface Props {
  src: string
  style?: React.CSSProperties
  className?: string
}

export default function DotLottieWC({ src, style, className }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Import the package first so the custom element is registered before createElement
    import('@lottiefiles/dotlottie-wc').then(() => {
      if (!ref.current) return
      ref.current.innerHTML = ''
      const el = document.createElement('dotlottie-wc') as HTMLElement
      el.setAttribute('src', src)
      el.setAttribute('autoplay', '')
      el.setAttribute('loop', '')
      el.style.width = '100%'
      el.style.height = '100%'
      ref.current.appendChild(el)
    })
  }, [src])

  return <div ref={ref} style={style} className={className} />
}
