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
    <div className="w-72 flex-shrink-0">
      {isOpen ? (
        <div className="rounded-xl bg-zinc-200/80 p-3 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-2">
            <input
              name="name"
              type="text"
              required
              autoFocus
              placeholder="Nama kolom baru..."
              className="w-full rounded-md border border-zinc-300 px-3 py-1.5 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
            {error && (
              <div className="text-xs text-red-600 dark:text-red-400">{error}</div>
            )}
            <div className="flex justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded px-3 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-300 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Menambah...' : 'Tambah Kolom'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/40 p-4 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:border-indigo-500 hover:bg-white hover:text-indigo-600 dark:hover:bg-zinc-900 transition"
        >
          + Tambah Kolom Baru
        </button>
      )}
    </div>
  )
}
