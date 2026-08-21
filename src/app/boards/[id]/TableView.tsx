'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { deleteBatchTasks, moveBatchTasks } from './taskActions'
import { EditTaskModal } from './EditTaskModal'
import {
  getColumnBadgeStyle,
  getCategoryBadgeStyle,
  getPhaseBadgeStyle,
} from './boardColors'

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

type TableViewProps = {
  tasks: Task[]
  columns: Column[]
  members: Member[]
  boardId: string
}

function CustomCheckbox({
  checked,
  onChange,
  ariaLabel,
  indeterminate = false,
}: {
  checked: boolean
  onChange: () => void
  ariaLabel?: string
  indeterminate?: boolean
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? 'mixed' : checked}
      aria-label={ariaLabel}
      onClick={(e) => {
        e.stopPropagation()
        onChange()
      }}
      className={`relative inline-flex items-center justify-center w-4 h-4 rounded-md border transition-all duration-150 cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
        checked || indeterminate
          ? 'bg-indigo-600 border-indigo-500 text-white shadow-xs shadow-indigo-950/60'
          : 'bg-zinc-900/90 border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800'
      }`}
    >
      {checked && (
        <svg
          className="w-2.5 h-2.5 stroke-current stroke-[3]"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      )}
      {indeterminate && !checked && (
        <span className="w-2 h-0.5 bg-white rounded-full" />
      )}
    </button>
  )
}

export function TableView({
  tasks,
  columns,
  members,
  boardId,
}: TableViewProps) {
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set())
  const [activeEditTask, setActiveEditTask] = useState<Task | null>(null)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false)
  const [bulkMoveColumnId, setBulkMoveColumnId] = useState('')
  const [isBulkMoving, setIsBulkMoving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Map column names
  const columnMap = useMemo(() => {
    const map = new Map<string, string>()
    columns.forEach((c) => map.set(c.id, c.name))
    return map
  }, [columns])

  // Select all / Deselect all
  const isAllSelected =
    tasks.length > 0 && tasks.every((t) => selectedTaskIds.has(t.id))
  const isIndeterminate = selectedTaskIds.size > 0 && !isAllSelected

  function toggleSelectAll() {
    if (isAllSelected) {
      setSelectedTaskIds(new Set())
    } else {
      const allIds = new Set(tasks.map((t) => t.id))
      setSelectedTaskIds(allIds)
    }
  }

  function toggleSelectTask(id: string) {
    setSelectedTaskIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  async function handleBulkDelete() {
    if (selectedTaskIds.size === 0) return
    setIsBulkDeleting(true)
    setError(null)

    const ids = Array.from(selectedTaskIds)
    const res = await deleteBatchTasks(ids, boardId)

    if (res.error) {
      setError(res.error)
      setIsBulkDeleting(false)
      setIsConfirmDeleteOpen(false)
    } else {
      setSelectedTaskIds(new Set())
      setIsBulkDeleting(false)
      setIsConfirmDeleteOpen(false)
    }
  }

  async function handleBulkMove(targetColumnId: string) {
    if (selectedTaskIds.size === 0 || !targetColumnId) return
    setIsBulkMoving(true)
    setError(null)

    const ids = Array.from(selectedTaskIds)
    const res = await moveBatchTasks(ids, boardId, targetColumnId)

    if (res.error) {
      setError(res.error)
      setIsBulkMoving(false)
    } else {
      setSelectedTaskIds(new Set())
      setIsBulkMoving(false)
      setBulkMoveColumnId('')
    }
  }

  function getPriorityBadge(priority?: string) {
    switch (priority) {
      case 'P0':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/25 font-mono shadow-2xs">
            P0
          </span>
        )
      case 'P1':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/25 font-mono shadow-2xs">
            P1
          </span>
        )
      case 'P2':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-sky-500/10 text-sky-400 border border-sky-500/25 font-mono shadow-2xs">
            P2
          </span>
        )
      case 'P3':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-800/70 text-zinc-400 border border-zinc-700/50 font-mono shadow-2xs">
            P3
          </span>
        )
      default:
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-800/70 text-zinc-400 border border-zinc-700/50 font-mono shadow-2xs">
            P2
          </span>
        )
    }
  }

  return (
    <div className="flex flex-col h-full space-y-3 pb-16">
      {error && (
        <div className="rounded-lg bg-rose-950/40 border border-rose-800/40 p-3 text-xs text-rose-300 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Table Container */}
      <div className="flex-1 overflow-auto rounded-xl border border-zinc-800/80 bg-[#1A1A1E] shadow-inner max-h-[calc(100vh-210px)]">
        <table className="w-full border-collapse text-left text-xs text-zinc-300 min-w-max">
          <thead className="sticky top-0 z-20 bg-[#25252b] border-b border-zinc-700/80 shadow-xs">
            <tr>
              <th className="py-2.5 px-3 w-10 text-center border-r border-zinc-800">
                <div className="flex items-center justify-center">
                  <CustomCheckbox
                    checked={isAllSelected}
                    indeterminate={isIndeterminate}
                    onChange={toggleSelectAll}
                    ariaLabel="Pilih semua task"
                  />
                </div>
              </th>
              <th className="py-2.5 px-3 font-bold text-zinc-200 text-xs border-r border-zinc-800 w-16 text-center">
                #
              </th>
              <th className="py-2.5 px-3.5 font-bold text-zinc-100 text-xs border-r border-zinc-800 min-w-[240px]">
                Judul Task
              </th>
              <th className="py-2.5 px-3 font-bold text-zinc-200 text-xs border-r border-zinc-800 w-36">
                Status / Kolom
              </th>
              <th className="py-2.5 px-3 font-bold text-zinc-200 text-xs border-r border-zinc-800 w-24 text-center">
                Prioritas
              </th>
              <th className="py-2.5 px-3.5 font-bold text-zinc-200 text-xs border-r border-zinc-800 min-w-[140px]">
                Assignee
              </th>
              <th className="py-2.5 px-3 font-bold text-zinc-200 text-xs border-r border-zinc-800 min-w-[110px]">
                Kategori
              </th>
              <th className="py-2.5 px-3 font-bold text-zinc-200 text-xs border-r border-zinc-800 min-w-[110px]">
                Fase
              </th>
              <th className="py-2.5 px-3 font-bold text-zinc-200 text-xs border-r border-zinc-800 min-w-[110px]">
                Tenggat
              </th>
              <th className="py-2.5 px-3 font-bold text-zinc-200 text-xs text-center w-16">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 text-[11px]">
            {tasks.length > 0 ? (
              tasks.map((task, idx) => {
                const isSelected = selectedTaskIds.has(task.id)
                const columnName = columnMap.get(task.column_id) || 'Kolom'

                return (
                  <tr
                    key={task.id}
                    className={`transition-colors ${
                      isSelected
                        ? 'bg-indigo-950/40 hover:bg-indigo-950/60'
                        : 'odd:bg-[#1A1A1E] even:bg-[#1f1f25]/70 hover:bg-[#282830]'
                    }`}
                  >
                    <td className="py-2 px-3 text-center border-r border-zinc-800/80">
                      <div className="flex items-center justify-center">
                        <CustomCheckbox
                          checked={isSelected}
                          onChange={() => toggleSelectTask(task.id)}
                          ariaLabel={`Pilih task ${task.title}`}
                        />
                      </div>
                    </td>
                    <td className="py-2 px-3 text-center text-zinc-500 font-mono border-r border-zinc-800/80">
                      {task.task_number ? `#${task.task_number}` : idx + 1}
                    </td>
                    <td className="py-2 px-3.5 border-r border-zinc-800/80 max-w-sm">
                      <button
                        type="button"
                        onClick={() => setActiveEditTask(task)}
                        className="text-left font-semibold text-zinc-100 hover:text-indigo-400 transition truncate block w-full"
                        title="Klik untuk melihat / mengedit detail task"
                      >
                        {task.title}
                      </button>
                      {task.description && (
                        <p className="text-[10px] text-zinc-500 truncate max-w-xs mt-0.5">
                          {task.description}
                        </p>
                      )}
                    </td>
                    <td className="py-2 px-3 border-r border-zinc-800/80">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border truncate max-w-[130px] shadow-2xs ${getColumnBadgeStyle(
                          columnName
                        )}`}
                      >
                        {columnName}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center border-r border-zinc-800/80">
                      {getPriorityBadge(task.priority)}
                    </td>
                    <td className="py-2 px-3.5 border-r border-zinc-800/80">
                      {task.profiles ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-[9px] font-bold text-white uppercase border border-indigo-400/40">
                            {task.profiles.full_name.charAt(0)}
                          </div>
                          <span className="truncate max-w-[100px] text-zinc-300 font-medium">
                            {task.profiles.full_name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-zinc-600 italic">-</span>
                      )}
                    </td>
                    <td className="py-2 px-3 border-r border-zinc-800/80">
                      {task.category ? (
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium border truncate max-w-[110px] ${getCategoryBadgeStyle(
                            task.category
                          )}`}
                          title={task.category}
                        >
                          {task.category}
                        </span>
                      ) : (
                        <span className="text-zinc-600 italic">-</span>
                      )}
                    </td>
                    <td className="py-2 px-3 border-r border-zinc-800/80">
                      {task.phase ? (
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium border truncate max-w-[110px] ${getPhaseBadgeStyle(
                            task.phase
                          )}`}
                          title={task.phase}
                        >
                          {task.phase}
                        </span>
                      ) : (
                        <span className="text-zinc-600 italic">-</span>
                      )}
                    </td>
                    <td className="py-2 px-3 border-r border-zinc-800/80 font-mono text-zinc-400">
                      {task.due_date ? (
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{task.due_date}</span>
                        </span>
                      ) : (
                        <span className="text-zinc-600 italic">-</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => setActiveEditTask(task)}
                        className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-indigo-300 transition"
                        title="Edit Task"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={10} className="py-12 text-center text-zinc-500 italic text-xs">
                  Tidak ada task yang cocok dengan filter yang dipilih.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Floating Bulk Action Bar */}
      <AnimatePresence>
        {selectedTaskIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#222228]/95 backdrop-blur-md border border-zinc-700/80 shadow-2xl rounded-2xl px-5 py-3 flex items-center gap-4 text-xs"
          >
            <div className="flex items-center gap-2 font-bold text-white">
              <span className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-mono shadow-xs">
                {selectedTaskIds.size}
              </span>
              <span>Task Terpilih</span>
            </div>

            <div className="h-4 w-px bg-zinc-700" />

            {/* Move to Column */}
            <div className="flex items-center gap-2">
              <select
                value={bulkMoveColumnId}
                onChange={(e) => {
                  const target = e.target.value
                  setBulkMoveColumnId(target)
                  if (target) handleBulkMove(target)
                }}
                disabled={isBulkMoving}
                className="rounded-lg bg-zinc-800 border border-zinc-700 px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold cursor-pointer"
              >
                <option value="">Pindah ke Kolom...</option>
                {columns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Bulk Delete */}
            <button
              type="button"
              onClick={() => setIsConfirmDeleteOpen(true)}
              disabled={isBulkDeleting}
              className="rounded-lg bg-rose-950/70 border border-rose-800/60 px-3 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-900/70 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <svg className="w-3.5 h-3.5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
              <span>Hapus ({selectedTaskIds.size})</span>
            </button>

            {/* Cancel selection */}
            <button
              type="button"
              onClick={() => setSelectedTaskIds(new Set())}
              className="text-zinc-400 hover:text-white transition text-xs font-semibold cursor-pointer"
            >
              Batal
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Delete Modal Confirmation */}
      <AnimatePresence>
        {isConfirmDeleteOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-sm rounded-xl bg-[#2C2C30] p-6 shadow-2xl border border-zinc-800"
            >
              <h3 className="text-base font-bold text-white">
                Konfirmasi Hapus {selectedTaskIds.size} Task
              </h3>
              <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                Apakah Anda yakin ingin menghapus <strong>{selectedTaskIds.size} task</strong> yang dipilih secara permanen?
              </p>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsConfirmDeleteOpen(false)}
                  className="rounded-lg border border-zinc-700 px-3.5 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  disabled={isBulkDeleting}
                  className="rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-rose-500 disabled:opacity-50 transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {isBulkDeleting && (
                    <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                  )}
                  <span>{isBulkDeleting ? 'Menghapus...' : 'Ya, Hapus Semua'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Task Modal */}
      {activeEditTask && (
        <EditTaskModal
          task={activeEditTask}
          columns={columns}
          members={members}
          isOpen={!!activeEditTask}
          onClose={() => setActiveEditTask(null)}
        />
      )}
    </div>
  )
}
