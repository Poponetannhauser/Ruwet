import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { BoardHeader } from './BoardHeader'
import { KanbanBoard } from './KanbanBoard'

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
    <div className="flex flex-col flex-1 min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="bg-zinc-100 px-4 sm:px-8 py-2 border-b border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 text-xs">
        <Link href="/" className="text-indigo-600 hover:underline dark:text-indigo-400">
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

      <main className="flex-1 p-4 sm:p-8 overflow-x-auto">
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
  )
}
