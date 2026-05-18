'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RegistroPage() {
  const router = useRouter()
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const returnUrl = params.get('returnUrl')
    const query = returnUrl 
      ? `?registro=1&returnUrl=${encodeURIComponent(returnUrl)}`
      : '?registro=1'
    router.replace(`/${query}`)
  }, [])
  return null
}