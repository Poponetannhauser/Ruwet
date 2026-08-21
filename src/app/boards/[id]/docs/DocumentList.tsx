'use client'

import { useState } from 'react'
import {
  type BoardDocument,
  type DocumentType,
  DOCUMENT_TEMPLATES,
} from './docTypes'

type DocumentListProps = {
  documents: BoardDocument[]
  selectedDocId: string | null
  onSelectDoc: (id: string) => void
  onOpenCreateModal: () => void
}

export function DocumentList({
  documents,
  selectedDocId,
  onSelectDoc,
  onOpenCreateModal,
}: DocumentListProps) {
  const [filterType, setFilterType] = useState<string>('all')
  const [search, setSearch] = useState('')

  const filteredDocs = documents.filter((doc) => {
    if (filterType !== 'all' && doc.doc_type !== filterType) {
      return false
    }
    if (search.trim() !== '') {
      const q = search.toLowerCase()
      return doc.title.toLowerCase().includes(q)
    }
    return true
  })

  return (
    <div className="flex flex-col h-full bg-[#2C2C30] rounded-xl border border-zinc-800/80 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">📚</span>
            <h3 className="text-sm font-bold text-white">Dokumen Board</h3>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
              {documents.length}
            </span>
          </div>
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="flex items-center gap-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-2.5 py-1 rounded-lg transition shadow-xs"
          >
            <span>+</span>
            <span>Baru</span>
          </button>
        </div>

        {/* Search Input */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari dokumen..."
          className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#1a1a1e] border border-zinc-700/80 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
        />

        {/* Filter Badges */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px]">
          <button
            onClick={() => setFilterType('all')}
            className={`px-2 py-0.5 rounded-full font-medium transition shrink-0 ${
              filterType === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            Semua
          </button>
          {(['prd', 'gdd', 'tech_spec', 'meeting_notes', 'general'] as DocumentType[]).map((t) => {
            const tmpl = DOCUMENT_TEMPLATES[t]
            return (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2 py-0.5 rounded-full font-medium transition shrink-0 flex items-center gap-1 ${
                  filterType === t
                    ? 'bg-indigo-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <span>{tmpl.icon}</span>
                <span>{t.toUpperCase()}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredDocs.length > 0 ? (
          filteredDocs.map((doc) => {
            const isSelected = selectedDocId === doc.id
            const tmpl = DOCUMENT_TEMPLATES[doc.doc_type] || DOCUMENT_TEMPLATES.general
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
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm shrink-0">{tmpl.icon}</span>
                    <span
                      className={`text-xs font-bold truncate ${
                        isSelected ? 'text-white' : 'text-zinc-200'
                      }`}
                    >
                      {doc.title}
                    </span>
                  </div>
                  <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-zinc-800/90 text-zinc-400 border border-zinc-700/40 shrink-0">
                    {doc.doc_type}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1">
                  <span>
                    {doc.profiles?.full_name ? `Oleh ${doc.profiles.full_name}` : 'Anggota Tim'}
                  </span>
                  <span>
                    {new Date(doc.updated_at).toLocaleDateString('id-ID', {
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
              <div className="space-y-2">
                <span>Belum ada dokumen di board ini.</span>
                <button
                  type="button"
                  onClick={onOpenCreateModal}
                  className="block mx-auto text-indigo-400 hover:text-indigo-300 font-bold"
                >
                  + Buat Dokumen Pertama
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
