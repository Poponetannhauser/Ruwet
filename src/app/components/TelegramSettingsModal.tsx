'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface TelegramSettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function TelegramSettingsModal({ isOpen, onClose }: TelegramSettingsModalProps) {
  const [loading, setLoading] = useState(false)
  const [chatId, setChatId] = useState<string | null>(null)
  const [deepLink, setDeepLink] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchStatus()
      setShowUnlinkConfirm(false)
    }
  }, [isOpen])

  async function fetchStatus() {
    try {
      setLoading(true)
      setError(null)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('telegram_chat_id')
        .eq('id', user.id)
        .single()

      setChatId(profile?.telegram_chat_id || null)
    } catch (err: unknown) {
      console.error('Error fetching Telegram status:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleGenerateLink() {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/telegram/generate-link', { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Gagal membuat tautan Telegram')
      }

      setDeepLink(data.deep_link)
      setExpiresAt(data.expires_at)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  async function executeUnlink() {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/telegram/unlink', { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Gagal memutuskan koneksi')
      }

      setChatId(null)
      setDeepLink(null)
      setExpiresAt(null)
      setShowUnlinkConfirm(false)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  function handleCopy() {
    if (deepLink) {
      navigator.clipboard.writeText(deepLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="w-full max-w-md rounded-2xl glass-modal p-6 shadow-2xl border border-white/10 text-white relative">
        <button
          onClick={() => {
            setShowUnlinkConfirm(false)
            onClose()
          }}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-extrabold tracking-tight">Pengaturan Telegram</h2>
            <p className="text-xs text-zinc-400">Terima notifikasi tugas langsung di Telegram</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-rose-950/60 border border-rose-800/50 p-3 text-xs text-rose-300">
            {error}
          </div>
        )}

        {/* Status section */}
        <div className="rounded-xl bg-zinc-900/80 border border-white/5 p-4 mb-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Status Koneksi:</span>
            {chatId ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950/80 border border-emerald-700/50 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Terhubung
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-zinc-800 border border-zinc-700 text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-zinc-500" />
                Belum Terhubung
              </span>
            )}
          </div>

          {chatId && (
            <p className="mt-2 text-[11px] text-zinc-500">
              ID Telegram Chat: <code className="text-zinc-300 bg-zinc-800 px-1.5 py-0.5 rounded font-mono">{chatId}</code>
            </p>
          )}
        </div>

        {/* Actions section */}
        {chatId ? (
          <div className="flex flex-col gap-3">
            {!showUnlinkConfirm ? (
              <>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Akun Anda sudah terhubung. Jika ingin mengganti akun Telegram atau memutuskan notifikasi, silakan klik tombol di bawah.
                </p>
                <button
                  onClick={() => setShowUnlinkConfirm(true)}
                  disabled={loading}
                  className="w-full rounded-xl bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800/50 py-2.5 text-xs font-bold text-rose-300 transition"
                >
                  Putuskan Koneksi Telegram
                </button>
              </>
            ) : (
              <div className="rounded-xl bg-rose-950/40 border border-rose-800/40 p-4 space-y-3">
                <div>
                  <h3 className="text-xs font-bold text-rose-300">Yakin ingin memutuskan koneksi?</h3>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                    Anda tidak akan lagi menerima notifikasi tugas & tidak dapat menggunakan bot Telegram.
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setShowUnlinkConfirm(false)}
                    disabled={loading}
                    className="flex-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 py-2 text-xs font-bold text-zinc-300 transition"
                  >
                    Batal
                  </button>
                  <button
                    onClick={executeUnlink}
                    disabled={loading}
                    className="flex-1 rounded-lg bg-rose-600 hover:bg-rose-500 py-2 text-xs font-bold text-white transition disabled:opacity-50"
                  >
                    {loading ? 'Memproses...' : 'Ya, Putuskan'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {!deepLink ? (
              <div>
                <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                  Klik tombol di bawah untuk membuat tautan sekali pakai (berlaku 10 menit). Anda akan diarahkan ke bot Telegram Ruwet untuk menyelesaikan verifikasi.
                </p>
                <button
                  onClick={handleGenerateLink}
                  disabled={loading}
                  className="w-full rounded-xl bg-sky-600 hover:bg-sky-500 py-2.5 text-xs font-bold text-white shadow-lg shadow-sky-600/30 transition disabled:opacity-50"
                >
                  {loading ? 'Membuat Tautan...' : 'Hubungkan Telegram'}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-xl bg-sky-950/40 border border-sky-800/40 p-4">
                  <p className="text-xs font-bold text-sky-300 mb-2">
                    1. Klik tombol &quot;Buka Telegram&quot; atau salin tautan di bawah:
                  </p>
                  <div className="flex items-center gap-2 bg-zinc-950 p-2 rounded-lg border border-white/10">
                    <input
                      readOnly
                      value={deepLink}
                      className="bg-transparent text-xs text-zinc-300 flex-1 outline-none font-mono select-all"
                    />
                    <button
                      onClick={handleCopy}
                      className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[11px] font-bold text-zinc-300 transition"
                    >
                      {copied ? 'Tersalin!' : 'Salin'}
                    </button>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-2">
                    2. Tekan tombol <b>START</b> di aplikasi Telegram.
                  </p>
                  {expiresAt && (
                    <p className="text-[10px] text-amber-400 mt-2 flex items-center gap-1">
                      <svg className="w-3 h-3 text-amber-400 inline shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                      </svg>
                      <span>Tautan ini kadaluarsa pada {new Date(expiresAt).toLocaleTimeString()}.</span>
                    </p>
                  )}

                </div>

                <a
                  href={deepLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 py-2.5 text-xs font-bold text-white shadow-lg shadow-sky-600/30 transition text-center"
                >
                  Buka Aplikasi Telegram ↗
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
