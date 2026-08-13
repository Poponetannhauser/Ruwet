'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { createTask } from './taskActions'

type Member = {
  id: string
  user_id?: string
  role: string
  profiles: {
    full_name: string
    avatar_url: string | null
  } | null
}

type CreateTaskModalProps = {
  boardId: string
  columnId: string
  columnName: string
  members: Member[]
}

export function CreateTaskModal({
  boardId,
  columnId,
  columnName,
  members,
}: CreateTaskModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const result = await createTask(boardId, columnId, formData)

    if (result && result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setIsOpen(false)
      setLoading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null)
          setIsOpen(true)
        }}
        className="w-full flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold text-zinc-400 hover:text-white hover:bg-[#34343a] transition-all cursor-pointer pointer-events-auto relative z-10"
      >
        <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Tambah Task
      </button>

      {mounted && createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="create-task-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs"
            >
              <motion.div
                key="create-task-content"
                initial={{ opacity: 0, scale: 0.95, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 8 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl bg-[#2C2C30] p-4 sm:p-6 shadow-2xl border border-zinc-800/80"
              >
                <h3 className="text-lg font-bold text-white">
                  Tambah Task Baru ({columnName})
                </h3>

                {error && (
                  <div className="mt-3 rounded-md bg-red-50 p-3 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-400">
                    {error}
                  </div>
                )}

                <form noValidate onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Judul Task <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="title"
                      type="text"
                      required
                      maxLength={50}
                      placeholder="Contoh: Buat halaman login"
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
                      placeholder="Detail tentang task..."
                      className="w-full rounded-md border border-zinc-300 px-3 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        Assignee
                      </label>
                      <select
                        name="assignee_id"
                        defaultValue=""
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

                    <div>
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        Tenggat Waktu (Due Date)
                      </label>
                      <input
                        name="due_date"
                        type="date"
                        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Prioritas Task
                    </label>
                    <select
                      name="priority"
                      defaultValue="medium"
                      className="w-full rounded-md border border-zinc-300 px-3 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white font-medium"
                    >
                      <option value="low">Low (Rendah)</option>
                      <option value="medium">Medium (Sedang)</option>
                      <option value="high">High (Tinggi)</option>
                      <option value="urgent">Urgent (Mendesak)</option>
                    </select>
                  </div>


                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="rounded-md border border-zinc-300 px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="rounded-md bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {loading ? 'Menyimpan...' : 'Tambah Task'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}