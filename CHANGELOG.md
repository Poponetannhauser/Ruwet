# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v0.3.0] - 2026-08-21

### Added
- **Docs & Specs Hub (`/boards/[id]/docs`)**: Ruang penyimpanan dan penampil dokumen board terintegrasi untuk PRD, GDD, Technical Architecture Spec, Meeting Notes, dan catatan umum.
- **File Upload & Live Preview**: Mendukung file PDF, Word (DOCX), Markdown, Plain Text, JSON, YAML, dan format gambar (PNG, JPG, WEBP) hingga 5MB.
- **Drag-and-Drop Uploader**: Area dropzone interaktif dengan animasi visual feedback saat mengunggah file.
- **Kanban Filter Toolbar**: Filter instan task berdasarkan pencarian teks judul/nomor `#task`, level prioritas (`P0` - `P3`), kategori, fase pengembangan, dan status assignee.
- **Custom Confirmation Modal**: Modal konfirmasi penghapusan dokumen berbasis Framer Motion yang aman dan responsif menggantikan popup browser bawaan.
- **Dedicated Loading Skeletons**: Skeleton loading independen dan presisi untuk halaman Docs Hub dan Kanban Filter bar.

### Changed
- **Task Priority Standardization**: Menstandarkan sistem prioritas task ke `P0` (Blocker), `P1` (High), `P2` (Medium), dan `P3` (Low) dengan styling badge bersih tanpa emoji.
- **Task Schema Enhancement**: Menambahkan kolom `category` dan `phase` pada tabel `tasks` serta migrasi database PostgreSQL dengan check constraint.
- **Kanban Viewport & Scroll Isolation**: Memisahkan layout scroll horizontal kolom card dari Filter Toolbar atas sehingga posisi toolbar tetap statis dan rapi saat board digeser ke samping.
- **Navbar Styling**: Menyelaraskan warna background, padding, dan hierarki navigasi antara Kanban board dan Docs Hub (`bg-[#2C2C30]`).

### Security & Optimization
- **Server-Side Extension & MIME Whitelist**: Memvalidasi ekstensi file yang diizinkan dan memblokir format file berbahaya / script execution (`.html`, `.svg`, `.exe`, `.sh`, `.php`, `.js`).
- **Iframe Preview Sandboxing**: Menambahkan atribut `sandbox="allow-same-origin allow-downloads"` pada preview PDF untuk mencegah eksekusi skrip berbahaya.
- **Board Membership Authorization**: Memverifikasi status akses kepemilikan/keanggotaan board (`verifyBoardAccess`) di server action sebelum memproses file.
- **Input Sanitization**: Membatasi panjang teks `category` dan `phase` maksimal 50 karakter untuk mencegah payload bloat.
- **Database Indexing**: Menambahkan index `idx_board_documents_board_id` dan `idx_tasks_board_category_phase` untuk query performa tinggi.

---

## [v0.2.0] - 2026-08-15

### Added
- **Telegram Bot Integration**: Notifikasi real-time ke Telegram untuk penugasan task, update kolom, dan peringatan stale task.
- **Rate Limiting**: Proteksi endpoint dengan Upstash Redis dan in-memory fallback.
- **Board Membership & Roles**: Manajemen anggota board (Owner vs Member) dan invite link.

---

## [v0.1.0] - 2026-08-01

### Added
- **Core Kanban Engine**: Manajemen board, kolom dinamis, dan drag-and-drop task card dengan `@dnd-kit`.
- **Supabase Authentication & RLS**: Autentikasi email/password dan Row Level Security.
