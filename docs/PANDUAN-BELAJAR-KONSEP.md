# Panduan Belajar: Istilah & Konsep Audit Fix Ruwet
> Dibuat untuk menjelaskan istilah teknis menggunakan analogi dunia nyata / kehidupan sehari-hari.

---

## 1. CI/CD (Continuous Integration / Continuous Deployment)
* **Apa itu?** Otomatisasi pengecekan kode setiap kali kamu push ke GitHub.
* **Analogi Sehari-hari:** **Satpam & Kasir Minimarket**
  Saat kamu mau belanja, kamu bawa barang ke kasir. Kasir scan tiap barang (mengecek harga & expired). Kalau ada barang rusak, kamu tidak boleh beli.
  CI/CD itu seperti kasir otomatis di GitHub: tiap kali kamu setor kode, dia otomatis cek: "Kodenya rusak tidak? Ada error tidak?" Jika rusak, dia tolak sebelum masuk ke produk utama (`main`).

---

## 2. Docker & Containerization
* **Apa itu?** Membungkus aplikasi beserta seluruh kebetuhannya (node, library, OS setting) dalam satu "kotak" yang pasti sama di laptop manapun.
* **Analogi Sehari-hari:** **Makanan Kaleng / Bento Box**
  Daripada kamu kirim resep rendang ke teman di luar negeri (yang mungkin beda bumbu, beda kompor, beda gas, lalu rasanya jadi beda), kamu masak rendangnya di rumah, masukkan ke kaleng kedap udara, lalu kirim kalengnya.
  Temanmu tinggal buka kaleng & makan — rasanya 100% sama persis. Docker adalah kaleng/bento box untuk aplikasi webmu.

---

## 3. Typecheck & Testing (Vitest)
* **Apa itu?** Penjaga kualitas logika kode. `typecheck` memastikan bentuk data benar, `test` memastikan fungsi berjalan sesuai ekspektasi.
* **Analogi Sehari-hari:**
  * **Typecheck = Lubang Mainan Anak (Bentuk Geometris)**. Kamu tidak bisa memasukkan balok lingkaran ke lubang kotak. TypeScript mencegah kamu memasukkan data "angka" ke tempat yang minta "teks".
  * **Testing (Vitest) = Uji Emisi / Test Drive Mobil**. Sebelum mobil dijual, pabrik tes ngerem mendadak. Apakah remnya berfungsi? `vitest` mengetes fungsi kode: "Kalau user request 100x dalam 1 detik, sistem menolak atau malah jebol?"

---

## 4. Rate Limiting & Upstash Redis
* **Apa itu?** Batasan jumlah request yang boleh dilakukan user/bot dalam rentang waktu tertentu.
* **Analogi Sehari-hari:** **Antrean Pengambilan Sembako / Tiket Konser**
  Supaya 1 orang tidak mengambil semua sembako/tiket, panitia cap tangan pakai tinta (max 1 tiket per orang).
  * **In-Memory Store:** Panitia ingat-ingat pakai ingatan sendiri. Tapi kalau panitia pingsan/ganti shift (Serverless cold start), ingatan hilang, orang tadi bisa minta sembako lagi.
  * **Upstash Redis:** Panitia catat di buku besar terpusat (database cepat). Siapapun panitianya, catatan tidak akan hilang.

---

## 5. Environment Validation (`@t3-oss/env-nextjs` & `zod`)
* **Apa itu?** Mengecek kunci rahasia (API Key, Database Password) saat aplikasi baru mau menyala.
* **Analogi Sehari-hari:** **Checklist Kelengkapan Sebelum Naik Gunung**
  Sebelum berangkat mendaki, kamu cek tas: "Ada tenda? Ada air? Ada korek?" Kalau korek tidak ada, kamu tidak jadi berangkat dari rumah. Lebih baik batal berangkat di awal daripada baru sadar tidak ada korek saat sudah di puncak gunung malam hari yang dingin.
  Env validation menghentikan aplikasi saat dinyalakan jika ada password/kunci rahasia yang lupa dipasang.

---

## 6. Security Headers di Web Server
* **Apa itu?** Aturan keamanan tambahan yang dikirim server ke browser pengunjung.
* **Analogi Sehari-hari:** **Papan Aturan di Kolam Renang / Gedung**
  "Dilarang melompat", "Dilarang membawa makanan luar", "Gedung ini diawasi CCTV".
  Security headers memberi tahu browser user: "Jangan izinkan web ini dimasukkan ke dalam frame iframe web lain" (`X-Frame-Options`), "Jangan izinkan akses kamera tanpa izin" (`Permissions-Policy`).

---

## Ringkasan Perubahan di Branch `development`

| Yang Dikerjakan | Analogi Kasar |
|---|---|
| **Renamed package & scripts** | Merapi ganti nama dus & label tombol alat kerja |
| **Added Security Headers** | Pasang papan aturan keselamatan di pintu depan web |
| **Added GitHub Actions CI** | Pasang robot inspeksi otomatis di gerbang GitHub |
| **Added Env Validation** | Buat checklist wajib sebelum aplikasi dinyalakan |
| **Migrated Rate Limiter** | Ganti ingatan panitia dengan buku catatan terpusat |
| **Setup Vitest & Tests** | Buat robot penguji otomatis untuk tes fungsi rem/mesin |
| **Added Dockerfile** | Buat wadah kaleng kedap udara supaya web bisa dijalankan di mana saja |
