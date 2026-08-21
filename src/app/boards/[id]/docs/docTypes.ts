export type DocumentType = 'prd' | 'gdd' | 'tech_spec' | 'meeting_notes' | 'general'

export interface BoardDocument {
  id: string
  board_id: string
  title: string
  file_name?: string | null
  file_size?: number | null
  file_type?: string | null
  content: string
  doc_type: DocumentType
  created_by: string | null
  created_at: string
  updated_at: string
  profiles?: {
    full_name: string
    avatar_url: string | null
  } | null
}

export const DOCUMENT_TYPE_LABELS: Record<
  DocumentType,
  { label: string; description: string }
> = {
  prd: {
    label: 'PRD',
    description: 'Product Requirement Document',
  },
  gdd: {
    label: 'GDD',
    description: 'Game Design Document',
  },
  tech_spec: {
    label: 'Tech Spec',
    description: 'Technical Architecture & Spec',
  },
  meeting_notes: {
    label: 'Notes',
    description: 'Meeting / Sync Notes',
  },
  general: {
    label: 'General',
    description: 'General Document',
  },
}

export const MAX_DOC_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

export const ALLOWED_DOC_EXTENSIONS = [
  '.pdf',
  '.doc',
  '.docx',
  '.md',
  '.markdown',
  '.txt',
  '.csv',
  '.json',
  '.yaml',
  '.yml',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
]

export const DISALLOWED_DOC_EXTENSIONS = [
  '.html',
  '.htm',
  '.svg',
  '.exe',
  '.bat',
  '.cmd',
  '.sh',
  '.php',
  '.py',
  '.js',
  '.mjs',
  '.cjs',
  '.vbs',
  '.apk',
  '.dll',
]

export function isValidDocumentExtension(fileName: string): boolean {
  const lower = fileName.toLowerCase().trim()
  const isExplicitlyDisallowed = DISALLOWED_DOC_EXTENSIONS.some((ext) => lower.endsWith(ext))
  if (isExplicitlyDisallowed) return false

  return ALLOWED_DOC_EXTENSIONS.some((ext) => lower.endsWith(ext))
}
