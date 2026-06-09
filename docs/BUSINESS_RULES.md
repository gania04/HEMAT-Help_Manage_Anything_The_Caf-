# BUSINESS_RULES.md - HEMAT Business Logic & Governance (v1.2)

Dokumen ini mendefinisikan aturan main (business rules) yang harus diterapkan secara konsisten di seluruh lapisan aplikasi HEMAT.

## 1. Role & Hak Akses (RBAC Matrix)
Pengaturan akses fitur berdasarkan peran pengguna untuk menjaga integritas data.

| Fitur | Owner | Manager | Admin Keuangan | Kasir |
| :--- | :---: | :---: | :---: | :---: |
| Dashboard Analitik (Full) | View | View | No | No |
| Konfigurasi Bisnis & Role | Edit | No | No | No |
| CRUD Bahan Baku & HPP | Edit | Edit | View | No |
| POS Kasir (Penjualan) | Yes | Yes | No | Yes |
| Request Void (Batal) | Yes | Yes | No | Request Only |
| Approve Void | Yes | Yes | No | No |
| Laporan Keuangan | View/Export | View/Export | View/Export | No |
| Manajemen Zakat & Hutang | Full | View | Edit | No |

---

## 2. Approval Workflow (Alur Persetujuan)

### A. Pembatalan Transaksi (Void)
1. **Trigger:** Kasir melakukan kesalahan input pada transaksi yang sudah selesai.
2. **Action:** Kasir menekan tombol "Void" dan memasukkan alasan.
3. **State:** Transaksi berubah menjadi `pending_void`. Stok bahan baku **belum** dikembalikan.
4. **Finalization:** Manager/Owner memberikan approval via aplikasi.
5. **Outcome:** Status transaksi menjadi `voided`. Stok dikembalikan otomatis ke tabel `inventory`.

### B. Pengeluaran di Atas Threshold
- Setiap pengeluaran (Expense) > Rp 5.000.000 wajib divalidasi oleh Owner sebelum tercatat di Laporan Laba Rugi.

---

## 3. Threshold & Alert Transaksi (Limit & Batasan)

- **Stock Alert:** Notifikasi dipicu jika `inventory.quantity` <= `inventory.min_stock`.
- **Budget Threshold:** Alert WhatsApp/Push dikirim saat pengeluaran kategori mencapai **80%** dan **100%** dari limit anggaran.
- **Nisab Zakat:** Alert otomatis jika total aset lancar >= Nilai 85 gram emas (berdasarkan `GoldAPI.io`).

---

## 4. Alur Verifikasi Masjid (Penyaluran Sedekah/Zakat)
Untuk menjamin keamanan penyaluran dana sosial:
1. **Pendaftaran Lembaga:** Pengguna memasukkan Nama Masjid/Lembaga dan ID Resmi (BOS/Kemenag jika ada).
2. **Rekening Validasi:** Nama rekening bank penerima wajib mengandung kata kunci yang relevan (misal: "Masjid", "Yayasan", "Zakat").
3. **Pencatatan:** Setiap penyaluran wajib disertai unggahan foto bukti transfer/kuitansi fisik.
4. **Transparency:** Laporan penyaluran dana sosial dipisahkan dari operasional bisnis utama.

---

## 5. Atur Syariah (Financial Integrity)

- **Anti-Riba:** Modul hutang-piutang dilarang memiliki kolom "Bunga/Interest". Hanya diperbolehkan selisih harga jual (Margin) dalam akad Murabahah yang disepakati di awal.
- **Denda:** Tidak boleh ada denda keterlambatan yang masuk ke pendapatan perusahaan (disarankan masuk ke dana sosial/sedekah jika ada).
- **Zakat Mal:** Perhitungan menggunakan metode `(Aset Lancar - Hutang Jangka Pendek) * 2.5%` jika sudah mencapai Haul (1 tahun).

---

## 6. Alur Program (Core Program Flow)
1. **Inventory:** Bahan Baku masuk -> Kalkulasi HPP otomatis (termasuk packaging).
2. **Sales:** Transaksi POS -> Potong stok real-time (Header-Detail logic).
3. **Audit:** Setiap perubahan manual (Void/Update Stok) wajib tercatat di `audit_logs`.

---
**Product Owner:** Gania Kusriyati
**Lead Developer:** [TBD]
