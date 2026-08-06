import Link from 'next/link'
import Image from 'next/image'
import { signup } from '../actions'

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-100 bg-mesh px-4 py-12 sm:px-6 lg:px-8 selection:bg-indigo-500/30 selection:text-indigo-200">
      <div className="w-full max-w-md space-y-8 glass-panel p-8 sm:p-10 rounded-2xl shadow-2xl glow-indigo border border-white/10 relative overflow-hidden">
        {/* Glow ambient circle */}
        <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-violet-500/20 blur-3xl pointer-events-none" />

        <div className="text-center relative">
          <Image
            src="/ruwet-logo.png"
            alt="Logo Ruwet"
            width={56}
            height={56}
            className="mx-auto h-14 w-14 rounded-2xl object-cover border border-white/10 shadow-lg mb-4"
          />
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">


            Daftar Akun Ruwet
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-zinc-400">
            Sudah punya akun?{' '}
            <Link
              href="/login"
              className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors underline underline-offset-4"
            >
              Masuk di sini
            </Link>
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-950/80 border border-rose-800/60 p-4 text-xs font-semibold text-rose-300 shadow-sm">
            ⚠️ {error}
          </div>
        )}

        <form className="mt-8 space-y-5" action={signup}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="fullName"
                className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5"
              >
                Nama Lengkap
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                className="block w-full rounded-xl bg-zinc-900/80 border border-white/10 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none transition"
                placeholder="Nama Anda"
              />
            </div>
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
                className="block w-full rounded-xl bg-zinc-900/80 border border-white/10 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none transition"
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
                autoComplete="new-password"
                required
                minLength={6}
                className="block w-full rounded-xl bg-zinc-900/80 border border-white/10 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none transition"
                placeholder="Minimal 6 karakter"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500 px-4 py-3.5 text-sm font-extrabold text-white shadow-xl shadow-indigo-500/25 hover:opacity-95 active:scale-[0.99] transition-all"
            >
              Buat Akun Baru →
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

