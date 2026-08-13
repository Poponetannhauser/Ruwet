'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
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
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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

    const form = event.currentTarget
    const formData = new FormData(form)
    const email = formData.get('email') as string

    const result = await addBoardMemberByEmail(boardId, email)

    if (result && result.error) {
      setError(result.error)
    } else {
      setSuccessMessage('Anggota berhasil ditambahkan ke board!')
      form.reset()
    }

    setLoading(false)
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800/60 px-3 py-1.5 text-xs font-bold text-zinc-300 hover:text-white transition flex items-center gap-1.5"
      >
        <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
        </svg>
        Undang Member
      </button>

      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl bg-[#22222a] p-4 sm:p-6 shadow-2xl border border-zinc-800/80">
            <h3 className="text-lg font-bold text-white">
              Undang Anggota ke Board
            </h3>
            <p className="mt-1 text-xs text-zinc-400">
              Bagikan link di bawah ini kepada rekan tim Anda untuk bergabung ke board ini.
            </p>

            <div className="mt-4 space-y-4">
              {error && (
                <div className="rounded-md bg-rose-950/60 border border-rose-800/40 p-3 text-xs text-rose-300">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="rounded-md bg-emerald-950/60 border border-emerald-800/40 p-3 text-xs text-emerald-300">
                  {successMessage}
                </div>
              )}

              <form onSubmit={handleEmailInvite} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300">
                    Undang lewat Email
                  </label>
                  <div className="mt-1 flex gap-2">
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="nama@email.com"
                      className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-medium text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-50 transition shrink-0"
                    >
                      {loading ? '...' : 'Undang'}
                    </button>
                  </div>
                </div>
              </form>

              <div className="relative flex items-center py-1">
                <div className="flex-grow border-t border-zinc-800" />
                <span className="mx-2 shrink-0 text-[10px] uppercase font-mono text-zinc-500">atau salin link</span>
                <div className="flex-grow border-t border-zinc-800" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300">
                  Link Undangan
                </label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={inviteUrl}
                    className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-mono text-zinc-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="rounded-lg bg-zinc-800 px-3 py-2 text-xs font-bold text-zinc-200 hover:bg-zinc-700 transition shrink-0"
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
                className="rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
