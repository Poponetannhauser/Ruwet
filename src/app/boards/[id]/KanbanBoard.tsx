'use client'

import { useState, useEffect, useSyncExternalStore } from 'react'
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
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
  status_updated_at?: string | null
  position: number
  profiles: {
    full_name: string
    avatar_url: string | null
  } | null
}

type KanbanBoardProps = {
  boardId: string
  staleThresholdHours?: number
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
  staleThresholdHours,
}: {
  column: Column
  tasks: Task[]
  columns: Column[]
  members: Member[]
  currentUserId: string
  staleThresholdHours?: number
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  })

  const taskIds = tasks.map((t) => t.id)

  return (
    <div
      ref={setNodeRef}
      className={`w-80 flex-shrink-0 rounded-xl glass-panel p-4 flex flex-col justify-between transition-all duration-200 ${
        isOver ? 'border-indigo-500/80 bg-indigo-950/20 shadow-xl' : ''
      }`}
    >

      <div>
        <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-3">
          <div className="flex-1">
            <ColumnHeader column={column} />
          </div>
          <span className="rounded-full bg-zinc-800/80 border border-white/10 px-2.5 py-0.5 text-[10px] font-extrabold text-zinc-300">
            {tasks.length}
          </span>
        </div>

        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3 min-h-[160px]">
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  columns={columns}
                  members={members}
                  currentUserId={currentUserId}
                  staleThresholdHours={staleThresholdHours}
                />
              ))
            ) : (
              <div className="min-h-[120px] flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 p-5 text-center text-xs text-zinc-500 bg-zinc-900/30">
                <svg className="w-6 h-6 text-zinc-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25-2.25M12 13.875V8.25M3.75 7.5h16.5M6 3.75h12" />
                </svg>
                <span className="font-bold text-zinc-400 text-xs">Kolom Kosong</span>
                <span className="text-[10px] text-zinc-500 mt-0.5">Tarik task ke sini</span>
              </div>
            )}

          </div>
        </SortableContext>
      </div>

      <div className="mt-3 border-t border-white/5 pt-2">
        <CreateTaskModal
          boardId={column.board_id}
          columnId={column.id}
          columnName={column.name}
          members={members}
        />
      </div>
    </div>
  )
}


const emptySubscribe = () => () => {}

export function KanbanBoard({
  boardId,
  staleThresholdHours = 48,
  initialColumns,
  initialTasks,
  members,
  currentUserId,
}: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [previousTasksState, setPreviousTasksState] = useState<Task[]>(initialTasks)
  const [, setTick] = useState(0)

  // Interval timer (setiap 30 detik) untuk update badge stale secara otomatis
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1)
    }, 30000)
    return () => clearInterval(timer)
  }, [])
  // Track online/offline status via useSyncExternalStore
  const isOnline = useSyncExternalStore(
    (callback) => {
      window.addEventListener('online', callback)
      window.addEventListener('offline', callback)
      return () => {
        window.removeEventListener('online', callback)
        window.removeEventListener('offline', callback)
      }
    },
    () => navigator.onLine,
    () => true
  )
  const isOffline = !isOnline
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Track props update
  const [prevInitialTasks, setPrevInitialTasks] = useState(initialTasks)
  if (prevInitialTasks !== initialTasks) {
    setPrevInitialTasks(initialTasks)
    setTasks(initialTasks)
  }

  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function findColumnOfTask(taskId: string) {
    const task = tasks.find((t) => t.id === taskId)
    return task ? task.column_id : null
  }

  function handleDragStart(event: DragStartEvent) {
    if (isOffline || (typeof navigator !== 'undefined' && !navigator.onLine)) {
      setToastMessage('Tidak bisa memindahkan task dalam kondisi offline!')
      return
    }

    const { active } = event
    const task = tasks.find((t) => t.id === active.id)
    if (task) {
      setActiveTask(task)
      // Simpan snapshot keadaan sebelum di-drag (last known good state)
      setPreviousTasksState([...tasks])
    }
  }

  function handleDragOver(event: DragOverEvent) {
    if (isOffline) return

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

    if (isOffline || (typeof navigator !== 'undefined' && !navigator.onLine)) {
      setTasks(previousTasksState)
      setToastMessage('Koneksi terputus! Perubahan posisi task dibatalkan (rollback).')
      return
    }

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

    // Function to run server action with 5s timeout
    const moveTaskWithTimeout = () =>
      Promise.race([
        moveTask(activeId, boardId, targetColumnId, finalPosition, isColumnChanged),
        new Promise<{ error: string }>((_, reject) =>
          setTimeout(() => reject(new Error('Waktu koneksi habis (Timeout 5s)')), 5000)
        ),
      ])

    try {
      const result = await moveTaskWithTimeout()

      if (result && result.error) {
        setTasks(previousTasksState)
        setToastMessage(`Gagal memindahkan task: ${result.error}`)
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Koneksi terputus'
      setTasks(previousTasksState)
      setToastMessage(`${errorMessage}! Perubahan posisi task dibatalkan (rollback).`)
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
    <div className="space-y-4">
      {isOffline && (
        <div className="flex items-center justify-between rounded-lg bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-800 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800">
          <span>⚠️ Anda sedang dalam mode Offline. Interaksi board dibatasi sementara.</span>
        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-xs font-medium text-white shadow-lg transition">
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 font-bold hover:opacity-80"
          >
            ✕
          </button>
        </div>
      )}

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
              staleThresholdHours={staleThresholdHours}
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
    </div>
  )
}
