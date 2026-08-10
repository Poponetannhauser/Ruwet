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

  // Fetch board details (menggunakan admin client agar non-member yang diundang tetap dapat membaca nama board)
  let boardName = 'Board'
  try {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const adminSupabase = createAdminClient()
    const { data: board } = await adminSupabase
      .from('boards')
      .select('name')
      .eq('id', id)
      .maybeSingle()

    if (board?.name) {
      boardName = board.name
    }
  } catch {
    const { data: board } = await supabase
      .from('boards')
      .select('name')
      .eq('id', id)
      .maybeSingle()

    if (board?.name) {
      boardName = board.name
    }
  }


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
          <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.25-2.142V9M6 8.25h.008v.008H6V8.25zm0 3h.008v.008H6v-.008zm0 3h.008v.008H6v-.008zm0 3h.008v.008H6v-.008z" />
          </svg>
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
