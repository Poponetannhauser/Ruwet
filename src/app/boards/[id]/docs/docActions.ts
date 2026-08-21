'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { checkRateLimit } from '@/lib/rateLimit'
import {
  type BoardDocument,
  type DocumentType,
  MAX_DOC_FILE_SIZE_BYTES,
  isValidDocumentExtension,
} from './docTypes'

function sanitizeFileName(fileName: string): string {
  // Strip path traversal and control characters
  return fileName
    .replace(/[/\\]/g, '')
    .replace(/[\x00-\x1f\x80-\x9f]/g, '')
    .trim()
}

async function verifyBoardAccess(
  supabase: Awaited<ReturnType<typeof createClient>>,
  boardId: string,
  userId: string
): Promise<boolean> {
  const [boardRes, memberRes] = await Promise.all([
    supabase.from('boards').select('id').eq('id', boardId).eq('owner_id', userId).single(),
    supabase.from('board_members').select('id').eq('board_id', boardId).eq('user_id', userId).single(),
  ])

  return !!boardRes.data || !!memberRes.data
}

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

  // Verify user is member or owner of the board
  const hasAccess = await verifyBoardAccess(supabase, boardId, user.id)
  if (!hasAccess) {
    return { error: 'Anda tidak memiliki akses ke board ini' }
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

  const sanitizedName = sanitizeFileName(file.name)
  if (!sanitizedName) {
    return { error: 'Nama file tidak valid' }
  }

  // Validate extension
  if (!isValidDocumentExtension(sanitizedName)) {
    return {
      error: 'Format file tidak didukung atau dilarang demi keamanan. Harap gunakan PDF, Word, Markdown, Text, JSON, YAML, atau Gambar (PNG/JPG/WEBP).',
    }
  }

  // Max 5MB file limit
  if (file.size > MAX_DOC_FILE_SIZE_BYTES) {
    return { error: 'Ukuran file maksimal adalah 5MB' }
  }

  const rawTitle = titleInput.trim() || sanitizedName
  const title = rawTitle.slice(0, 100) // limit title to 100 chars

  // If text or markdown file, read content text for quick in-browser preview
  let content = ''
  const isTextual =
    (file.type && (file.type.includes('text') || file.type.includes('csv'))) ||
    sanitizedName.endsWith('.md') ||
    sanitizedName.endsWith('.markdown') ||
    sanitizedName.endsWith('.txt') ||
    sanitizedName.endsWith('.csv') ||
    sanitizedName.endsWith('.json') ||
    sanitizedName.endsWith('.yaml') ||
    sanitizedName.endsWith('.yml')

  if (isTextual) {
    try {
      content = await file.text()
    } catch {
      content = ''
    }
  } else {
    // For binary documents (PDF, Docx, Image, etc.), store base64 data URL
    try {
      const buffer = await file.arrayBuffer()
      const base64 = Buffer.from(buffer).toString('base64')
      const mime = file.type || 'application/octet-stream'
      content = `data:${mime};base64,${base64}`
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
      file_name: sanitizedName,
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

  // Verify board access
  const hasAccess = await verifyBoardAccess(supabase, boardId, user.id)
  if (!hasAccess) {
    return { error: 'Anda tidak memiliki akses ke board ini' }
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
