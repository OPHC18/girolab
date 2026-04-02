'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { useRef } from 'react'

export default function RichTextEditor({ content, onChange }: {
  content: string
  onChange: (html: string) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  if (!editor) return null

  const btn = (action: () => void, label: string, active?: boolean, title?: string) => (
    <button
      type="button"
      title={title}
      onClick={action}
      style={{
        padding: '6px 12px',
        borderRadius: 8,
        border: 'none',
        cursor: 'pointer',
        background: active ? '#421869' : '#f0f0f0',
        color: active ? 'white' : '#333',
        fontWeight: 600,
        fontSize: 13,
        whiteSpace: 'nowrap'
      }}
    >
      {label}
    </button>
  )

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen no puede superar 2 MB')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      editor.chain().focus().setImage({ src: reader.result as string }).run()
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleLink = () => {
    const url = window.prompt('Ingresa la URL:')
    if (!url) return
    if (editor.state.selection.empty) {
      alert('Selecciona primero el texto al que quieres agregar el link')
      return
    }
    editor.chain().focus().setLink({ href: url }).run()
  }

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 12, overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 6,
        padding: '10px 12px', background: '#f8f9fa',
        borderBottom: '1px solid #ddd'
      }}>
        {btn(() => editor.chain().focus().toggleBold().run(), 'B', editor.isActive('bold'), 'Negrita')}
        {btn(() => editor.chain().focus().toggleItalic().run(), 'I', editor.isActive('italic'), 'Cursiva')}
        {btn(() => editor.chain().focus().toggleHeading({ level: 2 }).run(), 'Subtítulo', editor.isActive('heading', { level: 2 }), 'Subtítulo')}
        {btn(() => editor.chain().focus().toggleBulletList().run(), '• Lista', editor.isActive('bulletList'), 'Lista con viñetas')}
        {btn(() => editor.chain().focus().toggleOrderedList().run(), '1. Lista', editor.isActive('orderedList'), 'Lista numerada')}
        {btn(() => editor.chain().focus().toggleBlockquote().run(), '❝ Cita', editor.isActive('blockquote'), 'Cita')}
        {btn(handleLink, '🔗 Link', editor.isActive('link'), 'Insertar link (selecciona texto primero)')}

        {/* Botón imagen — sube archivo */}
        <button
          type="button"
          title="Insertar imagen (máx. 2MB)"
          onClick={() => fileInputRef.current?.click()}
          style={{
            padding: '6px 12px', borderRadius: 8, border: 'none',
            cursor: 'pointer', background: '#f0f0f0',
            color: '#333', fontWeight: 600, fontSize: 13
          }}
        >
          🖼️ Imagen
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleImageUpload}
        />

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          {btn(() => editor.chain().focus().undo().run(), '↩ Deshacer')}
          {btn(() => editor.chain().focus().redo().run(), '↪ Rehacer')}
        </div>
      </div>

      {/* Editor — sin borde negro, altura flexible */}
      <EditorContent
        editor={editor}
        style={{ minHeight: 200, padding: '12px 16px', fontSize: 15, lineHeight: 1.6 }}
      />

      {/* Estilos para quitar el outline negro del editor */}
      <style>{`
        .tiptap { outline: none !important; }
        .tiptap p { margin: 0.5em 0; }
        .tiptap h2 { font-size: 1.3em; font-weight: 700; margin: 1em 0 0.5em; color: #421869; }
        .tiptap ul { padding-left: 1.5em; list-style-type: disc; }
        .tiptap ol { padding-left: 1.5em; list-style-type: decimal; }
        .tiptap blockquote { border-left: 3px solid #421869; padding-left: 12px; color: #666; margin: 0.5em 0; }
        .tiptap a { color: #421869; text-decoration: underline; }
        .tiptap img { max-width: 100%; height: auto; border-radius: 8px; margin: 8px 0; }
      `}</style>
    </div>
  )
}