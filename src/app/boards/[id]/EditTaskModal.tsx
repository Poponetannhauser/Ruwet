'use client'

import { useState } from 'react'
import { updateTask, deleteTask } from './taskActions'

type Member = {
  id: string
  user_id?: string
  role: string
  profiles: {
    full_name: string
    avatar_url: string | null
  } | null
}

type Column = {
  id: string
  name: string
}

type Task = {
  id: string
  board_id: string
  column_id: string
  title: string
  description: string | null
  assignee_id: string | null
  due_date: string | null
}

type EditTaskModalProps = {
  task: Task
  columns: Column[]
  members: Member[]
  isOpen: boolean
  onClose: () => void
}

export function EditTaskModal({
  task,
  columns,
  members,
  isOpen,
  onClose,
}: EditTaskModalProps) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const result = await updateTask(task.id, task.board_id, formData)

    if (result && result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setLoading(false)
      onClose()
    }
  }

  async function handleDelete() {
    if (!confirm(`Yakin ingin menghapus task "${task.title}"?`)) {
      return
    }

    setLoading(true)
    const result = await deleteTask(task.id, task.board_id)

    if (result && result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setLoading(false)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
            Edit Task
          </h3>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="text-xs text-red-600 hover:underline dark:text-red-400"
          >
            Hapus Task
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-md bg-red-50 p-3 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleUpdate} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Judul Task <span className="text-red-500">*</span>
            </label>
            <input
              name="title"
              type="text"
              defaultValue={task.title}
              required
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Deskripsi
            </label>
            <textarea
              name="description"
              rows={3}
              defaultValue={task.description || ''}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Pindah Kolom
              </label>
              <select
                name="column_id"
                defaultValue={task.column_id}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              >
                {columns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Assignee
              </label>
              <select
                name="assignee_id"
                defaultValue={task.assignee_id || ''}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              >
                <option value="">Belum di-assign</option>
                {members.map((m) => (
                  <option key={m.id} value={m.user_id || ''}>
                    {m.profiles?.full_name || 'User'} ({m.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Tenggat Waktu (Due Date)
            </label>
            <input
              name="due_date"
              type="date"
              defaultValue={task.due_date ? task.due_date.split('T')[0] : ''}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-zinc-300 px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
