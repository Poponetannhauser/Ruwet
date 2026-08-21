export type DocumentType = 'prd' | 'gdd' | 'tech_spec' | 'meeting_notes' | 'general'

export interface BoardDocument {
  id: string
  board_id: string
  title: string
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

export const DOCUMENT_TEMPLATES: Record<
  DocumentType,
  { name: string; icon: string; description: string; template: string }
> = {
  prd: {
    name: 'Product Requirement Document (PRD)',
    icon: '📄',
    description: 'Dokumentasi spesifikasi fitur, problem statement, user story, dan scope produk.',
    template: `# Product Requirement Document (PRD)

## 1. Problem Statement
Jelaskan masalah apa yang ingin diselesaikan dengan fitur atau produk ini.

## 2. Goals & Success Metrics
- **Goal**: Sasaran utama yang ingin dicapai.
- **Metrics**: Indikator keberhasilan (misal: adopsi pengguna, efisiensi waktu).

## 3. Target Audience / User Persona
Siapa pengguna yang ditargetkan dan use-case utamanya?

## 4. User Stories & Functional Requirements
- [ ] Sebagai pengguna, saya dapat...
- [ ] Sistem harus memvalidasi...

## 5. Out of Scope (Non-Goals)
Hal-hal yang tidak akan dikerjakan pada fase ini.

## 6. Open Questions & Risks
- [ ] Pertanyaan teknis / desain yang masih perlu klarifikasi.
`,
  },
  gdd: {
    name: 'Game Design Document (GDD)',
    icon: '🎮',
    description: 'Dokumentasi konsep game, core gameplay loop, mekanik, progression, dan art vision.',
    template: `# Game Design Document (GDD)

## 1. Executive Summary & Vision
- **Genre**: 
- **Target Platform**: 
- **Core Hook**: Apa yang membuat game ini unik dan menarik?

## 2. Core Gameplay Loop
1. **Action**: Tindakan pemain di setiap loop (misal: eksplorasi, pertarungan).
2. **Reward**: Hasil atau reward yang didapatkan.
3. **Progression**: Bagaimana reward digunakan untuk upgrade/upgrade level.

## 3. Game Mechanics & Systems
- **Controls & Input**: 
- **Combat / Interaction System**: 
- **Economy / Inventory**: 

## 4. Game World & Narrative
- **Setting & Lore**: 
- **Characters / Factions**: 

## 5. Art & Audio Direction
- **Visual Style**: (Pixel art, Stylized 3D, Low poly, dsb.)
- **Audio Mood**: (BGM, sound effects direction)

## 6. Milestones & Phases
- **Prototype**: Core mechanics playable.
- **Core Production**: Level design & asset pipeline.
- **Polish & Testing**: Balancing & bug fixing.
`,
  },
  tech_spec: {
    name: 'Technical Specification',
    icon: '⚙️',
    description: 'Dokumentasi arsitektur sistem, skema database, API endpoints, dan security.',
    template: `# Technical Specification

## 1. Overview & Architecture
Penjelasan singkat rancangan sistem dan diagram arsitektur.

## 2. Data Models & Schema
\`\`\`sql
-- Definisikan tabel dan relasi database di sini
\`\`\`

## 3. API Endpoints & Interfaces
- \`POST /api/...\` - Deskripsi request/response payload.

## 4. Security & Performance Considerations
- Rate limiting, authentication, authorization, dan caching strategy.

## 5. Rollout & Migration Plan
Langkah-langkah deployment dan rollback jika terjadi kegagalan.
`,
  },
  meeting_notes: {
    name: 'Meeting & Sync Notes',
    icon: '📝',
    description: 'Catatan rapat tim, kesimpulan sprint review, dan action items.',
    template: `# Meeting Notes

**Tanggal**: ${new Date().toISOString().split('T')[0]}  
**Peserta**:  

## 1. Agenda
1. Agenda 1
2. Agenda 2

## 2. Discussion & Decisions
- Poin pembahasan utama dan keputusan yang disepakati.

## 3. Action Items
- [ ] Task 1 (Assignee: @...)
- [ ] Task 2 (Assignee: @...)
`,
  },
  general: {
    name: 'Blank Document',
    icon: '📋',
    description: 'Dokumen bebas / catatan umum.',
    template: `# Judul Dokumen

Tuliskan catatan atau panduan proyek Anda di sini menggunakan format Markdown.
`,
  },
}
