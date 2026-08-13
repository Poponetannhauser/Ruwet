# Ruwet - Kanban Board & Task Accountability

Aplikasi manajemen task / kanban board modern berbasis **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, dan **Supabase**.

## Fitur Utama

- 🚦 **Stale Task Detection**: Indikator visual otomatis (Hijau, Kuning, Merah) untuk task yang berhenti/stagnan melebihi threshold jam yang dapat dikonfigurasi per board.
- 📋 **Flexible Kanban Management**: Drag and drop task antar kolom (`dnd-kit`), tambah/edit/hapus kolom dan task dengan pergerakan posisi otomatis.
- 💬 **Interactive Comment Section**: Fitur diskusi komentar per task dengan tampilan chat bubble intuitif.
- 📜 **Automatic Activity Log**: Pencatatan riwayat aktivitas task otomatis (dibuat, dipindah, di-assign, diubah).
- 🔔 **In-App Notifications**: Notifikasi lonceng realtime saat user ditugaskan (assigned) pada task baru.
- 🤖 **Telegram Bot Companion**: Bot Telegram personal ("sekretaris pribadi") yang mengirim notifikasi penting dan mendukung command pull untuk ringkasan status task langsung dari chat.
- 🔒 **Security & Production Hardened**: Proteksi RLS Supabase, Security Headers di Next.js, Upstash Redis Rate Limiting, Zod Env Validation, CI/CD via GitHub Actions, serta Containerization (Docker).

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Runtime & Package Manager:** Bun
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Drag and Drop:** `@dnd-kit/core` & `@dnd-kit/sortable`
- **Database & Auth:** Supabase PostgreSQL + Auth + Realtime
- **Edge Functions:** Supabase Edge Functions (Deno) — Telegram bot handler & notifier
- **Testing:** Vitest + React Testing Library
- **Containerization:** Docker & Docker Compose (Standalone Output)
- **CI/CD:** GitHub Actions (Lint, Typecheck, Build)

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
     - Tabel utama (`profiles`, `boards`, `board_members`, `columns`, `tasks`, `activity_log`, `comments`, `notifications`, `telegram_metrics`).
     - Trigger otomatis pendaftaran user dari `auth.users` ke `public.profiles`.
     - Trigger `task_number` sekuensial per board.
     - Kebijakan Keamanan RLS (Row Level Security).

6. **Konfigurasi Auth & Redirect URL:**
   - Di Supabase Dashboard, masuk ke **Authentication > Providers** dan pastikan **Email** aktif.
   - Di **Authentication > URL Configuration**, tambahkan Redirect URL lokal (`http://localhost:3000`) dan domain deployment Anda.

7. **Jalankan Server Pengembangan:**
   ```bash
   bun run dev
   ```
   Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## Fitur Telegram Bot

Bot Telegram terintegrasi berfungsi sebagai *sekretaris pribadi* tiap anggota tim — memberikan notifikasi dan akses ringkasan status task langsung dari Telegram tanpa harus membuka web app.

### Cara Menghubungkan Akun
1. Buka web app → **Settings / Profile**
2. Klik tombol **"Connect Telegram"**
3. Ikuti instruksi yang muncul — kamu akan diarahkan ke bot Telegram
4. Kirim perintah yang tertera ke bot, akun langsung terhubung

### Command yang Tersedia
| Command | Fungsi |
|---|---|
| `/mytasks` | Tampilkan daftar task aktif yang di-assign ke kamu |
| `/stale` | Tampilkan task yang belum diperbarui melebihi threshold di board kamu |
| `/task <nomor atau kata kunci>` | Lihat detail singkat satu task (cari by nomor `#1` atau kata kunci judul) |
| `/help` | Tampilkan daftar perintah yang tersedia |

### Notifikasi Push Otomatis
Bot secara otomatis mengirim notifikasi saat:
- 📌 Kamu **di-assign** ke task baru
- ⚠️ Task yang kamu pegang menjadi **stale** (melewati threshold waktu tanpa update)
- 💬 Ada **komentar baru** pada task yang kamu handle *(notifikasi aktivitas saja — isi komentar tidak dikirim)*

### Setup Bot untuk Self-Host
Untuk menjalankan fitur bot di environment sendiri, diperlukan:
1. Buat bot Telegram via `@BotFather` → dapatkan **Bot Token**
2. Set Supabase Secrets:
   ```bash
   supabase secrets set TELEGRAM_BOT_TOKEN="..."
   supabase secrets set TELEGRAM_WEBHOOK_SECRET="..."
   supabase secrets set APP_BASE_URL="https://your-domain.com"
   ```
3. Deploy Edge Functions:
   ```bash
   supabase functions deploy telegram-webhook
   supabase functions deploy telegram-notifier
   ```
4. Daftarkan webhook Telegram ke URL Edge Function Anda

---
