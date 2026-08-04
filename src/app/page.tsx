import { createClient } from '@/lib/supabase/server'
import { logout } from './(auth)/actions'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      <header className="flex items-center justify-between px-8 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <h1 className="text-xl font-bold">Ruwet Kanban</h1>
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {user.email}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-md bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
              >
                Keluar
              </button>
            </form>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <a
              href="/login"
              className="rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 transition"
            >
              Masuk
            </a>
          </div>
        )}
      </header>
      <main className="flex flex-1 w-full max-w-4xl flex-col items-center justify-center p-8 mx-auto text-center">
        <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Selamat datang di Ruwet
        </h2>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
          Aplikasi Realtime Kanban Board untuk Manajemen Task Tim Anda.
        </p>
      </main>
    </div>
  )
}
