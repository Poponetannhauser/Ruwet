'use client'

import { useState } from 'react'
import {
  type BoardDocument,
} from './docActions'
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
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const selectedDoc = documents.find((d) => d.id === selectedDocId) || null

  return (
    <div className="flex-1 flex flex-col md:flex-row gap-6 h-[calc(100vh-140px)] min-h-[500px]">
      {/* Left Sidebar Document List */}
      <div className="w-full md:w-80 lg:w-96 shrink-0 h-full">
        <DocumentList
          documents={documents}
          selectedDocId={selectedDocId}
          onSelectDoc={(id) => setSelectedDocId(id)}
          onOpenCreateModal={() => setIsCreateOpen(true)}
        />
      </div>

      {/* Right Main Editor / Previewer Area */}
      <div className="flex-1 h-full min-w-0">
        {selectedDoc ? (
          <DocumentEditor
            key={selectedDoc.id}
            document={selectedDoc}
            boardId={boardId}
            onUpdated={(partial) => {
              setDocuments((prev) =>
                prev.map((d) => (d.id === selectedDoc.id ? { ...d, ...partial } : d))
              )
            }}
            onDelete={() => {
              const remaining = documents.filter((d) => d.id !== selectedDoc.id)
              setDocuments(remaining)
              setSelectedDocId(remaining.length > 0 ? remaining[0].id : null)
            }}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center rounded-xl bg-[#2C2C30] border border-zinc-800/80 p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800/80 flex items-center justify-center text-3xl">
              📄
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Belum Ada Dokumen Terpilih</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                Pilih dokumen dari daftar di sebelah kiri atau buat dokumen baru dengan template PRD, GDD, atau Tech Spec.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition shadow-xs"
            >
              + Buat Dokumen Baru
            </button>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <CreateDocumentModal
        boardId={boardId}
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={(newId) => {
          // Re-trigger reload / add to local documents if needed
          window.location.reload()
        }}
      />
    </div>
  )
}
