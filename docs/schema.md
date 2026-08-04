# Dokumentasi Skema Database & RLS Policy — Ruwet

## Struktur Tabel

### 1. `profiles`
Menyimpan profil pengguna yang terhubung ke `auth.users`.
- `id`: UUID (Primary Key, references `auth.users`)
- `full_name`: Text (Nama lengkap pengguna)
- `avatar_url`: Text (URL foto profil)
- `created_at`: Timestamptz

### 2. `boards`
Menyimpan ruang kerja (board) kanban tim.
- `id`: UUID (Primary Key)
- `name`: Text (Nama board)
- `owner_id`: UUID (References `profiles.id`)
- `created_at`: Timestamptz

### 3. `board_members`
Menyimpan relasi anggota pada setiap board.
- `id`: UUID (Primary Key)
- `board_id`: UUID (References `boards.id`)
- `user_id`: UUID (References `profiles.id`)
- `role`: Text (`owner` | `member`)
- `joined_at`: Timestamptz

---

## Row Level Security (RLS) Policies

### `profiles`
- **SELECT**: Pengguna terautentikasi dapat melihat profil.
- **INSERT / UPDATE**: Pengguna hanya dapat menambah/mengedit profil milik sendiri (`auth.uid() = id`).

### `boards`
- **SELECT**: Pengguna hanya bisa membaca board jika tercatat sebagai owner atau anggota di `board_members`.
- **INSERT**: Pengguna terautentikasi dapat membuat board baru (otomatis diset sebagai `owner_id`).
- **UPDATE**: Pengguna yang menjadi anggota atau owner board dapat memperbarui info board.
- **DELETE**: Hanya `owner_id` yang diizinkan menghapus board.

### `board_members`
- **SELECT**: Pengguna dapat melihat daftar anggota board jika ia menjadi anggota di board tersebut.
- **INSERT**: Anggota/owner board dapat menambahkan pengguna lain ke board.
- **DELETE**: Owner board atau pengguna itu sendiri dapat menghapus keanggotaan dari board.
