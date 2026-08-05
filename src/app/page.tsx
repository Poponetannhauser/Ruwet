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
    <div className="flex flex-col flex-1 min-h-screen bg-zinc-950 text-zinc-100 bg-mesh selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Header Bar */}
      <header className="sticky top-0 z-40 border-b border-white/10 glass-panel px-6 sm:px-10 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-indigo-400 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-indigo-500/25">
              R
            </div>
            <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
              Ruwet
            </span>
            <span className="hidden sm:inline-block rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-400">
              v1.0 Realtime
            </span>
          </div>

          {user ? (
            <div className="flex items-center gap-3 sm:gap-5">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-xs font-bold text-white ring-2 ring-white/10">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:inline-block text-xs font-medium text-zinc-300">
                  {user.email}
                </span>
              </div>
              <form action={logout}>
                <button
                  type="submit"
                  className="rounded-lg bg-zinc-800/80 border border-white/10 px-3.5 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white transition"
                >
                  Keluar
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:opacity-95 transition"
              >
                Masuk
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-1 w-full max-w-7xl flex-col p-6 sm:p-10 mx-auto space-y-8">
        {user ? (
          <div className="space-y-8">
            {/* Hero / Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 sm:p-8 rounded-2xl">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Dashboard Board Kanban
                </h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Kelola tugas, pantau stale tasks, dan kolaborasi tim secara real-time.
                </p>
              </div>
              <CreateBoardModal />
            </div>

            {/* Board Cards Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
                  Board Milik Anda ({boards.length})
                </h3>
              </div>

              {boards.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {boards.map((b) => {
                    const isOwner = b.owner_id === user.id
                    return (
                      <Link
                        key={b.id}
                        href={`/boards/${b.id}`}
                        className="group relative flex flex-col justify-between rounded-2xl glass-card p-6 transition-all duration-200 hover:-translate-y-1 hover:border-indigo-500/40 glow-indigo"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-zinc-400">
                              Kanban Workspace
                            </span>
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                isOwner
                                  ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-700/50'
                                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700/50'
                              }`}
                            >
                              {isOwner ? 'Owner' : 'Member'}
                            </span>
                          </div>
                          <h3 className="mt-3 font-bold text-xl text-white group-hover:text-indigo-300 transition-colors">
                            {b.name}
                          </h3>
                        </div>

                        <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4 text-xs font-medium text-indigo-400 group-hover:text-indigo-300">
                          <span>Buka Board →</span>
                          <span className="text-[10px] text-zinc-400">
                            {new Date(b.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl glass-panel p-12 text-center space-y-4">
                  <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-3xl">
                    ⚡
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    Belum Ada Board Kanban
                  </h3>
                  <p className="text-xs text-zinc-400 max-w-sm">
                    Anda belum terhubung ke board kanban mana pun. Buat board baru untuk mulai mengelola task tim Anda.
                  </p>
                  <div className="pt-2">
                    <CreateBoardModal />
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center my-auto py-20 px-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 text-xs font-semibold text-indigo-300 mb-6">
              ✨ Modern Task Accountability Platform
            </div>
            <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-3xl leading-tight">
              Kelola Tugas Tim dengan <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400">Akuntabilitas Realtime</span>
            </h2>
            <p className="mt-6 text-base sm:text-lg text-zinc-400 max-w-xl">
              Deteksi tugas macet (stale tasks) secara otomatis, berkolaborasi tanpa delay, dan tingkatkan produktivitas tim Anda.
            </p>
            <div className="mt-10 flex items-center gap-4">
              <Link
                href="/login"
                className="rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500 px-8 py-3.5 text-sm font-extrabold text-white shadow-xl shadow-indigo-500/25 hover:opacity-95 transition"
              >
                Mulai Sekarang →
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

