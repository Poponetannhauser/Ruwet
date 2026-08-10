# TASKS — Ruwet Telegram Bot (Feature Add-on)

**Sumber:** `PRD-Telegram-Bot.md` v1.1
**Tujuan file ini:** Pecah fitur jadi task kecil yang bisa dikerjakan & di-commit satu-satu, dengan aturan kerja yang jelas supaya history rapi dan gampang di-review — meski solo project.

---

## 0. Aturan Kerja

### 0.1 Micro-commit (bukan micro-PR)

Satu **PR per milestone** (A, B, C — lihat PRD Bagian 12), tapi di dalamnya terdiri dari banyak **commit kecil, atomik, dan bisa berdiri sendiri**. Ini beda dari micro-PR (PR kecil-kecil per task) karena project solo — overhead buka/review/merge PR per task kecil nggak sepadan, tapi disiplin histori commit tetap dijaga supaya:
- Gampang di-`git bisect` kalau ada bug regresi
- Gampang di-review manual sebelum merge PR besar (baca commit-by-commit, bukan diff raksasa sekaligus)
- Gampang di-revert sebagian tanpa nge-revert seluruh milestone

**Aturan commit:**
1. Satu commit = satu perubahan logis. Kalau kamu butuh kata "dan" untuk jelasin commit message, kemungkinan itu 2 commit.
2. Commit harus tetap dalam keadaan **build passing** (`bun run build` tidak boleh gagal di commit manapun, meski fitur belum selesai — pakai feature flag/stub kalau perlu, bukan commit setengah jadi yang bikin build merah).
3. Format pesan: [Conventional Commits](https://www.conventionalcommits.org/)
   ```
   <type>(<scope>): <deskripsi singkat imperatif>

   [body opsional: kenapa, bukan apa — apa-nya sudah kelihatan di diff]
   ```
   Type yang dipakai: `feat`, `fix`, `chore`, `refactor`, `test`, `docs`, `migration`
   Scope yang dipakai di fitur ini: `telegram-link`, `telegram-notify`, `telegram-command`, `schema`, `web-ui`

   Contoh:
   ```
   feat(telegram-link): validate secret_token header on webhook

   Menolak request yang tidak menyertakan X-Telegram-Bot-Api-Secret-Token
   yang cocok, mencegah endpoint disalahgunakan pihak luar.
   ```
4. Setiap task di bawah = idealnya 1 commit. Kalau ternyata perlu >1 commit, itu sinyal task-nya masih terlalu besar — pecah lebih lanjut sebelum mulai coding, bukan setelahnya.

### 0.2 Review

Karena solo project, "review" di sini bukan review orang lain, tapi **jeda sadar sebelum merge**, dengan dua level:

| Level | Kapan dipakai | Bentuknya |
|---|---|---|
| **Automated** | Semua task | `bun run lint`, `bun run typecheck`, `bun run test` (kalau ada test untuk task itu) harus hijau sebelum commit di-push |
| **Manual Review** | Task yang ditandai 🔒 di bawah — menyentuh keamanan, data user lain, atau alur yang gagal-diam (silent fail) | Baca ulang diff task tsb **besoknya** (bukan langsung setelah nulis, biar bukan "membaca tulisan sendiri masih hangat") sambil isi checklist di tiap task |

Task yang ditandai 🔒 **tidak boleh di-merge ke PR milestone tanpa manual review checklist-nya dicentang semua.**

### 0.3 Bun

Bun dipakai sebagai package manager & script runner di **root Next.js project** (`bun install`, `bun run dev`, `bun run build`, `bun run lint`, `bun run test`, `bunx <tool>`) — menggantikan semua command `npm`/`yarn`/`pnpm` di dokumentasi manapun kalau ada.

⚠️ **Catatan penting:** Supabase Edge Function **tetap jalan di runtime Deno**, bukan Bun — ini keharusan platform Supabase (lihat PRD Bagian 8), bukan pilihan yang bisa diganti. Bun di sini scope-nya cuma untuk tooling repo utama (frontend, testing, script lokal), bukan untuk menjalankan Edge Function itu sendiri. Kalau perlu test logic Edge Function secara lokal, tetap pakai `supabase functions serve` (Deno), bukan `bun run`.

### 0.4 rtk-rules — Realtime/Kanban Sync Rules (draft awal)

Belum ada sebelumnya, jadi ini draft awal berdasarkan titik rawan yang disebut di PRD utama (Bagian 13: race condition) dan PRD bot (notifikasi berbasis event board). Sesuaikan kalau ada preferensi lain.

1. **Satu sumber trigger per event.** Notifikasi Telegram untuk assign/stale/komentar **hanya** boleh dipicu dari Database Webhook (server-side, atas perubahan row yang benar-benar tersimpan) — **tidak pernah** dari client-side setelah optimistic update. Optimistic update di client itu tentatif (bisa rollback), kalau notifikasi dipicu dari situ bisa terkirim untuk perubahan yang akhirnya di-rollback.
2. **Idempotency check di notifier.** Karena Telegram bisa retry webhook (lihat PRD 8a poin 4) dan Database Webhook juga bisa fire lebih dari sekali dalam kasus tertentu, Edge Function notifier harus aman dipanggil dua kali untuk event yang sama tanpa mengirim notifikasi dobel (misal: cek `activity_log.id` yang sudah diproses, bukan asumsi "pasti sekali panggil").
3. **Realtime subscription di client tidak pernah nunggu bot.** Update board di web app (via Supabase Realtime) harus tetap secepat sebelumnya — bot/notifier adalah side-effect async yang terpisah total dari jalur realtime sync utama, bukan dependency-nya. Kalau Telegram API lambat/down, board di web tidak boleh ikut lambat.
4. **Stale detection tetap dihitung dari `status_updated_at`, bukan dari kapan notifikasi terkirim.** Jangan pernah pakai timestamp pengiriman notifikasi Telegram sebagai referensi waktu apa pun di logic stale — dua concern ini harus independen supaya kegagalan kirim notif tidak pernah mengubah kapan task dianggap stale.
5. **Command pull (read-only) tidak boleh menyentuh state realtime sama sekali.** `/mytasks`, `/stale`, `/task` murni query langsung ke Supabase saat command diterima — tidak subscribe, tidak cache state board di Edge Function, supaya tidak ada state ganda yang bisa out-of-sync dengan board.

---

## 1. Milestone A — Linking & Notifier Dasar

- [x] **A1 — Setup bot via BotFather**
  Commit: `chore(telegram-link): document bot token setup`
  - Buat bot lewat `@BotFather`, simpan token ke `.env.local` (dev) & Supabase secrets (prod)
  - Tambah `.env.example` entry `TELEGRAM_BOT_TOKEN=`
  - Review: automated saja

- [x] **A2 — Migrasi skema `profiles`**
  Commit: `migration(schema): add telegram_chat_id and telegram_link_token to profiles`
  - Kolom `telegram_chat_id` (text, nullable, unique)
  - Kolom `telegram_link_token` (text, nullable)
  - RLS: pastikan kolom ini tidak bisa di-update bebas oleh user lewat client (cuma lewat Edge Function pakai service role)
  - Review: 🔒 manual — cek RLS policy tidak bocor, kolom tidak writable dari client langsung

- [x] **A3 — Endpoint generate link token di web app**
  Commit: `feat(telegram-link): generate one-time link token from profile settings`
  - Tombol "Connect Telegram" → generate token acak, simpan ke `telegram_link_token`, tampilkan instruksi + deep link ke bot (`t.me/<botname>?start=<token>`)
  - Token harus expire (misal 10 menit) — cek timestamp, bukan token yang hidup selamanya
  - Review: 🔒 manual — pastikan token tidak predictable & expired token ditolak di A4

- [x] **A4 — Edge Function: handler `/start`**
  Commit: `feat(telegram-link): handle /start webhook and verify link token`
  - Terima update dari Telegram, ambil `chat_id` + token dari payload `/start <token>`
  - Cocokkan ke `profiles.telegram_link_token`, kalau valid & belum expired → simpan `chat_id`, hapus token
  - Balas konfirmasi ke user via `sendMessage`
  - Review: 🔒 manual — checklist di 0.2

- [x] **A5 — Validasi `secret_token` webhook**
  Commit: `feat(telegram-link): validate X-Telegram-Bot-Api-Secret-Token header`
  - Set `secret_token` saat `setWebhook`, validasi di setiap request masuk sebelum diproses lebih lanjut
  - Request tanpa header valid → reject 401, jangan diproses
  - Review: 🔒 manual — **wajib**, ini satu-satunya lapisan yang mencegah endpoint dipalsukan

- [x] **A6 — UI status koneksi Telegram**
  Commit: `feat(web-ui): show telegram connection status in profile settings`
  - Tampilkan "Connected"/"Not connected" berdasar `telegram_chat_id`, tombol re-connect (lihat PRD Bagian 6 soal re-linking)
  - Review: automated saja

- [x] **A7 — Edge Function notifier: assign**
  Commit: `feat(telegram-notify): send notification on task assignment`
  - Database Webhook on `tasks` update (assignee berubah) → Edge Function → `sendMessage` ke `telegram_chat_id` assignee
  - Ikuti rtk-rules #1 (trigger dari DB webhook, bukan client) dan #2 (idempotency)
  - Review: 🔒 manual — cek idempotency & bahwa gagal kirim tidak throw error yang mengganggu webhook lain

- [x] **A8 — Edge Function notifier: stale**
  Commit: `feat(telegram-notify): send notification when task becomes stale`
  - Trigger dari perubahan status stale (lihat metodologi PRD utama Bagian 8)
  - Ikuti rtk-rules #4 (stale timestamp independen dari notif)
  - Review: 🔒 manual

- [x] **A9 — Template pesan notifikasi**
  Commit: `feat(telegram-notify): add message templates for assign and stale events`
  - Helper function terpusat untuk format pesan (biar konsisten & gampang diubah), termasuk link balik ke task
  - Review: automated saja

- [x] **A10 — Testing end-to-end dengan tim asli**
  Commit: `test(telegram-notify): manual e2e verification with real team`
  - Bukan unit test — ini checklist manual sesuai PRD Milestone A ("testing dengan tim asli, bukan cuma diri sendiri")
  - Dokumentasikan hasil di PR description
  - Review: 🔒 manual (ini review-nya sendiri)

- [x] **A11 — Deploy & register webhook production**
  Commit: `chore(telegram-link): deploy edge function and register production webhook`
  - `supabase functions deploy`, lalu `setWebhook` ke URL production
  - Review: automated saja, tapi verifikasi manual sekali jalan setelah deploy

---

## 2. Milestone B — Command Pull

- [x] **B1 — Command dispatcher/routing**
  Commit: `feat(telegram-command): add command router in edge function`
  - Parse incoming update, route berdasar command (`/mytasks`, `/stale`, `/task`) ke handler masing-masing
  - Review: automated saja

- [x] **B2 — Migrasi `tasks.task_number`**
  Commit: `migration(schema): add sequential task_number per board`
  - Kolom `task_number` (integer, not null), auto-increment per `board_id` (trigger atau logic di app)
  - Backfill task_number untuk task existing
  - Tampilkan `#<task_number>` di card web app (kecil, konsisten dgn bot)
  - Review: 🔒 manual — backfill di data existing rawan salah, cek dulu di staging

- [x] **B3 — Command `/mytasks`**
  Commit: `feat(telegram-command): implement /mytasks command`
  - Query task assigned ke user (by `telegram_chat_id` → `profiles.id`), tunduk RLS yang sama seperti web
  - Review: automated saja

- [x] **B4 — Command `/stale`**
  Commit: `feat(telegram-command): implement /stale command`
  - List task stale di board yang diikuti user
  - Review: automated saja

- [x] **B5 — Command `/task` + disambiguation**
  Commit: `feat(telegram-command): implement /task lookup by number or keyword`
  - Angka → exact match `task_number`; bukan angka → partial match nama
  - >1 hasil → balas daftar pilihan (lihat PRD Bagian 6 Flow 3)
  - Ikuti rtk-rules #5 (murni query, tanpa cache state)
  - Review: automated saja, tapi coba manual sekali untuk kasus ambigu

- [x] **B6 — Helper link balik ke web app**
  Commit: `refactor(telegram-command): extract shared task-link helper`
  - Satu fungsi dipakai semua command/notifier biar formatnya konsisten
  - Review: automated saja

- [x] **B7 — Notifikasi komentar (no-content)**
  Commit: `feat(telegram-notify): send activity-only notification on new comment`
  - Format sesuai PRD 1.1 — nama commenter + link, tanpa isi komentar
  - Review: 🔒 manual — pastikan isi komentar benar-benar tidak ikut terkirim (privacy-sensitive kalau lupa)

- [x] **B8 — Testing command end-to-end**
  Commit: `test(telegram-command): manual e2e verification for all commands`
  - Review: 🔒 manual

---

## 3. Milestone C — Evaluasi & Lanjutan

- [ ] **C1 — Instrumentasi metrik command vs push**
  Commit: `feat(telegram-notify): log command and notification response metrics`
  - Sesuai PRD Bagian 11 (rasio command pull vs push yang direspons)
  - Review: automated saja

- [ ] **C2 — Review pemakaian nyata**
  Commit: `docs: summarize real usage review for milestone C`
  - Bukan kode — dokumentasi hasil evaluasi
  - Review: 🔒 manual (baca datanya sendiri dengan jujur)

- [ ] **C3 — Decision doc P1/P2 lanjutan**
  Commit: `docs: decide on P1/P2 continuation based on usage data`
  - Putuskan lanjut/tidak `/board`, reply-comment dari Telegram, dll — berdasar data, bukan asumsi (PRD Bagian 12)
  - Review: 🔒 manual

---

## 4. Checklist Manual Review (dipakai di semua task 🔒)

Salin ke PR description tiap kali ada task 🔒 yang mau di-merge:

```
- [ ] Dibaca ulang minimal sehari setelah ditulis (bukan langsung setelah commit)
- [ ] Tidak ada data user lain yang bocor/exposed (RLS, response payload)
- [ ] Kegagalan (Telegram API down, query gagal) tidak mem-block operasi board utama
- [ ] Tidak ada secret/token yang ke-log atau ke-commit
- [ ] Sesuai rtk-rules yang relevan (§0.4) jika task menyentuh event/notifikasi
```
