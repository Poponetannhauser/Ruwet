# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v0.3.0] - 2026-08-21

### Added
- **Notion-Style Table View (`TableView.tsx`)**: Tampilan tabel berdensitas tinggi dengan scroll mandiri terisolasi, toggle instan Kanban/Table, dan pengeditan task langsung saat diklik.
- **Bulk Task Operations**: Floating action bar interaktif dengan animasi *spring physics* (`framer-motion`) untuk Bulk Delete task dengan modal konfirmasi aman dan Bulk Move task antar kolom.
- **Batch Task Importer (Beta)**: Modal import cepat di navbar untuk menambahkan banyak task sekaligus dari copy-paste checklist to-do atau unggah file CSV lengkap dengan template generator bawaan.
- **Column Reordering**: Fitur pemindahan urutan kolom (geser kiri / geser kanan) dengan update optimistik instan di server action.
- **Custom Modern Checkbox**: Checkbox kustom bergaya Notion/Linear dengan bold SVG checkmark putih dan indikator *indeterminate dash* (`-`) saat seleksi sebagian task.
- **Docs & Specs Hub (`/boards/[id]/docs`)**: Ruang penyimpanan dan penampil dokumen board terintegrasi untuk PRD, GDD, Technical Architecture Spec, Meeting Notes, dan catatan umum.
- **File Upload & Live Preview**: Mendukung file PDF, Word (DOCX), Markdown, Plain Text, JSON, YAML, dan format gambar (PNG, JPG, WEBP) hingga 5MB.
- **Drag-and-Drop Uploader**: Area dropzone interaktif dengan animasi visual feedback saat mengunggah file.
- **Kanban Filter Toolbar & Popover**: Filter instan task berbasis popover ringkas untuk pencarian teks judul/nomor `#task`, level prioritas (`P0` - `P3`), kategori, fase pengembangan, dan status assignee dengan chip filter interaktif.

### Changed
- **Minimalist Muted UI Design**: Menata ulang seluruh palet warna filter toolbar, popover dropdown, active filter chips, dan badge status/kategori/fase ke gaya dark minimalis yang tenang dan berkelas (anti-neon).
- **Clean Phase Sanitization**: Membersihkan otomatis prefix angka pada nama fase saat import CSV atau input task (contoh: `0 - Prototype` otomatis menjadi `Prototype`).
- **Task Priority Standardization**: Menstandarkan sistem prioritas task ke `P0` (Blocker), `P1` (High), `P2` (Medium), dan `P3` (Low) dengan styling badge bersih tanpa emoji.
- **Task Schema Enhancement**: Menambahkan kolom `category` dan `phase` pada tabel `tasks` serta migrasi database PostgreSQL dengan check constraint.
- **Board Sidebar Reorganization**: Memindahkan tombol Ringkasan Board dan Manajemen Anggota Board ke sidebar agar navbar tetap bersih dan terfokus.
- **Kanban Viewport & Scroll Isolation**: Memisahkan layout scroll horizontal kolom card dari Filter Toolbar atas sehingga posisi toolbar tetap statis dan rapi saat board digeser ke samping.
- **Copy Cleanliness**: Menghapus seluruh label berulang "real-time" di judul aplikasi, komentar, dan landing page.

### Security & Optimization
- **Performance Drag & Drop (60fps)**: Memoization task filtering menggunakan `useMemo` dan transisi `CSS.Translate` untuk mencegah jitter/blur saat drag kartu.
- **Eliminasi Memory & CPU Leaks**: Menghapus interval timer lokal yang berjalan di tiap kartu task dan memusatkannya pada siklus central board.
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
