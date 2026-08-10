'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global Error Boundary caught an error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 text-center">
      <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 shadow-xl dark:border-red-900/50 dark:bg-zinc-900 space-y-4">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400">
          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>

        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
          Terjadi Kesalahan Aplikasi
        </h2>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          {error.message || 'Sistem mengalami kegagalan saat memuat data. Silakan coba muat ulang halaman.'}
        </p>

        <div className="pt-2 flex justify-center gap-3">
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
