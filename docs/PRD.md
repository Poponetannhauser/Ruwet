# Product Requirements Document (PRD)
## Ruwet — Kanban Board dengan Accountability & Real-Time Sync

**Versi:** 1.0
**Tanggal:** 4 Agustus 2026
**Author:** Poponetannhauser
**Status:** Draft

---

## 1. Latar Belakang & Masalah

Tim developer sering berkoordinasi hanya lewat chat (WhatsApp/Discord/Telegram), yang menyebabkan:

- **Miskomunikasi status kerja** — tidak ada satu sumber kebenaran (single source of truth) soal siapa mengerjakan apa dan sejauh mana progressnya.
- **Task "diambil" tapi tidak dikerjakan** — anggota tim meng-assign diri ke sebuah task, tapi tidak ada progress selama beberapa hari, sementara anggota lain menunggu tanpa tahu harus menunggu atau mengambil alih.
- **Riwayat kerja tidak tercatat** — sulit melacak siapa mengubah apa dan kapan, terutama saat terjadi masalah atau evaluasi kerja tim.
- **Diskusi tersebar** — pembahasan teknis soal sebuah task bercampur dengan obrolan lain di chat group, sehingga sulit dicari kembali.
- **Tidak mau pakai Notion / Jira yang terlalu kompleks** — mau yang simpel tapi fungsional dan tentu saja gratis.

Ruwet dibangun untuk menyelesaikan masalah ini secara langsung, dengan fokus pada **transparansi status** dan **akuntabilitas** tim kecil (3–15 orang), bukan sekadar kanban board generik.

---

## 2. Tujuan Produk

1. Memberikan satu sumber kebenaran soal status setiap task, real-time, tanpa perlu tanya di chat.
2. Membuat task yang "diambil tapi mangkrak" terlihat jelas secara visual, sehingga tim bisa segera menindaklanjuti.
3. Mencatat riwayat aktivitas tiap task secara otomatis, menggantikan kebutuhan update manual di chat.
4. Menyediakan ruang diskusi per-task, mengurangi ketergantungan pada chat eksternal.

### Non-Goals (di luar cakupan v1)
- Tidak menggantikan tools manajemen proyek enterprise (Jira, Linear) secara fitur lengkap.
- Tidak mencakup time tracking mendetail (jam kerja per task).
- Tidak mencakup integrasi pihak ketiga (Slack, GitHub) di versi awal — masuk roadmap.

---

## 3. Target Pengguna

**Primary user:** Tim developer kecil (freelance/startup/tim kuliah) yang berkoordinasi lewat chat dan butuh visibilitas kerja tanpa overhead tools kompleks seperti Jira.

**Contoh persona:**
- *Product Lead* — butuh tahu status semua task tanpa harus tanya satu-satu di chat.
- *Developer* — butuh tempat jelas untuk melihat task miliknya dan mendiskusikan blocker.

---

## 4. User Stories

| # | Sebagai | Saya ingin | Supaya |
|---|---------|-----------|--------|
| 1 | Anggota tim | Melihat papan kanban board tim saya | Tahu status semua task secara visual |
| 2 | Anggota tim | Mengambil (assign diri) sebuah task | Menandai bahwa saya yang mengerjakannya |
| 3 | Anggota tim | Memindahkan task antar kolom lewat drag-and-drop | Update status dengan cepat tanpa friksi |
| 4 | Product Lead | Melihat indikator visual untuk task yang stale (tidak ada progress > 2 hari) | Bisa segera follow-up tanpa harus menagih manual |
| 5 | Anggota tim | Melihat activity feed suatu task | Tahu riwayat perubahan tanpa tanya di chat |
| 6 | Anggota tim | Berkomentar di dalam task | Diskusi teknis tidak tercecer di grup chat |
| 7 | Anggota tim | Menerima notifikasi saat di-assign task baru | Tidak ketinggalan info |
| 8 | Product Lead | Melihat dashboard ringkasan (jumlah task overdue per anggota) | Evaluasi beban kerja tim dengan cepat |
| 9 | User baru | Membuat board dan mengundang anggota tim | Mulai pakai TaskSync untuk tim saya |

---

## 5. Fitur & Prioritas

### P0 — Must Have (MVP)
- Autentikasi (sign up, login, logout) via Supabase Auth
- CRUD board (buat, edit nama, hapus board)
- Undang/tambah anggota ke board
- CRUD kolom (default: To Do, In Progress, Review, Done — bisa ditambah/ubah nama)
- CRUD task (judul, deskripsi, assignee, due date)
- Drag-and-drop task antar kolom & reorder dalam kolom
- Real-time sync antar anggota (perubahan langsung terlihat semua user)
- Indikator visual "stale task" (badge/warna beda jika status tidak berubah > X hari, X bisa dikonfigurasi per board)
- Activity log otomatis per task (dibuat, di-assign, pindah status)

### P1 — Should Have
- Komentar per task
- Dashboard ringkasan (jumlah task per status, task overdue per anggota)
- Filter & sort task (by assignee, by due date, by status)
- Notifikasi in-app (badge/lonceng) saat di-assign task

### P2 — Nice to Have (Post-MVP / Roadmap)
- Dark mode
- Notifikasi email
- Label/tag warna pada task
- Search global
- Export board ke CSV/PDF
- Integrasi Slack/Discord webhook untuk notifikasi

---

## 6. Alur Pengguna Utama (User Flow)

**Flow 1 — Onboarding**
1. User sign up → verifikasi email (Supabase Auth)
2. User membuat board baru → sistem otomatis buat 4 kolom default
3. User mengundang anggota tim via email/link invite

**Flow 2 — Mengambil & mengerjakan task**
1. User membuka board → melihat task di kolom "To Do"
2. User klik task → assign diri sendiri
3. Task langsung tercatat di activity log ("[User] mengambil task ini")
4. User drag task ke "In Progress" → `status_updated_at` ter-update, timer stale reset
5. Jika lebih dari 2 hari task tidak berpindah kolom → card menampilkan badge warning merah, terlihat oleh semua anggota secara real-time

**Flow 3 — Diskusi & kolaborasi**
1. Anggota lain membuka task yang sama → menulis komentar (misal menanyakan progress)
2. User yang di-assign mendapat notifikasi in-app
3. Semua histori diskusi tersimpan di task, tidak hilang di chat

---

## 7. Requirement Non-Fungsional

| Aspek | Requirement |
|---|---|
| **Performa** | Perubahan real-time harus terlihat oleh user lain dalam < 2 detik |
| **Responsif** | Layout harus tetap fungsional di layar mobile (min. 360px) hingga desktop |
| **Aksesibilitas** | Kontras warna memenuhi WCAG AA, seluruh aksi utama bisa diakses via keyboard |
| **Keamanan** | Row Level Security (RLS) aktif di seluruh tabel Supabase — user hanya bisa akses board yang dia jadi member |
| **Skalabilitas** | Struktur data mendukung penambahan kolom/board custom tanpa migrasi skema |
| **Reliabilitas** | Drag-and-drop tidak boleh kehilangan data jika koneksi terputus sesaat (optimistic update + rollback jika gagal) |

---

## 8. Metodologi Deteksi "Stale Task"

Task dianggap stale jika:
```
assignee_id IS NOT NULL
AND kolom saat ini BUKAN kolom "Done"
AND (now() - status_updated_at) > threshold (default: 2 hari, dapat dikonfigurasi per board)
```

Representasi visual:
- **Hijau/normal** — masih dalam threshold aman
- **Kuning** — mendekati threshold (misal > 70% dari batas waktu)
- **Merah** — sudah melewati threshold, ditandai jelas di card

---

## 9. Tech Stack

| Layer | Teknologi | Alasan |
|---|---|---|
| Frontend | Next.js + TypeScript | SSR/SSG untuk performa, type-safety |
| Styling | Tailwind CSS | Konsisten, cepat untuk iterasi UI |
| Animasi | Framer Motion | Transisi halus untuk drag-drop & state changes |
| Drag & Drop | dnd-kit | Ringan, accessible, aktif dikembangkan |
| State Management | Zustand | Sederhana untuk state board/kanban |
| Backend & DB | Supabase (PostgreSQL) | Auth, database, dan realtime tersedia out-of-the-box |
| Realtime | Supabase Realtime (WebSocket) | Native, tidak perlu setup server terpisah |
| Hosting | Vercel (frontend) + Supabase Cloud | Deploy cepat, gratis untuk skala portofolio |

---

## 10. Skema Data (ringkasan)

Lihat detail lengkap di `schema.sql` pada repo. Tabel utama:
- `profiles` — data user
- `boards` — workspace tim
- `board_members` — relasi user ↔ board
- `columns` — kolom kanban per board (fleksibel, bukan hardcode)
- `tasks` — task dengan `status_updated_at` terpisah dari `updated_at` untuk deteksi stale
- `activity_log` — audit trail otomatis (jsonb detail)
- `comments` — diskusi per task

---

## 11. Metrik Keberhasilan (untuk validasi konsep, meski project portofolio)

| Metrik | Target |
|---|---|
| Waktu rata-rata task berpindah status setelah di-assign | Menurun dibanding baseline tim (subjektif, evaluasi kualitatif) |
| Jumlah task stale per minggu | Menurun setelah pemakaian rutin |
| Adopsi komentar in-app vs chat eksternal | Meningkat (mengurangi pesan koordinasi di chat group) |

*(Catatan: karena ini project portofolio, metrik ini bersifat aspirasional — bisa dijadikan bahan cerita "kalau dipakai tim sungguhan, ini yang diharapkan terjadi".)*

---

## 12. Roadmap Pengerjaan (Milestone)

**Milestone 1 — Fondasi**
- Setup project (Next.js, Supabase, Tailwind)
- Autentikasi & profile
- Skema database + RLS policy

**Milestone 2 — Core Kanban**
- CRUD board, kolom, task
- Drag-and-drop dasar (tanpa realtime dulu)

**Milestone 3 — Realtime & Accountability**
- Integrasi Supabase Realtime
- Fitur stale task detection + indikator visual
- Activity log otomatis

**Milestone 4 — Kolaborasi**
- Komentar per task
- Notifikasi in-app
- Dashboard ringkasan

**Milestone 5 — Polish**
- Responsive & aksesibilitas
- Empty state, loading state, error handling
- Animasi & micro-interaction (Framer Motion)
- Deploy & dokumentasi (README, demo video)

---

## 13. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Realtime sync bikin bug race condition (dua user edit bersamaan) | Gunakan optimistic update + last-write-wins sederhana untuk MVP, catat sebagai known limitation |
| Scope creep (nambah fitur terus, project tak selesai) | Kunci fitur P0 dulu sampai selesai & deploy, baru lanjut P1/P2 |
| Waktu pengerjaan solo terbatas | Prioritaskan milestone 1–3 sebagai "versi layak demo", milestone 4–5 sebagai polish lanjutan |

---

## 14. Lampiran
- Skema database lengkap: lihat `schema.sql`
- Repo: 
- Live demo: [link Vercel, diisi setelah deploy]
