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
  const taskIdShort = `TS-${task.id.slice(0, 4).toUpperCase()}`

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

    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    let elapsedText = ''
    if (diffDays > 0) {
      elapsedText = `${diffDays}d`
    } else if (diffHours > 0) {
      elapsedText = `${diffHours}h`
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
      staleLabel = `Fresh (${elapsedText})`
    }
  }

  // Border color based on status according to DESIGN.md
  let borderLeftColor = 'border-l-[#5b4df6]'
  if (staleStatus === 'red') borderLeftColor = 'border-l-[#ba1a1a]'
  else if (staleStatus === 'yellow') borderLeftColor = 'border-l-[#724900]'
  else if (staleStatus === 'green') borderLeftColor = 'border-l-[#006c47]'

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
        className={`group relative cursor-grab active:cursor-grabbing touch-manipulation rounded-lg border-t border-r border-b border-[#e1e2e6] border-l-4 ${borderLeftColor} bg-white p-3.5 shadow-level-1 hover:shadow-level-2 hover:border-[#5b4df6] focus:ring-2 focus:ring-[#5b4df6] focus:outline-none transition-all duration-150`}
      >
        {/* Header row: ID + Status Pill */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="font-data-mono text-[11px] font-semibold text-[#777587]">
            {taskIdShort}
          </span>

          {staleStatus && (
            <span
              title={`Status aktivitas: ${staleLabel}`}
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                staleStatus === 'red'
                  ? 'bg-[#ffdad6] text-[#ba1a1a]'
                  : staleStatus === 'yellow'
                  ? 'bg-[#fff4e5] text-[#724900]'
                  : 'bg-[#e6f7f0] text-[#006c47]'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  staleStatus === 'red'
                    ? 'bg-[#ba1a1a]'
                    : staleStatus === 'yellow'
                    ? 'bg-[#724900]'
                    : 'bg-[#006c47]'
                }`}
              />
              {staleStatus === 'red' ? 'Stale' : staleStatus === 'yellow' ? 'Warning' : 'Fresh'}
            </span>
          )}
        </div>

        {/* Task Title */}
        <h4 className="font-sans font-semibold text-sm text-[#191c1f] group-hover:text-[#5b4df6] transition leading-snug">
          {task.title}
        </h4>

        {/* Task Description */}
        {task.description && (
          <p className="mt-1 line-clamp-2 text-xs text-[#464556]">
            {task.description}
          </p>
        )}

        {/* Footer: Due date + Assignee */}
        <div className="mt-3.5 flex items-center justify-between border-t border-[#f2f3f7] pt-2.5 text-xs text-[#777587]">
          <div>
            {task.due_date ? (
              <span className="flex items-center gap-1 font-data-mono text-[11px] text-[#724900]">
                📅 {new Date(task.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
              </span>
            ) : (
              <span className="text-[11px]">No due date</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isAssignedToMe && (
              <button
                onClick={handleAssignSelf}
                disabled={loading}
                className="hidden rounded bg-[#ebe7ff] px-2 py-0.5 text-[11px] font-semibold text-[#5b4df6] hover:bg-[#5b4df6] hover:text-white group-hover:block transition"
                title="Assign task ini ke saya"
              >
                +Me
              </button>
            )}

            <div
              title={`Assignee: ${assigneeName}`}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-xs ${
                task.assignee_id ? 'bg-[#5b4df6]' : 'bg-[#c7c4d8]'
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
