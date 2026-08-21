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
    .eq('board_id', boardId)

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

  const { error } = await supabase
    .from('columns')
    .delete()
    .eq('id', columnId)
    .eq('board_id', boardId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/boards/${boardId}`)
  return { success: true }
}

export async function moveColumn(
  columnId: string,
  boardId: string,
  direction: 'left' | 'right'
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Ambil semua kolom board ini diurutkan berdasarkan position
  const { data: columns, error } = await supabase
    .from('columns')
    .select('id, position')
    .eq('board_id', boardId)
    .order('position', { ascending: true })

  if (error || !columns) {
    return { error: 'Gagal mengambil daftar kolom' }
  }

  const currentIndex = columns.findIndex((c) => c.id === columnId)
  if (currentIndex === -1) {
    return { error: 'Kolom tidak ditemukan' }
  }

  const targetIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1
  if (targetIndex < 0 || targetIndex >= columns.length) {
    return { success: true }
  }

  const currentColumn = columns[currentIndex]
  const targetColumn = columns[targetIndex]

  // Gunakan nilai sementara jika posisi bertabrakan
  const currentPos = currentColumn.position
  const targetPos = targetColumn.position

  const { error: err1 } = await supabase
    .from('columns')
    .update({ position: targetPos })
    .eq('id', currentColumn.id)

  const { error: err2 } = await supabase
    .from('columns')
    .update({ position: currentPos })
    .eq('id', targetColumn.id)

  if (err1 || err2) {
    return { error: 'Gagal mengubah posisi kolom' }
  }

  revalidatePath(`/boards/${boardId}`)
  return { success: true }
}

