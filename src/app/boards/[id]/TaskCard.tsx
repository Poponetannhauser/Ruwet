'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { assignSelf } from './taskActions'
import { EditTaskModal } from './EditTaskModal'




type Member = {
  id: string
  role: string
  profiles: {
    full_name: string
    avatar_url: string | null
  } | null
}

type Column = {
  id: string
  name: string
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

  const isAssignedToMe = task.assignee_id === currentUserId
  const assigneeName = task.profiles?.full_name || 'Unassigned'
  const assigneeInitial = assigneeName.charAt(0).toUpperCase()

  // Calculate Stale Status
  const currentColumn = columns.find((c) => c.id === task.column_id)
  const isDoneColumn = currentColumn?.name.trim().toLowerCase() === 'done'
  const hasAssignee = !!task.assignee_id

  const [nowMs] = useState(() => Date.now())

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

    if (ratio > 1) {
      staleStatus = 'red'
      staleLabel = `Stale (${elapsedText})`
    } else if (ratio >= 0.7) {
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
        className="group relative cursor-grab active:cursor-grabbing touch-manipulation rounded-lg border border-zinc-200 bg-white p-3 shadow-sm hover:border-indigo-400 hover:shadow focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors dark:border-zinc-800 dark:bg-zinc-900/90 dark:hover:border-indigo-600"
      >
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-xs text-zinc-100 group-hover:text-indigo-300 transition-colors leading-snug">
            {task.title}
          </h4>

          {staleStatus && (
            <span
              title={`Status aktivitas: ${staleLabel}`}
              className={`inline-flex flex-shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wide uppercase transition-all ${
                staleStatus === 'red'
                  ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60 glow-rose animate-pulse'
                  : staleStatus === 'yellow'
                  ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60 glow-amber'
                  : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 glow-emerald'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  staleStatus === 'red'
                    ? 'bg-rose-400'
                    : staleStatus === 'yellow'
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
              />
              {staleStatus === 'red' ? 'Stale' : staleStatus === 'yellow' ? 'Warning' : 'Fresh'}
            </span>
          )}
        </div>

        {task.description && (
          <p className="mt-1.5 line-clamp-2 text-[11px] text-zinc-400 leading-relaxed">
            {task.description}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2.5 text-[10px] text-zinc-400">
          <div>
            {task.due_date ? (
              <span className="flex items-center gap-1 font-medium text-amber-400 bg-amber-950/30 px-2 py-0.5 rounded-md border border-amber-800/30">
                <svg className="w-3 h-3 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                {new Date(task.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
              </span>
            ) : (

              <span className="text-zinc-500">Tanpa tenggat</span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {!isAssignedToMe && (
              <button
                onClick={handleAssignSelf}
                disabled={loading}
                className="hidden items-center gap-1 rounded-md bg-indigo-950/80 border border-indigo-700/50 px-2 py-0.5 text-[10px] font-semibold text-indigo-300 hover:bg-indigo-900 group-hover:inline-flex transition-all shadow-xs"
                title="Assign task ini ke saya"
              >
                <svg className="w-2.5 h-2.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span>Saya</span>
              </button>
            )}

            <div
              title={`Assignee: ${assigneeName}`}
              className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ring-2 ring-zinc-950 ${
                task.assignee_id
                  ? 'bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-indigo-500/20'
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
      />
    </>
  )
}

