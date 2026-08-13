import Link from 'next/link'
import Image from 'next/image'
import { login } from '../actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const { error, message } = await searchParams

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1A1A1E] text-zinc-100 px-4 py-12 sm:px-6 lg:px-8 selection:bg-indigo-500/30 selection:text-indigo-200">
      <div className="w-full max-w-md space-y-8 bg-[#2C2C30] p-8 sm:p-10 rounded-xl border border-zinc-800/80 shadow-2xl relative overflow-hidden">
        <div className="text-center relative">
          <Image
            src="/ruwet-logo.png"
            alt="Logo Ruwet"
            width={56}
            height={56}
            className="mx-auto h-14 w-14 rounded-2xl object-cover border border-zinc-800 shadow-sm mb-4"
          />
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Masuk ke Ruwet
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-zinc-400">
            Belum punya akun?{' '}
            <Link
              href="/signup"
              className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors underline underline-offset-4"
            >
              Daftar sekarang
            </Link>
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-950/40 border border-rose-900/60 p-4 text-xs font-semibold text-rose-300 shadow-xs">
            <svg className="w-4 h-4 text-rose-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-950/40 border border-emerald-900/60 p-4 text-xs font-semibold text-emerald-300 shadow-xs">
            <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{message}</span>
          </div>
        )}

        <form className="mt-8 space-y-5" action={login}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5"
              >
                Alamat Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition"
                placeholder="nama@email.com"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5"
              >
                Kata Sandi
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-500 active:scale-[0.99] transition-all"
            >
              Masuk ke Workspace →
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

