import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { BoardHeader } from './BoardHeader'
import { KanbanBoard } from './KanbanBoard'
import { Sidebar } from '@/app/components/Sidebar'

export default async function BoardDetailPage({
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

  // Fetch board details, members, columns, and tasks secara paralel (Promise.all)
  const [boardRes, rawMembersRes, columnsRes, rawTasksRes] = await Promise.all([
    supabase.from('boards').select('*').eq('id', id).single(),
    supabase.from('board_members').select('id, user_id, role, profiles(full_name, avatar_url)').eq('board_id', id),
    supabase.from('columns').select('*').eq('board_id', id).order('position', { ascending: true }),
    supabase.from('tasks').select('*, profiles:assignee_id(full_name, avatar_url)').eq('board_id', id).order('position', { ascending: true }),
  ])

  const board = boardRes.data
  const boardError = boardRes.error

  if (boardError || !board) {
    notFound()
  }

  const members = (rawMembersRes.data || []).map((m) => ({
    id: m.id,
    user_id: m.user_id,
    role: m.role || 'member',
    profiles: Array.isArray(m.profiles) ? m.profiles[0] : m.profiles,
  }))

  const columns = columnsRes.data || []
  const tasks = (rawTasksRes.data || []).map((t) => ({
    ...t,
    profiles: Array.isArray(t.profiles) ? t.profiles[0] : t.profiles,
  }))

  const isOwner = board.owner_id === user.id

  return (
    <div className="min-h-screen bg-[#f8f9fd] text-[#191c1f] flex">
      {/* Sidebar Navigation */}
      <Sidebar userEmail={user.email} />

      {/* Main Board Container */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Sub-header breadcrumb */}
        <div className="bg-[#edeef2] px-6 lg:px-10 py-2 border-b border-[#e1e2e6] text-xs">
          <Link href="/" className="font-semibold text-[#5b4df6] hover:underline flex items-center gap-1.5">
            ← Kembali ke Dashboard Board
          </Link>
        </div>

        <BoardHeader
          board={board}
          isOwner={isOwner}
          members={members}
          columns={columns || []}
          tasks={tasks || []}
        />

        <main className="flex-1 p-6 lg:p-10 overflow-x-auto">
          <KanbanBoard
            boardId={id}
            staleThresholdHours={board.stale_threshold_hours ? Number(board.stale_threshold_hours) : 48}
            initialColumns={columns || []}
            initialTasks={tasks}
            members={members}
            currentUserId={user.id}
          />
        </main>
      </div>
    </div>
  )
}
