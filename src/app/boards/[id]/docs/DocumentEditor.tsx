'use client'

import { useState, useTransition } from 'react'
import {
  type BoardDocument,
  type DocumentType,
  DOCUMENT_TEMPLATES,
  updateDocument,
  deleteDocument,
} from './docActions'

type DocumentEditorProps = {
  document: BoardDocument
  boardId: string
  onDelete?: () => void
  onUpdated?: (doc: Partial<BoardDocument>) => void
}

export function DocumentEditor({
  document: initialDoc,
  boardId,
  onDelete,
  onUpdated,
}: DocumentEditorProps) {
  const [title, setTitle] = useState(initialDoc.title)
  const [content, setContent] = useState(initialDoc.content)
  const [docType, setDocType] = useState<DocumentType>(initialDoc.doc_type || 'general')
  const [activeTab, setActiveTab] = useState<'preview' | 'edit'>('preview')
  const [isSaving, startSaving] = useTransition()
  const [isDeleting, setIsDeleting] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Track if doc changed from parent
  const [prevDocId, setPrevDocId] = useState(initialDoc.id)
  if (prevDocId !== initialDoc.id) {
    setPrevDocId(initialDoc.id)
    setTitle(initialDoc.title)
    setContent(initialDoc.content)
    setDocType(initialDoc.doc_type || 'general')
    setActiveTab('preview')
  }

  function handleSave() {
    setError(null)
    setSaveSuccess(false)
    startSaving(async () => {
      const formData = new FormData()
      formData.set('title', title)
      formData.set('content', content)
      formData.set('doc_type', docType)

      const res = await updateDocument(initialDoc.id, boardId, formData)
      if (res.error) {
        setError(res.error)
      } else {
        setSaveSuccess(true)
        if (onUpdated) {
          onUpdated({ title, content, doc_type: docType, updated_at: new Date().toISOString() })
        }
        setTimeout(() => setSaveSuccess(false), 2500)
      }
    })
  }

  async function handleDeleteConfirm() {
    setIsDeleting(true)
    const res = await deleteDocument(initialDoc.id, boardId)
    if (res.error) {
      setError(res.error)
      setIsDeleting(false)
    } else {
      if (onDelete) onDelete()
    }
  }

  function insertFormatting(prefix: string, suffix = '') {
    const textarea = document.getElementById('doc-editor-textarea') as HTMLTextAreaElement
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = content.substring(start, end)
    const replacement = `${prefix}${selected || 'teks'}${suffix}`
    const newContent = content.substring(0, start) + replacement + content.substring(end)
    setContent(newContent)
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected.length || 4))
    }, 50)
  }

  // Simple Markdown renderer (lightweight, safe, beautiful)
  function renderMarkdownPreview(raw: string) {
    if (!raw.trim()) {
      return (
        <div className="text-zinc-500 text-xs italic py-8 text-center">
          Dokumen masih kosong. Klik tab &ldquo;Edit Markdown&rdquo; untuk mulai menulis konten.
        </div>
      )
    }

    const lines = raw.split('\n')
    let inCodeBlock = false
    let codeContent: string[] = []

    const elements: React.ReactNode[] = []

    lines.forEach((line, index) => {
      // Code block toggles
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre
              key={`code-${index}`}
              className="bg-zinc-950 text-zinc-200 p-3 rounded-lg text-xs font-mono overflow-x-auto border border-zinc-800 my-2"
            >
              <code>{codeContent.join('\n')}</code>
            </pre>
          )
          codeContent = []
          inCodeBlock = false
        } else {
          inCodeBlock = true
        }
        return
      }

      if (inCodeBlock) {
        codeContent.push(line)
        return
      }

      // Headings
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={index} className="text-xl sm:text-2xl font-black text-white mt-6 mb-3 pb-2 border-b border-zinc-800">
            {line.replace('# ', '')}
          </h1>
        )
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={index} className="text-base sm:text-lg font-bold text-indigo-300 mt-5 mb-2">
            {line.replace('## ', '')}
          </h2>
        )
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={index} className="text-sm font-bold text-zinc-200 mt-4 mb-1">
            {line.replace('### ', '')}
          </h3>
        )
      }
      // Checkbox list
      else if (line.trim().startsWith('- [ ] ') || line.trim().startsWith('- [x] ') || line.trim().startsWith('- [X] ')) {
        const isChecked = line.trim().startsWith('- [x] ') || line.trim().startsWith('- [X] ')
        const text = line.replace(/- \[[ xX]\] /, '')
        elements.push(
          <div key={index} className="flex items-center gap-2 my-1 text-xs text-zinc-300 pl-2">
            <input type="checkbox" checked={isChecked} readOnly className="rounded border-zinc-700 bg-zinc-800 text-indigo-600" />
            <span className={isChecked ? 'line-through text-zinc-500' : ''}>{text}</span>
          </div>
        )
      }
      // Bullet list
      else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        elements.push(
          <li key={index} className="text-xs text-zinc-300 my-0.5 ml-4 list-disc">
            {formatInline(line.replace(/^[-*] /, ''))}
          </li>
        )
      }
      // Numbered list
      else if (/^\d+\.\s/.test(line.trim())) {
        elements.push(
          <li key={index} className="text-xs text-zinc-300 my-0.5 ml-4 list-decimal">
            {formatInline(line.replace(/^\d+\.\s/, ''))}
          </li>
        )
      }
      // Empty line
      else if (line.trim() === '') {
        elements.push(<div key={index} className="h-2" />)
      }
      // Regular paragraph
      else {
        elements.push(
          <p key={index} className="text-xs text-zinc-300 leading-relaxed my-1">
            {formatInline(line)}
          </p>
        )
      }
    })

    return <div className="space-y-1">{elements}</div>
  }

  function formatInline(str: string) {
    // Basic inline bold and inline code
    const parts = str.split(/(\*\*.*?\*\*|`.*?`)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="px-1 py-0.5 rounded bg-zinc-800 text-indigo-300 font-mono text-[11px]">
            {part.slice(1, -1)}
          </code>
        )
      }
      return part
    })
  }

  const currentTemplate = DOCUMENT_TEMPLATES[docType] || DOCUMENT_TEMPLATES.general

  return (
    <div className="flex flex-col h-full bg-[#2C2C30] rounded-xl border border-zinc-800/80 overflow-hidden shadow-xs">
      {/* Editor Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#242429] border-b border-zinc-800/80">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <span className="text-xl shrink-0">{currentTemplate.icon}</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Judul Dokumen..."
            className="flex-1 bg-transparent text-sm sm:text-base font-bold text-white focus:outline-none border-b border-transparent focus:border-indigo-500 px-1 py-0.5 transition"
          />
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value as DocumentType)}
            className="text-[11px] py-1 px-2 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-300 focus:outline-none"
          >
            <option value="prd">📄 PRD</option>
            <option value="gdd">🎮 GDD</option>
            <option value="tech_spec">⚙️ Tech Spec</option>
            <option value="meeting_notes">📝 Notes</option>
            <option value="general">📋 General</option>
          </select>
        </div>

        {/* View / Edit Mode Switch & Actions */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg bg-zinc-900/80 p-0.5 border border-zinc-800">
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                activeTab === 'preview' ? 'bg-indigo-600 text-white shadow-xs' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Preview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                activeTab === 'edit' ? 'bg-indigo-600 text-white shadow-xs' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Edit Markdown
            </button>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs ${
              saveSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50'
            }`}
          >
            {isSaving ? (
              <span>Menyimpan...</span>
            ) : saveSuccess ? (
              <span>✓ Tersimpan</span>
            ) : (
              <span>Simpan</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              if (confirm(`Yakin ingin menghapus dokumen "${title}"?`)) {
                handleDeleteConfirm()
              }
            }}
            disabled={isDeleting}
            className="p-1.5 text-zinc-500 hover:text-rose-400 rounded-lg hover:bg-zinc-800 transition"
            title="Hapus Dokumen"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-950/40 border-b border-rose-800/60 px-4 py-2 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Editor Content Area */}
      {activeTab === 'edit' ? (
        <div className="flex flex-col flex-1 min-h-0">
          {/* Quick Formatting Toolbar */}
          <div className="flex items-center gap-1 px-4 py-2 bg-[#202024] border-b border-zinc-800/80 text-zinc-400 text-xs overflow-x-auto">
            <button
              type="button"
              onClick={() => insertFormatting('## ')}
              className="px-2 py-1 hover:bg-zinc-800 hover:text-white rounded font-bold"
              title="Heading 2"
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('### ')}
              className="px-2 py-1 hover:bg-zinc-800 hover:text-white rounded font-bold"
              title="Heading 3"
            >
              H3
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('**', '**')}
              className="px-2 py-1 hover:bg-zinc-800 hover:text-white rounded font-bold"
              title="Bold"
            >
              B
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('- ')}
              className="px-2 py-1 hover:bg-zinc-800 hover:text-white rounded"
              title="Bullet List"
            >
              • List
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('- [ ] ')}
              className="px-2 py-1 hover:bg-zinc-800 hover:text-white rounded"
              title="Task Checklist"
            >
              ☑ Checklist
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('```\n', '\n```')}
              className="px-2 py-1 hover:bg-zinc-800 hover:text-white rounded font-mono"
              title="Code Block"
            >
              &lt;/&gt; Code
            </button>
          </div>

          <textarea
            id="doc-editor-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Tuliskan dokumentasi Markdown di sini..."
            className="flex-1 w-full p-4 sm:p-6 bg-[#1A1A1E] text-zinc-200 font-mono text-xs leading-relaxed focus:outline-none resize-none overflow-y-auto"
          />
        </div>
      ) : (
        /* Markdown Preview Area */
        <div className="flex-1 p-5 sm:p-8 overflow-y-auto bg-[#1A1A1E] text-zinc-200 selection:bg-indigo-500/30 selection:text-indigo-200">
          <div className="max-w-3xl mx-auto">
            {renderMarkdownPreview(content)}
          </div>
        </div>
      )}
    </div>
  )
}
