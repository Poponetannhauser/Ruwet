'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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
    <div className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md px-4 sm:px-6 py-3 shadow-xs w-full">
      <div className="flex flex-wrap items-center justify-between gap-4 w-full">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs font-bold text-zinc-300 hover:bg-zinc-800 hover:text-white transition shadow-xs"
            title="Kembali ke Dashboard"
          >
            <Image
              src="/ruwet-logo.png"
              alt="Logo Ruwet"
              width={20}
              height={20}
              className="h-5 w-5 rounded-md object-cover"
            />
            Dashboard
          </Link>



          {isEditing ? (

            <form onSubmit={handleUpdate} className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-0.5">Nama Board</label>
                <input
                  name="name"
                  defaultValue={name}
                  required
                  className="rounded-md bg-zinc-900 border border-white/10 px-3 py-1 text-xs font-bold text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-0.5">Stale Threshold (Jam)</label>
                <input
                  name="stale_threshold_hours"
                  type="number"
                  step="0.01"
                  min="0.01"
                  defaultValue={staleThreshold}
                  placeholder="48"
                  className="w-24 rounded-md bg-zinc-900 border border-white/10 px-3 py-1 text-xs font-bold text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5 self-end pb-0.5">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-md bg-indigo-600 px-3 py-1 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-50 transition"
                >
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-md bg-zinc-800 border border-white/10 px-3 py-1 text-xs font-bold text-zinc-400 hover:bg-zinc-700 hover:text-white transition"
                >
                  Batal
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-extrabold text-white tracking-tight">
                {name}
              </h1>
              <span className="inline-flex items-center gap-1 rounded-md bg-indigo-950/80 border border-indigo-700/50 px-2.5 py-1 text-[10px] font-bold text-indigo-300">
                <svg className="w-3 h-3 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Threshold: {staleThreshold}j
              </span>
              {isOwner && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Setting
                </button>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="text-xs text-rose-400 font-medium">{error}</div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSummaryOpen(true)}
            className="rounded-lg bg-indigo-950/80 border border-indigo-700/50 px-3 py-1.5 text-xs font-bold text-indigo-300 hover:bg-indigo-900/60 transition flex items-center gap-1.5 shadow-sm"
          >
            <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            Ringkasan
          </button>


          <button
            onClick={() => setIsTelegramOpen(true)}
            className="rounded-lg bg-sky-950/80 border border-sky-700/50 px-3 py-1.5 text-xs font-bold text-sky-300 hover:bg-sky-900/60 transition flex items-center gap-1.5 shadow-sm"
            title="Pengaturan Telegram Bot"
          >
            <svg className="w-3.5 h-3.5 text-sky-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
            </svg>
            Telegram Bot
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

              {isDeleting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
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
                </div>
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


