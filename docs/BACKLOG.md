# Product Backlog (BACKLOCK) - HEMAT App

**Versi:** 1.0 (Berdasarkan dokumen PRD v1.2, README, dan BUSINESS_RULES)
**Proyek:** HEMAT (Help Manage Anything The Café)
**Progress Keseluruhan:** 48 / 48 Tasks (100%) Selesai 🎉

Dokumen ini merangkum daftar fitur, epics, dan kebutuhan sistem yang harus dikembangkan, diurutkan berdasarkan fase rilis (Alpha, Beta, v1.0 Launch).

---

## 📌 Fase Alpha (Prioritas Tinggi - MVP)
**Target Waktu:** 6 Minggu
**Fokus:** Core system, Database, Inventaris, dan POS Dasar.

- [x] **EPIC 1: Setup Database & Arsitektur Dasar**
  - [x] Implementasi skema tabel `transactions` (Header) dan `transaction_items` (Detail).
  - [x] Konfigurasi Supabase (PostgreSQL) sebagai database utama.
  - [x] Setup Role-Based Access Control (RBAC) untuk Owner, Manager, Admin Keuangan, dan Kasir.
- [ ] **EPIC 2: Modul Inventaris & Kalkulator HPP**
  - [x] Fitur CRUD (Create, Read, Update, Delete) Bahan Baku.
  - [x] Implementasi sistem konversi satuan (Multi-unit conversion) untuk bahan baku.
  - [x] Kalkulator Harga Pokok Penjualan (HPP) otomatis.
  - [x] Integrasi perhitungan "Hidden Costs" (seperti packaging) ke dalam kalkulasi HPP per porsi.
  - [x] Fitur notifikasi batas stok (Stock Alert) jika ketersediaan <= batas minimum.
- [ ] **EPIC 3: POS Dasar (Point of Sales)**
  - [x] Pembuatan antarmuka POS untuk transaksi kasir (Online-Only untuk sementara).
  - [x] Integrasi pemotongan stok otomatis dan real-time saat transaksi berhasil dilakukan.
  - [x] Dukungan berbagai metode pembayaran (tunai, debit, qris, murabahah).
- [x] **EPIC 3b: Fondasi UI/UX & Pengujian (Testing)**
  - [x] Implementasi standarisasi UI/UX (Palet Hijau/Merah, Tipografi Inter/Plus Jakarta Sans).
  - [x] Setup *Unit Testing* (Jest) untuk logika bisnis inti (HPP, kalkulasi zakat, konversi satuan).

---

## 📌 Fase Beta (Prioritas Menengah) - ✅ SELESAI
**Target Waktu:** 8 Minggu
**Fokus:** PWA, Mode Offline, Audit, Laporan Keuangan, dan Pengujian.

- [x] **EPIC 4: PWA & Offline Mode**
  - [x] Konfigurasi Progressive Web App (PWA) dengan Service Workers.
  - [x] Implementasi penyimpanan data `IndexedDB` untuk mencatat transaksi saat status offline.
  - [x] Pembuatan mekanisme Sinkronisasi Latar Belakang (Background Sync) otomatis.
  - [x] Implementasi strategi *Last-Write-Wins* untuk resolusi konflik data ke Supabase.
  - [x] Limitasi penyimpanan *local cache* hanya untuk 24 jam terakhir guna menjaga performa perangkat.
- [x] **EPIC 5: Void Transaction & Audit Trail**
  - [x] Pembuatan alur "Request Void" untuk Kasir (mengubah status transaksi menjadi `pending_void`).
  - [x] Pembuatan antarmuka **Approval Void** untuk Manager/Owner via Mobile App.
  - [x] Otomasi pengembalian stok saat Manager mengkonfirmasi void transaksi.
  - [x] Implementasi tabel `audit_logs` untuk mencatat perubahan harga, stok, maupun penghapusan transaksi (beserta data `old_value` dan `new_value`).
- [x] **EPIC 6: Waste Management (Manajemen Limbah)**
  - [x] Antarmuka bagi Staff Logistik untuk menginput bahan yang dibuang (kuantitas, alasan).
  - [x] Otomasi pengurangan stok akibat waste.
  - [x] Pencatatan kerugian bahan terbuang sebagai "Beban Kerugian Barang" dalam Laporan Laba Rugi.
- [x] **EPIC 7: Laporan Keuangan Dasar & Limit Pengeluaran**
  - [x] Generate Laporan Laba Rugi secara dinamis dan Laporan Neraca dasar.
  - [x] Fitur batas pengeluaran: Wajib *Approval* Owner untuk *Expense* > Rp 5.000.000.
  - [x] Fitur peringatan (*Budget Alert*) saat pengeluaran kategori mencapai 80% dan 100% dari limit anggaran.
- [x] **EPIC 7b: Dashboard & Infrastruktur Tambahan**
  - [x] Pembuatan *Dashboard KPI Cards* (Kas, Omzet, HPP, Laba Bersih).
  - [x] Integrasi visualisasi data (Grafik Garis tren omzet, Grafik Radar kepatuhan syariah).
  - [x] Implementasi UI "Audit Kilat AI" untuk validasi margin dan stok.
  - [x] Setup *E2E Testing* (Playwright) untuk alur kritis (Offline Sync, Void).
  - [x] Integrasi *Sentry* untuk pelacakan *error* secara real-time.

---

## 📌 Fase v1.0 Launch (Prioritas Akhir)
**Target Waktu:** 4 Minggu
**Fokus:** Multi-channel Pricing, Integrasi API Emas, dan Kepatuhan Syariah.

- [x] **EPIC 8: Multi-Channel Pricing**
  - [x] Pembuatan skema tabel `menu_prices` untuk menyimpan relasi harga per kanal.
  - [x] Modul pengaturan harga yang berbeda untuk Dine-in, Takeaway, GrabFood, GoFood, dan ShopeeFood.
  - [x] Adaptasi halaman POS kasir untuk dapat menyesuaikan kalkulasi berdasarkan opsi kanal yang dipilih.
- [x] **EPIC 9: Otomasi Zakat Mal & Integrasi API**
  - [x] Integrasi `GoldAPI.io` untuk penarikan data harga emas (setiap jam 00:00).
  - [x] Pembuatan *Fallback*: Fitur input harga emas secara manual jika koneksi API terputus.
  - [x] Sistem notifikasi peringatan Zakat (Nisab) jika total aset lancar >= nilai 85 gram emas.
  - [x] Kalkulasi otomatis: `(Aset Lancar - Hutang Jangka Pendek) * 2.5%` (jika sudah haul).
- [x] **EPIC 10: Kepatuhan Keuangan Syariah (Tanpa Riba)**
  - [x] Modul hutang-piutang tanpa bunga (Anti-Riba) atau denda masuk operasional.
  - [x] Fitur pendataan dan validasi penerima dana sosial (Masjid/Yayasan/Lembaga).
  - [x] Fitur unggah bukti struk/kuitansi untuk setiap pengeluaran dana sosial.
  - [x] Pembuatan Laporan Penyaluran Dana Sosial (terpisah dari Laporan Laba Rugi).

---

## 📌 Kepatuhan Regulasi & Keamanan Sistem (Compliance)
**Target Waktu:** Berjalan pararel sepanjang fase rilis.

- [x] **EPIC 11: Kepatuhan Keamanan & Data Privacy (KYC/AML)**
  - [x] *Merchant Verification*: Wajib unggah KTP dan NIB saat registrasi akun Owner.
  - [x] *Sanction Screening* & pemantauan transaksi anomali (*Transaction Monitoring*).
  - [x] Penerapan kebijakan retensi data (penyimpanan transaksi 5 tahun & *cold storage archiving*).
  - [x] Mekanisme anonimisasi data apabila *user* mengajukan penghapusan akun.
