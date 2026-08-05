'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function BoardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Board Error Boundary caught an error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 text-center">
      <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 shadow-xl dark:border-red-900/50 dark:bg-zinc-900 space-y-4">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 text-xl font-bold">
          🚫
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
          Gagal Memuat Board Kanban
        </h2>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          {error.message || 'Terjadi kesalahan saat memproses data board ini atau Anda tidak memiliki akses.'}
        </p>

        <div className="pt-2 flex justify-center gap-3">
          <Link
            href="/"
            className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition"
          >
            ← Ke Dashboard
          </Link>
          <button
            onClick={() => reset()}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 active:scale-95 transition"
          >
            Coba Lagi 🔄
          </button>
        </div>
      </div>
    </div>
  )
}
