import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { BoardHeader } from './BoardHeader'

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

  // Fetch board details
  const { data: board, error: boardError } = await supabase
    .from('boards')
    .select('*')
    .eq('id', id)
    .single()

  if (boardError || !board) {
    notFound()
  }

  // Fetch board members with profiles
  const { data: rawMembers } = await supabase
    .from('board_members')
    .select('id, role, profiles(full_name, avatar_url)')
    .eq('board_id', id)

  const members = (rawMembers || []).map((m) => ({
    id: m.id,
    role: m.role || 'member',
    profiles: Array.isArray(m.profiles) ? m.profiles[0] : m.profiles,
  }))

  // Fetch board columns
  const { data: columns } = await supabase
    .from('columns')
    .select('*')
    .eq('board_id', id)
    .order('position', { ascending: true })

  const isOwner = board.owner_id === user.id

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="bg-zinc-100 px-8 py-2 border-b border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 text-xs">
        <Link href="/" className="text-indigo-600 hover:underline dark:text-indigo-400">
          ← Kembali ke Dashboard Board
        </Link>
      </div>

      <BoardHeader board={board} isOwner={isOwner} members={members} />

      <main className="flex-1 p-8 overflow-x-auto">
        <div className="flex gap-6 items-start">
          {columns && columns.length > 0 ? (
            columns.map((col) => (
              <div
                key={col.id}
                className="w-72 flex-shrink-0 rounded-xl bg-zinc-200/70 p-4 dark:bg-zinc-900 border border-zinc-300/50 dark:border-zinc-800"
              >
                <div className="flex items-center justify-between font-semibold text-sm text-zinc-700 dark:text-zinc-300 mb-3">
                  <span>{col.name}</span>
                  <span className="rounded bg-zinc-300 dark:bg-zinc-800 px-2 py-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                    0
                  </span>
                </div>
                <div className="min-h-[200px] flex items-center justify-center rounded-lg border border-dashed border-zinc-300 dark:border-zinc-800 text-xs text-zinc-400">
                  Belum ada task
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-zinc-500">Tidak ada kolom.</div>
          )}
        </div>
      </main>
    </div>
  )
}
