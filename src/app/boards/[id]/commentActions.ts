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

  // Validasi taskId terdaftar di boardId ini
  const { data: task } = await supabase
    .from('tasks')
    .select('id')
    .eq('id', taskId)
    .eq('board_id', boardId)
    .single()

  if (!task) {
    return { error: 'Task tidak ditemukan di board ini' }
  }

  const { error } = await supabase.from('comments').insert({
    task_id: taskId,
    user_id: user.id,
    content: content.trim(),
  })

  if (error) {
    return { error: error.message }
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
