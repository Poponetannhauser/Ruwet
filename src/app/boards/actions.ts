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

export async function leaveBoard(boardId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { error } = await supabase
    .from('board_members')
    .delete()
    .eq('board_id', boardId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/boards')
  redirect('/')
}

export async function addBoardMemberByEmail(boardId: string, email: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  if (!email || email.trim() === '') {
    return { error: 'Email tidak boleh kosong' }
  }

  // Ensure current user is the owner of the board
  const { data: board } = await supabase
    .from('boards')
    .select('owner_id')
    .eq('id', boardId)
    .single()

  if (!board || board.owner_id !== user.id) {
    return { error: 'Hanya pemilik board yang diizinkan mengundang anggota' }
  }

  // 1. Cari profile berdasarkan email (lewat profiles / auth email)
  const { data: targetProfiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name')

  if (profileError) {
    return { error: profileError.message }
  }

  // Cari user id dari profiles berdasarkan ID / matching
  let targetUserId: string | null = null

  if (email.includes('-') && email.length === 36) {
    // Possibly a UUID
    targetUserId = email
  } else if (targetProfiles) {
    const match = targetProfiles.find(
      (p) => p.full_name?.toLowerCase() === email.trim().toLowerCase()
    )
    if (match) targetUserId = match.id
  }

  if (!targetUserId) {
    // If RPC not available, query profiles directly
    const { data: matchedProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', email) // in case UUID passed
      .single()

    if (matchedProfile) {
      targetUserId = matchedProfile.id
    }
  }

  if (!targetUserId) {
    return { error: 'Pengguna dengan email/ID tersebut tidak ditemukan' }
  }

  // 2. Insert to board_members
  const { error: memberError } = await supabase.from('board_members').insert({
    board_id: boardId,
    user_id: targetUserId,
    role: 'member',
  })

  if (memberError) {
    if (memberError.code === '23505') {
      return { error: 'Pengguna sudah menjadi anggota board ini' }
    }
    return { error: memberError.message }
  }

  revalidatePath(`/boards/${boardId}`)
  return { success: true }
}

export async function joinBoard(boardId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?next=/boards/join/${boardId}`)
  }

  // Ensure profile exists for user
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

  // Check if already a member
  const { data: existingMember } = await supabase
    .from('board_members')
    .select('id')
    .eq('board_id', boardId)
    .eq('user_id', user.id)
    .single()

  if (existingMember) {
    redirect(`/boards/${boardId}`)
  }

  // Insert member
  const { error } = await supabase.from('board_members').insert({
    board_id: boardId,
    user_id: user.id,
    role: 'member',
  })

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath(`/boards/${boardId}`)
  revalidatePath('/')
  redirect(`/boards/${boardId}`)
}
