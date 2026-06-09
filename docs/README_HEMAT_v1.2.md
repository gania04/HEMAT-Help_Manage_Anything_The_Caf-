# HEMAT — Help Manage Anything The Café (v1.2)

![Status](https://img.shields.io/badge/Status-Draft--Final-green)
![Version](https://img.shields.io/badge/Version-1.2-blue)

**HEMAT** adalah platform manajemen operasional dan keuangan café yang mengintegrasikan efisiensi POS dengan prinsip keuangan Syariah (Zakat & Akad Tanpa Riba).

## 🚀 Fitur Utama & Pembaruan (v1.2)

* **PWA & Offline Resilience:** Menggunakan `IndexedDB` dan `Service Workers` untuk menjamin operasional kasir tetap berjalan tanpa internet.
* **Smart HPP & Waste Management:** Kalkulasi HPP akurat yang mencakup *Hidden Costs* (packaging) dan pencatatan limbah bahan baku (*Waste*).
* **Auto Zakat Mal:** Integrasi dengan `GoldAPI.io` untuk kalkulasi kewajiban zakat secara otomatis berdasarkan harga emas real-time.
* **Multi-Channel Pricing:** Pengaturan harga berbeda untuk *Dine-in*, *GrabFood*, *GoFood*, dan *ShopeeFood*.
* **Security & Audit Trail:** Pelacakan setiap perubahan data sensitif dan alur persetujuan *Void* transaksi.

## 🛠 Arsitektur Teknis

| Komponen | Teknologi |
| :--- | :--- |
| **Frontend** | Next.js (PWA) |
| **Backend/DB** | Supabase (PostgreSQL) |
| **Local Storage** | IndexedDB (untuk Offline Mode) |
| **Sync Strategy** | Background Sync & Last-Write-Wins |
| **Integrasi** | GoldAPI.io (Harga Emas) |

## 📊 Skema Database Inti

### 1. Transaksi (Header-Detail)
Memisahkan ringkasan transaksi dengan detail item yang terjual untuk akurasi stok dan audit.
- `transactions`: Menyimpan total, metode bayar, kanal penjualan, dan status void.
- `transaction_items`: Menyimpan detail menu, kuantitas, dan harga saat transaksi.

### 2. Multi-Channel Pricing
- `menu_prices`: Memungkinkan satu menu memiliki harga berbeda tergantung platform penjualan.

### 3. Keamanan
- `audit_logs`: Mencatat aktivitas pengguna (siapa, melakukan apa, kapan, nilai sebelum vs sesudah).

## 🔄 Alur Operasional Baru

### Void Transaction
1. Kasir melakukan **Request Void**.
2. Transaksi berstatus `Pending Void`.
3. Manager menerima notifikasi di Mobile App dan melakukan **Approval**.
4. Status berubah menjadi `Voided` dan stok otomatis kembali.

### Waste Management
1. Staff Logistik input bahan terbuang.
2. Stok berkurang otomatis.
3. Nilai kerugian dicatat langsung ke **Laporan Laba Rugi** sebagai biaya operasional.

## 🗓 Rencana Rilis (Roadmap)

- **Fase Alpha (6 Minggu):** Setup Database, Modul Inventaris (HPP), & POS Dasar.
- **Fase Beta (8 Minggu):** PWA/Offline Mode, Waste Management, Audit Trail, & Laporan Keuangan.
- **Fase v1.0 Launch (4 Minggu):** Integrasi API Gold, Auto Zakat, & Manajemen Hutang-Piutang Syariah.

## 📈 Kriteria Keberhasilan
- **Sync Accuracy:** 100% (Tidak ada duplikasi data setelah sinkronisasi offline).
- **HPP Accuracy:** Selisih stok sistem vs fisik < 2%.

---
**Disusun oleh:** Gania Kusriyati
**Tanggal:** 1 Mei 2026
