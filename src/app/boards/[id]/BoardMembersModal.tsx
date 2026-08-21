'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { addBoardMemberByEmail } from '../actions'

type Member = {
  id: string
  user_id?: string
  role: string
  profiles: {
    full_name: string
    avatar_url: string | null
  } | null
}

type BoardMembersModalProps = {
  boardId: string
  members: Member[]
  isOwner?: boolean
  isOpen: boolean
  onClose: () => void
}

export function BoardMembersModal({
  boardId,
  members,
  isOwner = false,
  isOpen,
  onClose,
}: BoardMembersModalProps) {
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  const inviteUrl =
    typeof window !== 'undefined'
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

  if (!mounted || typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-xl bg-[#2C2C30] shadow-2xl border border-zinc-800/80 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 px-5 py-4 bg-[#25252a]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-950/70 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Anggota Tim ({members.length})
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Daftar anggota yang memiliki akses ke board ini
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              {/* Member List */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-zinc-300">
                  Daftar Anggota Aktif
                </div>
                <div className="divide-y divide-zinc-800/80 rounded-xl bg-[#222228] border border-zinc-800/80 max-h-56 overflow-y-auto">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 border border-zinc-700 flex items-center justify-center text-xs font-bold text-white uppercase">
                          {member.profiles?.full_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-zinc-100">
                            {member.profiles?.full_name || 'User'}
                          </div>
                          <div className="text-[10px] text-zinc-500 font-mono">
                            {member.role === 'owner' ? 'Project Lead / Owner' : 'Team Member'}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          member.role === 'owner'
                            ? 'bg-amber-950/40 text-amber-300 border-amber-800/40'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700/60'
                        }`}
                      >
                        {member.role.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Invite Section (Owner only) */}
              {isOwner && (
                <div className="pt-2 border-t border-zinc-800 space-y-4">
                  <div className="text-xs font-bold text-zinc-300">
                    Undang Rekan Baru
                  </div>

                  {error && (
                    <div className="rounded-lg bg-rose-950/40 border border-rose-800/40 p-3 text-xs text-rose-300 flex items-center gap-2">
                      <svg className="w-4 h-4 shrink-0 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span>{error}</span>
                    </div>
                  )}

                  {successMessage && (
                    <div className="rounded-lg bg-emerald-950/40 border border-emerald-800/40 p-3 text-xs text-emerald-300 flex items-center gap-2">
                      <svg className="w-4 h-4 shrink-0 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{successMessage}</span>
                    </div>
                  )}

                  <form onSubmit={handleEmailInvite} className="space-y-2">
                    <label className="block text-[11px] font-semibold text-zinc-400">
                      Undang via Email
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        name="email"
                        required
                        placeholder="nama@perusahaan.com"
                        className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={loading}
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-50 transition shadow-xs flex items-center gap-1.5 shrink-0"
                      >
                        {loading ? (
                          <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
                          </svg>
                        )}
                        <span>Undang</span>
                      </button>
                    </div>
                  </form>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold text-zinc-400">
                      Atau Bagikan Link Undangan
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={inviteUrl}
                        className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900/80 px-3 py-2 text-xs text-zinc-300 font-mono truncate select-all"
                      />
                      <button
                        type="button"
                        onClick={handleCopy}
                        className={`rounded-lg px-3.5 py-2 text-xs font-bold transition flex items-center gap-1.5 shrink-0 border ${
                          copied
                            ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-300'
                            : 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700 hover:text-white'
                        }`}
                      >
                        {copied ? (
                          <>
                            <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                            </svg>
                            <span>Salin Link</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end border-t border-zinc-800/80 px-5 py-3 bg-[#25252a]">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 transition"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
