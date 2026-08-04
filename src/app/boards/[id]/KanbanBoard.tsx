'use client'

import { useState, useSyncExternalStore } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { ColumnHeader } from './ColumnHeader'
import { AddColumnButton } from './AddColumnButton'
import { CreateTaskModal } from './CreateTaskModal'
import { TaskCard } from './TaskCard'
import { moveTask } from './taskActions'

type Member = {
  id: string
  user_id?: string
  role: string
  profiles: {
    full_name: string
    avatar_url: string | null
  } | null
}

type Column = {
  id: string
  name: string
  position: number
  board_id: string
}

type Task = {
  id: string
  board_id: string
  column_id: string
  title: string
  description: string | null
  assignee_id: string | null
  due_date: string | null
  position: number
  profiles: {
    full_name: string
    avatar_url: string | null
  } | null
}

type KanbanBoardProps = {
  boardId: string
  initialColumns: Column[]
  initialTasks: Task[]
  members: Member[]
  currentUserId: string
}

function ColumnContainer({
  column,
  tasks,
  columns,
  members,
  currentUserId,
}: {
  column: Column
  tasks: Task[]
  columns: Column[]
  members: Member[]
  currentUserId: string
}) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  })

  const taskIds = tasks.map((t) => t.id)

  return (
    <div
      ref={setNodeRef}
      className="w-72 flex-shrink-0 rounded-xl bg-zinc-200/70 p-4 dark:bg-zinc-900 border border-zinc-300/50 dark:border-zinc-800"
    >
      <ColumnHeader column={column} />

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2.5 min-h-[150px]">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                columns={columns}
                members={members}
                currentUserId={currentUserId}
              />
            ))
          ) : (
            <div className="min-h-[100px] flex items-center justify-center rounded-lg border border-dashed border-zinc-300 dark:border-zinc-800 text-xs text-zinc-400">
              Belum ada task
            </div>
          )}
        </div>
      </SortableContext>

      <CreateTaskModal
        boardId={column.board_id}
        columnId={column.id}
        columnName={column.name}
        members={members}
      />
    </div>
  )
}

const emptySubscribe = () => () => {}

export function KanbanBoard({
  boardId,
  initialColumns,
  initialTasks,
  members,
  currentUserId,
}: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [previousTasksState, setPreviousTasksState] = useState<Task[]>(initialTasks)
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  )

  function findColumnOfTask(taskId: string) {
    const task = tasks.find((t) => t.id === taskId)
    return task ? task.column_id : null
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event
    const task = tasks.find((t) => t.id === active.id)
    if (task) {
      setActiveTask(task)
      // Simpan snapshot keadaan sebelum di-drag (untuk rollback jika koneksi terputus/gagal)
      setPreviousTasksState([...tasks])
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeColumnId = findColumnOfTask(activeId)
    // `over` bisa berupa task id lain atau column id
    const overColumnId = initialColumns.some((c) => c.id === overId)
      ? overId
      : findColumnOfTask(overId)

    if (!activeColumnId || !overColumnId || activeColumnId === overColumnId) {
      return
    }

    setTasks((prevTasks) => {
      const activeIndex = prevTasks.findIndex((t) => t.id === activeId)
      if (activeIndex === -1) return prevTasks

      const updated = [...prevTasks]
      updated[activeIndex] = {
        ...updated[activeIndex],
        column_id: overColumnId,
      }
      return updated
    })
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const currentTaskState = tasks.find((t) => t.id === activeId)
    const originalTask = initialTasks.find((t) => t.id === activeId)

    if (!currentTaskState || !originalTask) return

    const targetColumnId = initialColumns.some((c) => c.id === overId)
      ? overId
      : findColumnOfTask(overId) || currentTaskState.column_id

    const columnTasks = tasks.filter((t) => t.column_id === targetColumnId)
    const oldIndex = columnTasks.findIndex((t) => t.id === activeId)
    const newIndex = columnTasks.findIndex((t) => t.id === overId)

    let reorderedTasks = columnTasks
    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
      reorderedTasks = arrayMove(columnTasks, oldIndex, newIndex)
    }

    const finalPosition = reorderedTasks.findIndex((t) => t.id === activeId) + 1
    const isColumnChanged = originalTask.column_id !== targetColumnId

    // 2. Perform DB update with try-catch rollback
    try {
      const result = await moveTask(
        activeId,
        boardId,
        targetColumnId,
        finalPosition,
        isColumnChanged
      )

      if (result && result.error) {
        setTasks(previousTasksState)
        alert(`Gagal memindahkan task: ${result.error}`)
      }
    } catch {
      // Direct network error / fetch failure during offline mode
      setTasks(previousTasksState)
      alert('Koneksi terputus! Perubahan posisi task dibatalkan (rollback).')
    }
  }

  if (!isMounted) {
    return (
      <div className="flex gap-6 items-start">
        {initialColumns.map((col) => {
          const colTasks = tasks.filter((t) => t.column_id === col.id)
          return (
            <ColumnContainer
              key={col.id}
              column={col}
              tasks={colTasks}
              columns={initialColumns}
              members={members}
              currentUserId={currentUserId}
            />
          )
        })}
        <AddColumnButton boardId={boardId} />
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 items-start">
        {initialColumns.map((col) => {
          const colTasks = tasks.filter((t) => t.column_id === col.id)
          return (
            <ColumnContainer
              key={col.id}
              column={col}
              tasks={colTasks}
              columns={initialColumns}
              members={members}
              currentUserId={currentUserId}
            />
          )
        })}
        <AddColumnButton boardId={boardId} />
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="opacity-80 rotate-2 scale-105 shadow-2xl">
            <TaskCard
              task={activeTask}
              columns={initialColumns}
              members={members}
              currentUserId={currentUserId}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
