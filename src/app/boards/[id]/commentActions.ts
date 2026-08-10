'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { checkRateLimit } from '@/lib/rateLimit'

export async function addComment(taskId: string, boardId: string, content: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Anda harus login untuk mengirim komentar' }
  }

  const rateLimit = checkRateLimit(`comment:${user.id}`, { maxRequests: 15, intervalMs: 60000 })
  if (!rateLimit.success) {
    return { error: 'Terlalu banyak komentar. Harap tunggu sebentar.' }
  }

  if (!content || content.trim() === '') {
    return { error: 'Komentar tidak boleh kosong' }
  }

  if (content.trim().length > 2000) {
    return { error: 'Komentar terlalu panjang (maksimal 2000 karakter)' }
  }

  // Validasi taskId terdaftar di boardId ini
  const { data: task } = await supabase
    .from('tasks')
    .select('id, title, assignee_id')
    .eq('id', taskId)
    .eq('board_id', boardId)
    .single()

  if (!task) {
    return { error: 'Task tidak ditemukan di board ini' }
  }

  const trimmedContent = content.trim()

  const { error } = await supabase.from('comments').insert({
    task_id: taskId,
    user_id: user.id,
    content: trimmedContent,
  })

  if (error) {
    return { error: error.message }
  }

  // Kirim notifikasi jika task di-assign ke member lain
  if (task.assignee_id && task.assignee_id !== user.id) {
    const { createNotification } = await import('@/app/notificationActions')
    const commenterName =
      (user.user_metadata?.full_name as string) || user.email || 'Seseorang'
    const snippet =
      trimmedContent.length > 50
        ? `${trimmedContent.substring(0, 50)}...`
        : trimmedContent

    await createNotification(
      task.assignee_id,
      'Komentar Baru pada Task',
      `${commenterName} mengomentari "${task.title}": "${snippet}"`,
      `/boards/${boardId}`
    )
  }

  revalidatePath(`/boards/${boardId}`)
  return { success: true }
}

export async function getComments(taskId: string) {
  const supabase = await createClient()

  const { data: comments, error } = await supabase
    .from('comments')
    .select('*, profiles:user_id(full_name, avatar_url)')
    .eq('task_id', taskId)
    .order('created_at', { ascending: true })

  if (error) {
    return { error: error.message, comments: [] }
  }

  const formattedComments = (comments || []).map((c) => ({
    ...c,
    profiles: Array.isArray(c.profiles) ? c.profiles[0] : c.profiles,
  }))

  return { comments: formattedComments }
}
