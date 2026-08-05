import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { logout } from './(auth)/actions'
import { CreateBoardModal } from './boards/CreateBoardModal'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch boards if user is logged in
  let boards: { id: string; name: string; created_at: string; owner_id: string }[] = []
  if (user) {
    const { data: memberBoards } = await supabase
      .from('board_members')
      .select('board_id')
      .eq('user_id', user.id)

    const boardIds = memberBoards?.map((mb) => mb.board_id) || []

    if (boardIds.length > 0) {
      const { data } = await supabase
        .from('boards')
        .select('*')
        .in('id', boardIds)
        .order('created_at', { ascending: false })
      if (data) {
        boards = data
      }
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      <header className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-8 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <h1 className="text-xl font-bold">Ruwet Kanban</h1>
        {user ? (
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <span className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 truncate max-w-[180px] sm:max-w-none">
              {user.email}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-md bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 text-xs sm:text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
              >
                Keluar
              </button>
            </form>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-md bg-indigo-600 px-4 py-1.5 text-xs sm:text-sm font-medium text-white hover:bg-indigo-700 transition"
            >
              Masuk
            </Link>
          </div>
        )}
      </header>

      <main className="flex flex-1 w-full max-w-6xl flex-col p-4 sm:p-8 mx-auto">
        {user ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Board Saya</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Kelola dan pilih board kanban kerja tim Anda.
                </p>
              </div>
              <CreateBoardModal />
            </div>

            {boards.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {boards.map((b) => (
                  <Link
                    key={b.id}
                    href={`/boards/${b.id}`}
                    className="group rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm hover:border-indigo-500 hover:shadow-md transition"
                  >
                    <h3 className="font-semibold text-lg text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                      {b.name}
                    </h3>
                    <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                      Role: {b.owner_id === user.id ? 'Pemilik (Owner)' : 'Anggota'}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 p-10 sm:p-14 text-center bg-white dark:bg-zinc-900/40 shadow-xs space-y-3">
                <span className="text-4xl">⚡</span>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  Belum Ada Board Kanban
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm">
                  Anda belum terhubung ke board kanban mana pun. Buat board baru untuk mulai mengelola task tim Anda.
                </p>
                <div className="pt-2">
                  <CreateBoardModal />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center my-auto py-16">
            <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              Selamat datang di Ruwet
            </h2>
            <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400 max-w-xl">
              Aplikasi Realtime Kanban Board untuk Manajemen Task Tim Anda. Masuk sekarang untuk mulai membuat board.
            </p>
            <div className="mt-8">
              <Link
                href="/login"
                className="rounded-lg bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow hover:bg-indigo-700 transition"
              >
                Mulai Sekarang
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
