'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { checkRateLimit } from '@/lib/rateLimit'
import {
  type BoardDocument,
  type DocumentType,
  DOCUMENT_TEMPLATES,
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
    .order('updated_at', { ascending: false })

  if (error) {
    return { data: [], error: error.message }
  }

  const docs = (data || []).map((d) => ({
    ...d,
    profiles: Array.isArray(d.profiles) ? d.profiles[0] : d.profiles,
  }))

  return { data: docs as BoardDocument[], error: null }
}

export async function createDocument(boardId: string, formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const rateLimit = checkRateLimit(`doc_create:${user.id}`, { maxRequests: 20, intervalMs: 60000 })
  if (!rateLimit.success) {
    return { error: 'Terlalu banyak membuat dokumen. Harap tunggu sebentar.' }
  }

  const title = (formData.get('title') as string) || ''
  const docType = ((formData.get('doc_type') as string) || 'general') as DocumentType
  let content = (formData.get('content') as string) || ''

  if (!title || title.trim() === '') {
    return { error: 'Judul dokumen tidak boleh kosong' }
  }

  if (title.trim().length > 100) {
    return { error: 'Judul dokumen maksimal 100 karakter' }
  }

  if (!content && DOCUMENT_TEMPLATES[docType]) {
    content = DOCUMENT_TEMPLATES[docType].template
  }

  const now = new Date().toISOString()

  const { data: newDoc, error } = await supabase
    .from('board_documents')
    .insert({
      board_id: boardId,
      title: title.trim(),
      content: content,
      doc_type: docType in DOCUMENT_TEMPLATES ? docType : 'general',
      created_by: user.id,
      created_at: now,
      updated_at: now,
    })
    .select('id')
    .single()

  if (error || !newDoc) {
    return { error: error?.message || 'Gagal membuat dokumen' }
  }

  revalidatePath(`/boards/${boardId}`)
  revalidatePath(`/boards/${boardId}/docs`)
  return { success: true, id: newDoc.id }
}

export async function updateDocument(docId: string, boardId: string, formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const title = (formData.get('title') as string) || ''
  const content = (formData.get('content') as string) ?? ''
  const docType = (formData.get('doc_type') as string) || undefined

  if (!title || title.trim() === '') {
    return { error: 'Judul dokumen tidak boleh kosong' }
  }

  if (title.trim().length > 100) {
    return { error: 'Judul dokumen maksimal 100 karakter' }
  }

  const now = new Date().toISOString()
  const updateData: Record<string, unknown> = {
    title: title.trim(),
    content: content,
    updated_at: now,
  }

  if (docType && docType in DOCUMENT_TEMPLATES) {
    updateData.doc_type = docType as DocumentType
  }

  const { error } = await supabase
    .from('board_documents')
    .update(updateData)
    .eq('id', docId)
    .eq('board_id', boardId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/boards/${boardId}`)
  revalidatePath(`/boards/${boardId}/docs`)
  return { success: true }
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
