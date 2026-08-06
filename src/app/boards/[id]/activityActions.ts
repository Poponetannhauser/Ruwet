'use server'

import { createClient } from '@/lib/supabase/server'

export async function logActivity(
  taskId: string,
  boardId: string,
  userId: string,
  actionType: string,
  detail: Record<string, unknown>
) {
  const supabase = await createClient()

  const { error } = await supabase.from('activity_log').insert({
    task_id: taskId,
    board_id: boardId,
    user_id: userId,
    action_type: actionType,
    detail,
  })

  if (error) {
    console.error('Failed to log activity:', error.message)
  }
}

export async function getActivityLogs(taskId: string, limit = 10) {
  const supabase = await createClient()

  const { data: logs, error } = await supabase
    .from('activity_log')
    .select('*, profiles:user_id(full_name, avatar_url)')
    .eq('task_id', taskId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    return { error: error.message, logs: [] }
  }

  const formattedLogs = (logs || []).map((log) => ({
    ...log,
    profiles: Array.isArray(log.profiles) ? log.profiles[0] : log.profiles,
  }))

  return { logs: formattedLogs }
}
