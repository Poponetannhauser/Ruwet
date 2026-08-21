import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getBoardDocuments } from './docActions'
import { DocsClientView } from './DocsClientView'
import { AppSidebar } from '@/app/components/AppSidebar'
import { logout } from '@/app/(auth)/actions'

export default async function BoardDocsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch profile, board, and documents
  const [profileRes, boardRes, docsRes] = await Promise.all([
    supabase.from('profiles').select('telegram_chat_id').eq('id', user.id).single(),
    supabase.from('boards').select('*').eq('id', id).single(),
    getBoardDocuments(id),
  ])

  const board = boardRes.data
  const hasTelegramLinked = !!profileRes.data?.telegram_chat_id
  const documents = docsRes.data || []

  if (boardRes.error || !board) {
    notFound()
  }

  return (
    <div className="flex min-h-screen bg-[#1A1A1E] text-zinc-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Left Sidebar Navigation */}
      <AppSidebar
        userEmail={user.email}
        logoutAction={logout}
        hasTelegramLinked={hasTelegramLinked}
        currentBoardId={id}
        boardName={board.name}
      />

      {/* Main Content Workspace */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Header */}
        <header className="flex items-center justify-between border-b border-zinc-800/80 bg-[#2C2C30] px-5 sm:px-8 py-3.5 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <Link
              href={`/boards/${id}`}
              className="text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-1.5 transition"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              <span>Kanban</span>
            </Link>
            <span className="text-zinc-600">/</span>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white tracking-tight">
                {board.name}
              </span>
              <span className="rounded-full bg-indigo-950/80 border border-indigo-800/50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-300 font-mono">
                Docs &amp; Specs Hub
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/boards/${id}`}
              className="rounded-lg bg-[#1e1e24] border border-zinc-700/80 hover:bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:text-white transition flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
              <span>Buka Kanban Board</span>
            </Link>
          </div>
        </header>

        {/* Client Workspace */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <DocsClientView
            boardId={id}
            initialDocuments={documents}
            dbError={docsRes.error}
          />
        </main>
      </div>
    </div>
  )
}
