'use client'
import { useEffect } from 'react'

export function ContentProtection() {
  useEffect(() => {
    // Deshabilitar clic derecho
    const onContextMenu = (e: MouseEvent) => e.preventDefault()

    // Deshabilitar atajos de teclado para inspeccionar / guardar fuente
    const onKeyDown = (e: KeyboardEvent) => {
      const k = (e.key ?? '').toLowerCase()
      // F12
      if (e.key === 'F12') { e.preventDefault(); return }
      // Ctrl+S, Ctrl+U, Ctrl+P
      if (e.ctrlKey && !e.shiftKey && ['s', 'u', 'p'].includes(k)) { e.preventDefault(); return }
      // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (DevTools)
      if (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(k)) { e.preventDefault(); return }
    }

    // El target de un evento no siempre es un elemento: en `selectstart` casi
    // siempre es un nodo de texto, que no tiene closest() ni tagName.
    const elementoDe = (t: EventTarget | null): Element | null =>
      t instanceof Element ? t : t instanceof Node ? t.parentElement : null

    // Deshabilitar drag nativo de imágenes
    const onDragStart = (e: DragEvent) => {
      if (elementoDe(e.target)?.tagName === 'IMG') e.preventDefault()
    }

    // Deshabilitar selección de texto en contenido no editable al hacer doble clic
    const onSelectStart = (e: Event) => {
      const isEditable = elementoDe(e.target)?.closest('input, textarea, [contenteditable], select')
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
