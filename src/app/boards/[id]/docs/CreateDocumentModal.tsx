'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { createDocument, DOCUMENT_TEMPLATES, type DocumentType } from './docActions'

type CreateDocumentModalProps = {
  boardId: string
  isOpen: boolean
  onClose: () => void
  onCreated?: (docId: string) => void
}

export function CreateDocumentModal({
  boardId,
  isOpen,
  onClose,
  onCreated,
}: CreateDocumentModalProps) {
  const [selectedType, setSelectedType] = useState<DocumentType>('prd')
  const [title, setTitle] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  if (!isOpen || !mounted) return null

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.set('doc_type', selectedType)
    if (!formData.get('content')) {
      formData.set('content', DOCUMENT_TEMPLATES[selectedType].template)
    }

    const res = await createDocument(boardId, formData)
    if (res.error) {
      setError(res.error)
      setLoading(false)
    } else {
      setLoading(false)
      setTitle('')
      onClose()
      if (res.id && onCreated) {
        onCreated(res.id)
      }
    }
  }

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-[#2C2C30] p-5 sm:p-6 shadow-2xl border border-zinc-800/80"
        >
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
            <div>
              <h3 className="text-base font-bold text-white">Buat Dokumen Baru</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Simpan PRD, GDD, Tech Spec, atau catatan tim untuk board ini.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
            >
              ✕
            </button>
          </div>

          {error && (
            <div className="mt-3 rounded-md bg-red-900/30 border border-red-800/50 p-2.5 text-xs text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Template Selector */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-2">
                Pilih Template Starter
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(Object.entries(DOCUMENT_TEMPLATES) as [DocumentType, typeof DOCUMENT_TEMPLATES[DocumentType]][]).map(
                  ([key, val]) => {
                    const isSelected = selectedType === key
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setSelectedType(key)
                          if (!title) {
                            setTitle(val.name.split(' (')[0])
                          }
                        }}
                        className={`text-left p-2.5 rounded-lg border transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-indigo-950/60 border-indigo-500/80 text-white shadow-xs'
                            : 'bg-[#1e1e24] border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-base">{val.icon}</span>
                          <span className="text-xs font-bold">{val.name}</span>
                        </div>
                        <span className="text-[10px] text-zinc-500 line-clamp-2">
                          {val.description}
                        </span>
                      </button>
                    )
                  }
                )}
              </div>
            </div>

            {/* Document Title */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Judul Dokumen <span className="text-rose-400">*</span>
              </label>
              <input
                name="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Contoh: Game Design Document v1.0 / PRD Fitur Auth"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800/80">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-50 transition shadow-xs"
              >
                {loading ? 'Membuat...' : 'Buat Dokumen'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}
