'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { updateBoard, deleteBoard, leaveBoard } from '../actions'
import { InviteMemberModal } from './InviteMemberModal'
import { MemberList } from './MemberList'
import { NotificationBell } from '@/app/components/NotificationBell'
import { BoardSummaryModal } from './BoardSummaryModal'
import { TelegramSettingsModal } from '@/app/components/TelegramSettingsModal'

type Member = {
  id: string
  role: string
  profiles: {
    full_name: string
    avatar_url: string | null
  } | null
}

type Task = {
  id: string
  board_id: string
  column_id: string
  title: string
  assignee_id: string | null
  due_date: string | null
  status_updated_at?: string | null
  profiles?: {
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
  tasks?: Task[]
}

export function BoardHeader({ board, isOwner, members, columns = [], tasks = [] }: BoardHeaderProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSummaryOpen, setIsSummaryOpen] = useState(false)
  const [isTelegramOpen, setIsTelegramOpen] = useState(false)
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
                  className="rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800/60 px-2.5 py-1 text-[11px] font-semibold text-zinc-300 hover:text-white transition"
                  title="Edit Pengaturan Board"
                >
                  Edit Board
                </button>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="text-xs text-rose-400 font-medium">{error}</div>
        )}

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsSummaryOpen(true)}
            className="rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800/60 px-3 py-1.5 text-xs font-bold text-zinc-300 hover:text-white transition flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            Ringkasan
          </button>

          <NotificationBell />
          <MemberList members={members} />
          {isOwner && <InviteMemberModal boardId={board.id} />}

          <BoardSummaryModal
            boardName={name}
            staleThresholdHours={staleThreshold}
            columns={columns}
            tasks={tasks}
            members={members}
            isOpen={isSummaryOpen}
            onClose={() => setIsSummaryOpen(false)}
          />

          <TelegramSettingsModal
            isOpen={isTelegramOpen}
            onClose={() => setIsTelegramOpen(false)}
          />

          {isOwner ? (
            <div>
              <button
                onClick={() => setIsDeleting(true)}
                className="rounded-lg bg-rose-950/50 border border-rose-800/40 px-3 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-900/60 transition"
              >
                Hapus Board
              </button>

              {isDeleting && mounted && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                  <div className="w-full max-w-sm rounded-xl glass-modal p-6 shadow-2xl border border-white/10">
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
              className="rounded-lg bg-zinc-800/80 border border-white/10 px-3.5 py-1.5 text-xs font-bold text-zinc-300 hover:bg-zinc-700 transition"
            >
              {loading ? 'Keluar...' : 'Keluar Board'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}


