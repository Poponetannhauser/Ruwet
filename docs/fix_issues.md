# Fix Plan — Known Issues Ruwet

**Referensi:** issues.md
**Format:** Mengikuti aturan main yang sama dengan Task_Breakdown_Ruwet_Junior.md — satu task = satu branch, micro-commit, **wajib review sebelum lanjut ke task berikutnya**.

Urutan pengerjaan di bawah ini **berdasarkan prioritas**, bukan urutan di issues.md. Kerjakan sesuai urutan, jangan loncat.

---

## Aturan Main (sama seperti sebelumnya)

- Branch: `fix/<nomor>-<slug>`, contoh: `fix/01-realtime-replication`
- Commit: `fix: ...` atau `chore: ...` sesuai Conventional Commits
- Setiap task di bawah **harus di-review dan di-approve** sebelum lanjut ke task berikutnya
- Kalau saat investigasi ternyata akar masalah beda dari dugaan awal di dokumen ini, **stop, laporkan dulu**, jangan lanjut asumsi sendiri

---



**Root cause dugaan:** Bukan bug kode, kemungkinan besar konfigurasi Supabase (replication belum aktif / RLS SELECT policy salah / filter channel salah).

### Langkah Investigasi (wajib urut, jangan loncat ke kode dulu)
- [ ] Buka Supabase Dashboard → **Database → Replication** → pastikan tabel `tasks` dan `columns` berstatus **enabled**. Kalau belum, aktifkan.
- [ ] Buka **Realtime Inspector** di dashboard → lakukan insert/update manual lewat SQL editor pada tabel `tasks` → cek apakah event muncul di inspector.
  - Kalau **event TIDAK muncul** di inspector → masalah di replication/RLS, lanjut ke langkah berikut.
  - Kalau **event muncul** di inspector tapi tidak sampai ke browser → masalah di kode subscription, skip ke bagian "Kode".
- [ ] Cek RLS policy SELECT di tabel `tasks` — pastikan kondisinya benar-benar match untuk user yang jadi member board (biasanya lewat join/subquery ke `board_members`). Realtime tunduk ke RLS yang sama seperti query biasa.

### Langkah Kode (kalau root cause ada di subscription)
- [ ] Cek channel subscription di kode, pastikan filter benar:
```js
supabase
  .channel('board-' + boardId)
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'tasks', filter: `board_id=eq.${boardId}` },
    callback
  )
  .subscribe()
```
- [ ] Pastikan tidak ada subscribe ganda (misal karena component re-render tanpa cleanup `useEffect`)
- [ ] Pastikan `unsubscribe()`/`removeChannel()` dipanggil saat component unmount

**DoD:**
- [ ] Buka board yang sama di 2 browser berbeda (atau 1 normal + 1 incognito)
- [ ] User A tambah/pindah task → muncul di User B tanpa refresh manual, dalam < 2 detik (sesuai NFR PRD section 7)
- [ ] Catat di PR description: apa root cause sebenarnya (config atau kode), supaya jadi referensi kalau muncul lagi

**Commit contoh:** `fix(realtime): aktifkan replication & perbaiki channel subscription`

🛑 **STOP — review sebelum lanjut ke FIX-02.**

---

## FIX-03 — Fitur Kick Member (Prioritas 3 — perlu keputusan dulu)

**Status:** Ini bukan bug, ini feature request yang belum ada di scope P0 PRD. **Jangan mulai coding sebelum 3 pertanyaan di bawah dijawab oleh Senior Dev/Product Lead.**

### Keputusan yang Harus Diklarifikasi Dulu
- [ ] Siapa yang boleh kick member? Hanya `owner`, atau role lain juga?
Jawab: Hanya owner
- [ ] Task yang di-assign ke member yang di-kick jadi apa — otomatis unassigned, atau tetap assigned tapi read-only?
Jawab: otomatis unasigned
- [ ] Apakah history activity log & komentar dari member yang di-kick tetap tersimpan (nama tetap muncul di riwayat), atau dihapus/dianonimkan?
Jawab: Tetap tersimpan tapi mungkin di ganti warna atau dikasih tanda kicked

### Langkah Kerja (setelah keputusan di atas jelas)
- [ ] Cek `schema.sql` — pastikan kolom `role` di tabel `board_members` sudah ada (`owner`, `member`). Kalau belum, tambah migration.
- [ ] Tambah tombol "Remove" di UI list member — hanya visible/enabled untuk user dengan role `owner`
- [ ] Buat Server Action untuk hapus row di `board_members`:
```sql
DELETE FROM board_members WHERE board_id = ? AND user_id = ?
```
- [ ] Pastikan RLS policy hanya izinkan `owner` board terkait yang bisa eksekusi delete ini (jangan hanya andalkan validasi di frontend)
- [ ] Implementasikan behavior task assignee sesuai keputusan di atas
- [ ] Catat aksi kick ke `activity_log` (konsisten dengan PRD section 5 soal audit trail)

**DoD:**
- [ ] Owner bisa kick member, member yang di-kick langsung kehilangan akses ke board (test: coba akses board itu pakai akun yang di-kick)
- [ ] Member biasa (bukan owner) tidak bisa lihat/klik tombol kick
- [ ] Behavior task assignee sesuai keputusan yang sudah dikonfirmasi
- [ ] Aksi kick tercatat di activity log

**Commit contoh:** `feat(board): fitur kick member oleh owner`

🛑 **STOP — review final.**

---

## Catatan

- FIX-01 dan FIX-02 boleh dianggap bug fix murni, langsung eksekusi sesuai investigasi di atas.
- FIX-03 **wajib menunggu jawaban dari 3 pertanyaan keputusan** sebelum branch dibuka — kalau langsung ngoding tanpa itu, risiko rombak ulang tinggi karena menyangkut RLS dan data model.