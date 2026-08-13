import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

import { BoardHeader } from './BoardHeader'
import { KanbanBoard } from './KanbanBoard'
import { AppSidebar } from '@/app/components/AppSidebar'
import { logout } from '@/app/(auth)/actions'

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

  // Fetch user profile for telegram link status & board details, members, columns, tasks
  const [profileRes, boardRes, rawMembersRes, columnsRes, rawTasksRes] = await Promise.all([
    supabase.from('profiles').select('telegram_chat_id').eq('id', user.id).single(),
    supabase.from('boards').select('*').eq('id', id).single(),
    supabase.from('board_members').select('id, user_id, role, profiles(full_name, avatar_url)').eq('board_id', id),
    supabase.from('columns').select('*').eq('board_id', id).order('position', { ascending: true }),
    supabase.from('tasks').select('*, profiles:assignee_id(full_name, avatar_url)').eq('board_id', id).order('position', { ascending: true }),
  ])

  const board = boardRes.data
  const boardError = boardRes.error
  const hasTelegramLinked = !!profileRes.data?.telegram_chat_id

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
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Left Sidebar Navigation */}
      <AppSidebar
        userEmail={user.email}
        logoutAction={logout}
        hasTelegramLinked={hasTelegramLinked}
      />

      {/* Main Board Workspace Area */}
      <div className="flex flex-1 flex-col min-w-0">
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
    </div>
  )
}
