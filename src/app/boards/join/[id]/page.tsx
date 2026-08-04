import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { joinBoard } from '../../actions'

export default async function JoinBoardPage({
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
    redirect(`/login?next=/boards/join/${id}`)
  }

  // Fetch board details (menggunakan query yang mengizinkan nama board diambil untuk invite page)
  const { data: board } = await supabase
    .from('boards')
    .select('id, name')
    .eq('id', id)
    .maybeSingle()

  // Jika RLS memblokir SELECT board untuk non-member, kita bisa berikan fallback info undangan
  const boardName = board?.name || 'Board Tim'

  // Check if already a member
  const { data: isMember } = await supabase
    .from('board_members')
    .select('id')
    .eq('board_id', id)
    .eq('user_id', user.id)
    .single()

  if (isMember) {
    redirect(`/boards/${id}`)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
          📋
        </div>
        <h2 className="mt-4 text-2xl font-bold text-zinc-900 dark:text-white">
          Undangan Bergabung Board
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Anda diundang untuk bergabung ke board <strong className="text-zinc-900 dark:text-white">{boardName}</strong>.
        </p>

        <form action={joinBoard.bind(null, id)} className="mt-6 flex flex-col gap-3">
          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition"
          >
            Bergabung Sekarang
          </button>
          <Link
            href="/"
            className="text-xs text-zinc-500 hover:underline dark:text-zinc-400"
          >
            Batal & Kembali ke Beranda
          </Link>
        </form>
      </div>
    </div>
  )
}
