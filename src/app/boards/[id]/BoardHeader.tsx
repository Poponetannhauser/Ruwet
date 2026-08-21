'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { updateBoard, deleteBoard, leaveBoard } from '../actions'
import { BatchTaskModal } from './BatchTaskModal'

type Member = {
  id: string
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

type BoardHeaderProps = {
  board: {
    id: string
    name: string
    owner_id: string
    stale_threshold_hours?: number
  }
  isOwner: boolean
  members: Member[]
  columns?: Column[]
}

export function BoardHeader({ board, isOwner, members, columns = [] }: BoardHeaderProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [name, setName] = useState(board.name)
  const [staleThreshold, setStaleThreshold] = useState(board.stale_threshold_hours || 48)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const result = await updateBoard(board.id, formData)

    if (result && result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setIsEditing(false)
      setLoading(false)
      setName((formData.get('name') as string).trim())
      const thresholdRaw = formData.get('stale_threshold_hours') as string
      if (thresholdRaw) {
        setStaleThreshold(parseFloat(thresholdRaw))
      }
    }
  }

  async function handleDelete() {
    setLoading(true)
    const result = await deleteBoard(board.id)
    if (result && result.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  async function handleLeave() {
    setLoading(true)
    const result = await leaveBoard(board.id)
    if (result && result.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="sticky top-0 z-30 border-b border-zinc-800/80 bg-[#2C2C30] px-5 sm:px-8 py-3.5 w-full">
      <div className="flex flex-wrap items-center justify-between gap-3 w-full">
        <div className="flex items-center gap-3">
          {isEditing ? (
            <form onSubmit={handleUpdate} className="flex flex-wrap items-center gap-3">
              <div>
                <input
                  name="name"
                  type="text"
                  defaultValue={name}
                  required
                  className="rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-sm font-bold text-white focus:border-indigo-500 focus:outline-none"
                  placeholder="Nama Board"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs text-zinc-400 font-medium whitespace-nowrap">
                  Stale Threshold (jam):
                </label>
                <input
                  name="stale_threshold_hours"
                  type="number"
                  min={1}
                  max={720}
                  defaultValue={staleThreshold}
                  className="w-20 rounded-lg bg-zinc-900 border border-zinc-800 px-2.5 py-1.5 text-xs font-bold text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-50 transition"
                >
                  {loading ? '...' : 'Simpan'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white transition"
                >
                  Batal
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center gap-2.5">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {name}
              </h1>
              <span className="inline-flex items-center gap-1 rounded-md bg-indigo-950/60 border border-indigo-800/40 px-2 py-0.5 text-[10px] font-bold text-indigo-300">
                <svg className="w-3 h-3 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Threshold: {staleThreshold}j
              </span>
              {isOwner && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800/60 px-2.5 py-1 text-[11px] font-semibold text-zinc-300 hover:text-white transition flex items-center gap-1"
                  title="Edit Pengaturan Board"
                >
                  <svg className="w-3 h-3 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                  <span>Edit</span>
                </button>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="text-xs text-rose-400 font-medium">{error}</div>
        )}

        <div className="flex items-center gap-2.5">
          {/* Import / Bulk Tasks Modal Button */}
          <BatchTaskModal
            boardId={board.id}
            columns={columns}
            members={members}
          />

          {isOwner ? (
            <div>
              <button
                onClick={() => setIsDeleting(true)}
                className="rounded-lg bg-rose-950/50 border border-rose-800/40 px-3 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-900/60 transition flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
                <span>Hapus Board</span>
              </button>

              {isDeleting && mounted && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                  <div className="w-full max-w-sm rounded-xl glass-modal p-6 shadow-2xl border border-white/10 bg-[#2C2C30]">
                    <h3 className="text-lg font-extrabold text-white">
                      Konfirmasi Hapus Board
                    </h3>
                    <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                      Apakah Anda yakin ingin menghapus board <strong>{name}</strong>? Seluruh kolom dan task di dalamnya akan terhapus secara permanen.
                    </p>
                    <div className="mt-6 flex justify-end gap-2.5">
                      <button
                        onClick={() => setIsDeleting(false)}
                        className="rounded-lg bg-zinc-800 border border-white/10 px-4 py-2 text-xs font-bold text-zinc-300 hover:bg-zinc-700 hover:text-white transition"
                      >
                        Batal
                      </button>
                      <button
                        onClick={handleDelete}
                        disabled={loading}
                        className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-500 disabled:opacity-50 shadow-md shadow-rose-600/30 transition"
                      >
                        {loading ? 'Menghapus...' : 'Hapus Board'}
                      </button>
                    </div>
                  </div>
                </div>,
                document.body
              )}
            </div>
          ) : (
            <button
              onClick={handleLeave}
              disabled={loading}
              className="rounded-lg bg-zinc-800/80 border border-zinc-700/60 px-3.5 py-1.5 text-xs font-bold text-zinc-300 hover:bg-zinc-700 transition flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              <span>{loading ? 'Keluar...' : 'Keluar Board'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}



