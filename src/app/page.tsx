import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { logout } from './(auth)/actions'
import { CreateBoardModal } from './boards/CreateBoardModal'
import { Sidebar } from './components/Sidebar'

type BoardMemberWithProfile = {
  user_id: string
  role: string
  profiles: {
    full_name: string
    avatar_url: string | null
  } | null
}

type BoardData = {
  id: string
  name: string
  created_at: string
  owner_id: string
  stale_threshold_hours: number
  tasks: { id: string }[]
  board_members: BoardMemberWithProfile[]
}

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let boards: BoardData[] = []
  let activeMembers: { id: string; name: string; role: string; avatar: string | null }[] = []

  if (user) {
    const { data: memberBoards } = await supabase
      .from('board_members')
      .select('board_id')
      .eq('user_id', user.id)

    const boardIds = memberBoards?.map((mb) => mb.board_id) || []

    if (boardIds.length > 0) {
      const { data } = await supabase
        .from('boards')
        .select('*, tasks(id), board_members(user_id, role, profiles(full_name, avatar_url))')
        .in('id', boardIds)
        .order('created_at', { ascending: false })

      if (data) {
        boards = data as unknown as BoardData[]

        // Extract unique active team members across user's boards
        const memberMap = new Map<string, { id: string; name: string; role: string; avatar: string | null }>()
        boards.forEach((b) => {
          b.board_members?.forEach((m) => {
            if (m.profiles && !memberMap.has(m.user_id)) {
              memberMap.set(m.user_id, {
                id: m.user_id,
                name: m.profiles.full_name || 'Tim Member',
                role: m.role === 'owner' ? 'Owner' : 'Member',
                avatar: m.profiles.avatar_url,
              })
            }
          })
        })
        activeMembers = Array.from(memberMap.values())
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f9fd] text-[#191c1f] flex">
      {/* Persistent Navigation Sidebar */}
      <Sidebar userEmail={user?.email} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header / Action Bar */}
        <header className="sticky top-0 z-20 bg-[#f8f9fd]/80 backdrop-blur-md px-6 lg:px-10 py-6 flex items-center justify-between border-b border-[#e1e2e6]">
          <div>
            <h1 className="font-heading text-2xl lg:text-3xl font-bold tracking-tight text-[#191c1f]">
              {user ? 'Dashboard Overview' : 'Selamat Datang di Ruwet'}
            </h1>
            <p className="text-xs sm:text-sm text-[#464556] mt-0.5">
              {user ? "Here's a quick overview of your workspace." : 'Aplikasi Realtime Kanban Board untuk Manajemen Task Tim.'}
            </p>
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              <form action={logout}>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg border border-[#c7c4d8] bg-white text-xs font-semibold text-[#191c1f] hover:bg-[#edeef2] transition shadow-xs flex items-center gap-2"
                >
                  <svg className="w-4 h-4 text-[#777587]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </form>
              <CreateBoardModal />
            </div>
          ) : (
            <Link
              href="/login"
              className="px-5 py-2.5 rounded-lg bg-[#5b4df6] hover:bg-[#412dde] text-xs font-semibold text-white transition shadow-sm"
            >
              Masuk / Register
            </Link>
          )}
        </header>

        {/* Main Body */}
        <main className="flex-1 px-6 lg:px-10 py-8 space-y-10">
          {user ? (
            <>
              {/* Available Boards Section */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading text-lg font-bold text-[#191c1f]">
                    Available Boards
                  </h2>
                  <span className="text-xs text-[#777587] font-medium">
                    {boards.length} Boards
                  </span>
                </div>

                {boards.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {boards.map((b) => {
                      const taskCount = b.tasks?.length || 0
                      const memberCount = b.board_members?.length || 1
                      return (
                        <Link
                          key={b.id}
                          href={`/boards/${b.id}`}
                          className="group relative flex flex-col justify-between p-6 rounded-xl bg-white border border-[#e1e2e6] shadow-level-1 hover:shadow-level-2 hover:border-[#5b4df6] transition-all duration-200"
                        >
                          <div>
                            <div className="flex items-start justify-between">
                              <div className="w-12 h-12 rounded-xl bg-[#5b4df6]/10 text-[#5b4df6] flex items-center justify-center font-heading font-bold text-xl group-hover:bg-[#5b4df6] group-hover:text-white transition">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                                </svg>
                              </div>
                              <span className="px-2.5 py-1 rounded-full bg-[#f2f3f7] text-[11px] font-bold text-[#464556] uppercase tracking-wider">
                                {b.owner_id === user.id ? 'Owner' : 'Member'}
                              </span>
                            </div>

                            <div className="mt-5">
                              <h3 className="font-heading font-bold text-lg text-[#191c1f] group-hover:text-[#5b4df6] transition">
                                {b.name}
                              </h3>
                              <p className="mt-1 text-xs text-[#777587]">
                                Stale threshold: {b.stale_threshold_hours || 48} jam
                              </p>
                            </div>
                          </div>

                          <div className="mt-6 pt-4 border-t border-[#f2f3f7] flex items-center justify-between text-xs font-data-mono text-[#464556]">
                            <span className="flex items-center gap-1.5">
                              <svg className="w-4 h-4 text-[#5b4df6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {taskCount} tasks
                            </span>
                            <span className="flex items-center gap-1.5 font-sans text-xs text-[#777587]">
                              👤 {memberCount} anggota
                            </span>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#c7c4d8] p-12 text-center bg-white shadow-level-1 space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#ebe7ff] text-[#5b4df6] flex items-center justify-center text-2xl font-bold">
                      ⚡
                    </div>
                    <div>
                      <h3 className="font-heading text-lg font-bold text-[#191c1f]">
                        Belum Ada Board Kanban
                      </h3>
                      <p className="text-xs text-[#777587] max-w-sm mt-1">
                        Anda belum terhubung ke board kanban mana pun. Buat board baru untuk mulai mengelola task tim Anda.
                      </p>
                    </div>
                    <CreateBoardModal />
                  </div>
                )}
              </section>

              {/* Active Team Members Section */}
              {activeMembers.length > 0 && (
                <section className="space-y-4">
                  <h2 className="font-heading text-lg font-bold text-[#191c1f]">
                    Active Team Members
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {activeMembers.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center gap-3.5 p-4 rounded-xl bg-white border border-[#e1e2e6] shadow-level-1"
                      >
                        <div className="relative">
                          {m.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={m.avatar}
                              alt={m.name}
                              className="w-10 h-10 rounded-full object-cover border border-[#e1e2e6]"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-[#ebe7ff] text-[#5b4df6] font-bold text-sm flex items-center justify-center">
                              {m.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#006c47] ring-2 ring-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-heading text-sm font-semibold text-[#191c1f] truncate">
                            {m.name}
                          </h4>
                          <p className="text-xs text-[#777587] truncate">
                            {m.role}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-center py-20 bg-white rounded-2xl border border-[#e1e2e6] shadow-level-1 p-8">
              <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-[#191c1f]">
                Selamat Datang di Ruwet
              </h2>
              <p className="mt-3 text-sm text-[#777587] max-w-md">
                Aplikasi Realtime Kanban Board untuk Manajemen Task Tim Anda. Masuk sekarang untuk mulai membuat board.
              </p>
              <div className="mt-6">
                <Link
                  href="/login"
                  className="px-6 py-3 rounded-lg bg-[#5b4df6] hover:bg-[#412dde] text-sm font-semibold text-white shadow-sm transition"
                >
                  Mulai Sekarang
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
