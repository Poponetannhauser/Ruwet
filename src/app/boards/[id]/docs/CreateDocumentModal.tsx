'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { uploadDocument } from './docActions'
import { DOCUMENT_TYPE_LABELS, type DocumentType } from './docTypes'

type UploadDocumentModalProps = {
  boardId: string
  isOpen: boolean
  onClose: () => void
  onUploaded?: (docId: string) => void
}

export function CreateDocumentModal({
  boardId,
  isOpen,
  onClose,
  onUploaded,
}: UploadDocumentModalProps) {
  const [selectedType, setSelectedType] = useState<DocumentType>('prd')
  const [title, setTitle] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  if (!isOpen || !mounted) return null

  function handleFileSelect(file: File) {
    setSelectedFile(file)
    if (!title) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '')
      setTitle(cleanName)
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      handleFileSelect(file)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (!selectedFile) {
      setError('Silakan pilih file untuk diupload')
      return
    }

    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.set('doc_type', selectedType)
    formData.set('file', selectedFile)
    if (title.trim()) {
      formData.set('title', title.trim())
    }

    const res = await uploadDocument(boardId, formData)
    if (res.error) {
      setError(res.error)
      setLoading(false)
    } else {
      setLoading(false)
      setTitle('')
      setSelectedFile(null)
      onClose()
      if (res.id && onUploaded) {
        onUploaded(res.id)
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
              <h3 className="text-base font-bold text-white">Upload Dokumen</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Simpan file PRD, GDD, Tech Spec, atau catatan tim untuk board ini.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition"
              aria-label="Tutup modal"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mt-3 rounded-md bg-red-900/30 border border-red-800/50 p-2.5 text-xs text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Document Type Classification */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-2">
                Tipe Dokumen
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(Object.entries(DOCUMENT_TYPE_LABELS) as [DocumentType, typeof DOCUMENT_TYPE_LABELS[DocumentType]][]).map(
                  ([key, val]) => {
                    const isSelected = selectedType === key
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSelectedType(key)}
                        className={`text-left p-2.5 rounded-lg border transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-indigo-950/60 border-indigo-500/80 text-white shadow-xs'
                            : 'bg-[#1e1e24] border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                        }`}
                      >
                        <span className="text-xs font-bold">{val.label}</span>
                        <span className="text-[10px] text-zinc-500 truncate">
                          {val.description}
                        </span>
                      </button>
                    )
                  }
                )}
              </div>
            </div>

            {/* File Upload Drag & Drop Area */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Pilih atau Drag File Dokumen <span className="text-rose-400">*</span>
              </label>
              <div
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-all ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-950/40 scale-[1.01]'
                    : 'border-zinc-700 hover:border-indigo-500/80 bg-zinc-900/50'
                }`}
              >
                <div className="space-y-1.5 text-center">
                  <svg
                    className={`mx-auto h-10 w-10 transition ${
                      isDragging ? 'text-indigo-400 animate-bounce' : 'text-zinc-400'
                    }`}
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <div className="flex text-xs text-zinc-400 justify-center">
                    <label className="relative cursor-pointer rounded-md font-medium text-indigo-400 hover:text-indigo-300 focus-within:outline-none">
                      <span>{isDragging ? 'Lepaskan file di sini' : 'Pilih file dari perangkat'}</span>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="sr-only"
                        accept=".pdf,.doc,.docx,.md,.markdown,.txt,.csv,.json,.yaml,.yml,.png,.jpg,.jpeg,.webp"
                      />
                    </label>
                    {!isDragging && <span className="pl-1 text-zinc-500">atau drag &amp; drop</span>}
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    Mendukung PDF, Word, CSV / Spreadsheet, Markdown, Text, JSON, YAML, Gambar (Maks. 5MB)
                  </p>
                  {selectedFile && (
                    <div className="mt-2 text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1.5 rounded-lg flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Document Title */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Judul / Keterangan Dokumen
              </label>
              <input
                name="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: PRD Fitur Autentikasi v1.2"
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
                disabled={loading || !selectedFile}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-50 transition shadow-xs flex items-center gap-1.5"
              >
                {loading && (
                  <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                )}
                <span>{loading ? 'Mengupload...' : 'Upload Dokumen'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}
