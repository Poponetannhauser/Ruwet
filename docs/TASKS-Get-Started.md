# TASKS — Ruwet Get Started (Landing Page & Onboarding)

**Sumber:** `PRD-Get-Started.md` v1.0
**Konvensi kerja:** sama seperti `TASKS-Telegram-Bot.md` §0 — dirangkum ulang di bawah supaya file ini bisa dipakai berdiri sendiri, plus satu tambahan khusus fitur ini di §0.4.

---

## 0. Aturan Kerja

### 0.1 Micro-commit (bukan micro-PR)

Satu **PR per milestone** (Milestone 1: Landing, Milestone 2: Onboarding), isinya banyak **commit kecil atomik**:

1. Satu commit = satu perubahan logis. Butuh kata "dan" di commit message → kemungkinan itu 2 commit.
2. Commit harus tetap **build passing** (`bun run build` hijau di commit manapun).
3. Format: [Conventional Commits](https://www.conventionalcommits.org/)
   ```
   <type>(<scope>): <deskripsi singkat imperatif>
   ```
   Type: `feat`, `fix`, `chore`, `refactor`, `test`, `docs`, `migration`, `style` (khusus perubahan visual/CSS murni tanpa logic)
   Scope fitur ini: `landing`, `onboarding`, `schema`

   Contoh:
   ```
   feat(onboarding): derive checklist status from board/member/task counts
   ```
4. Task di bawah idealnya 1 commit. Kalau ternyata butuh lebih dari itu, task-nya masih kegedean — pecah lebih lanjut sebelum mulai, bukan setelah nulis kode.

### 0.2 Review

| Level | Kapan dipakai | Bentuknya |
|---|---|---|
| **Automated** | Semua task | `bun run lint`, `bun run typecheck`, `bun run test` (kalau ada) harus hijau sebelum push |
| **Manual Review** | Task bertanda 🔒 — nyentuh data user (RLS), atau state yang kalau salah bisa nyasar diam-diam | Dibaca ulang **besoknya** (bukan langsung setelah nulis), isi checklist §4 di PR |

Task 🔒 tidak boleh masuk PR milestone tanpa checklist §4 dicentang semua.

### 0.3 Bun

Semua command pakai Bun (`bun install`, `bun run dev`, `bun run build`, `bun run lint`, `bun run test`, `bunx <tool>`) — ganti semua `npm`/`yarn` di dokumentasi manapun. Fitur ini murni frontend (Next.js route + komponen) + satu migrasi kolom, jadi **tidak ada bagian yang jalan di Deno** seperti kasus Telegram bot — semuanya di scope Bun tanpa pengecualian.

### 0.4 rtk-rules: .agents/rules/antigravity-rtk-rules.md

---

## 1. Milestone 1 — Landing Page

- [x] **G1 — Landing page route**
  Commit: `feat(landing): replace root redirect with public landing route`
  - Ganti behavior root (`/`) dari redirect-ke-login jadi render halaman publik
  - Pastikan route ini tidak butuh Supabase session untuk render (cek NFR Bagian 7 PRD)
  - Review: automated saja

- [x] **G2 — Hero section**
  Commit: `feat(landing): add hero section with headline and CTA buttons`
  - Headline + subheadline value prop, 2 tombol CTA (Sign Up, Login) — belum di-wire ke route asli dulu (itu G5)
  - Review: automated saja

- [x] **G3 — Highlight 3 fitur utama**
  Commit: `feat(landing): add feature highlights section`
  - Real-time sync, stale detection, activity log — masing-masing 1 kalimat singkat + ikon
  - Review: automated saja

- [x] **G4 — Screenshot board**
  Commit: `feat(landing): add static board screenshot section`
  - Gambar statis (bukan demo interaktif — sesuai PRD Non-Goals), optimasi ukuran file
  - Review: automated saja

- [x] **G5 — Wiring CTA ke flow auth**
  Commit: `feat(landing): wire CTA buttons to existing signup and login routes`
  - Sambungkan tombol dari G2 ke route auth yang sudah ada (PRD utama Flow 1) — **jangan bikin flow auth baru**, cuma nyambungin
  - Review: 🔒 manual — pastikan tidak merusak flow login/signup existing yang sudah dipakai (regresi di sini berdampak ke seluruh app, bukan cuma landing)

- [x] **G6 — Responsive & aksesibilitas**
  Commit: `style(landing): ensure responsive layout and WCAG AA contrast`
  - Cek di 360px–desktop, kontras warna, keyboard navigation untuk CTA
  - Review: automated saja (visual, cek manual sekali pas dev tapi bukan checklist 🔒 formal)

- [x] **G7 — Deploy & verifikasi**
  Commit: `chore(landing): verify public route accessible without auth in production`
  - Deploy, buka landing di incognito/logged-out browser, pastikan tidak ke-redirect ke login
  - Review: automated saja + verifikasi manual sekali jalan

---

## 2. Milestone 2 — Onboarding Empty State & Checklist

- [x] **G8 — Migrasi `profiles.onboarding_dismissed`**
  Commit: `migration(schema): add onboarding_dismissed to profiles`
  - Kolom boolean, default `false`
  - RLS: user cuma bisa update kolom ini di row miliknya sendiri, tidak bisa set punya user lain
  - Review: 🔒 manual — cek RLS policy, kolom tidak writable ke row orang lain

- [x] **G9 — Empty state board kosong**
  Commit: `feat(onboarding): add empty state with create-first-board CTA`
  - Dashboard tanpa board sama sekali → tampilkan CTA besar "Buat board pertama", bukan kanban kosong tanpa konteks
  - Review: automated saja

- [x] **G10 — Derive logic status checklist**
  Commit: `feat(onboarding): derive checklist status from boards/members/tasks counts`
  - Helper function: cek jumlah `boards` (≥1), `board_members` di board tsb (≥2), `tasks` di board tsb (≥1) — **tidak ada kolom status baru**, murni query (lihat PRD Bagian 8 & rtk-rules §0.4 poin 6)
  - Review: automated saja — state ini self-correcting karena derived, bukan persisted, jadi risiko "nyasar diam-diam" rendah

- [x] **G11 — Komponen UI checklist**
  Commit: `feat(onboarding): add onboarding checklist component to dashboard`
  - 3 baris dengan checkmark sesuai hasil G10, tampil di sidebar/dashboard
  - Review: automated saja

- [x] **G12 — Dismiss & persist**
  Commit: `feat(onboarding): add dismiss button and persist onboarding_dismissed`
  - Klik dismiss → update `profiles.onboarding_dismissed = true`, checklist tidak muncul lagi setelahnya meski belum 3 langkah selesai
  - Review: 🔒 manual — pastikan write cuma ke row user sendiri (terkait langsung ke RLS G8), dan dismiss tidak bisa ke-trigger tanpa aksi eksplisit user (misal jangan sampai auto-dismiss karena bug re-render)

- [x] **G13 — Testing end-to-end akun baru**
  Commit: `test(onboarding): manual e2e verification with fresh account`
  - Signup akun baru dari nol, ikuti flow lengkap: empty state → buat board → checklist update → undang anggota → buat task → checklist selesai/dismiss
  - Review: 🔒 manual (checklist-nya checklist ini sendiri)

- [x] **G14 — Ajak tim asli coba pakai**
  Commit: `docs: log first real team onboarding session`
  - Bukan kode — begitu G1–G13 selesai, ini momentum yang sudah lama ditunda (lihat PRD Get Started Bagian 10) untuk akhirnya divalidasi ke tim asli, bukan asumsi lagi
  - Catat hasilnya: bagian mana yang bikin bingung, apakah 3 langkah checklist itu memang langkah yang masuk akal buat tim beneran
  - Review: 🔒 manual — baca hasilnya jujur, ini input langsung buat keputusan lanjut/tidaknya `PRD-Telegram-Bot.md`

---

## 3. Urutan Ketergantungan Milestone

```
Milestone 1 (Landing) ──► Milestone 2 (Onboarding) ──► G14 (tim asli coba)
                                                              │
                                                              ▼
                                        Keputusan lanjut Telegram Bot Milestone A
                                        (lihat TASKS-Telegram-Bot.md — masih gated,
                                        tunggu sinyal adopsi nyata dari sini)
```

---

## 4. Checklist Manual Review (dipakai di semua task 🔒)

```
- [ ] Dibaca ulang minimal sehari setelah ditulis
- [ ] Tidak ada write ke row/data milik user lain (RLS dicek, bukan diasumsikan)
- [ ] Tidak merusak flow existing (auth, board, dsb) — regresi di fitur pengantar bisa berdampak ke seluruh app
- [ ] State yang ditampilkan (checklist, empty state) sesuai data asli, tidak ada kemungkinan "nyasar diam-diam"
- [ ] Sesuai rtk-rules relevan (§0.4) kalau task menyentuh derive state / query realtime-adjacent
```
