'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createTask(boardId: string, columnId: string, formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const title = formData.get('title') as string
  const description = (formData.get('description') as string) || null
  const assigneeId = (formData.get('assignee_id') as string) || null
  const dueDate = (formData.get('due_date') as string) || null

  if (!title || title.trim() === '') {
    return { error: 'Judul task tidak boleh kosong' }
  }

  // Hitung jumlah task di kolom ini untuk menentukan posisi
  const { count } = await supabase
    .from('tasks')
    .select('id', { count: 'exact', head: true })
    .eq('column_id', columnId)

  const newPosition = (count || 0) + 1
  const now = new Date().toISOString()

  const { error } = await supabase.from('tasks').insert({
    board_id: boardId,
    column_id: columnId,
    title: title.trim(),
    description: description ? description.trim() : null,
    assignee_id: assigneeId && assigneeId !== '' ? assigneeId : null,
    due_date: dueDate && dueDate !== '' ? dueDate : null,
    position: newPosition,
    created_by: user.id,
    status_updated_at: now,
    created_at: now,
    updated_at: now,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/boards/${boardId}`)
  return { success: true }
}

export async function updateTask(taskId: string, boardId: string, formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const title = formData.get('title') as string
  const description = (formData.get('description') as string) || null
  const assigneeId = (formData.get('assignee_id') as string) || null
  const dueDate = (formData.get('due_date') as string) || null
  const columnId = (formData.get('column_id') as string) || null

  if (!title || title.trim() === '') {
    return { error: 'Judul task tidak boleh kosong' }
  }

  // Cek apakah column_id berubah untuk mengupdate status_updated_at
  const { data: currentTask } = await supabase
    .from('tasks')
    .select('column_id')
    .eq('id', taskId)
    .single()

  const now = new Date().toISOString()
  const isColumnChanged = columnId && currentTask && currentTask.column_id !== columnId

  const updateData: Record<string, unknown> = {
    title: title.trim(),
    description: description ? description.trim() : null,
    assignee_id: assigneeId && assigneeId !== '' ? assigneeId : null,
    due_date: dueDate && dueDate !== '' ? dueDate : null,
    updated_at: now,
  }

  if (isColumnChanged) {
    updateData.column_id = columnId
    updateData.status_updated_at = now
  }

  const { error } = await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', taskId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/boards/${boardId}`)
  return { success: true }
}

export async function deleteTask(taskId: string, boardId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { error } = await supabase.from('tasks').delete().eq('id', taskId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/boards/${boardId}`)
  return { success: true }
}

export async function assignSelf(taskId: string, boardId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const now = new Date().toISOString()

  const { error } = await supabase
    .from('tasks')
    .update({
      assignee_id: user.id,
      updated_at: now,
    })
    .eq('id', taskId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/boards/${boardId}`)
  return { success: true }
}

export async function moveTask(
  taskId: string,
  boardId: string,
  targetColumnId: string,
  newPosition: number,
  isColumnChanged: boolean
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const now = new Date().toISOString()

  const updateData: Record<string, unknown> = {
    column_id: targetColumnId,
    position: newPosition,
    updated_at: now,
  }

  if (isColumnChanged) {
    updateData.status_updated_at = now
  }

  const { error } = await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', taskId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/boards/${boardId}`)
  return { success: true }
}
