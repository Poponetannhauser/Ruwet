'use client'

import { useState } from 'react'
import { createColumn } from './columnActions'

type AddColumnButtonProps = {
  boardId: string
}

export function AddColumnButton({ boardId }: AddColumnButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const result = await createColumn(boardId, formData)

    if (result && result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setIsOpen(false)
      setLoading(false)
    }
  }

  return (
    <div className="w-80 flex-shrink-0">
      {isOpen ? (
        <div className="rounded-xl glass-panel p-4 shadow-xl border border-indigo-500/30">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">
                Nama Kolom Baru
              </label>
              <input
                name="name"
                type="text"
                required
                autoFocus
                placeholder="Contoh: QA Testing..."
                className="w-full rounded-lg bg-zinc-900 border border-white/10 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none transition"
              />
            </div>
            {error && (
              <div className="text-xs text-rose-400 font-medium">{error}</div>
            )}
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg bg-zinc-800 border border-white/10 px-3 py-1.5 text-xs font-bold text-zinc-400 hover:bg-zinc-700 hover:text-white transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:opacity-95 disabled:opacity-50 transition"
              >
                {loading ? 'Menambah...' : 'Tambah Kolom'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 glass-card p-4 text-xs font-bold text-zinc-400 hover:border-indigo-500/60 hover:text-indigo-300 hover:bg-indigo-950/20 transition-all duration-200"
        >
          <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Tambah Kolom Baru
        </button>

      )}
    </div>
  )
}

