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
        <div className="rounded-xl bg-zinc-900 p-4 shadow-sm border border-zinc-800">
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
                placeholder="Contoh: In Progress..."
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            {error && (
              <p className="text-[10px] font-bold text-rose-400">{error}</p>
            )}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg border border-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Menambah...' : 'Simpan Kolom'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/50 p-4 text-xs font-bold text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 hover:bg-zinc-900 transition-all duration-200"
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

