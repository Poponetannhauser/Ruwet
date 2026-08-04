# Ruwet - Realtime Kanban Board

Aplikasi manajemen task/kanban board berbasis **Next.js**, **TypeScript**, **Tailwind CSS**, dan **Supabase**.

## Tech Stack
- **Framework:** Next.js (App Router)
- **Runtime & Package Manager:** Bun
- **Styling:** Tailwind CSS
- **Database & Auth:** Supabase

## Setup Lokal

### Prasyarat
- [Bun](https://bun.sh) v1.0.0 atau lebih baru

### Langkah Setup

1. **Clone repository & masuk ke direktori:**
   ```bash
   git clone https://github.com/Poponetannhauser/Ruwet.git
   cd Ruwet
   ```

2. **Install dependensi:**
   ```bash
   bun install
   ```

3. **Setup Environment Variables:**
   Salin `.env.example` ke `.env.local` dan isi nilainya:
   ```bash
   cp .env.example .env.local
   ```

4. **Jalankan server pengembangan:**
   ```bash
   bun run dev
   ```
   Buka [http://localhost:3000](http://localhost:3000) di browser.

5. **Linting & Code Quality:**
   ```bash
   bun run lint
   ```
