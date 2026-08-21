'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { checkRateLimit } from '@/lib/rateLimit'
import {
  type BoardDocument,
  type DocumentType,
} from './docTypes'

export async function getBoardDocuments(boardId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: [], error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('board_documents')
    .select('*, profiles:created_by(full_name, avatar_url)')
    .eq('board_id', boardId)
    .order('created_at', { ascending: false })

  if (error) {
    return { data: [], error: error.message }
  }

  const docs = (data || []).map((d) => ({
    ...d,
    profiles: Array.isArray(d.profiles) ? d.profiles[0] : d.profiles,
  }))

  return { data: docs as BoardDocument[], error: null }
}

export async function uploadDocument(boardId: string, formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const rateLimit = checkRateLimit(`doc_upload:${user.id}`, { maxRequests: 20, intervalMs: 60000 })
  if (!rateLimit.success) {
    return { error: 'Terlalu sering mengupload dokumen. Harap tunggu sebentar.' }
  }

  const file = formData.get('file') as File | null
  const titleInput = (formData.get('title') as string) || ''
  const docType = ((formData.get('doc_type') as string) || 'general') as DocumentType

  if (!file || !(file instanceof File) || file.size === 0) {
    return { error: 'Silakan pilih file dokumen untuk diupload' }
  }

  // Max 10MB file limit
  if (file.size > 10 * 1024 * 1024) {
    return { error: 'Ukuran file maksimal adalah 10MB' }
  }

  const title = titleInput.trim() || file.name

  // If text or markdown file, read content text for quick in-browser preview
  let content = ''
  const isTextual =
    file.type.includes('text') ||
    file.name.endsWith('.md') ||
    file.name.endsWith('.txt') ||
    file.name.endsWith('.json') ||
    file.name.endsWith('.yaml') ||
    file.name.endsWith('.yml')

  if (isTextual) {
    try {
      content = await file.text()
    } catch {
      content = ''
    }
  } else {
    // For binary documents (PDF, Docx, etc.), store base64 data URL so user can view/download
    try {
      const buffer = await file.arrayBuffer()
      const base64 = Buffer.from(buffer).toString('base64')
      content = `data:${file.type || 'application/octet-stream'};base64,${base64}`
    } catch {
      content = ''
    }
  }

  const now = new Date().toISOString()

  const { data: newDoc, error } = await supabase
    .from('board_documents')
    .insert({
      board_id: boardId,
      title: title,
      file_name: file.name,
      file_size: file.size,
      file_type: file.type || 'application/octet-stream',
      content: content,
      doc_type: docType,
      created_by: user.id,
      created_at: now,
      updated_at: now,
    })
    .select('id')
    .single()

  if (error || !newDoc) {
    return { error: error?.message || 'Gagal mengupload dokumen' }
  }

  revalidatePath(`/boards/${boardId}`)
  revalidatePath(`/boards/${boardId}/docs`)
  return { success: true, id: newDoc.id }
}

export async function deleteDocument(docId: string, boardId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { error } = await supabase
    .from('board_documents')
    .delete()
    .eq('id', docId)
    .eq('board_id', boardId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/boards/${boardId}`)
  revalidatePath(`/boards/${boardId}/docs`)
  return { success: true }
}
