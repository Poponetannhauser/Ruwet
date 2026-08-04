'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createBoard(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const name = formData.get('name') as string

  if (!name || name.trim() === '') {
    return { error: 'Nama board tidak boleh kosong' }
  }

  // 0. Ensure profile exists for current user
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  if (!profile) {
    await supabase.from('profiles').insert({
      id: user.id,
      full_name: user.user_metadata?.full_name || user.email || 'User',
      avatar_url: user.user_metadata?.avatar_url || null,
    })
  }

  // 1. Insert board
  const { data: board, error: boardError } = await supabase
    .from('boards')
    .insert({
      name: name.trim(),
      owner_id: user.id,
    })
    .select('id')
    .single()

  if (boardError || !board) {
    return { error: boardError?.message || 'Gagal membuat board' }
  }

  // 2. Add owner to board_members
  const { error: memberError } = await supabase.from('board_members').insert({
    board_id: board.id,
    user_id: user.id,
    role: 'owner',
  })

  if (memberError) {
    return { error: memberError.message }
  }

  // 3. Generate 4 default columns
  const defaultColumns = [
    { board_id: board.id, name: 'To Do', position: 1 },
    { board_id: board.id, name: 'In Progress', position: 2 },
    { board_id: board.id, name: 'Review', position: 3 },
    { board_id: board.id, name: 'Done', position: 4 },
  ]

  const { error: columnsError } = await supabase
    .from('columns')
    .insert(defaultColumns)

  if (columnsError) {
    return { error: columnsError.message }
  }

  revalidatePath('/')
  revalidatePath('/boards')
  redirect(`/boards/${board.id}`)
}

export async function updateBoard(boardId: string, formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const name = formData.get('name') as string

  if (!name || name.trim() === '') {
    return { error: 'Nama board tidak boleh kosong' }
  }

  const { error } = await supabase
    .from('boards')
    .update({ name: name.trim() })
    .eq('id', boardId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/boards/${boardId}`)
  revalidatePath('/')
  revalidatePath('/boards')
  return { success: true }
}

export async function deleteBoard(boardId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { error } = await supabase.from('boards').delete().eq('id', boardId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/boards')
  redirect('/')
}
