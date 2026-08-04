'use client'

import { useState } from 'react'
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
}

export function TaskCard({ task, columns, members, currentUserId }: TaskCardProps) {
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
        className="group relative cursor-grab active:cursor-grabbing rounded-lg border border-zinc-200 bg-white p-3 shadow-sm hover:border-indigo-400 hover:shadow transition dark:border-zinc-800 dark:bg-zinc-900/90 dark:hover:border-indigo-600"
      >
        <h4 className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
          {task.title}
        </h4>

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
