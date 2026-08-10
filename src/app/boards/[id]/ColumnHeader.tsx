'use client'

import { useState } from 'react'
import { updateColumn, deleteColumn } from './columnActions'

type ColumnHeaderProps = {
  column: {
    id: string
    name: string
    board_id: string
  }
}

export function ColumnHeader({ column }: ColumnHeaderProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeletingConfirm, setIsDeletingConfirm] = useState(false)
  const [name, setName] = useState(column.name)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const result = await updateColumn(column.id, column.board_id, formData)

    if (result && result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setIsEditing(false)
      setLoading(false)
      setName((formData.get('name') as string).trim())
    }
  }

  async function handleDeleteConfirm() {
    setLoading(true)
    const result = await deleteColumn(column.id, column.board_id)

    if (result && result.error) {
      setError(result.error)
      setLoading(false)
      setIsDeletingConfirm(false)
    }
  }

  return (
    <div>
      {isEditing ? (
        <form onSubmit={handleUpdate} className="flex items-center gap-1.5">
          <input
            name="name"
            defaultValue={name}
            required
            autoFocus
            className="w-full rounded-xl bg-zinc-900 border border-indigo-500/60 px-3 py-1 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-indigo-600 px-2 py-1 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-50 transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="rounded-lg bg-zinc-800 border border-white/10 px-2 py-1 text-xs font-bold text-zinc-400 hover:bg-zinc-700 hover:text-white transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </form>
      ) : (

        <div className="flex items-center justify-between group py-1">
          <div className="flex items-center gap-2">
            <span
              onClick={() => setIsEditing(true)}
              className="cursor-pointer font-bold text-xs uppercase tracking-wider text-zinc-200 hover:text-indigo-300 transition-colors"
              title="Klik untuk mengubah nama kolom"
            >
              {name}
            </span>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mr-3">

            <button
              onClick={() => setIsEditing(true)}
              className="rounded-md p-1 text-zinc-400 hover:bg-zinc-800 hover:text-indigo-300 transition-colors"
              title="Edit Nama Kolom"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.89 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.89L16.863 4.487zm0 0L19.5 7.125" />
              </svg>
            </button>
            <button
              onClick={() => setIsDeletingConfirm(true)}
              disabled={loading}
              className="rounded-md p-1 text-zinc-400 hover:bg-zinc-800 hover:text-rose-400 transition-colors"
              title="Hapus Kolom"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-1 text-xs text-rose-400 font-medium">{error}</div>
      )}

      {/* Custom Delete Column Confirmation Modal */}
      {isDeletingConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 text-left">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              Konfirmasi Hapus Kolom
            </h3>
            <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Apakah Anda yakin ingin menghapus kolom <strong className="text-zinc-900 dark:text-zinc-200">&quot;{name}&quot;</strong> beserta seluruh task di dalamnya?
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsDeletingConfirm(false)}
                className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-3.5 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={loading}
                className="rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50 transition shadow-xs"
              >
                {loading ? 'Menghapus...' : 'Ya, Hapus Kolom'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

