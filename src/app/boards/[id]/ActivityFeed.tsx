'use client'

import { useEffect, useState } from 'react'
import { getActivityLogs } from './activityActions'

type ActivityLog = {
  id: string
  action_type: string
  detail: Record<string, unknown> | null
  created_at: string
  profiles: {
    full_name: string
    avatar_url: string | null
  } | null
}

export function ActivityFeed({ taskId }: { taskId: string }) {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    async function loadLogs() {
      setLoading(true)
      const res = await getActivityLogs(taskId)
      if (isMounted && res.logs) {
        setLogs(res.logs)
      }
      if (isMounted) {
        setLoading(false)
      }
    }
    loadLogs()
    return () => {
      isMounted = false
    }
  }, [taskId])

  function renderLogText(log: ActivityLog) {
    const userName = log.profiles?.full_name || 'Seseorang'
    const detail = log.detail || {}

    switch (log.action_type) {
      case 'task_created':
        return `${userName} membuat task ini`
      case 'task_assigned':
        return `${userName} mengambil (assign) task ini`
      case 'task_moved':
        return `${userName} memindahkan task ke kolom "${detail.column_name || 'baru'}"`
      case 'task_updated':
        return `${userName} memperbarui rincian task`
      default:
        return `${userName} melakukan pembaruan`
    }
  }

  if (loading) {
    return <div className="text-xs text-zinc-400 p-2">Memuat riwayat aktivitas...</div>
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-xs text-zinc-400">
        <svg className="w-8 h-8 mb-2 text-zinc-400 dark:text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Belum ada riwayat aktivitas untuk task ini</span>
      </div>
    )
  }

  return (
    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
      {logs.map((log) => (
        <div key={log.id} className="flex items-start gap-3 text-xs">
          <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/50 text-indigo-600 dark:text-indigo-400">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-2.5 border border-zinc-200/50 dark:border-zinc-700/50">
            <p className="text-zinc-800 dark:text-zinc-200 font-medium">
              {renderLogText(log)}
            </p>
            <span className="mt-0.5 block text-[10px] text-zinc-400">
              {new Date(log.created_at).toLocaleString('id-ID', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
