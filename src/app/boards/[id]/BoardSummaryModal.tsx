'use client'

import { useSyncExternalStore } from 'react'

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
}

type Task = {
  id: string
  board_id: string
  column_id: string
  title: string
  assignee_id: string | null
  due_date: string | null
  status_updated_at?: string | null
  profiles?: {
    full_name: string
    avatar_url: string | null
  } | null
}

type BoardSummaryModalProps = {
  boardName: string
  staleThresholdHours?: number
  columns: Column[]
  tasks: Task[]
  members: Member[]
  isOpen: boolean
  onClose: () => void
}

export function BoardSummaryModal({
  boardName,
  staleThresholdHours = 48,
  columns,
  tasks,
  members,
  isOpen,
  onClose,
}: BoardSummaryModalProps) {
  const nowMs = useSyncExternalStore(
    () => () => {},
    () => Date.now(),
    () => 0
  )

  if (!isOpen) return null

  const todayStr = new Date().toISOString().split('T')[0]

  // 1. Total & Overdue Overall
  const totalTasks = tasks.length

  // Identifikasi kolom "Done"
  const doneColumn = columns.find(
    (c) => c.name.trim().toLowerCase() === 'done'
  )
  const doneColumnId = doneColumn?.id

  const completedTasks = doneColumnId
    ? tasks.filter((t) => t.column_id === doneColumnId).length
    : 0

  const overdueTasks = tasks.filter((t) => {
    if (t.column_id === doneColumnId) return false
    if (!t.due_date) return false
    const dueStr = t.due_date.split('T')[0]
    return dueStr < todayStr
  }).length

  // Hitung Stale Tasks
  const staleTasks = tasks.filter((t) => {
    if (t.column_id === doneColumnId) return false
    if (!t.assignee_id || !t.status_updated_at) return false
    const updatedMs = new Date(t.status_updated_at).getTime()
    const diffMs = nowMs - updatedMs
    const thresholdMs = staleThresholdHours * 60 * 60 * 1000
    return diffMs > thresholdMs
  }).length

  // 2. Hitung jumlah task per status / kolom
  const columnStats = columns.map((col) => {
    const count = tasks.filter((t) => t.column_id === col.id).length
    const percentage = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0
    return {
      ...col,
      count,
      percentage,
    }
  })

  // 3. Hitung beban & task overdue per anggota
  const memberStats = members.map((mem) => {
    const memUserId = mem.user_id || mem.id
    const assignedTasks = tasks.filter((t) => t.assignee_id === memUserId)

    const memOverdue = assignedTasks.filter((t) => {
      if (t.column_id === doneColumnId) return false
      if (!t.due_date) return false
      const dueStr = t.due_date.split('T')[0]
      return dueStr < todayStr
    }).length

    const memCompleted = doneColumnId
      ? assignedTasks.filter((t) => t.column_id === doneColumnId).length
      : 0

    return {
      id: mem.id,
      name: mem.profiles?.full_name || 'User',
      role: mem.role,
      totalAssigned: assignedTasks.length,
      completed: memCompleted,
      overdue: memOverdue,
    }
  })

  // Unassigned tasks
  const unassignedCount = tasks.filter((t) => !t.assignee_id).length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              📊 Ringkasan Board
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Statistik & analisis data aktual untuk board <strong>{boardName}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-6">
          {/* Card Statistik Utama */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-3 text-center dark:border-zinc-800 dark:bg-zinc-800/30">
              <span className="text-[10px] font-semibold text-zinc-500 uppercase">Total Task</span>
              <p className="text-xl font-bold text-zinc-900 dark:text-white mt-1">{totalTasks}</p>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-3 text-center dark:border-emerald-900/50 dark:bg-emerald-950/20">
              <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase">Selesai (Done)</span>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{completedTasks}</p>
            </div>
            <div className="rounded-lg border border-red-200 bg-red-50/40 p-3 text-center dark:border-red-900/50 dark:bg-red-950/20">
              <span className="text-[10px] font-semibold text-red-700 dark:text-red-400 uppercase">Overdue</span>
              <p className="text-xl font-bold text-red-600 dark:text-red-400 mt-1">{overdueTasks}</p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50/40 p-3 text-center dark:border-amber-900/50 dark:bg-amber-950/20">
              <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 uppercase">Stale / Macet</span>
              <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">{staleTasks}</p>
            </div>
          </div>

          {/* Perhitungan Task per Kolom / Status */}
          <div>
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-3">
              📌 Distribusi Task per Kolom
            </h4>
            <div className="space-y-3">
              {columnStats.map((col) => (
                <div key={col.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      {col.name}
                    </span>
                    <span className="text-zinc-500 font-semibold">
                      {col.count} task ({col.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-300"
                      style={{ width: `${col.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Perhitungan Overdue & Beban per Anggota */}
          <div>
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-3">
              👥 Beban Kerja & Task Overdue Anggota
            </h4>
            <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-800/60 dark:text-zinc-400">
                  <tr>
                    <th className="p-2.5 font-semibold">Anggota Tim</th>
                    <th className="p-2.5 font-semibold text-center">Total Assigned</th>
                    <th className="p-2.5 font-semibold text-center">Selesai</th>
                    <th className="p-2.5 font-semibold text-center">Overdue ⚠️</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {memberStats.map((m) => (
                    <tr key={m.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                      <td className="p-2.5 font-medium text-zinc-900 dark:text-zinc-100">
                        {m.name} <span className="text-[10px] text-zinc-400">({m.role})</span>
                      </td>
                      <td className="p-2.5 text-center font-semibold text-zinc-700 dark:text-zinc-300">
                        {m.totalAssigned}
                      </td>
                      <td className="p-2.5 text-center font-semibold text-emerald-600 dark:text-emerald-400">
                        {m.completed}
                      </td>
                      <td className="p-2.5 text-center font-bold text-red-600 dark:text-red-400">
                        {m.overdue > 0 ? `${m.overdue}` : '0'}
                      </td>
                    </tr>
                  ))}
                  {unassignedCount > 0 && (
                    <tr className="bg-zinc-50/30 dark:bg-zinc-900/40">
                      <td className="p-2.5 font-medium text-zinc-500 italic">
                        Unassigned (Belum di-assign)
                      </td>
                      <td className="p-2.5 text-center font-semibold text-zinc-500">
                        {unassignedCount}
                      </td>
                      <td className="p-2.5 text-center text-zinc-400">-</td>
                      <td className="p-2.5 text-center text-zinc-400">-</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}
