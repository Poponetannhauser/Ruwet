'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { addComment, getComments } from './commentActions'

type Comment = {
  id: string
  task_id: string
  user_id: string
  content: string
  created_at: string
  profiles: {
    full_name: string
    avatar_url: string | null
  } | null
}

export function CommentSection({
  taskId,
  boardId,
}: {
  taskId: string
  boardId: string
}) {
  const [comments, setComments] = useState<Comment[]>([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadComments() {
      setLoading(true)
      const res = await getComments(taskId)
      if (isMounted && res.comments) {
        setComments(res.comments)
      }
      if (isMounted) {
        setLoading(false)
      }
    }

    loadComments()

    // Realtime subscription untuk komentar baru
    const supabase = createClient()
    const channel = supabase
      .channel(`task-comments-${taskId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `task_id=eq.${taskId}`,
        },
        () => {
          loadComments()
        }
      )
      .subscribe()

    return () => {
      isMounted = false
      supabase.removeChannel(channel)
    }
  }, [taskId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return

    setError(null)
    setSubmitting(true)

    const res = await addComment(taskId, boardId, content)
    if (res && res.error) {
      setError(res.error)
      setSubmitting(false)
    } else {
      setContent('')
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
        {loading ? (
          <div className="text-xs text-zinc-400">Memuat komentar...</div>
        ) : comments.length === 0 ? (
          <div className="text-xs text-zinc-400">Belum ada komentar</div>
        ) : (
          comments.map((comment) => {
            const authorName = comment.profiles?.full_name || 'User'
            const authorInitial = authorName.charAt(0).toUpperCase()

            return (
              <div key={comment.id} className="flex items-start gap-2.5 text-xs">
                <div
                  title={authorName}
                  className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white"
                >
                  {authorInitial}
                </div>

                <div className="flex-1 rounded-lg bg-zinc-100 p-2 dark:bg-zinc-800/80">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {authorName}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {new Date(comment.created_at).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
                    {comment.content}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        {error && <div className="text-xs text-red-500">{error}</div>}
        <div className="flex gap-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Tulis komentar..."
            className="flex-1 rounded-md border border-zinc-300 px-3 py-1.5 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          />
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {submitting ? 'Kirim...' : 'Kirim'}
          </button>
        </div>
      </form>
    </div>
  )
}
