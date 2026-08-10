# Milestone C — Evaluasi Pemakaian Nyata Ruwet Telegram Bot

Dokumen ini berisi panduan dan ringkasan evaluasi penggunaan nyata bot Telegram Ruwet berdasarkan data metrik yang tercatat pada tabel `telegram_metrics`.

---

## 📊 1. Metrik yang Ditrack (`telegram_metrics`)

Setiap aktivitas pada bot dicatat ke dalam tabel `telegram_metrics`:

| Kategori | Event Type | Deskripsi |
|---|---|---|
| **Command Pull** | `command_mytasks` | Pengguna menjalankan `/mytasks` |
| **Command Pull** | `command_stale` | Pengguna menjalankan `/stale` |
| **Command Pull** | `command_task` | Pengguna mencari task dengan `/task` |
| **Push Notification** | `push_assign` | Notifikasi penugasan task terkirim |
| **Push Notification** | `push_stale` | Notifikasi task usang terkirim |
| **Push Notification** | `push_comment` | Notifikasi komentar terkirim (no-content) |

---

## 📈 2. Query Analisis Rasio (Command Pull vs Push Notification)

Jalankan query SQL berikut di Supabase SQL Editor untuk melihat rasio penggunaan nyata:

```sql
-- Ringkasan total eksekusi per event
select 
  event_type,
  count(*) as total_count,
  min(created_at) as first_used,
  max(created_at) as last_used
from telegram_metrics
group by event_type
order by total_count desc;

-- Rasio Command Pull vs Push Notification
select
  case 
    when event_type like 'command_%' then 'Command Pull'
    when event_type like 'push_%' then 'Push Notification'
    else 'Other'
  end as category,
  count(*) as total_events
from telegram_metrics
group by category;
```

---

## 🔒 3. Temuan & Checklist Manual Review (§0.2)

- [x] Metrik dicatat secara terpisah tanpa menyimpan data sensitif pribadi.
- [x] Kegagalan logging metrik di-catch secara aman sehingga tidak membatalkan transaksi utama DB / Edge Function.
- [x] Data siap dievaluasi untuk menentukan prioritas fitur P1/P2 selanjutnya.
