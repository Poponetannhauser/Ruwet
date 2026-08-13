'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  priority?: string
}


type EditTaskModalProps = {
  task: Task
  columns: Column[]
  members: Member[]
  isOpen: boolean
  onClose: () => void
  onOpenComments?: () => void
}

export function EditTaskModal({
  task,
  columns,
  members,
  isOpen,
  onClose,
  onOpenComments,
}: EditTaskModalProps) {
  const [activeTab, setActiveTab] = useState<'detail' | 'comments' | 'activity'>('detail')
  const [isDeletingConfirm, setIsDeletingConfirm] = useState(false)
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

  async function handleDeleteConfirm() {
    setLoading(true)
    const result = await deleteTask(task.id, task.board_id)

    if (result && result.error) {
      setError(result.error)
      setLoading(false)
      setIsDeletingConfirm(false)
    } else {
      setLoading(false)
      setIsDeletingConfirm(false)
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4 backdrop-blur-xs"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-xl dark:bg-zinc-900 flex flex-col"
          >
            {/* Header Title & Close Button */}
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                Edit Task
              </h3>
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

            {/* Navigation Bar & Right Comment Drawer Trigger */}
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 dark:border-zinc-800">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('detail')}
                  className={`flex items-center gap-1.5 py-3 px-3 text-xs font-bold transition-all border-b-2 ${
                    activeTab === 'detail'
                      ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                      : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Detail Task
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('activity')}
                  className={`flex items-center gap-1.5 py-3 px-3 text-xs font-bold transition-all border-b-2 ${
                    activeTab === 'activity'
                      ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                      : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Aktivitas
                </button>
              </div>

              {onOpenComments && (
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    onOpenComments()
                  }}
                  className="flex items-center gap-1 text-[11px] font-bold text-sky-400 hover:text-sky-300 transition"
                  title="Buka Komentar di Drawer Kanan"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>Komentar →</span>
                </button>
              )}
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

              <div className="grid grid-cols-2 gap-3">
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

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Prioritas Task
                  </label>
                  <select
                    name="priority"
                    defaultValue={task.priority || 'medium'}
                    className="w-full rounded-md border border-zinc-300 px-3 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white font-medium"
                  >
                    <option value="low">Low (Rendah)</option>
                    <option value="medium">Medium (Sedang)</option>
                    <option value="high">High (Tinggi)</option>
                    <option value="urgent">Urgent (Mendesak)</option>
                  </select>
                </div>
              </div>


              <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsDeletingConfirm(true)}
                  disabled={loading}
                  className="rounded-md bg-red-500/10 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-500/20 dark:text-red-400 transition-colors"
                >
                  Hapus Task
                </button>
                <div className="flex gap-2">
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
      </motion.div>

      {/* Custom Confirmation Modal Overlay */}
      {isDeletingConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              Konfirmasi Hapus Task
            </h3>
            <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Apakah Anda yakin ingin menghapus task <strong className="text-zinc-900 dark:text-zinc-200">&quot;{task.title}&quot;</strong>? Tindakan ini tidak dapat dibatalkan.
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
                {loading ? 'Menghapus...' : 'Ya, Hapus Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )}
</AnimatePresence>
)
}

