'use client'

import { useState, useSyncExternalStore } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { assignSelf } from './taskActions'
import { EditTaskModal } from './EditTaskModal'

const emptySubscribe = () => () => {}

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
    opacity: isDragging ? 0.4 : 1,
  }

  const isAssignedToMe = task.assignee_id === currentUserId
  const assigneeName = task.profiles?.full_name || 'Unassigned'
  const assigneeInitial = assigneeName.charAt(0).toUpperCase()

  // Calculate Stale Status
  const currentColumn = columns.find((c) => c.id === task.column_id)
  const isDoneColumn = currentColumn?.name.trim().toLowerCase() === 'done'
  const hasAssignee = !!task.assignee_id

  const getSnapshot = () => Math.floor(Date.now() / 1000)
  const nowSec = useSyncExternalStore(
    emptySubscribe,
    getSnapshot,
    () => 0
  )
  const nowMs = nowSec * 1000

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
      elapsedText = `${diffDays} hari`
    } else if (diffHours > 0) {
      elapsedText = `${diffHours} jam`
    } else {
      elapsedText = `${diffMinutes} mnt`
    }

    if (ratio > 1) {
      staleStatus = 'red'
      staleLabel = `Stale (${elapsedText})`
    } else if (ratio >= 0.7) {
      staleStatus = 'yellow'
      staleLabel = `Perlu Perhatian (${elapsedText})`
    } else {
      staleStatus = 'green'
      staleLabel = `Aktif (${elapsedText})`
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
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={() => setIsEditOpen(true)}
        className="group relative cursor-grab active:cursor-grabbing touch-manipulation rounded-lg border border-zinc-200 bg-white p-3 shadow-sm hover:border-indigo-400 hover:shadow focus:ring-2 focus:ring-indigo-500 focus:outline-none transition dark:border-zinc-800 dark:bg-zinc-900/90 dark:hover:border-indigo-600"
      >
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
            {task.title}
          </h4>

          {staleStatus && (
            <span
              title={`Status aktivitas: ${staleLabel}`}
              className={`inline-flex flex-shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${
                staleStatus === 'red'
                  ? 'bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-400 animate-pulse'
                  : staleStatus === 'yellow'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-400'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-400'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  staleStatus === 'red'
                    ? 'bg-red-600 dark:bg-red-400'
                    : staleStatus === 'yellow'
                    ? 'bg-amber-500 dark:bg-amber-400'
                    : 'bg-emerald-500 dark:bg-emerald-400'
                }`}
              />
              {staleStatus === 'red' ? 'Stale' : staleStatus === 'yellow' ? 'Warning' : 'Fresh'}
            </span>
          )}
        </div>

        {task.description && (
          <p className="mt-1 line-clamp-2 text-[11px] text-zinc-500 dark:text-zinc-400">
            {task.description}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-2 text-[10px] text-zinc-500 dark:border-zinc-800/80 dark:text-zinc-400">
          <div>
            {task.due_date ? (
              <span className="flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
                📅 {new Date(task.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
              </span>
            ) : (
              <span>Tanpa tenggat</span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {!isAssignedToMe && (
              <button
                onClick={handleAssignSelf}
                disabled={loading}
                className="hidden rounded bg-indigo-50 px-1.5 py-0.5 font-medium text-indigo-600 hover:bg-indigo-100 group-hover:block dark:bg-indigo-950 dark:text-indigo-400 dark:hover:bg-indigo-900 transition"
                title="Assign task ini ke saya"
              >
                +Saya
              </button>
            )}

            <div
              title={`Assignee: ${assigneeName}`}
              className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white ${
                task.assignee_id ? 'bg-indigo-600' : 'bg-zinc-300 dark:bg-zinc-700'
              }`}
            >
              {task.assignee_id ? assigneeInitial : '?'}
            </div>
          </div>
        </div>
      </div>

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
