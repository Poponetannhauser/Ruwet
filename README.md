# Ruwet - Kanban Board & Task Accountability

Aplikasi manajemen task / kanban board modern berbasis **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, dan **Supabase**.

## Fitur Utama

- 🚦 **Stale Task Detection**: Indikator visual otomatis (Hijau, Kuning, Merah) untuk task yang berhenti/stagnan melebihi threshold jam yang dapat dikonfigurasi per board.
- 📋 **Flexible Kanban Management**: Drag and drop task antar kolom (`dnd-kit`), tambah/edit/hapus kolom dan task dengan pergerakan posisi otomatis.
- 💬 **Interactive Comment Section**: Fitur diskusi komentar per task dengan tampilan chat bubble intuitif.
- 📜 **Automatic Activity Log**: Pencatatan riwayat aktivitas task otomatis (dibuat, dipindah, di-assign, diubah).
- 🔔 **In-App Notifications**: Notifikasi lonceng realtime saat user ditugaskan (assigned) pada task baru.
- 🔒 **Security Hardened**: Proteksi RLS (Row Level Security) Supabase, verifikasi IDOR/cross-board di Server Actions, serta in-memory Rate Limiting.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Runtime & Package Manager:** Bun
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Drag and Drop:** `@dnd-kit/core` & `@dnd-kit/sortable`
- **Database & Auth:** Supabase PostgreSQL + Auth + Realtime
- **Proxy Tooling:** RTK (Rust Token Killer)

---

## Setup Lokal

### Prasyarat
- [Bun](https://bun.sh) (v1.0+) atau Node.js (v20+)

### Langkah Setup

1. **Clone repository:**
   ```bash
   git clone https://github.com/Poponetannhauser/Ruwet.git
   cd Ruwet
   ```

2. **Install dependensi:**
   ```bash
   bun install
   ```

3. **Setup Proyek Supabase:**
   - Buat proyek baru di [Supabase Dashboard](https://supabase.com/dashboard).
   - Dapatkan **Project URL** dan **anon (public) key** dari menu `Project Settings > API`.

4. **Setup Environment Variables:**
   Salin `.env.example` menjadi `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Isi nilai variabel berikut dengan kredensial Supabase Anda:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

5. **Eksekusi Skrip Database (schema.sql):**
   - Buka menu **SQL Editor** pada Supabase Dashboard.
   - Buka file [`schema.sql`](schema.sql) dari repositori ini, salin seluruh kodenya, lalu tempel dan jalankan (**Run**) di SQL Editor.
   - Skrip ini otomatis mengonfigurasi:
     - Tabel utama (`profiles`, `boards`, `board_members`, `columns`, `tasks`, `activity_log`, `comments`, `notifications`).
     - Trigger otomatis pendaftaran user dari `auth.users` ke `public.profiles`.
     - Kebijakan Keamanan RLS (Row Level Security).

6. **Konfigurasi Auth & Redirect URL:**
   - Di Supabase Dashboard, masuk ke **Authentication > Providers** dan pastikan **Email** aktif.
   - Di **Authentication > URL Configuration**, tambahkan Redirect URL lokal (`http://localhost:3000`) dan domain deployment Vercel Anda.

7. **Jalankan Server Pengembangan:**
   ```bash
   bun run dev
   ```
   Buka [http://localhost:3000](http://localhost:3000) di browser.

---
