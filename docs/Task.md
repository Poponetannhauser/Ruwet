# Task Breakdown — Project Ruwet (untuk Junior Developer)

**Berdasarkan:** PRD_Ruwet.md v1.0
**Dibuat oleh:** Senior Dev (review gate)
**Tujuan dokumen:** Memecah PRD jadi task-task kecil yang bisa dikerjakan berurutan, dengan checkpoint review supaya tidak ada rework besar di tengah jalan.

---

## 0. Aturan Main (Wajib Dibaca Dulu)

1. **Satu task = satu branch.** Nama branch: `feature/<milestone>-<nomor-task>-<slug>`, contoh: `feature/m1-01-init-project`.
2. **Micro-commit.** Commit sesering mungkin per unit kerja kecil yang jelas (bukan satu commit raksasa di akhir). Format commit pakai Conventional Commits:
   - `feat: ...` — fitur baru
   - `fix: ...` — perbaikan bug
   - `chore: ...` — setup, config, dependency
   - `refactor: ...` — ubah struktur tanpa ubah behavior
   - `docs: ...` — dokumentasi
   - `style: ...` — ubah UI/CSS tanpa ubah logika

   Contoh: `feat(auth): tambah form login dengan validasi email`

3. **STOP DI SETIAP CHECKPOINT.** Setelah task selesai:
   - Buka Pull Request (PR) ke branch utama.
   - Tag Senior Dev untuk review.
   - **JANGAN mulai task berikutnya sebelum PR di-approve.** Kalau ada task lanjutan yang bergantung pada task ini dan kamu duluan, kita harus rombak ulang kalau reviewnya minta perubahan struktur.
   - Kalau butuh progress paralel sambil nunggu review, kerjakan riset/baca dokumentasi task berikutnya — tapi jangan nulis kode implementasi.
4. **Definition of Done (DoD)** di tiap task harus semua tercentang sebelum minta review.
5. Kalau ragu-ragu di tengah task (misalnya nama kolom database, struktur folder), **tanya dulu, jangan asumsi sendiri** — asumsi yang salah di awal akan menjalar ke semua task berikutnya.

---

## MILESTONE 1 — Fondasi

> Tidak boleh lanjut ke Milestone 2 sebelum SEMUA task di milestone ini di-approve. Ini pondasi — kalau salah, semua yang di atasnya rombak total.

### Task M1-01 — Setup Project Awal
**Deskripsi:** Inisialisasi project Next.js + TypeScript + Tailwind CSS, konfigurasi ESLint/Prettier, struktur folder dasar.

**Langkah:**
- [x] `create-next-app` dengan TypeScript + Tailwind
- [x] Setup ESLint + Prettier + husky pre-commit (opsional tapi disarankan)
- [x] Buat struktur folder: `app/`, `components/`, `lib/`, `types/`, `hooks/`
- [x] Push `.env.example` (tanpa isi rahasia)

**DoD:**
- [x] Project bisa `bun run dev` tanpa error
- [x] Lint bersih (`bun run lint`)
- [x] README ada instruksi setup lokal

**Commit contoh:** `chore: setup project next.js + tailwind + eslint`

🛑 **STOP — buka PR, minta review sebelum lanjut ke M1-02.**

---

### Task M1-02 — Setup Supabase Project
**Deskripsi:** Buat project Supabase, hubungkan ke aplikasi, setup environment variable.

**Langkah:**
- [x] Buat project di Supabase
- [x] Install `@supabase/supabase-js`
- [x] Buat `lib/supabase/client.ts` (client-side) dan `lib/supabase/server.ts` (server-side)
- [x] Simpan `SUPABASE_URL` & `SUPABASE_ANON_KEY` di `.env.local`

**DoD:**
- [x] Koneksi ke Supabase berhasil (test query sederhana, misal `select now()`)
- [x] Tidak ada key/secret yang ke-commit ke repo

**Commit contoh:** `chore: integrasi supabase client`

🛑 **STOP — review sebelum lanjut.**

---

### Task M1-03 — Skema Database & RLS Dasar
**Deskripsi:** Buat tabel `profiles`, `boards`, `board_members` sesuai PRD section 10, plus RLS policy dasar.

**Langkah:**
- [x] Tulis migration SQL untuk `profiles`, `boards`, `board_members`
- [x] Aktifkan RLS di semua tabel
- [x] Policy: user hanya bisa `select` board yang dia jadi member-nya
- [x] Simpan semua SQL di `schema.sql` (sesuai referensi PRD section 14)

**DoD:**
- [x] Migration bisa dijalankan ulang dari nol tanpa error
- [x] Test manual: user A tidak bisa lihat board milik user B lewat query langsung
- [x] Dokumentasi singkat struktur tabel di README/`docs/schema.md`

**Commit contoh:** `feat(db): tambah skema profiles, boards, board_members + RLS`

🛑 **STOP — ini fondasi paling kritis. Wajib direview sebelum lanjut ke autentikasi.**

---

### Task M1-04 — Autentikasi (Sign Up, Login, Logout)
**Deskripsi:** Implementasi auth pakai Supabase Auth sesuai user story #9 dan flow onboarding di PRD section 6.

**Langkah:**
- [x] Halaman sign up (email + password)
- [x] Verifikasi email (pakai flow default Supabase)
- [x] Halaman login
- [x] Logout + proteksi route (redirect ke login kalau belum auth)
- [x] Trigger otomatis: saat sign up sukses, buat row di `profiles`

**DoD:**
- [x] User baru bisa sign up → dapat email verifikasi → login sukses
- [x] Route yang butuh auth tidak bisa diakses tanpa login (coba akses langsung via URL)
- [x] Logout menghapus session dengan benar

**Commit contoh:** `feat(auth): implementasi sign up, login, logout`

🛑 **STOP — review. Setelah ini baru boleh masuk Milestone 2.**

---

## MILESTONE 2 — Core Kanban

> Prasyarat: Milestone 1 sudah full approved.

### Task M2-01 — CRUD Board
**Deskripsi:** User bisa buat, edit nama, hapus board (user story #9, PRD section 5 P0).

**Langkah:**
- [ ] Form buat board baru
- [ ] Saat board dibuat → otomatis generate 4 kolom default (To Do, In Progress, Review, Done) sesuai flow 1
- [ ] Edit nama board
- [ ] Hapus board (dengan konfirmasi)
- [ ] List board milik user (yang dia jadi member)

**DoD:**
- [ ] Buat board baru langsung muncul 4 kolom default
- [ ] Edit & hapus board berjalan dan RLS tetap terjaga (user lain tidak bisa edit board yang bukan miliknya)

**Commit contoh:** `feat(board): CRUD board + auto-generate kolom default`

🛑 **STOP — review sebelum lanjut ke kolom & member.**

---

### Task M2-02 — Undang/Tambah Anggota Board
**Deskripsi:** User story #9 bagian invite, PRD flow 1 langkah 3.

**Langkah:**
- [ ] Generate invite link atau input email untuk invite
- [ ] User yang diundang otomatis masuk `board_members` setelah accept
- [ ] List anggota board di UI

**DoD:**
- [ ] User baru bisa join board lewat invite
- [ ] User yang bukan member tidak bisa akses board tersebut (cek RLS lagi)

**Commit contoh:** `feat(board): fitur invite anggota board`

🛑 **STOP — review.**

---

### Task M2-03 — CRUD Kolom
**Deskripsi:** Kolom kanban fleksibel, bukan hardcode (PRD section 5 & 9).

**Langkah:**
- [ ] Tambah kolom baru
- [ ] Edit nama kolom
- [ ] Hapus kolom (tentukan behavior: task di dalamnya pindah ke mana? — tanya dulu ke Senior Dev kalau belum jelas)
- [ ] Reorder posisi kolom

**DoD:**
- [ ] CRUD kolom berjalan tanpa merusak urutan kolom lain
- [ ] Behavior hapus kolom sudah dikonfirmasi & terdokumentasi

**Commit contoh:** `feat(column): CRUD kolom + reorder`

🛑 **STOP — review sebelum masuk ke task.**

---

### Task M2-04 — CRUD Task
**Deskripsi:** Task dengan judul, deskripsi, assignee, due date (PRD user story #1, #2).

**Langkah:**
- [ ] Buat task baru di kolom tertentu
- [ ] Edit task (judul, deskripsi, assignee, due date)
- [ ] Hapus task
- [ ] Assign diri sendiri ke task (user story #2)
- [ ] Saat task dibuat, set `status_updated_at` = waktu sekarang

**DoD:**
- [ ] CRUD task berjalan penuh
- [ ] Assign diri berhasil dan langsung terlihat siapa assignee-nya
- [ ] Field `status_updated_at` konsisten dengan `updated_at` (dua kolom terpisah sesuai PRD section 10)

**Commit contoh:** `feat(task): CRUD task + self-assign`

🛑 **STOP — review. Ini dasar untuk drag-and-drop.**

---

### Task M2-05 — Drag-and-Drop Dasar (Tanpa Realtime Dulu)
**Deskripsi:** User story #3, pakai `dnd-kit`, TANPA realtime sync dulu (itu masuk Milestone 3).

**Langkah:**
- [ ] Setup `dnd-kit` untuk drag antar kolom
- [ ] Reorder task dalam kolom yang sama
- [ ] Update `status_updated_at` setiap kali task pindah kolom (bukan saat reorder dalam kolom sama)
- [ ] Optimistic update di UI (update tampilan dulu, baru sync ke DB)

**DoD:**
- [ ] Drag antar kolom & reorder jalan mulus di desktop
- [ ] `status_updated_at` hanya berubah saat pindah kolom, bukan saat reorder saja
- [ ] Kalau update ke DB gagal, UI rollback ke posisi semula (PRD section 7 — reliabilitas)

**Commit contoh:** `feat(kanban): drag-and-drop dasar dengan dnd-kit`

🛑 **STOP — review sebelum masuk Milestone 3 (realtime).**

---

## MILESTONE 3 — Realtime & Accountability

> Prasyarat: Milestone 2 full approved. Ini bagian paling kritis dari diferensiasi produk — jangan buru-buru.

### Task M3-01 — Integrasi Supabase Realtime
**Deskripsi:** Perubahan board/task terlihat real-time oleh semua anggota, target < 2 detik (PRD section 7).

**Langkah:**
- [ ] Subscribe ke perubahan tabel `tasks` dan `columns` per board
- [ ] Update state lokal (Zustand) saat ada event realtime masuk
- [ ] Handle kasus: user A drag task, user B lihat board yang sama — pastikan tidak dobel-update atau konflik dengan optimistic update milik user A sendiri

**DoD:**
- [ ] Buka board di 2 browser berbeda, drag task di satu sisi → muncul di sisi lain dalam < 2 detik
- [ ] Tidak ada flicker/dobel-render aneh saat event realtime masuk

**Commit contoh:** `feat(realtime): integrasi supabase realtime untuk sync task & kolom`

🛑 **STOP — review. Ini rawan bug race condition, wajib dicek bareng.**

---

### Task M3-02 — Stale Task Detection
**Deskripsi:** Sesuai metodologi PRD section 8.

**Langkah:**
- [ ] Implementasi logika: task stale jika `assignee_id` ada, kolom bukan "Done", dan `now() - status_updated_at > threshold`
- [ ] Badge visual: hijau (aman), kuning (>70% threshold), merah (lewat threshold)
- [ ] Threshold dikonfigurasi per board (default 2 hari), simpan di tabel `boards`
- [ ] Update badge secara real-time (tidak perlu refresh manual)

**DoD:**
- [ ] Badge berubah warna sesuai kondisi waktu (test dengan threshold kecil dulu, misal 1 menit, untuk mempercepat testing)
- [ ] Ubah threshold di setting board langsung berpengaruh ke semua task

**Commit contoh:** `feat(stale): implementasi deteksi & indikator visual stale task`

🛑 **STOP — review sebelum lanjut activity log.**

---

### Task M3-03 — Activity Log Otomatis
**Deskripsi:** PRD user story #5, tabel `activity_log`.

**Langkah:**
- [ ] Trigger/log otomatis saat: task dibuat, di-assign, pindah status/kolom
- [ ] Simpan detail dalam format `jsonb` (siapa, apa, kapan)
- [ ] UI: tampilkan activity feed di detail task, urut dari terbaru

**DoD:**
- [ ] Semua aksi di atas tercatat otomatis tanpa input manual
- [ ] Activity feed terbaca jelas ("User X mengambil task ini", dst — sesuai flow 2 langkah 3)

**Commit contoh:** `feat(activity): activity log otomatis per task`

🛑 **STOP — review. Setelah ini baru boleh masuk Milestone 4.**

---

## MILESTONE 4 — Kolaborasi

> Prasyarat: Milestone 3 full approved.

### Task M4-01 — Komentar per Task
**Deskripsi:** User story #6, tabel `comments`.

**Langkah:**
- [ ] Form tambah komentar di detail task
- [ ] List komentar urut waktu
- [ ] RLS: hanya member board yang bisa komentar/lihat

**DoD:**
- [ ] Komentar tersimpan dan muncul real-time ke semua anggota yang sedang buka task itu

**Commit contoh:** `feat(comments): fitur komentar per task`

🛑 **STOP — review.**

---

### Task M4-02 — Notifikasi In-App
**Deskripsi:** User story #7, saat di-assign task baru.

**Langkah:**
- [ ] Trigger notifikasi saat user di-assign ke task
- [ ] UI badge/lonceng dengan counter unread
- [ ] Tandai notifikasi sebagai "read" saat diklik

**DoD:**
- [ ] Notifikasi muncul real-time saat di-assign
- [ ] Counter unread akurat

**Commit contoh:** `feat(notification): notifikasi in-app saat assign task`

🛑 **STOP — review.**

---

### Task M4-03 — Dashboard Ringkasan
**Deskripsi:** User story #8.

**Langkah:**
- [ ] Hitung jumlah task per status
- [ ] Hitung jumlah task overdue per anggota
- [ ] Tampilkan dalam bentuk chart/summary sederhana

**DoD:**
- [ ] Angka di dashboard sesuai dengan data aktual di board (cross-check manual)

**Commit contoh:** `feat(dashboard): dashboard ringkasan board`

🛑 **STOP — review. Setelah ini masuk Milestone 5 (polish).**

---

## MILESTONE 5 — Polish

> Prasyarat: Milestone 4 full approved. Ini tahap terakhir, tapi tetap dipecah kecil dan direview per bagian — jangan digabung jadi satu PR raksasa.

### Task M5-01 — Responsive & Aksesibilitas
**Langkah:**
- [ ] Test & perbaiki layout di 360px, tablet, desktop
- [ ] Cek kontras warna WCAG AA (termasuk badge stale task)
- [ ] Aksi utama (drag-drop alternatif, assign, comment) bisa diakses via keyboard

**DoD:**
- [ ] Lolos cek manual di 3 breakpoint
- [ ] Tab-navigation berfungsi untuk aksi utama

**Commit contoh:** `fix(a11y): perbaikan responsive & aksesibilitas`

🛑 **STOP — review.**

---

### Task M5-02 — Empty State, Loading State, Error Handling
**Langkah:**
- [ ] Empty state untuk board kosong, kolom kosong, belum ada task
- [ ] Loading skeleton saat fetch data
- [ ] Error handling untuk gagal koneksi/realtime terputus

**DoD:**
- [ ] Semua state di atas punya tampilan yang jelas, tidak blank/crash

**Commit contoh:** `feat(ux): tambah empty state, loading state, error handling`

🛑 **STOP — review.**

---

### Task M5-03 — Animasi & Micro-interaction
**Langkah:**
- [ ] Framer Motion untuk transisi drag-drop
- [ ] Transisi halus perubahan status/badge stale

**DoD:**
- [ ] Animasi tidak mengganggu performa (tetap smooth di board dengan banyak task)

**Commit contoh:** `style: tambah animasi framer motion untuk drag-drop & state changes`

🛑 **STOP — review.**

---

### Task M5-04 — Deploy & Dokumentasi
**Langkah:**
- [ ] Deploy frontend ke Vercel
- [ ] Pastikan environment variable production benar
- [ ] Tulis README lengkap + demo video/GIF
- [ ] Update link live demo di PRD section 14

**DoD:**
- [ ] Live demo bisa diakses publik dan berfungsi penuh
- [ ] README cukup jelas untuk orang lain setup project dari nol

**Commit contoh:** `docs: dokumentasi final + deploy production`

🛑 **STOP — review final sebelum project dianggap selesai.**

---

## Catatan Penting untuk Junior

- Kalau saat mengerjakan task ketemu hal yang bikin kamu berpikir "kayaknya task sebelumnya harus diubah dulu" — **stop, jangan lanjut, laporkan ke Senior Dev.** Itu justru tanda sistem gating ini bekerja dengan benar.
- Task-task di atas sengaja kecil supaya review cepat dan salah arah bisa ketahuan lebih awal, bukan setelah 3 milestone berjalan.
- Kalau ada task yang ternyata masih kebesaran saat dikerjakan, boleh dipecah lagi jadi sub-task — komunikasikan dulu sebelum mulai coding.
