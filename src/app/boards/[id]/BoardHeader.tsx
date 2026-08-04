'use client'

import { useState } from 'react'
import { updateBoard, deleteBoard, leaveBoard } from '../actions'
import { InviteMemberModal } from './InviteMemberModal'
import { MemberList } from './MemberList'

type Member = {
  id: string
  role: string
  profiles: {
    full_name: string
    avatar_url: string | null
  } | null
}

type BoardHeaderProps = {
  board: {
    id: string
    name: string
    owner_id: string
  }
  isOwner: boolean
  members: Member[]
}

export function BoardHeader({ board, isOwner, members }: BoardHeaderProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [name, setName] = useState(board.name)
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
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 bg-white px-8 py-4 dark:border-zinc-800 dark:bg-zinc-900">
      {isEditing ? (
        <form onSubmit={handleUpdate} className="flex items-center gap-2">
          <input
            name="name"
            defaultValue={name}
            required
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-lg font-bold text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Batal
          </button>
        </form>
      ) : (
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            {name}
          </h1>
          {isOwner && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Edit Nama
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
      )}

      <div className="flex items-center gap-4">
        <MemberList members={members} />
        {isOwner && <InviteMemberModal boardId={board.id} />}

        {isOwner ? (
          <div>
            <button
              onClick={() => setIsDeleting(true)}
              className="rounded-md bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition"
            >
              Hapus Board
            </button>

            {isDeleting && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-900">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                    Konfirmasi Hapus
                  </h3>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    Apakah Anda yakin ingin menghapus board <strong>{name}</strong>? Tindakan ini tidak dapat dibatalkan.
                  </p>
                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      onClick={() => setIsDeleting(false)}
                      className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={loading}
                      className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
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
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 transition"
          >
            {loading ? 'Keluar...' : 'Keluar Board'}
          </button>
        )}
      </div>
    </div>
  )
}
