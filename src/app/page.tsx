import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { logout } from './(auth)/actions'
import { CreateBoardModal } from './boards/CreateBoardModal'
import { OnboardingChecklist } from './components/OnboardingChecklist'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let boards: { id: string; name: string; created_at: string; owner_id: string }[] = []
  let onboardingDismissed = false
  let hasMembers = false
  let hasTask = false

  if (user) {
    // Fetch profile onboarding_dismissed status
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_dismissed')
      .eq('id', user.id)
      .single()

    onboardingDismissed = profile?.onboarding_dismissed || false

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

      // Check if any of user's boards have > 1 member (team member joined)
      const { count: totalMemberRows } = await supabase
        .from('board_members')
        .select('id', { count: 'exact', head: true })
        .in('board_id', boardIds)

      hasMembers = (totalMemberRows || 0) > boardIds.length

      // Check if any tasks exist on user's boards
      const { count: taskCount } = await supabase
        .from('tasks')
        .select('id', { count: 'exact', head: true })
        .in('board_id', boardIds)

      hasTask = (taskCount || 0) > 0
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-zinc-950 text-zinc-100 bg-mesh selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Header Bar */}
      <header className="sticky top-0 z-40 border-b border-white/10 glass-panel px-6 sm:px-10 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Image
              src="/ruwet-logo.png"
              alt="Logo Ruwet"
              width={36}
              height={36}
              className="h-9 w-9 rounded-xl object-cover border border-white/10 shadow-md"
            />
            <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
              Ruwet
            </span>
            <span className="hidden sm:inline-block rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-400">
              v1.0
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
                className="rounded-lg bg-zinc-800/80 border border-white/10 px-3.5 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white transition"
              >
                Masuk
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:opacity-95 transition"
              >
                Daftar Gratis
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-1 w-full max-w-7xl flex-col p-6 sm:p-10 mx-auto space-y-8">
        {user ? (
          <div className="space-y-8">
            {/* Dashboard Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 sm:p-8 rounded-2xl">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Dashboard Board Kanban
                </h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Kelola tugas, pantau stale tasks, dan tingkatkan akuntabilitas tim.
                </p>
              </div>
              <CreateBoardModal />
            </div>

            {/* Onboarding Checklist Component */}
            {!onboardingDismissed && (
              <OnboardingChecklist
                hasBoard={boards.length > 0}
                hasMembers={hasMembers}
                hasTask={hasTask}
              />
            )}

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
                /* Improved Empty State (Task G9) */
                <div className="flex flex-col items-center justify-center rounded-2xl glass-panel p-12 text-center space-y-5 border border-indigo-500/20 shadow-2xl">
                  <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-3xl">
                    🚀
                  </div>
                  <div className="space-y-1 max-w-md">
                    <h3 className="text-xl font-extrabold text-white">
                      Selamat Datang! Mari Buat Board Pertama Anda
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Anda belum memiliki workspace kanban. Klik tombol di bawah untuk membuat board baru dan mulai berkolaborasi dengan tim Anda.
                    </p>
                  </div>
                  <div className="pt-2">
                    <CreateBoardModal />
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Public Landing Page Section */
          <div className="flex flex-col items-center space-y-16 py-12">
            {/* Hero Section */}
            <div className="flex flex-col items-center text-center max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 text-xs font-semibold text-indigo-300">
                ✨ Platform Kanban &amp; Akuntabilitas Tugas Tim
              </div>

              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
                Kelola Tugas Tim dengan{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400">
                  Akuntabilitas Realtime
                </span>
              </h1>

              <p className="text-base sm:text-lg text-zinc-400 max-w-2xl leading-relaxed">
                Ruwet membantu tim kecil bekerja lebih fokus: deteksi otomatis tugas macet (stale tasks), kolaborasi realtime, dan asisten bot Telegram personal.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                <Link
                  href="/signup"
                  className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500 px-8 py-3.5 text-sm font-extrabold text-white shadow-xl shadow-indigo-500/25 hover:opacity-95 transition text-center"
                >
                  Daftar Gratis Sekarang →
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-auto rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 px-8 py-3.5 text-sm font-bold text-zinc-300 hover:text-white transition text-center"
                >
                  Masuk ke Akun
                </Link>
              </div>
            </div>

            {/* Feature Highlights Section */}
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div className="rounded-2xl glass-card p-6 flex flex-col justify-between border border-white/10 hover:border-indigo-500/30 transition">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-2xl mb-4 text-indigo-400">
                    ⚡
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Real-time Sync</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Pergerakan kartu task, perubahan status, dan diskusi komentar tersinkronisasi secara instan ke seluruh anggota tim tanpa perlu reload.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl glass-card p-6 flex flex-col justify-between border border-white/10 hover:border-amber-500/30 transition">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl mb-4 text-amber-400">
                    🚦
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Stale Task Detection</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Indikator otomatis (Hijau, Kuning, Merah) menandai tugas yang stagnan/berhenti melebihi threshold jam agar cepat ditindaklanjuti.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl glass-card p-6 flex flex-col justify-between border border-white/10 hover:border-sky-500/30 transition">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-2xl mb-4 text-sky-400">
                    🤖
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Telegram Bot Companion</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Dapatkan notifikasi penugasan &amp; komentar langsung di Telegram personal Anda, serta query ringkasan tugas lewat perintah `/mytasks`.
                  </p>
                </div>
              </div>
            </div>

            {/* Static Board Screenshot Container */}
            <div className="w-full flex flex-col items-center pt-8">
              <div className="w-full rounded-2xl glass-panel p-2 sm:p-4 border border-white/10 shadow-2xl overflow-hidden relative">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5 mb-3 bg-zinc-950/60 rounded-t-xl">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-[11px] text-zinc-400 font-mono ml-2">ruwet.app/boards/demo</span>
                </div>
                <div className="relative w-full aspect-[16/9] min-h-[280px] bg-zinc-900 rounded-xl overflow-hidden flex items-center justify-center">
                  <Image
                    src="/screenshot-board.png"
                    alt="Preview Kanban Board Ruwet"
                    fill
                    className="object-cover rounded-xl"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                  <div className="p-8 text-center space-y-3 max-w-md">
                    <div className="text-4xl">📋</div>
                    <h4 className="text-base font-bold text-white">Preview Kanban Board Ruwet</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Tampilan workspace modern dengan kolom interaktif, badge stale real-time, dan manajemen tim terpadu.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
