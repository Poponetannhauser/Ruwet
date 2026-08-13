import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/(auth)/actions'
import { CreateBoardModal } from '@/app/boards/CreateBoardModal'
import { OnboardingChecklist } from '@/app/components/OnboardingChecklist'
import { LandingScreenshot } from '@/app/components/LandingScreenshot'
import { AppSidebar } from '@/app/components/AppSidebar'
import { NotificationBell } from '@/app/components/NotificationBell'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let boards: { id: string; name: string; created_at: string; owner_id: string }[] = []
  let onboardingDismissed = false
  let hasMembers = false
  let hasTelegramLinked = false

  if (user) {
    // Ambil preferensi onboarding & telegram user
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_dismissed, telegram_chat_id')
      .eq('id', user.id)
      .single()

    onboardingDismissed = profile?.onboarding_dismissed ?? false
    hasTelegramLinked = !!profile?.telegram_chat_id

    // Fetch boards di mana user adalah owner
    const { data: ownedBoards } = await supabase
      .from('boards')
      .select('id, name, created_at, owner_id')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })

    // Fetch boards di mana user adalah member
    const { data: memberRows } = await supabase
      .from('board_members')
      .select('board_id, boards(id, name, created_at, owner_id)')
      .eq('user_id', user.id)

    type BoardItem = { id: string; name: string; created_at: string; owner_id: string }
    const memberBoards: BoardItem[] = []

    if (memberRows) {
      for (const row of memberRows) {
        const rawBoard = row.boards as unknown
        if (Array.isArray(rawBoard) && rawBoard.length > 0) {
          memberBoards.push(rawBoard[0] as BoardItem)
        } else if (rawBoard && typeof rawBoard === 'object') {
          memberBoards.push(rawBoard as BoardItem)
        }
      }
    }

    // Gabungkan & de-duplikasi berdasarkan ID
    const boardMap = new Map<string, BoardItem>()
    ;(ownedBoards || []).forEach((b) => boardMap.set(b.id, b))
    memberBoards.forEach((b) => boardMap.set(b.id, b))

    boards = Array.from(boardMap.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    // Cek apakah ada member lain di board milik user (untuk checklist item 2)
    if (ownedBoards && ownedBoards.length > 0) {
      const ownedIds = ownedBoards.map((b) => b.id)
      const { count } = await supabase
        .from('board_members')
        .select('id', { count: 'exact', head: true })
        .in('board_id', ownedIds)
        .neq('user_id', user.id)

      hasMembers = (count || 0) > 0
    }
  }

  return (
    <div className="flex min-h-screen bg-[#1A1A1E] text-zinc-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Left Sidebar Navigation (Only shown when logged in) */}
      {user && (
        <AppSidebar
          userEmail={user.email!}
          logoutAction={logout}
          hasTelegramLinked={hasTelegramLinked}
        />
      )}

      {/* Main Container */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Public Header Bar for non-logged-in visitors */}
        {!user && (
          <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-[#2C2C30]/90 px-6 sm:px-10 py-3.5 backdrop-blur-md">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center gap-3">
                <Image
                  src="/ruwet-logo.png"
                  alt="Logo Ruwet"
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-lg object-cover border border-zinc-800"
                />
                <span className="text-lg font-bold tracking-tight text-white">
                  Ruwet
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1A1A1E] border border-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>v2.4.0</span>
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="rounded-lg bg-[#1A1A1E] border border-zinc-800 px-3.5 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
                >
                  Masuk
                </Link>
                <Link
                  href="/signup"
                  className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 transition"
                >
                  Daftar Gratis
                </Link>
              </div>
            </div>
          </header>
        )}

        {/* Main Content Area */}
        <main className="flex flex-1 w-full max-w-7xl flex-col p-4 sm:p-8 mx-auto space-y-8">
          {user ? (
            <div className="space-y-8">
              {/* Dashboard Header Section */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#2C2C30] p-5 sm:p-6 rounded-xl border border-zinc-800/60">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                    Dashboard Kanban
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-zinc-400">
                    Kelola tugas, pantau stale tasks, dan tingkatkan akuntabilitas tim.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <NotificationBell />
                  <CreateBoardModal />
                </div>
              </div>

              {/* Onboarding Checklist Component */}
              {!onboardingDismissed && (
                <OnboardingChecklist
                  hasBoard={boards.length > 0}
                  hasMembers={hasMembers}
                  hasTask={boards.length > 0}
                />
              )}

              {/* Daftar Board Header */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Board Saya
                  </h3>
                  <span className="text-xs text-zinc-500 font-mono">
                    {boards.length} Board Aktif
                  </span>
                </div>

                {boards.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {boards.map((b) => {
                      const isOwner = b.owner_id === user.id
                      return (
                        <Link
                          key={b.id}
                          href={`/boards/${b.id}`}
                          className="group relative flex flex-col justify-between rounded-xl bg-[#2C2C30] p-5 transition-all duration-200 hover:bg-[#34343a] border border-zinc-800/60 shadow-xs"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-zinc-400">
                                Kanban Workspace
                              </span>
                              <span
                                className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                                  isOwner
                                    ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-800/50'
                                    : 'bg-zinc-800 text-zinc-400'
                                }`}
                              >
                                {isOwner ? 'Pemilik' : 'Anggota'}
                              </span>
                            </div>

                            <h4 className="mt-3 text-base font-bold text-white group-hover:text-indigo-400 transition-colors">
                              {b.name}
                            </h4>
                          </div>

                          <div className="mt-6 flex items-center justify-between border-t border-zinc-800/80 pt-3 text-[11px] text-zinc-400">
                            <span>Dibuat {new Date(b.created_at).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}</span>
                            <span className="font-bold text-indigo-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                              Buka Board →
                            </span>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-xl bg-[#2C2C30] p-8 text-center border border-zinc-800/60 space-y-4">
                    <div className="h-12 w-12 rounded-xl bg-zinc-800/80 flex items-center justify-center text-indigo-400">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">Belum ada board</h4>
                      <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                        Buat board Kanban pertama Anda untuk mulai mengelola tugas dan berkolaborasi secara realtime.
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
                <div className="inline-flex items-center gap-2 rounded-full bg-[#2C2C30] border border-zinc-800 px-4 py-1.5 text-xs font-semibold text-indigo-400">
                  <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                  <span>Platform Kanban &amp; Akuntabilitas Tugas Tim</span>
                </div>

                <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-tight">
                  Kelola Tugas Tim dengan{' '}
                  <span className="text-indigo-400">
                    Akuntabilitas Realtime
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-zinc-400 max-w-2xl leading-relaxed">
                  Ruwet membantu tim kecil bekerja lebih fokus: deteksi otomatis tugas macet (stale tasks), kolaborasi realtime, dan asisten bot Telegram personal.
                </p>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                  <Link
                    href="/signup"
                    className="w-full sm:w-auto rounded-xl bg-indigo-600 px-8 py-3.5 text-sm font-bold text-white hover:bg-indigo-500 transition text-center"
                  >
                    Daftar Gratis Sekarang →
                  </Link>
                  <Link
                    href="/login"
                    className="w-full sm:w-auto rounded-xl bg-[#2C2C30] hover:bg-[#34343a] border border-zinc-800 px-8 py-3.5 text-sm font-bold text-zinc-300 hover:text-white transition text-center"
                  >
                    Masuk ke Akun
                  </Link>
                </div>
              </div>

              {/* Feature Highlights Section */}
              <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                <div className="rounded-xl bg-[#2C2C30] p-6 flex flex-col justify-between border border-zinc-800/60 hover:border-zinc-700 transition">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-zinc-800/80 flex items-center justify-center mb-4 text-indigo-400">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Real-time Sync</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Pergerakan kartu task, perubahan status, dan diskusi komentar tersinkronisasi secara instan ke seluruh anggota tim tanpa perlu reload.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-[#2C2C30] p-6 flex flex-col justify-between border border-zinc-800/60 hover:border-zinc-700 transition">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-zinc-800/80 flex items-center justify-center mb-4 text-amber-400">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Stale Task Detection</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Indikator otomatis (Hijau, Kuning, Merah) menandai tugas yang stagnan/berhenti melebihi threshold jam agar cepat ditindaklanjuti.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-[#2C2C30] p-6 flex flex-col justify-between border border-zinc-800/60 hover:border-zinc-700 transition">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-zinc-800/80 flex items-center justify-center mb-4 text-sky-400">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                      </svg>
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
                <div className="w-full rounded-2xl bg-[#2C2C30] p-2 sm:p-4 border border-zinc-800/60 shadow-md overflow-hidden relative">
                  <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-800/80 mb-3 bg-[#1A1A1E] rounded-t-xl">
                    <div className="w-3 h-3 rounded-full bg-zinc-700" />
                    <div className="w-3 h-3 rounded-full bg-zinc-700" />
                    <div className="w-3 h-3 rounded-full bg-zinc-700" />
                    <span className="text-[11px] text-zinc-400 font-mono ml-2">ruwet.app/boards/demo</span>
                  </div>
                  <LandingScreenshot />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
