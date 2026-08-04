'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createColumn(boardId: string, formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const name = formData.get('name') as string

  if (!name || name.trim() === '') {
    return { error: 'Nama kolom tidak boleh kosong' }
  }

  // Hitung jumlah kolom saat ini untuk menentukan posisi
  const { count } = await supabase
    .from('columns')
    .select('id', { count: 'exact', head: true })
    .eq('board_id', boardId)

  const newPosition = (count || 0) + 1

  const { error } = await supabase.from('columns').insert({
    board_id: boardId,
    name: name.trim(),
    position: newPosition,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/boards/${boardId}`)
  return { success: true }
}

export async function updateColumn(columnId: string, boardId: string, formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const name = formData.get('name') as string

  if (!name || name.trim() === '') {
    return { error: 'Nama kolom tidak boleh kosong' }
  }

  const { error } = await supabase
    .from('columns')
    .update({ name: name.trim() })
    .eq('id', columnId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/boards/${boardId}`)
  return { success: true }
}

export async function deleteColumn(columnId: string, boardId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { error } = await supabase.from('columns').delete().eq('id', columnId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/boards/${boardId}`)
  return { success: true }
}
