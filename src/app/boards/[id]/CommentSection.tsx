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
    <div className="flex flex-col h-full justify-between space-y-4">
      <div className="flex-1 space-y-2.5 overflow-y-auto pr-1 max-h-[340px]">
        {loading ? (
          <div className="text-xs text-zinc-400 p-2">Memuat komentar...</div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-xs text-zinc-400">
            <svg className="w-8 h-8 mb-2 text-zinc-400 dark:text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>Belum ada komentar untuk task ini</span>
          </div>
        ) : (
          comments.map((comment) => {
            const authorName = comment.profiles?.full_name || 'User'
            const authorInitial = authorName.charAt(0).toUpperCase()

            return (
              <div key={comment.id} className="flex items-start gap-2.5 text-xs">
                <div
                  title={authorName}
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white shadow-xs"
                >
                  {authorInitial}
                </div>

                <div className="flex-1 rounded-xl bg-zinc-100 p-2.5 dark:bg-zinc-800/80 border border-zinc-200/50 dark:border-zinc-700/50">
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
                  <p className="mt-1 whitespace-pre-wrap text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>

      <form onSubmit={handleSubmit} className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
        {error && <div className="text-xs text-red-500">{error}</div>}
        <div className="flex gap-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Tulis komentar..."
            className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          />
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-xs"
          >
            <span>{submitting ? 'Kirim...' : 'Kirim'}</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9-7-9-7-9 7 9 7zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  )
}
