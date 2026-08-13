# Product Requirements Document (PRD) — Update
## Ruwet — Telegram Bot Companion ("Sekretaris Pribadi")

**Versi:** 1.1
**Tanggal:** 8 Agustus 2026
**Author:** Poponetannhauser
**Status:** Draft
**Terkait:** PRD.md v1.0 (Ruwet — Kanban Board dengan Accountability & Real-Time Sync)
**Tipe:** Feature Update / Add-on
**Changelog v1.1:** Perjelas notifikasi komentar (tanpa isi, bukan broadcast grup), ganti strategi matching `/task` jadi task number pendek, tambah catatan teknis implementasi (first-time Telegram bot).

---

## 1. Latar Belakang

PRD utama Ruwet (v1.0) fokus pada satu sumber kebenaran soal status task lewat web app. Namun setelah web app live, ditemukan gap adopsi: tim (freelance kecil, 3–15 orang) sudah punya kebiasaan koordinasi di Telegram, dan meminta mereka pindah sepenuhnya ke web app baru adalah friksi tambahan yang justru bertentangan dengan tujuan awal "mengurangi ketergantungan chat".

Alih-alih menggantikan chat, fitur ini **masuk ke tempat tim sudah ada** — Telegram — sebagai companion interface ke board, bukan pengganti board itu sendiri.

**Analogi produk:** bot ini berperan sebagai *sekretaris pribadi* tiap anggota tim — memberi ringkasan yang relevan, tanpa berisik, tanpa perlu buka web app tiap saat.

---

## 2. Tujuan Fitur

1. Menyampaikan notifikasi penting (assign, stale, komentar) ke channel yang sudah dipakai tim sehari-hari.
2. Memberi akses cepat ke ringkasan status task lewat command, tanpa harus membuka web app.
3. Menurunkan friksi adopsi — mempercepat onboarding dan penggunaan rutin tanpa mengubah kebiasaan komunikasi tim.
4. Tetap menjadikan web app sebagai sumber kebenaran penuh (detail, komentar, drag-and-drop) — bot hanya lapisan ringkasan.

### Non-Goals (di luar cakupan fitur ini)
- Bot tidak menggantikan board — tidak ada drag-and-drop, edit task, atau comment thread penuh di dalam Telegram.
- Tidak mendukung command untuk membuat/menghapus board atau kolom (manajemen struktural tetap di web app).
- Tidak mencakup grup chat bot (bot v1 hanya berinteraksi 1:1 via direct message ke tiap user). Ini sengaja dijaga ketat: begitu bot masuk ke grup/channel, notifikasi personal (assign, stale, komentar) berisiko berubah jadi broadcast yang rusuh buat semua orang di grup tersebut — bertentangan langsung dengan prinsip "sekretaris personal" di Bagian 3. Mode komunitas/tim dengan channel notifikasi terpisah dari chat umum (misal channel khusus bot) adalah ide yang valid, tapi **di luar cakupan v1** dan perlu PRD/evaluasi terpisah — bukan perluasan bertahap dari command DM yang ada.

---

## 3. Prinsip Desain — "Sekretaris, Bukan Dashboard"

Setiap command atau notifikasi yang diusulkan harus lolos filter ini sebelum ditambahkan:

| Prinsip | Artinya |
|---|---|
| Tidak menunggu ditanya, tapi tidak berisik | Push notification hanya untuk event yang benar-benar perlu diketahui user (di-assign, task jadi stale) — bukan setiap perubahan kecil |
| Ringkasan, bukan detail penuh | Command membalas ringkasan singkat + link ke web untuk detail lengkap, bukan dump seluruh data |
| Personal, bukan broadcast | Respons command disesuaikan ke user yang bertanya (berdasarkan `telegram_chat_id`), bukan sama untuk semua orang |
| Siap dipanggil kapan saja | Command-based, tidak perlu alur navigasi seperti membuka app |

---

## 4. User Stories

| # | Sebagai | Saya ingin | Supaya |
|---|---------|-----------|--------|
| 1 | Anggota tim | Menghubungkan akun Ruwet saya dengan Telegram | Bisa menerima notifikasi & pakai command bot |
| 2 | Anggota tim | Menerima pesan Telegram saat di-assign task baru | Tidak perlu buka web app untuk tahu ada kerjaan baru |
| 3 | Anggota tim | Menerima pesan saat task saya jadi stale | Segera bisa update progress tanpa ditagih manual |
| 4 | Anggota tim | Ketik `/mytasks` untuk lihat task saya | Dapat ringkasan cepat tanpa buka web |
| 5 | Anggota tim | Ketik `/stale` untuk lihat task yang mangkrak | Tahu task mana yang perlu segera ditindak |
| 6 | Anggota tim | Ketik `/task <nama>` untuk lihat detail singkat 1 task | Dapat info assignee & komentar terakhir dengan cepat |
| 7 | Anggota tim | Mendapat link balik ke web app dari tiap respons bot | Bisa lanjut ke detail penuh/komentar bila perlu |
| 8 | Anggota tim | Menerima notifikasi singkat saat ada komentar baru di task saya, **tanpa isi komentarnya** | Tahu ada aktivitas tanpa chat saya dibanjiri isi diskusi — cukup buka web kalau mau baca lengkap |

---

## 5. Fitur & Prioritas

### P0 — Must Have
- Linking akun: flow `/start` di bot → simpan `telegram_chat_id` ke `profiles`
- Notifikasi push: di-assign task baru
- Notifikasi push: task berubah status jadi stale (merah)
- Command `/mytasks` — list task yang di-assign ke user, dengan status singkat
- Setiap pesan bot menyertakan link balik ke task/board di web app

### P1 — Should Have
- Command `/stale` — list semua task stale yang relevan untuk board yang diikuti user
- Command `/task <task_number atau kata kunci>` — detail ringkas 1 task (assignee, status, komentar terakhir). Lihat Bagian 9 untuk strategi matching.
- Notifikasi push: ada komentar baru di task milik user — **notifikasi "ada aktivitas", bukan isi komentar** (pola sama seperti email notifikasi Figma: "X commented on Y", bukan kutipan komentarnya). Format contoh: `💬 [Nama] komentar di task #12 "Fix login bug" → [link]`. Ini sekaligus jawaban atas kekhawatiran spam: karena bot v1 murni 1:1 DM (bukan grup), risiko "rusuh di chat tim" otomatis tidak muncul — yang perlu dijaga hanya supaya pesannya tetap 1 baris ringkas, bukan dump isi diskusi.

### P2 — Nice to Have
- Command `/board` — ringkasan jumlah task per kolom (bersifat laporan tim, dievaluasi dulu apakah tetap sejalan dengan prinsip "sekretaris personal" sebelum dikerjakan)
- Reply langsung dari Telegram untuk menambah komentar singkat (tanpa buka web)
- Multi-board support dalam satu bot (user dengan >1 board pilih board via command)

---

## 6. Alur Pengguna Utama (User Flow)

**Flow 1 — Linking akun**
1. User klik link "Connect Telegram" di web app (profile/settings)
2. Diarahkan ke bot Telegram, kirim `/start`
3. Bot terima `chat_id`, cocokkan dengan token/kode unik dari web app
4. `telegram_chat_id` tersimpan di `profiles`, bot konfirmasi "Akun berhasil terhubung"
5. **Re-linking:** kalau user mengulang flow ini (misal ganti akun Telegram), `telegram_chat_id` lama ditimpa dengan yang baru pada baris `profiles` yang sama. Karena kolom ini `unique`, satu `chat_id` cuma bisa terhubung ke satu profile — chat_id lama otomatis berhenti menerima notifikasi begitu link baru berhasil, tanpa perlu langkah "unlink" terpisah.

**Flow 2 — Notifikasi push**
1. Event terjadi di board (assign / stale / komentar baru)
2. Database Webhook trigger Edge Function
3. Edge Function kirim pesan ke `telegram_chat_id` user terkait, sertakan link ke task

**Flow 3 — Command pull**
1. User ketik command (`/mytasks`, `/stale`, `/task <task_number atau kata kunci>`) di chat bot
2. Telegram kirim request ke webhook Edge Function
3. Edge Function identifikasi user dari `chat_id`, query Supabase
4. Khusus `/task`: Edge Function cek dulu apakah argumen berupa angka (task_number) → exact match. Kalau bukan angka, cari via partial match nama task (case-insensitive) di board yang user ikuti
   - 0 hasil → bot balas "Task tidak ditemukan, coba `/mytasks` untuk lihat daftar task kamu"
   - 1 hasil → langsung tampilkan detail
   - >1 hasil → bot balas daftar pilihan bernomor (`#12 Fix login bug`, `#15 Fix login redirect`), user tinggal ketik ulang dengan nomor yang dimaksud
5. Bot balas ringkasan + link ke web app untuk detail lengkap

---

## 7. Requirement Non-Fungsional

| Aspek | Requirement |
|---|---|
| **Performa** | Notifikasi push terkirim ke Telegram dalam < 5 detik setelah event terjadi |
| **Keamanan** | `telegram_chat_id` hanya bisa di-set lewat flow linking terverifikasi (bukan input bebas), untuk mencegah user menerima notifikasi milik orang lain |
| **Reliabilitas** | Kegagalan kirim ke Telegram API (rate limit/downtime) tidak boleh membuat event di board gagal tersimpan — notifikasi bersifat best-effort, bukan bagian dari transaksi utama |
| **Privasi** | Command hanya menampilkan data dari board yang user tersebut jadi member-nya (tunduk pada RLS yang sama seperti web app) |
| **Skalabilitas arsitektur** | Push (Database Webhook) dan pull (Telegram webhook) berbagi satu Edge Function dengan routing internal, agar tidak perlu service terpisah |

---

## 8. Tech Stack Tambahan

| Layer | Teknologi | Alasan |
|---|---|---|
| Bot Platform | Telegram Bot API | Gratis, tim sudah pakai Telegram sehari-hari |
| Command & Notifier Handler | Supabase Edge Function (Deno) | Satu stack dengan backend existing, tidak perlu server terpisah |
| Trigger notifikasi | Supabase Database Webhook | React ke perubahan `activity_log` / `tasks` tanpa polling |
| Trigger command | Telegram Webhook | Real-time, tidak perlu long-polling |

---

## 8a. Catatan Teknis Implementasi (First-Time Building a Telegram Bot)

Karena ini bot Telegram pertama, beberapa konsep dasar yang perlu dipahami sebelum mulai Milestone A:

**1. Setup awal via BotFather**
- Chat `@BotFather` di Telegram → `/newbot` → dapat **bot token** (format `123456:ABC-...`). Ini rahasia, jangan commit ke repo — simpan sebagai environment variable di Supabase Edge Function.
- Semua request ke Telegram lewat REST API: `https://api.telegram.org/bot<TOKEN>/<METHOD>` (misal `/sendMessage`, `/setWebhook`).

**2. Webhook vs Polling**
- PRD ini pakai **webhook** (Bagian 8: "real-time, tidak perlu long-polling") — Telegram akan `POST` ke URL Edge Function kamu setiap ada pesan/command baru.
- Konsekuensi: webhook butuh URL publik ber-HTTPS. Ini artinya kamu **tidak bisa test langsung di localhost** — harus deploy Edge Function dulu (Supabase Edge Function otomatis dapat URL publik saat deploy, jadi ini bukan hambatan besar, cuma perlu diketahui dari awal supaya alur dev-nya: deploy → daftarkan webhook → baru test, bukan develop-lokal-dulu seperti frontend biasa).
- Daftarkan webhook sekali lewat: `POST /setWebhook` dengan `url` = URL Edge Function kamu.

**3. Verifikasi request benar-benar dari Telegram**
- Karena URL webhook publik, siapa pun bisa `POST` ke situ dan pura-pura jadi Telegram. Saat `setWebhook`, sertakan parameter `secret_token` (string bebas buatanmu) — Telegram akan mengirimkannya balik di header `X-Telegram-Bot-Api-Secret-Token` di setiap request.
- Edge Function **wajib** validasi header ini cocok sebelum memproses apa pun. Ini bagian dari requirement Keamanan yang sudah ada di Bagian 7 — cuma sekarang eksplisit mekanismenya.

**4. Respons cepat ke webhook**
- Telegram mengharapkan Edge Function membalas cepat (return HTTP 200) setelah menerima update. Kalau proses (query Supabase, dsb) lambat, Telegram bisa retry dan kamu berpotensi memproses command yang sama dua kali.
- Praktik aman: proses request secepat mungkin, hindari operasi berat/berantai di jalur utama. Untuk P0/P1 kompleksitas query masih rendah (single table lookup), jadi ini belum jadi masalah nyata — tapi baik untuk diketahui sebagai kebiasaan sejak awal, bukan cuma dioptimasi belakangan.

**5. Reply ke user**
- Balasan bot dikirim lewat `POST /sendMessage` dengan `chat_id` tujuan + `text`. Untuk link yang bisa diklik, pakai `parse_mode: "Markdown"` atau `"HTML"` di payload.

Referensi resmi: [Telegram Bot API docs](https://core.telegram.org/bots/api).

## 9. Skema Data — Perubahan

Penambahan pada tabel existing (lihat `schema.sql` di PRD utama):

- `profiles.telegram_chat_id` (nullable, unique) — diisi setelah flow linking berhasil
- `profiles.telegram_link_token` (nullable, sementara) — token verifikasi saat proses `/start`, dihapus setelah linking sukses
- `tasks.task_number` (integer, **not null**, sequential per board — bukan global) — dipakai sebagai ID pendek untuk command `/task`, dan sekalian ditampilkan di card web app (misal `#12`) supaya penomoran konsisten antara bot dan web, bukan cuma ada di satu sisi. Digenerate otomatis saat task baru dibuat (trigger atau logic di layer aplikasi, ambil `MAX(task_number) + 1` per `board_id`).

### Catatan keputusan: kenapa task_number, bukan nama unik dipaksa

Dua opsi yang sempat dipertimbangkan untuk `/task <argumen>`:

| Opsi | Masalah |
|---|---|
| Wajibkan nama task unik per board | Mengubah UX pembuatan task di web app (perlu validasi tambahan), padahal PRD utama tidak pernah mensyaratkan ini — nama task seharusnya bebas, termasuk boleh mirip/sama |
| Pakai `task.id` (UUID) | Tidak manusiawi untuk diketik manual di chat |
| **Task number pendek per-board (dipilih)** | Gampang diketik (`/task 12`), tidak memaksa perubahan constraint pada penamaan task, dan tetap didukung fallback keyword search kalau user lupa nomornya (lihat Bagian 6, Flow 3) |

P0 tidak butuh `task_number` (belum ada command `/task`), jadi kolom ini ditambahkan sebagai bagian dari P1 saat command `/task` mulai dikerjakan — bukan migrasi terpisah dari milestone.

Tidak ada tabel baru yang dibutuhkan. Command dan notifikasi cukup query dari `tasks`, `activity_log`, `comments`, `board_members` yang sudah ada.

---

## 10. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| User tidak pernah `/start` bot → tidak bisa menerima notifikasi | Tampilkan CTA jelas di web app ("Hubungkan Telegram") saat onboarding, bukan opsional tersembunyi di settings |
| Bot jadi berisik (notifikasi berlebihan) → user mute/block bot | Batasi notifikasi push hanya ke event P0 (assign, stale) dulu; evaluasi P1 (komentar) setelah pemakaian nyata |
| Command `/board` bergeser jadi "dashboard mini" alih-alih asisten personal | Evaluasi ulang di P2 sebelum dikerjakan — cek kesesuaian dengan prinsip desain di Bagian 3 |
| Kegagalan Telegram API mengganggu alur utama board | Notifikasi dikirim async, kegagalan hanya di-log, tidak mem-block operasi board |
| `telegram_chat_id` disalahgunakan / typo linking ke akun salah | Wajib pakai token verifikasi satu kali (Flow 1), bukan input `chat_id` manual |

---

## 11. Metrik Keberhasilan

| Metrik | Target |
|---|---|
| % anggota tim yang berhasil linking Telegram | Menurun friksi onboarding — target semua anggota aktif linked dalam minggu pertama |
| Jumlah pertanyaan "progress gimana?" di grup chat tim | Menurun setelah bot aktif (indikator kualitatif, sejalan dengan tujuan PRD utama) |
| Rasio command pull vs push yang direspons user | Untuk melihat command mana yang benar-benar dipakai vs diabaikan, dasar evaluasi P1/P2 |

---

## 12. Milestone

**Milestone A — Linking & Notifier Dasar**
- Flow `/start` + token verifikasi + simpan `telegram_chat_id`
- Edge Function notifier: assign baru, task stale
- Testing dengan tim asli (bukan cuma diri sendiri)

**Milestone B — Command Pull**
- Telegram webhook + routing di Edge Function
- `/mytasks`, `/stale`, `/task <nama>`
- Link balik ke web app di tiap respons

**Milestone C — Evaluasi & Lanjutan**
- Review pemakaian nyata (metrik Bagian 11)
- Putuskan kelanjutan P1 (notifikasi komentar) dan P2 (`/board`, reply comment dari Telegram) berdasarkan data pemakaian, bukan asumsi

---

## 13. Lampiran
- PRD utama: `PRD.md`
- Skema database: lihat `schema.sql` pada repo (ditambah kolom sesuai Bagian 9)
