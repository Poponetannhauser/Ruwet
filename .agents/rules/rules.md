---
trigger: always_on
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