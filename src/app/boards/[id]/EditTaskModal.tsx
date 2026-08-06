'use client'

import { useState } from 'react'
import { updateTask, deleteTask } from './taskActions'
import { ActivityFeed } from './ActivityFeed'
import { CommentSection } from './CommentSection'

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
  const [activeTab, setActiveTab] = useState<'detail' | 'comments' | 'activity'>('detail')
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg h-[580px] max-h-[90vh] flex flex-col rounded-xl bg-white shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/80">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white truncate max-w-xs sm:max-w-sm">
              {task.title}
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Kelola detail, komentar, dan aktivitas task
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              disabled={loading}
              title="Hapus Task"
              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              <span className="hidden sm:inline">Hapus</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors"
              title="Tutup Modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tab Navigasi Top Bar */}
        <div className="flex items-center gap-2 px-5 pt-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <button
            onClick={() => setActiveTab('detail')}
            className={`flex items-center gap-1.5 pb-2.5 pt-1 px-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'detail'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Detail Task
          </button>

          <button
            onClick={() => setActiveTab('comments')}
            className={`flex items-center gap-1.5 pb-2.5 pt-1 px-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'comments'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            Komentar
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className={`flex items-center gap-1.5 pb-2.5 pt-1 px-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'activity'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Aktivitas
          </button>
        </div>

        {/* Dynamic Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-5">
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-400">
              {error}
            </div>
          )}

          {activeTab === 'detail' && (
            <form onSubmit={handleUpdate} className="space-y-4">
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
                  rows={4}
                  defaultValue={task.description || ''}
                  placeholder="Tambahkan penjelasan detail mengenai task ini..."
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

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md border border-zinc-300 px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-md bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-xs"
                >
                  {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'comments' && (
            <div className="h-full flex flex-col">
              <CommentSection taskId={task.id} boardId={task.board_id} />
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="h-full">
              <ActivityFeed taskId={task.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

