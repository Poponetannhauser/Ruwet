'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

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
  const [nowMs] = useState(() => Date.now())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  if (!isOpen || !mounted) return null

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

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl my-auto max-h-[85vh] overflow-y-auto rounded-xl bg-[#22222a] p-5 sm:p-6 shadow-2xl border border-zinc-800/80">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              Ringkasan Board
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Statistik & analisis data aktual untuk board <strong>{boardName}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-6">
          {/* Card Statistik Utama */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-zinc-500 bg-[#22222a] p-3.5 text-center">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total Task</span>
              <p className="text-2xl font-black text-white mt-1">{totalTasks}</p>
            </div>
            <div className="rounded-xl border border-emerald-800/40 bg-emerald-950/20 p-3.5 text-center">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Selesai (Done)</span>
              <p className="text-2xl font-black text-emerald-400 mt-1">{completedTasks}</p>
            </div>
            <div className="rounded-xl border border-rose-800/40 bg-rose-950/20 p-3.5 text-center">
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Overdue</span>
              <p className="text-2xl font-black text-rose-400 mt-1">{overdueTasks}</p>
            </div>
            <div className="rounded-xl border border-amber-800/40 bg-amber-950/20 p-3.5 text-center">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Stale / Macet</span>
              <p className="text-2xl font-black text-amber-400 mt-1">{staleTasks}</p>
            </div>
          </div>

          {/* Perhitungan Task per Kolom / Status */}
          <div>
            <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6h.008v.008H6V6z" />
              </svg>
              Distribusi Task per Kolom
            </h4>
            <div className="space-y-3">
              {columnStats.map((col) => (
                <div key={col.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-zinc-300">
                      {col.name}
                    </span>
                    <span className="text-zinc-400 font-bold">
                      {col.count} task ({col.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300 rounded-full"
                      style={{ width: `${col.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Perhitungan Overdue & Beban per Anggota */}
          <div>
            <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              Beban Kerja & Task Overdue Anggota
            </h4>

            <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-800/60 dark:text-zinc-400">
                  <tr>
                    <th className="p-2.5 font-semibold">Anggota Tim</th>
                    <th className="p-2.5 font-semibold text-center">Total Assigned</th>
                    <th className="p-2.5 font-semibold text-center">Selesai</th>
                    <th className="p-2.5 font-semibold text-center">
                      <span className="inline-flex items-center justify-center gap-1">
                        Overdue
                        <svg className="w-3.5 h-3.5 text-amber-500 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                      </span>
                    </th>
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
    </div>,
    document.body
  )
}
