'use client'
import { useEffect } from 'react'

export function ContentProtection() {
  useEffect(() => {
    // Deshabilitar clic derecho
    const onContextMenu = (e: MouseEvent) => e.preventDefault()

    // Deshabilitar atajos de teclado para inspeccionar / guardar fuente
    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase()
      // F12
      if (e.key === 'F12') { e.preventDefault(); return }
      // Ctrl+S, Ctrl+U, Ctrl+P
      if (e.ctrlKey && !e.shiftKey && ['s', 'u', 'p'].includes(k)) { e.preventDefault(); return }
      // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (DevTools)
      if (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(k)) { e.preventDefault(); return }
    }

    // Deshabilitar drag nativo de imágenes
    const onDragStart = (e: DragEvent) => {
      if ((e.target as HTMLElement).tagName === 'IMG') e.preventDefault()
    }

    // Deshabilitar selección de texto en contenido no editable al hacer doble clic
    const onSelectStart = (e: Event) => {
      const target = e.target as HTMLElement
      const isEditable = target.closest('input, textarea, [contenteditable], select')
      if (!isEditable) e.preventDefault()
    }

    document.addEventListener('contextmenu', onContextMenu)
    document.addEventListener('keydown',     onKeyDown,     { capture: true })
    document.addEventListener('dragstart',   onDragStart)
    document.addEventListener('selectstart', onSelectStart)

    return () => {
      document.removeEventListener('contextmenu', onContextMenu)
      document.removeEventListener('keydown',     onKeyDown,     { capture: true })
      document.removeEventListener('dragstart',   onDragStart)
      document.removeEventListener('selectstart', onSelectStart)
    }
  }, [])

  return null
}
