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

  async function handleDelete() {
    if (!confirm(`Yakin ingin menghapus kolom "${name}" beserta seluruh task di dalamnya?`)) {
      return
    }

    setLoading(true)
    const result = await deleteColumn(column.id, column.board_id)

    if (result && result.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="mb-3">
      {isEditing ? (
        <form onSubmit={handleUpdate} className="flex items-center gap-1">
          <input
            name="name"
            defaultValue={name}
            required
            autoFocus
            className="w-full rounded border border-indigo-400 px-2 py-1 text-xs font-semibold text-zinc-900 focus:outline-none dark:border-indigo-600 dark:bg-zinc-800 dark:text-white"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-indigo-600 px-2 py-1 text-xs text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            ✓
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="rounded border border-zinc-300 px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            ✕
          </button>
        </form>
      ) : (
        <div className="flex items-center justify-between font-semibold text-sm text-zinc-700 dark:text-zinc-300 group">
          <span
            onClick={() => setIsEditing(true)}
            className="cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition"
            title="Klik untuk mengubah nama kolom"
          >
            {name}
          </span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400"
              title="Edit Nama Kolom"
            >
              ✏️
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="text-xs text-zinc-400 hover:text-red-600 dark:hover:text-red-400"
              title="Hapus Kolom"
            >
              🗑️
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</div>
      )}
    </div>
  )
}
