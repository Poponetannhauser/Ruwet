'use client'

import { useState } from 'react'
import {
  type BoardDocument,
  type DocumentType,
  DOCUMENT_TYPE_LABELS,
} from './docTypes'

type DocumentListProps = {
  documents: BoardDocument[]
  selectedDocId: string | null
  onSelectDoc: (id: string) => void
  onOpenUploadModal: () => void
}

export function DocumentList({
  documents,
  selectedDocId,
  onSelectDoc,
  onOpenUploadModal,
}: DocumentListProps) {
  const [filterType, setFilterType] = useState<string>('all')
  const [search, setSearch] = useState('')

  const filteredDocs = documents.filter((doc) => {
    if (filterType !== 'all' && doc.doc_type !== filterType) {
      return false
    }
    if (search.trim() !== '') {
      const q = search.toLowerCase()
      const matchTitle = doc.title.toLowerCase().includes(q)
      const matchFileName = (doc.file_name || '').toLowerCase().includes(q)
      return matchTitle || matchFileName
    }
    return true
  })

  return (
    <div className="flex flex-col h-full bg-[#2C2C30] rounded-xl border border-zinc-800/80 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            <h3 className="text-sm font-bold text-white">Dokumen Board</h3>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
              {documents.length}
            </span>
          </div>
          <button
            type="button"
            onClick={onOpenUploadModal}
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-lg transition shadow-xs"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span>Upload</span>
          </button>
        </div>

        {/* Search Input */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari dokumen / nama file..."
          className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#1a1a1e] border border-zinc-700/80 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
        />

        {/* Filter Badges */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px]">
          <button
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-0.5 rounded-full font-medium transition shrink-0 ${
              filterType === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            Semua
          </button>
          {(Object.entries(DOCUMENT_TYPE_LABELS) as [DocumentType, typeof DOCUMENT_TYPE_LABELS[DocumentType]][]).map(
            ([key, val]) => (
              <button
                key={key}
                onClick={() => setFilterType(key)}
                className={`px-2.5 py-0.5 rounded-full font-medium transition shrink-0 ${
                  filterType === key
                    ? 'bg-indigo-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {val.label}
              </button>
            )
          )}
        </div>
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredDocs.length > 0 ? (
          filteredDocs.map((doc) => {
            const isSelected = selectedDocId === doc.id
            const typeLabel = DOCUMENT_TYPE_LABELS[doc.doc_type]?.label || doc.doc_type.toUpperCase()
            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => onSelectDoc(doc.id)}
                className={`w-full text-left p-3 rounded-lg transition-all flex flex-col gap-1 border ${
                  isSelected
                    ? 'bg-[#383842] border-indigo-500/50 shadow-xs'
                    : 'bg-[#1f1f24] border-zinc-800/60 hover:bg-[#27272e] text-zinc-400'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={`text-xs font-bold truncate ${
                      isSelected ? 'text-white' : 'text-zinc-200'
                    }`}
                  >
                    {doc.title}
                  </span>
                  <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/60 shrink-0">
                    {typeLabel}
                  </span>
                </div>

                {doc.file_name && (
                  <div className="text-[10px] text-zinc-400 font-mono truncate">
                    {doc.file_name} {doc.file_size ? `(${(doc.file_size / 1024).toFixed(1)} KB)` : ''}
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-0.5">
                  <span>
                    {doc.profiles?.full_name ? doc.profiles.full_name : 'Anggota Tim'}
                  </span>
                  <span>
                    {new Date(doc.created_at).toLocaleDateString('id-ID', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </button>
            )
          })
        ) : (
          <div className="py-8 text-center text-xs text-zinc-500">
            {search || filterType !== 'all' ? (
              <span>Tidak ada dokumen yang cocok</span>
            ) : (
              <span>Belum ada dokumen yang diupload di board ini.</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
