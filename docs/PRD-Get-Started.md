# Product Requirements Document (PRD)
## Ruwet — Get Started (Landing Page & Onboarding)

**Versi:** 1.0
**Tanggal:** 10 Agustus 2026
**Author:** Poponetannhauser
**Status:** Draft
**Terkait:** PRD.md v1.0 (Ruwet — Kanban Board dengan Accountability & Real-Time Sync)
**Tipe:** Feature Add-on

---

## 1. Latar Belakang & Masalah

Kanban board utama (`PRD.md` v1.0) sudah selesai dibangun dan di-deploy. Tapi dua gap ditemukan sebelum sempat dicoba ke tim asli:

- **Landing page saat ini langsung redirect ke halaman login** — pengunjung baru (termasuk evaluator portofolio) tidak dapat konteks apa pun soal apa itu Ruwet, buat siapa, dan kenapa beda dari sekadar kanban board generik, sebelum diminta bikin akun. Ini friksi di titik paling awal, dan kehilangan kesempatan "jual" value produk.
- **Tidak ada arahan setelah signup** — user baru dilempar ke board kosong tanpa tahu langkah pertama: bikin board? undang anggota? apa maksud badge stale merah-kuning-hijau itu? Ini berlawanan dengan tujuan produk sendiri (PRD utama Bagian 2) yang justru mau *menurunkan* friksi dibanding koordinasi lewat chat biasa.

Karena produk ini juga belum pernah benar-benar dicoba tim asli, onboarding yang jelas jadi lebih penting — first impression saat akhirnya dicoba tim nyata cuma ada sekali.

---

## 2. Tujuan Fitur

1. Landing page menjelaskan value proposition Ruwet dalam waktu scan singkat (apa itu, buat siapa, apa yang beda) sebelum orang diminta login.
2. Onboarding pasca-signup mengarahkan user baru menyelesaikan langkah pertama yang bermakna, tanpa harus menebak-nebak UI sendiri.
3. Tidak menambah kompleksitas berlebih — tetap sejalan dengan prinsip "simpel tapi fungsional" yang jadi alasan produk ini dibuat (PRD utama Bagian 1).

### Non-Goals (di luar cakupan v1)
- Bukan marketing site lengkap (blog, halaman pricing, dsb) — ini tim kecil/project portofolio, bukan produk SaaS berbayar.
- Tidak pakai library product-tour pihak ketiga (Shepherd.js, Intro.js, dll) di v1 — cukup empty state + checklist statis. Dievaluasi lagi kalau kebutuhan onboarding ternyata jauh lebih kompleks dari dugaan.
- Tidak ada tour interaktif dengan spotlight/tooltip berjalan otomatis — cukup hint sekali-tampil yang bisa di-dismiss per elemen (P1, bukan P0).
- Tidak mengubah cara kerja board itu sendiri — fitur ini murni lapisan pengantar di atas produk yang sudah ada.

---

## 3. Target Pengguna

Sama seperti PRD utama, ditambah satu persona baru yang relevan khusus untuk fitur ini:

- **Pengunjung baru (belum punya akun)** — termasuk calon anggota tim yang diundang, dan evaluator/recruiter yang melihat ini sebagai project portofolio.

---

## 4. User Stories

| # | Sebagai | Saya ingin | Supaya |
|---|---------|-----------|--------|
| 1 | Pengunjung baru | Melihat penjelasan singkat apa itu Ruwet sebelum diminta login | Paham value-nya dulu sebelum komit bikin akun |
| 2 | Pengunjung baru | Melihat preview/screenshot board tanpa harus login | Bisa menilai produknya dari luar |
| 3 | User baru (habis signup) | Diarahkan jelas untuk bikin board pertama | Tidak bingung harus mulai dari mana |
| 4 | User baru | Melihat checklist langkah awal (buat board → undang anggota → buat task pertama) | Tahu progress onboarding saya sejauh mana |
| 5 | User baru | Bisa skip/dismiss checklist kapan saja | Tidak dipaksa ikut alur kalau sudah paham sendiri |
| 6 | Anggota tim yang diundang | Melihat konteks singkat saat pertama kali masuk board | Tidak perlu nanya-nanya cara pakai ke Product Lead |

---

## 5. Fitur & Prioritas

### P0 — Must Have
- **Landing page**: hero section (headline + subheadline value prop), highlight 3 fitur utama (real-time sync, stale detection, activity log) singkat, CTA "Sign Up" dan "Login" terpisah jelas
- **Landing page**: 1 screenshot statis board (bukan demo interaktif) — cukup buat orang paham bentuk produknya sebelum login
- **Onboarding — empty state**: user baru yang belum punya board diarahkan CTA besar "Buat board pertama", bukan ditaruh di kanban kosong tanpa konteks
- **Onboarding — checklist 3 langkah**: buat board → undang anggota → buat task pertama, muncul di dashboard sampai selesai atau di-dismiss manual, progress-nya tersimpan (tidak hilang saat reload/login dari device lain)

### P1 — Should Have
- **Landing page**: mini FAQ (3–4 pertanyaan — misal "apakah gratis", "beda dari Notion/Jira apa")
- **Onboarding**: hint kontekstual sekali-tampil untuk elemen kunci yang baru pertama kali dilihat user (misal badge stale) — dismissable per elemen, bukan tour berjalan otomatis
- **Landing page**: link ke demo board publik read-only (kalau nanti dibuat)

### P2 — Nice to Have
- Video/GIF demo singkat di landing page
- Checklist onboarding dengan progress bar animasi
- Analytics A/B copy landing page — dicatat sebagai out-of-scope, tidak relevan untuk skala project ini

---

## 6. Alur Pengguna Utama (User Flow)

**Flow 1 — Pengunjung baru ke Landing**
1. Buka domain root → landing page tampil (bukan langsung redirect ke `/login` seperti sekarang)
2. Scroll lihat value prop singkat + screenshot board
3. Klik CTA "Sign Up" atau "Login" → lanjut ke flow auth yang sudah ada (PRD utama Flow 1)

**Flow 2 — Onboarding user baru**
1. Setelah verifikasi email & login pertama kali, sistem cek: user sudah punya board? Kalau belum → tampilkan empty state dengan CTA jelas "Buat board pertama", bukan kanban kosong
2. User buat board pertama → checklist onboarding muncul (di sidebar/dashboard):
   `[x] Buat board pertama` `[ ] Undang anggota tim` `[ ] Buat task pertama`
3. Checklist tetap tampil sampai 3 langkah selesai, atau user klik dismiss manual — mana pun duluan
4. Progress disimpan per user, bukan per sesi browser

---

## 7. Requirement Non-Fungsional

| Aspek | Requirement |
|---|---|
| **Aksesibilitas publik** | Landing page harus bisa diakses tanpa auth (public route), tidak butuh Supabase session untuk render |
| **Performa** | Landing page statis/SSG di Next.js — tidak fetch data dinamis berat, harus cepat dibuka tanpa login |
| **Non-blocking** | Checklist onboarding murni informatif — tidak boleh menghalangi akses fitur lain, bisa di-skip kapan saja |
| **Responsif** | Sama seperti requirement PRD utama (min. 360px hingga desktop) |

---

## 8. Skema Data — Perubahan

Prinsipnya: **derive status checklist dari data yang sudah ada, jangan duplikasi state.**

- Langkah "Buat board pertama" → cek `boards` milik user ada ≥1 row
- Langkah "Undang anggota tim" → cek `board_members` di board tsb ada ≥2 row (bukan cuma diri sendiri)
- Langkah "Buat task pertama" → cek `tasks` di board tsb ada ≥1 row

Ini semua bisa dihitung langsung dari tabel existing, **tidak perlu kolom status per-langkah**. Satu-satunya state baru yang memang tidak bisa di-derive:

- `profiles.onboarding_dismissed` (boolean, default `false`) — diisi `true` kalau user klik dismiss manual sebelum checklist selesai sendiri

Tidak ada tabel baru. Ini sekaligus menghindari risiko checklist "keliru" karena out-of-sync dengan data asli — kalau nanti user hapus board pertamanya, misalnya, checklist otomatis balik akurat tanpa perlu logic sinkronisasi tambahan.

---

## 9. Tech Stack

Tidak ada penambahan stack baru — reuse Next.js + TypeScript + Tailwind yang sudah ada di PRD utama. Landing page cukup sebagai static route (`app/page.tsx` sebagai landing, bukan langsung redirect), tanpa dependency baru.

---

## 10. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Landing page kebablasan jadi marketing site kompleks | Kunci scope ke P0 dulu — hero, 3 fitur, 1 screenshot, 2 CTA. Selesai baru evaluasi P1 |
| Checklist onboarding kerasa maksa/annoying | Wajib dismissable kapan saja, tidak pernah modal yang mem-block layar |
| Asumsi 3 langkah (board→undang→task) belum tentu sesuai kebiasaan tim nyata, karena belum pernah dicoba tim asli | Justru fitur ini jadi kesempatan bareng untuk akhirnya validasi ke tim asli (lihat Bagian 11) — bukan alasan menunda lagi |

---

## 11. Metrik Keberhasilan

| Metrik | Target |
|---|---|
| % pengunjung landing yang lanjut klik Sign Up | Baseline awal, dievaluasi kualitatif dulu (belum ada analytics infra) |
| % user baru yang menyelesaikan checklist vs dismiss di tengah jalan | Indikator apakah 3 langkah itu memang langkah yang masuk akal |
| Waktu dari signup ke task pertama dibuat | Baseline "sebelum onboarding" vs "sesudah" — bisa dibandingkan begitu tim asli akhirnya coba pakai |

---

## 12. Milestone

**Milestone 1 — Landing Page**
- Hero section + highlight 3 fitur + 1 screenshot board + CTA Sign Up/Login
- Ganti root route dari redirect-ke-login jadi landing page publik
- Deploy

**Milestone 2 — Onboarding Empty State & Checklist**
- Empty state board kosong dengan CTA jelas
- Checklist 3 langkah (derived dari data, bukan kolom status baru) + dismiss state
- Testing dengan akun baru — dan idealnya, momentum ini dipakai sekalian untuk akhirnya mengajak tim asli coba pakai (lihat Bagian 10)

---

## 13. Lampiran
- PRD utama: `PRD.md`
- PRD terkait: `PRD-Telegram-Bot.md` (ditunda, lihat catatan prioritas di percakapan sebelumnya — Get Started dikerjakan lebih dulu)
