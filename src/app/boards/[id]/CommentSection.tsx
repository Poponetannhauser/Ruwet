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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function initUserAndComments() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (isMounted && user) {
        setCurrentUserId(user.id)
      }

      setLoading(true)
      const res = await getComments(taskId)
      if (isMounted && res.comments) {
        setComments(res.comments)
      }
      if (isMounted) {
        setLoading(false)
      }
    }

    initUserAndComments()

    return () => {
      isMounted = false
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
      <div className="flex-1 space-y-3 overflow-y-auto pr-1 max-h-[340px] py-1">
        {loading ? (
          <div className="text-xs text-zinc-400 p-2 text-center">Memuat komentar...</div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-xs text-zinc-400">
            <svg className="w-8 h-8 mb-2 text-zinc-400 dark:text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>Belum ada komentar untuk task ini</span>
          </div>
        ) : (
          comments.map((comment) => {
            const isMe = currentUserId ? comment.user_id === currentUserId : false
            const authorName = isMe ? 'Anda' : (comment.profiles?.full_name || 'User')
            const authorInitial = (comment.profiles?.full_name || 'User').charAt(0).toUpperCase()

            return (
              <div
                key={comment.id}
                className={`flex items-end gap-2 text-xs ${
                  isMe ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div
                  title={comment.profiles?.full_name || 'User'}
                  className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-xs ${
                    isMe
                      ? 'bg-gradient-to-br from-indigo-600 to-violet-600'
                      : 'bg-zinc-700 dark:bg-zinc-700'
                  }`}
                >
                  {authorInitial}
                </div>

                <div
                  className={`max-w-[80%] rounded-2xl p-3 shadow-xs ${
                    isMe
                      ? 'rounded-br-xs bg-indigo-600 text-white'
                      : 'rounded-bl-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200/60 dark:border-zinc-700/60'
                  }`}
                >
                  <div
                    className={`flex items-center gap-2 mb-1 text-[11px] ${
                      isMe ? 'justify-end text-indigo-200' : 'justify-between text-zinc-500 dark:text-zinc-400'
                    }`}
                  >
                    <span className="font-bold">{authorName}</span>
                    <span className="text-[9px] opacity-80">
                      {new Date(comment.created_at).toLocaleString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed text-xs">
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
