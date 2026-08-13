'use client'

import { useEffect, useState, useRef } from 'react'
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
  const commentsEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    let isMounted = true
    const supabase = createClient()

    async function initUserAndComments() {
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
        setTimeout(scrollToBottom, 100)
      }
    }

    initUserAndComments()

    // Realtime subscription for comments on this task
    const channel = supabase
      .channel(`task-comments:${taskId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `task_id=eq.${taskId}`,
        },
        async (payload) => {
          const newCommentPayload = payload.new as {
            id: string
            task_id: string
            user_id: string
            content: string
            created_at: string
          }

          // Fetch profile of commenter if not already present
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', newCommentPayload.user_id)
            .maybeSingle()

          const newComment: Comment = {
            ...newCommentPayload,
            profiles: profile || null,
          }

          setComments((prev) => {
            if (prev.some((c) => c.id === newComment.id)) return prev
            return [...prev, newComment]
          })
          setTimeout(scrollToBottom, 100)
        }
      )
      .subscribe()

    return () => {
      isMounted = false
      supabase.removeChannel(channel)
    }
  }, [taskId])

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault()
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
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setContent(e.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }

  return (
    <div className="flex flex-col h-full min-h-0 justify-between gap-3">
      <div className="flex-1 overflow-y-auto min-h-0 space-y-3 pr-1 py-1">
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
            const authorName = comment.profiles?.full_name || 'User'
            const authorInitial = authorName.charAt(0).toUpperCase()
            const timeFormatted = new Date(comment.created_at).toLocaleString('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
              day: 'numeric',
              month: 'short',
            })

            return (
              <div
                key={comment.id}
                className={`flex items-end gap-2 text-xs ${
                  isMe ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div
                  title={authorName}
                  className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-xs ${
                    isMe
                      ? 'bg-gradient-to-br from-indigo-600 to-violet-600'
                      : 'bg-zinc-700 dark:bg-zinc-700'
                  }`}
                >
                  {authorInitial}
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 shadow-xs flex flex-col ${
                    isMe
                      ? 'rounded-br-xs bg-indigo-600 text-white'
                      : 'rounded-bl-xs bg-[#1a1a22] text-zinc-100 border border-zinc-800/80'
                  }`}
                >
                  {!isMe && (
                    <span className="text-[11px] font-bold text-indigo-400 mb-0.5">
                      {authorName}
                    </span>
                  )}
                  <p className="whitespace-pre-wrap leading-relaxed text-xs break-words">
                    {comment.content}
                  </p>
                  <span
                    className={`self-end text-[9px] font-mono mt-0.5 select-none ${
                      isMe ? 'text-indigo-200/80' : 'text-zinc-500'
                    }`}
                  >
                    {timeFormatted}
                  </span>
                </div>
              </div>
            )
          })
        )}
        <div ref={commentsEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
        {error && <div className="text-xs text-red-500">{error}</div>}
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            maxLength={2000}
            rows={1}
            placeholder="Tulis komentar... (Enter untuk kirim, Shift+Enter baris baru)"
            className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white resize-none min-h-[36px] max-h-[120px]"
          />
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="flex h-9 items-center gap-1.5 rounded-lg bg-indigo-600 px-4 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-xs shrink-0"
          >
            <span>{submitting ? '...' : 'Kirim'}</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9-7-9-7-9 7 9 7zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  )
}

