'use client'

import { useState, useEffect, useSyncExternalStore } from 'react'
import { createClient } from '@/lib/supabase/client'
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
  task_number?: number
  priority?: string
  category?: string | null
  phase?: string | null
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
      className={`w-72 sm:w-80 flex-shrink-0 rounded-xl bg-[#2C2C30] p-3 flex flex-col justify-between transition-all duration-200 ${
        isOver ? 'bg-[#34343a]' : ''
      }`}
    >
      <div>
        <div className="flex items-center justify-between pb-2 mb-2.5 px-1">
          <div className="flex-1">
            <ColumnHeader column={column} />
          </div>
          <span className="rounded-full bg-zinc-800/80 px-2 py-0.5 text-[10px] font-bold text-zinc-400 font-mono">
            {tasks.length}
          </span>
        </div>

        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2.5 min-h-[140px]">
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
              <div className="min-h-[100px] flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-800 p-4 text-center text-xs text-zinc-500 bg-[#1c1c24]/50">
                <span className="font-semibold text-zinc-400 text-xs">Kolom Kosong</span>
                <span className="text-[10px] text-zinc-500 mt-0.5">Tarik task ke sini</span>
              </div>
            )}

          </div>
        </SortableContext>
      </div>

      <div className="mt-3 pt-2">
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
  const [columns, setColumns] = useState<Column[]>(initialColumns)
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [previousTasksState, setPreviousTasksState] = useState<Task[]>(initialTasks)
  const [, setTick] = useState(0)

  // Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterPhase, setFilterPhase] = useState<string>('all')
  const [filterAssignee, setFilterAssignee] = useState<string>('all')

  // Extract unique categories & phases from current tasks
  const availableCategories = Array.from(
    new Set(tasks.map((t) => t.category).filter((c): c is string => !!c && c.trim() !== ''))
  ).sort()

  const availablePhases = Array.from(
    new Set(tasks.map((t) => t.phase).filter((p): p is string => !!p && p.trim() !== ''))
  ).sort()

  // Filtered tasks calculation
  const filteredTasks = tasks.filter((t) => {
    // Search query (title or description or task number)
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase()
      const matchTitle = t.title.toLowerCase().includes(q)
      const matchDesc = t.description?.toLowerCase().includes(q)
      const matchNum = t.task_number?.toString() === q || `#${t.task_number}` === q
      if (!matchTitle && !matchDesc && !matchNum) return false
    }

    // Priority filter
    if (filterPriority !== 'all') {
      const taskP = (t.priority || 'P2').toUpperCase()
      const normalizedP =
        taskP === 'URGENT' ? 'P0' : taskP === 'HIGH' ? 'P1' : taskP === 'LOW' ? 'P3' : taskP === 'MEDIUM' ? 'P2' : taskP
      if (normalizedP !== filterPriority) return false
    }

    // Category filter
    if (filterCategory !== 'all') {
      if ((t.category || '').toLowerCase() !== filterCategory.toLowerCase()) return false
    }

    // Phase filter
    if (filterPhase !== 'all') {
      if ((t.phase || '').toLowerCase() !== filterPhase.toLowerCase()) return false
    }

    // Assignee filter
    if (filterAssignee !== 'all') {
      if (filterAssignee === 'unassigned') {
        if (t.assignee_id) return false
      } else if (filterAssignee === 'me') {
        if (t.assignee_id !== currentUserId) return false
      } else if (t.assignee_id !== filterAssignee) {
        return false
      }
    }

    return true
  })

  // Track props update for initialColumns
  const [prevInitialColumns, setPrevInitialColumns] = useState(initialColumns)
  if (prevInitialColumns !== initialColumns) {
    setPrevInitialColumns(initialColumns)
    setColumns(initialColumns)
  }

  // Interval timer (setiap 30 detik) untuk update badge stale secara otomatis
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1)
    }, 30000)
    return () => clearInterval(timer)
  }, [])

  // Realtime subscription for board tasks & columns
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`board-realtime:${boardId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `board_id=eq.${boardId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newTask = payload.new as Task
            const assigneeMember = members.find((m) => m.user_id === newTask.assignee_id)
            const taskWithProfile: Task = {
              ...newTask,
              profiles: assigneeMember?.profiles || null,
            }
            setTasks((prev) => {
              if (prev.some((t) => t.id === newTask.id)) return prev
              return [...prev, taskWithProfile]
            })
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Partial<Task> & { id: string }
            const assigneeId = updated.assignee_id
            const assigneeMember = assigneeId ? members.find((m) => m.user_id === assigneeId) : undefined
            setTasks((prev) =>
              prev.map((t) =>
                t.id === updated.id
                  ? {
                      ...t,
                      ...updated,
                      profiles: assigneeMember !== undefined ? (assigneeMember?.profiles || null) : t.profiles,
                    }
                  : t
              )
            )
          } else if (payload.eventType === 'DELETE') {
            const oldId = payload.old.id
            setTasks((prev) => prev.filter((t) => t.id !== oldId))
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'columns',
          filter: `board_id=eq.${boardId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newCol = payload.new as Column
            setColumns((prev) => {
              if (prev.some((c) => c.id === newCol.id)) return prev
              return [...prev, newCol].sort((a, b) => a.position - b.position)
            })
          } else if (payload.eventType === 'UPDATE') {
            const updatedCol = payload.new as Column
            setColumns((prev) =>
              prev
                .map((c) => (c.id === updatedCol.id ? updatedCol : c))
                .sort((a, b) => a.position - b.position)
            )
          } else if (payload.eventType === 'DELETE') {
            const oldId = payload.old.id
            setColumns((prev) => prev.filter((c) => c.id !== oldId))
          }
        }
      )
      .subscribe((status, err) => {
        console.log(`[Realtime Board ${boardId}] Status:`, status, err || '')
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [boardId, members])
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
    const overColumnId = columns.some((c) => c.id === overId)
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

    const targetColumnId = columns.some((c) => c.id === overId)
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
      <div className="flex gap-6 items-start pr-6 sm:pr-10 pb-4">
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
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-amber-500 inline shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            Anda sedang dalam mode Offline. Interaksi board dibatasi sementara.
          </span>
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

      {/* Interactive Filter Toolbar (Pinned Top, Not Horizontally Scrolled) */}
      <div className="px-4 sm:px-8 pt-4 sm:pt-6 shrink-0 w-full">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#232328] p-3 sm:p-4 rounded-xl border border-zinc-800/80">
          <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
            {/* Keyword Search Input */}
            <div className="relative min-w-[180px] max-w-xs flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-zinc-500">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari task / #nomor..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-[#18181b] border border-zinc-700/80 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-zinc-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Priority Filter */}
            <div className="relative">
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="appearance-none text-xs py-1.5 pl-2.5 pr-8 rounded-lg bg-[#18181b] border border-zinc-700/80 text-zinc-200 focus:outline-none focus:border-indigo-500 font-medium cursor-pointer"
              >
                <option value="all">Semua Prioritas</option>
                <option value="P0">P0 - Blocker</option>
                <option value="P1">P1 - High</option>
                <option value="P2">P2 - Medium</option>
                <option value="P3">P3 - Low</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-zinc-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="appearance-none text-xs py-1.5 pl-2.5 pr-8 rounded-lg bg-[#18181b] border border-zinc-700/80 text-zinc-200 focus:outline-none focus:border-indigo-500 font-medium cursor-pointer"
              >
                <option value="all">Semua Kategori</option>
                {availableCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-zinc-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Phase Filter */}
            <div className="relative">
              <select
                value={filterPhase}
                onChange={(e) => setFilterPhase(e.target.value)}
                className="appearance-none text-xs py-1.5 pl-2.5 pr-8 rounded-lg bg-[#18181b] border border-zinc-700/80 text-zinc-200 focus:outline-none focus:border-indigo-500 font-medium cursor-pointer"
              >
                <option value="all">Semua Fase</option>
                {availablePhases.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-zinc-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Assignee Filter */}
            <div className="relative">
              <select
                value={filterAssignee}
                onChange={(e) => setFilterAssignee(e.target.value)}
                className="appearance-none text-xs py-1.5 pl-2.5 pr-8 rounded-lg bg-[#18181b] border border-zinc-700/80 text-zinc-200 focus:outline-none focus:border-indigo-500 font-medium cursor-pointer"
              >
                <option value="all">Semua Assignee</option>
                <option value="me">Ditugaskan ke Saya</option>
                <option value="unassigned">Belum Ditugaskan</option>
                {members.map((m) => (
                  <option key={m.id} value={m.user_id || ''}>
                    {m.profiles?.full_name || 'User'}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-zinc-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Reset Filters */}
            {(searchQuery || filterPriority !== 'all' || filterCategory !== 'all' || filterPhase !== 'all' || filterAssignee !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setFilterPriority('all')
                  setFilterCategory('all')
                  setFilterPhase('all')
                  setFilterAssignee('all')
                }}
                className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 px-2 py-1 rounded hover:bg-rose-950/40 transition"
              >
                Reset Filter
              </button>
            )}
          </div>

          <div className="text-[11px] text-zinc-400 font-mono">
            Menampilkan <span className="font-bold text-white">{filteredTasks.length}</span> dari {tasks.length} task
          </div>
        </div>
      </div>

      {/* Kanban Board Columns (Scrollable Independently) */}
      <div className="flex-1 overflow-x-auto px-4 sm:px-8 py-4 min-h-0">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 items-start pr-6 sm:pr-10 pb-4">
            {columns.map((col) => {
              const colTasks = filteredTasks.filter((t) => t.column_id === col.id)
              return (
                <ColumnContainer
                  key={col.id}
                  column={col}
                  tasks={colTasks}
                  columns={columns}
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
                  columns={columns}
                  members={members}
                  currentUserId={currentUserId}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}
