'use client'

import { useState } from 'react'
import { addBoardMemberByEmail } from '../actions'

type InviteMemberModalProps = {
  boardId: string
}

export function InviteMemberModal({ boardId }: InviteMemberModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const inviteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/boards/join/${boardId}`
    : `/boards/join/${boardId}`

  function handleCopy() {
    navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleEmailInvite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const email = formData.get('email') as string

    const result = await addBoardMemberByEmail(boardId, email)

    if (result && result.error) {
      setError(result.error)
    } else {
      setSuccessMessage('Anggota berhasil ditambahkan ke board!')
      event.currentTarget.reset()
    }
    setLoading(false)
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-lg bg-indigo-950/80 border border-indigo-700/50 px-3 py-1.5 text-xs font-bold text-indigo-300 hover:bg-indigo-900/60 transition flex items-center gap-1.5 shadow-sm"
      >
        <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
        </svg>
        Undang Member
      </button>


      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl bg-white p-4 sm:p-6 shadow-xl dark:bg-zinc-900">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              Undang Anggota ke Board
            </h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Bagikan link di bawah ini kepada rekan tim Anda untuk bergabung ke board ini.
            </p>

            <div className="mt-4 space-y-4">
              {error && (
                <div className="rounded-md bg-red-50 p-3 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-400">
                  {error}
                </div>
              )}
              {successMessage && (
                <div className="rounded-md bg-green-50 p-3 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  {successMessage}
                </div>
              )}

              <form onSubmit={handleEmailInvite} className="space-y-2">
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Undang via Nama / Email User
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="email"
                    required
                    placeholder="Nama lengkap atau User ID"
                    className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-md bg-indigo-600 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition"
                  >
                    {loading ? 'Mengirim...' : 'Undang'}
                  </button>
                </div>
              </form>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-zinc-400 dark:bg-zinc-900">
                    atau
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Link Undang (Invite Link)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={inviteUrl}
                    className="flex-1 rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-xs text-zinc-800 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  />
                  <button
                    onClick={handleCopy}
                    type="button"
                    className="rounded-md bg-zinc-100 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 transition"
                  >
                    {copied ? 'Tersalin!' : 'Salin Link'}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
