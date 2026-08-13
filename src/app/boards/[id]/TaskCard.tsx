'use client'

import { useState, useEffect } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'framer-motion'
import { assignSelf } from './taskActions'
import { EditTaskModal } from './EditTaskModal'
import { CommentDrawer } from '@/app/components/CommentDrawer'

type Column = {
  id: string
  name: string
}

type Member = {
  id: string
  user_id?: string
  role: string
  profiles: {
    full_name: string
    avatar_url: string | null
  } | null
}

type Task = {
  id: string
  board_id: string
  column_id: string
  title: string
  description: string | null
  assignee_id: string | null
  due_date: string | null
  status_updated_at?: string | null
  task_number?: number
  priority?: string
  profiles: {
    full_name: string
    avatar_url: string | null
  } | null
}

type TaskCardProps = {
  task: Task
  columns: Column[]
  members: Member[]
  currentUserId: string
  staleThresholdHours?: number
}

export function TaskCard({
  task,
  columns,
  members,
  currentUserId,
  staleThresholdHours = 48,
}: TaskCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isCommentOpen, setIsCommentOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  }

  const assigneeName = task.profiles?.full_name || 'Unassigned'
  const assigneeInitial = assigneeName.charAt(0).toUpperCase()

  // Calculate Stale Status
  const currentColumn = columns.find((c) => c.id === task.column_id)
  const isDoneColumn = currentColumn?.name.trim().toLowerCase() === 'done'
  const hasAssignee = !!task.assignee_id

  const [nowMs, setNowMs] = useState(() => Date.now())

  useEffect(() => {
    const timer = setInterval(() => {
      setNowMs(Date.now())
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  let staleStatus: 'green' | 'yellow' | 'red' | null = null

  let staleLabel = ''

  if (hasAssignee && !isDoneColumn && task.status_updated_at && nowMs > 0) {
    const updatedMs = new Date(task.status_updated_at).getTime()
    const diffMs = nowMs - updatedMs
    const thresholdMs = staleThresholdHours * 60 * 60 * 1000

    const ratio = diffMs / thresholdMs

    // Calculate readable elapsed time
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    let elapsedText = ''
    if (diffDays > 0) {
      elapsedText = `${diffDays}h`
    } else if (diffHours > 0) {
      elapsedText = `${diffHours}j`
    } else {
      elapsedText = `${diffMinutes}m`
    }

    if (ratio >= 1.0) {
      staleStatus = 'red'
      staleLabel = `Stale (${elapsedText})`
    } else if (ratio >= 0.75) {
      staleStatus = 'yellow'
      staleLabel = `Warning (${elapsedText})`
    } else {
      staleStatus = 'green'
      staleLabel = `Active (${elapsedText})`
    }
  }

  async function handleAssignSelf(e: React.MouseEvent) {
    e.stopPropagation()
    setLoading(true)
    await assignSelf(task.id, task.board_id)
    setLoading(false)
  }

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15 }}
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={() => setIsEditOpen(true)}
        className="group relative cursor-grab active:cursor-grabbing touch-manipulation rounded-xl bg-[#1A1A1E] p-3 hover:bg-[#232328] transition-all"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-1.5 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              {task.task_number !== undefined && (
                <span className="inline-block text-[10px] font-mono font-bold text-zinc-500 bg-zinc-900/90 px-1.5 py-0.2 rounded">
                  #{task.task_number}
                </span>
              )}
              {task.priority && (
                <span
                  className={`inline-block text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border ${
                    task.priority === 'urgent'
                      ? 'bg-rose-950/60 border-rose-800/40 text-rose-300'
                      : task.priority === 'high'
                      ? 'bg-amber-950/60 border-amber-800/40 text-amber-300'
                      : task.priority === 'low'
                      ? 'bg-zinc-850 border-zinc-700/40 text-zinc-400'
                      : 'bg-indigo-950/60 border-indigo-800/40 text-indigo-300'
                  }`}
                >
                  {task.priority}
                </span>
              )}
              <h4 className="text-xs font-bold text-zinc-100 group-hover:text-indigo-400 transition-colors leading-snug">
                {task.title}
              </h4>
            </div>

            {task.description && (
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-snug">
                {task.description}
              </p>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-2 text-[10px] text-zinc-500 dark:border-zinc-800/80 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            {staleStatus && (
              <span
                className={`inline-flex items-center gap-1 font-semibold rounded px-1.5 py-0.5 text-[10px] ${
                  staleStatus === 'red'
                    ? 'bg-rose-950/50 text-rose-400'
                    : staleStatus === 'yellow'
                    ? 'bg-amber-950/50 text-amber-400'
                    : 'bg-emerald-950/50 text-emerald-400'
                }`}
                title={`Stale status: ${staleStatus}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    staleStatus === 'red'
                      ? 'bg-rose-400'
                      : staleStatus === 'yellow'
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                  }`}
                />
                <span>{staleLabel}</span>
              </span>
            )}

            {task.due_date && (
              <span className="flex items-center gap-1 text-[10px] text-zinc-400">
                <svg className="w-3 h-3 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                {new Date(task.due_date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Direct Right Comment Drawer Trigger Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setIsCommentOpen(true)
              }}
              className="flex items-center gap-1 rounded px-1.5 py-0.5 text-zinc-400 hover:bg-zinc-800 hover:text-sky-400 transition"
              title="Buka Komentar"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>

            {!task.assignee_id && (
              <button
                type="button"
                onClick={handleAssignSelf}
                disabled={loading}
                className="hidden items-center gap-1 rounded-md bg-indigo-950/80 border border-indigo-700/50 px-2 py-0.5 text-[10px] font-semibold text-indigo-300 hover:bg-indigo-900 group-hover:inline-flex transition-all shadow-xs"
              >
                <svg className="w-3 h-3 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span>Saya</span>
              </button>
            )}

            <div
              title={`Assignee: ${assigneeName}`}
              className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ring-1 ring-zinc-800 ${
                task.assignee_id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
              }`}
            >
              {task.assignee_id ? assigneeInitial : '?'}
            </div>
          </div>
        </div>
      </motion.div>

      <EditTaskModal
        task={task}
        columns={columns}
        members={members}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onOpenComments={() => setIsCommentOpen(true)}
      />

      <CommentDrawer
        isOpen={isCommentOpen}
        onClose={() => setIsCommentOpen(false)}
        taskId={task.id}
        taskTitle={task.title}
        taskNumber={task.task_number}
        boardId={task.board_id}
      />
    </>
  )
}
