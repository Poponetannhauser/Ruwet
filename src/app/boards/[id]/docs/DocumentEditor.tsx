'use client'

import { useState } from 'react'
import {
  type BoardDocument,
  DOCUMENT_TYPE_LABELS,
} from './docTypes'
import { deleteDocument } from './docActions'

type DocumentViewerProps = {
  document: BoardDocument
  boardId: string
  onDelete?: () => void
}

export function DocumentEditor({
  document: doc,
  boardId,
  onDelete,
}: DocumentViewerProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDeleteConfirm() {
    setIsDeleting(true)
    const res = await deleteDocument(doc.id, boardId)
    if (res.error) {
      setError(res.error)
      setIsDeleting(false)
    } else {
      if (onDelete) onDelete()
    }
  }

  const isMarkdownOrText =
    doc.file_name?.endsWith('.md') ||
    doc.file_name?.endsWith('.txt') ||
    doc.file_name?.endsWith('.json') ||
    doc.file_type?.includes('text') ||
    (!doc.content.startsWith('data:') && doc.content.length > 0)

  const isDataUrl = doc.content.startsWith('data:')
  const isImage = doc.file_type?.startsWith('image/') || doc.content.startsWith('data:image/')
  const isPdf = doc.file_type === 'application/pdf' || doc.content.startsWith('data:application/pdf')

  const typeLabel = DOCUMENT_TYPE_LABELS[doc.doc_type]?.label || doc.doc_type.toUpperCase()

  function renderMarkdownPreview(raw: string) {
    if (!raw.trim()) {
      return (
        <div className="text-zinc-500 text-xs italic py-8 text-center">
          Konten file teks kosong.
        </div>
      )
    }

    const lines = raw.split('\n')
    let inCodeBlock = false
    let codeContent: string[] = []

    const elements: React.ReactNode[] = []

    lines.forEach((line, index) => {
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

      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={index} className="text-xl sm:text-2xl font-bold text-white mt-6 mb-3 pb-2 border-b border-zinc-800">
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
      } else if (line.trim().startsWith('- [ ] ') || line.trim().startsWith('- [x] ') || line.trim().startsWith('- [X] ')) {
        const isChecked = line.trim().startsWith('- [x] ') || line.trim().startsWith('- [X] ')
        const text = line.replace(/- \[[ xX]\] /, '')
        elements.push(
          <div key={index} className="flex items-center gap-2 my-1 text-xs text-zinc-300 pl-2">
            <input type="checkbox" checked={isChecked} readOnly className="rounded border-zinc-700 bg-zinc-800 text-indigo-600" />
            <span className={isChecked ? 'line-through text-zinc-500' : ''}>{text}</span>
          </div>
        )
      } else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        elements.push(
          <li key={index} className="text-xs text-zinc-300 my-0.5 ml-4 list-disc">
            {formatInline(line.replace(/^[-*] /, ''))}
          </li>
        )
      } else if (/^\d+\.\s/.test(line.trim())) {
        elements.push(
          <li key={index} className="text-xs text-zinc-300 my-0.5 ml-4 list-decimal">
            {formatInline(line.replace(/^\d+\.\s/, ''))}
          </li>
        )
      } else if (line.trim() === '') {
        elements.push(<div key={index} className="h-2" />)
      } else {
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

  function handleDownload() {
    if (!doc.content) return
    const link = window.document.createElement('a')
    if (isDataUrl) {
      link.href = doc.content
    } else {
      const blob = new Blob([doc.content], { type: doc.file_type || 'text/plain' })
      link.href = URL.createObjectURL(blob)
    }
    link.download = doc.file_name || `${doc.title}.txt`
    window.document.body.appendChild(link)
    link.click()
    window.document.body.removeChild(link)
  }

  return (
    <div className="flex flex-col h-full bg-[#2C2C30] rounded-xl border border-zinc-800/80 overflow-hidden shadow-xs">
      {/* Viewer Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#242429] border-b border-zinc-800/80">
        <div className="flex items-center gap-2.5 flex-1 min-w-[240px]">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white truncate">
                {doc.title}
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-indigo-300 border border-zinc-700/80 shrink-0">
                {typeLabel}
              </span>
            </div>
            {doc.file_name && (
              <span className="text-[11px] text-zinc-400 font-mono">
                {doc.file_name} {doc.file_size ? `(${(doc.file_size / 1024).toFixed(1)} KB)` : ''}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {doc.content && (
            <button
              type="button"
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1e1e24] border border-zinc-700 text-zinc-200 hover:bg-zinc-800 hover:text-white transition flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Download File</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (confirm(`Yakin ingin menghapus dokumen "${doc.title}"?`)) {
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

      {/* Document Content / Preview Area */}
      <div className="flex-1 p-5 sm:p-8 overflow-y-auto bg-[#1A1A1E] text-zinc-200">
        {isImage ? (
          <div className="flex flex-col items-center justify-center p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={doc.content} alt={doc.title} className="max-w-full max-h-[600px] object-contain rounded-lg border border-zinc-800" />
          </div>
        ) : isPdf ? (
          <div className="h-full flex flex-col items-center justify-center space-y-4">
            <iframe src={doc.content} className="w-full h-full min-h-[500px] rounded-lg border border-zinc-800" title={doc.title} />
          </div>
        ) : isMarkdownOrText ? (
          <div className="max-w-3xl mx-auto">
            {renderMarkdownPreview(doc.content)}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-16">
            <div className="w-14 h-14 rounded-2xl bg-zinc-800/80 flex items-center justify-center text-zinc-400">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">{doc.file_name || doc.title}</h4>
              <p className="text-xs text-zinc-400 mt-1">
                Preview visual tidak tersedia untuk tipe file ini. Klik tombol Download di atas untuk membukanya.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
