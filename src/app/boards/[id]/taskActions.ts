'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { logActivity } from './activityActions'
import { createNotification } from '@/app/notificationActions'
import { checkRateLimit } from '@/lib/rateLimit'

export async function createTask(boardId: string, columnId: string, formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const rateLimit = checkRateLimit(`task_create:${user.id}`, { maxRequests: 20, intervalMs: 60000 })
  if (!rateLimit.success) {
    return { error: 'Terlalu banyak membuat task. Harap tunggu sebentar.' }
  }

  const title = formData.get('title') as string
  const description = (formData.get('description') as string) || null
  const assigneeId = (formData.get('assignee_id') as string) || null
  const dueDate = (formData.get('due_date') as string) || null
  const priorityRaw = (formData.get('priority') as string) || 'medium'

  const priority = ['low', 'medium', 'high', 'urgent'].includes(priorityRaw.toLowerCase())
    ? priorityRaw.toLowerCase()
    : 'medium'

  if (!title || title.trim() === '') {
    return { error: 'Judul task tidak boleh kosong' }
  }

  if (title.trim().length > 50) {
    return { error: 'Judul task tidak boleh lebih dari 50 karakter' }
  }

  // Validasi kolom milik board ini
  const { data: validCol } = await supabase
    .from('columns')
    .select('id')
    .eq('id', columnId)
    .eq('board_id', boardId)
    .single()

  if (!validCol) {
    return { error: 'Kolom tidak valid untuk board ini' }
  }

  // Hitung jumlah task di kolom ini untuk menentukan posisi
  const { count } = await supabase
    .from('tasks')
    .select('id', { count: 'exact', head: true })
    .eq('column_id', columnId)

  const newPosition = (count || 0) + 1
  const now = new Date().toISOString()

  const targetAssignee = assigneeId && assigneeId !== '' ? assigneeId : null

  const { data: newTask, error } = await supabase
    .from('tasks')
    .insert({
      board_id: boardId,
      column_id: columnId,
      title: title.trim(),
      description: description ? description.trim() : null,
      assignee_id: targetAssignee,
      due_date: dueDate && dueDate !== '' ? dueDate : null,
      priority,
      position: newPosition,
      created_by: user.id,
      status_updated_at: now,
      created_at: now,
      updated_at: now,
    })
    .select('id')
    .single()

  if (error || !newTask) {
    return { error: error?.message || 'Gagal membuat task' }
  }

  // Log activity
  await logActivity(newTask.id, boardId, user.id, 'task_created', {
    title: title.trim(),
  })

  // Trigger notification if assigned to another user
  if (targetAssignee && targetAssignee !== user.id) {
    await createNotification(
      targetAssignee,
      'Penugasan Task Baru',
      `Anda ditugaskan pada task "${title.trim()}"`,
      `/boards/${boardId}`
    )
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
  const priorityRaw = (formData.get('priority') as string) || null

  if (!title || title.trim() === '') {
    return { error: 'Judul task tidak boleh kosong' }
  }

  if (title.trim().length > 50) {
    return { error: 'Judul task tidak boleh lebih dari 50 karakter' }
  }

  // Cek apakah column_id atau assignee_id berubah
  const { data: currentTask } = await supabase
    .from('tasks')
    .select('column_id, assignee_id, title')
    .eq('id', taskId)
    .single()

  const now = new Date().toISOString()
  const isColumnChanged = columnId && currentTask && currentTask.column_id !== columnId
  const targetAssignee = assigneeId && assigneeId !== '' ? assigneeId : null
  const isAssigneeChanged = targetAssignee && currentTask && currentTask.assignee_id !== targetAssignee

  if (isColumnChanged && columnId) {
    const { data: validCol } = await supabase
      .from('columns')
      .select('id')
      .eq('id', columnId)
      .eq('board_id', boardId)
      .single()

    if (!validCol) {
      return { error: 'Kolom tujuan tidak valid untuk board ini' }
    }
  }

  const updateData: Record<string, unknown> = {
    title: title.trim(),
    description: description ? description.trim() : null,
    assignee_id: targetAssignee,
    due_date: dueDate && dueDate !== '' ? dueDate : null,
    updated_at: now,
  }

  if (priorityRaw && ['low', 'medium', 'high', 'urgent'].includes(priorityRaw.toLowerCase())) {
    updateData.priority = priorityRaw.toLowerCase()
  }

  if (isColumnChanged) {
    updateData.column_id = columnId
    updateData.status_updated_at = now
  }

  const { error } = await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', taskId)
    .eq('board_id', boardId)

  if (error) {
    return { error: error.message }
  }

  // Trigger notification if newly assigned to another user
  if (isAssigneeChanged && targetAssignee !== user.id) {
    await createNotification(
      targetAssignee,
      'Penugasan Task',
      `Anda ditugaskan pada task "${title.trim()}"`,
      `/boards/${boardId}`
    )
  }

  // Log Activity
  if (isColumnChanged) {
    const { data: targetCol } = await supabase
      .from('columns')
      .select('name')
      .eq('id', columnId)
      .single()

    await logActivity(taskId, boardId, user.id, 'task_moved', {
      column_name: targetCol?.name || 'kolom baru',
    })
  } else {
    await logActivity(taskId, boardId, user.id, 'task_updated', {
      title: title.trim(),
    })
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

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)
    .eq('board_id', boardId)

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
    .eq('board_id', boardId)

  if (error) {
    return { error: error.message }
  }

  // Log activity
  await logActivity(taskId, boardId, user.id, 'task_assigned', {
    assigned_to_self: true,
  })

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

  // Validasi target column dan task belong to boardId
  const { data: validCol } = await supabase
    .from('columns')
    .select('id')
    .eq('id', targetColumnId)
    .eq('board_id', boardId)
    .single()

  if (!validCol) {
    return { error: 'Kolom tujuan tidak valid untuk board ini' }
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
    .eq('board_id', boardId)

  if (error) {
    return { error: error.message }
  }

  if (isColumnChanged) {
    const { data: targetCol } = await supabase
      .from('columns')
      .select('name')
      .eq('id', targetColumnId)
      .single()

    await logActivity(taskId, boardId, user.id, 'task_moved', {
      column_name: targetCol?.name || 'kolom baru',
    })
  }

  revalidatePath(`/boards/${boardId}`)
  return { success: true }
}
