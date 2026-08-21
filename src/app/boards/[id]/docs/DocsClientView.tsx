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
}

export function DocsClientView({
  boardId,
  initialDocuments,
}: DocsClientViewProps) {
  const [documents, setDocuments] = useState<BoardDocument[]>(initialDocuments)
  const [selectedDocId, setSelectedDocId] = useState<string | null>(
    initialDocuments.length > 0 ? initialDocuments[0].id : null
  )
  const [isUploadOpen, setIsUploadOpen] = useState(false)

  const selectedDoc = documents.find((d) => d.id === selectedDocId) || null

  return (
    <div className="flex-1 flex flex-col md:flex-row gap-6 h-[calc(100vh-140px)] min-h-[500px]">
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
