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
    return <div className="text-xs text-zinc-400">Memuat riwayat aktivitas...</div>
  }

  if (logs.length === 0) {
    return <div className="text-xs text-zinc-400">Belum ada riwayat aktivitas</div>
  }

  return (
    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
      {logs.map((log) => (
        <div key={log.id} className="flex items-start gap-2 text-xs">
          <div className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-500" />
          <div className="flex-1">
            <p className="text-zinc-700 dark:text-zinc-300">
              {renderLogText(log)}
            </p>
            <span className="text-[10px] text-zinc-400">
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
