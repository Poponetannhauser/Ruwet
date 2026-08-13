# Decision Doc — Kelanjutan Fitur P1 / P2 Ruwet Telegram Bot

Dokumen ini berisi keputusan strategis berbasis data untuk menentukan apakah pengembangan fitur **P1 (Priority 1)** dan **P2 (Priority 2)** lanjutan akan dikerjakan berdasarkan data penggunaan nyata dari Milestone C.

---

## 🎯 Kriteria Pengambilan Keputusan (Berbasis Data Metrik)

| Fitur Lanjutan | Deskripsi Fitur | Kriteria Data untuk Lanjut | Keputusan |
|---|---|---|---|
| **`/board` Command** | Menampilkan daftar seluruh board dan ringkasan kolom | Pengguna sering menggunakan `/mytasks` & `/stale` (>50 eksekusi/minggu) | 🟢 **Direkomendasikan Lanjut** (jika keaktifan tim tinggi) |
| **Reply Comment via Telegram** | Membalas pesan notifikasi Telegram untuk menambahkan komentar langsung ke web app | Rasio notifikasi `push_comment` terbukti tinggi dan tim membutuhkan fast-response | 🟡 **Tunda (P2)** — Evaluasi setelah 2 minggu pemakaian production |
| **Interactive Inline Buttons** | Tombol inline "Tandai Selesai" / "Pindah Kolom" langsung di pesan Telegram | Risiko race-condition tinggi (rtk-rules #3) & kompleksitas RLS | 🔴 **Ditahan (Hold)** — Prioritaskan kestabilan board web |

---

## 🔒 Kesimpulan & Rekomendasi 

1. **Prioritas Utama (Saat Ini):**
   Fokus pada kestabilan fitur **Milestone A** (Link Token, Notifikasi Assign & Stale) dan **Milestone B** (Command `/mytasks`, `/stale`, `/task` + Notifikasi Komentar No-Content).
2. **Evaluasi Berkala:**
   Pantau tabel `telegram_metrics` selama 1-2 minggu pertama di lingkungan production sebelum membuka pekerjaan fitur P1/P2 berikutnya.
