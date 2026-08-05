'use client'

import { useState } from 'react'
import { updateBoard, deleteBoard, leaveBoard } from '../actions'
import { InviteMemberModal } from './InviteMemberModal'
import { MemberList } from './MemberList'
import { NotificationBell } from '@/app/components/NotificationBell'
import { BoardSummaryModal } from './BoardSummaryModal'

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
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e1e2e6] bg-white px-6 lg:px-10 py-5">
      {isEditing ? (
        <form onSubmit={handleUpdate} className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[10px] uppercase font-bold text-[#777587] mb-1">Nama Board</label>
            <input
              name="name"
              defaultValue={name}
              required
              className="rounded-md border border-[#c7c4d8] px-3 py-1.5 text-sm font-bold text-[#191c1f] focus:border-[#5b4df6] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-[#777587] mb-1">Stale Threshold (Jam)</label>
            <input
              name="stale_threshold_hours"
              type="number"
              step="0.01"
              min="0.01"
              defaultValue={staleThreshold}
              placeholder="48"
              className="w-28 rounded-md border border-[#c7c4d8] px-3 py-1.5 text-sm font-bold text-[#191c1f] focus:border-[#5b4df6] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 self-end pb-0.5">
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-[#5b4df6] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#412dde] disabled:opacity-50 transition shadow-xs"
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded-md border border-[#c7c4d8] px-3.5 py-1.5 text-xs font-semibold text-[#191c1f] hover:bg-[#edeef2] transition"
            >
              Batal
            </button>
          </div>
        </form>
      ) : (
        <div className="flex items-center gap-3.5">
          <h1 className="font-heading text-2xl lg:text-3xl font-bold text-[#191c1f]">
            {name}
          </h1>
          <span className="rounded-full bg-[#ebe7ff] px-3 py-1 text-xs font-semibold text-[#5b4df6]">
            ⏳ Stale: {staleThreshold} jam
          </span>
          {isOwner && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs font-semibold text-[#5b4df6] hover:underline"
            >
              Setting Board
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="text-sm font-semibold text-[#ba1a1a]">{error}</div>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsSummaryOpen(true)}
          className="rounded-lg bg-[#ebe7ff] px-3.5 py-2 text-xs font-semibold text-[#5b4df6] hover:bg-[#5b4df6] hover:text-white transition flex items-center gap-1.5 shadow-xs"
        >
          📊 Ringkasan Board
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

        {isOwner ? (
          <div>
            <button
              onClick={() => setIsDeleting(true)}
              className="rounded-lg bg-[#ffdad6] px-3.5 py-2 text-xs font-semibold text-[#ba1a1a] hover:bg-[#ba1a1a] hover:text-white transition shadow-xs"
            >
              Hapus Board
            </button>

            {isDeleting && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-level-2 border border-[#e1e2e6]">
                  <h3 className="font-heading text-lg font-bold text-[#191c1f]">
                    Konfirmasi Hapus
                  </h3>
                  <p className="mt-2 text-xs text-[#464556]">
                    Apakah Anda yakin ingin menghapus board <strong>{name}</strong>? Tindakan ini tidak dapat dibatalkan.
                  </p>
                  <div className="mt-5 flex justify-end gap-2">
                    <button
                      onClick={() => setIsDeleting(false)}
                      className="rounded-md border border-[#c7c4d8] px-4 py-2 text-xs font-semibold text-[#191c1f] hover:bg-[#edeef2]"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={loading}
                      className="rounded-md bg-[#ba1a1a] px-4 py-2 text-xs font-semibold text-white hover:bg-[#93000a] disabled:opacity-50"
                    >
                      {loading ? 'Menghapus...' : 'Hapus'}
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
            className="rounded-lg border border-[#c7c4d8] px-3.5 py-2 text-xs font-semibold text-[#191c1f] hover:bg-[#edeef2] transition"
          >
            {loading ? 'Keluar...' : 'Keluar Board'}
          </button>
        )}
      </div>
    </div>
  )

}
