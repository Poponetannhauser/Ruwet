'use client'

import { useState } from 'react'
import {
  type BoardDocument,
} from './docTypes'
import { DocumentList } from './DocumentList'
import { DocumentEditor } from './DocumentEditor'
import { CreateDocumentModal } from './CreateDocumentModal'

type DocsClientViewProps = {
  boardId: string
  initialDocuments: BoardDocument[]
  dbError?: string | null
}

export function DocsClientView({
  boardId,
  initialDocuments,
  dbError,
}: DocsClientViewProps) {
  const [documents, setDocuments] = useState<BoardDocument[]>(initialDocuments)
  const [selectedDocId, setSelectedDocId] = useState<string | null>(
    initialDocuments.length > 0 ? initialDocuments[0].id : null
  )
  const [isUploadOpen, setIsUploadOpen] = useState(false)

  const selectedDoc = documents.find((d) => d.id === selectedDocId) || null

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-140px)] min-h-[500px]">
      {dbError && (
        <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-3 sm:p-4 text-xs text-amber-200 flex items-start gap-3 shrink-0">
          <svg className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="space-y-1">
            <p className="font-bold text-amber-300">Tabel Database Belum Ditemukan</p>
            <p className="text-[11px] text-zinc-300 leading-relaxed">
              Tabel <code className="font-mono text-amber-400 bg-black/40 px-1 py-0.5 rounded">board_documents</code> belum dibuat di remote Supabase Anda. Jalankan file migrasi <code className="font-mono text-indigo-300">supabase/migrations/20260821000000_update_tasks_and_add_board_documents.sql</code> di Supabase SQL Editor.
            </p>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0">
        {/* Left Sidebar Document List */}
        <div className="w-full md:w-80 lg:w-96 shrink-0 h-full">
          <DocumentList
            documents={documents}
            selectedDocId={selectedDocId}
            onSelectDoc={(id) => setSelectedDocId(id)}
            onOpenUploadModal={() => setIsUploadOpen(true)}
          />
        </div>

        {/* Right Main Viewer Area */}
        <div className="flex-1 h-full min-w-0">
          {selectedDoc ? (
            <DocumentEditor
              key={selectedDoc.id}
              document={selectedDoc}
              boardId={boardId}
              onDelete={() => {
                const remaining = documents.filter((d) => d.id !== selectedDoc.id)
                setDocuments(remaining)
                setSelectedDocId(remaining.length > 0 ? remaining[0].id : null)
              }}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center rounded-xl bg-[#2C2C30] border border-zinc-800/80 p-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-zinc-800/80 flex items-center justify-center text-zinc-400">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Belum Ada Dokumen Terpilih</h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                  Pilih dokumen dari daftar di sebelah kiri atau upload file PRD, GDD, Tech Spec, atau catatan baru.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadOpen(true)}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition shadow-xs"
              >
                + Upload Dokumen
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      <CreateDocumentModal
        boardId={boardId}
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploaded={(_newId) => {
          window.location.reload()
        }}
      />
    </div>
  )
}
