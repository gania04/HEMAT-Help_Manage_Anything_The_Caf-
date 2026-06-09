Product Requirements Document (PRD)
HEMAT — Help Manage Anything The Café
Versi: 1.2 (Final Draft)
Disusun oleh: Gania Kusriyati
Tanggal: 1 Mei 2026
________________________________________
1. Perubahan Utama (Changelog v1.2)
•	Sinkronisasi Database: Re-strukturisasi tabel transactions (Header-Detail) dan penambahan tabel audit_logs & menu_prices.
•	Strategi Offline: Definisi PWA dengan Background Sync untuk menjamin integrasi Supabase.
•	Flow Operasional: Penjelasan alur Void dan Waste Management.
•	Otomasi Zakat: Penentuan API Gold Price dan mekanisme fallback.
________________________________________
2. Arsitektur & Strategi Offline (PWA)
Untuk mengatasi konflik antara Supabase (Realtime) dan Offline Mode:
•	Storage: Menggunakan IndexedDB untuk menyimpan data transaksi sementara saat offline.
•	Sync Strategy: Menggunakan Last-Write-Wins untuk resolusi konflik. Data akan disinkronkan otomatis via Service Worker saat koneksi terdeteksi (Status: 4G/Wi-Fi).
•	Limitasi: Local cache hanya menyimpan data transaksi 24 jam terakhir untuk menjaga performa perangkat kasir.
________________________________________
3. Persyaratan Fungsional (Detail Baru)
3.1 Waste Management & Hidden Costs
•	Waste Recording: Staff Logistik menginput bahan yang dibuang (Nama Bahan, Qty, Alasan: Busuk/Expired/Tumpah).
o	Dampak: Mengurangi stok fisik dan tercatat sebagai "Beban Kerugian Barang" di Laporan Laba Rugi.
•	Hidden Costs (Packaging): Biaya packaging (cup, lid, straw) dimasukkan ke dalam kalkulasi HPP per porsi agar margin keuntungan lebih akurat, bukan sebagai biaya overhead bulanan.
3.2 Void Transaction & Audit Trail
•	Void Flow: Jika Manager tidak di tempat, Kasir dapat melakukan "Request Void". Transaksi akan ditandai Pending Void (stok belum kembali). Setelah di-approve Manager via Mobile App, stok otomatis kembali dan status transaksi berubah jadi Voided.
•	Audit Trail: Sistem mencatat setiap perubahan pada harga bahan baku, penghapusan transaksi, dan perubahan stok manual.
________________________________________
4. Skema Database (Konsolidasi & Fix)
Tabel: menu_prices (Fix Gap Multi-Channel)
Kolom	Tipe	Keterangan
menu_id	UUID	Foreign Key ke tabel menus
channel	ENUM	dine_in, takeaway, grabfood, gofood, shopeefood
price	DECIMAL	Harga spesifik per kanal
Tabel: transactions (Header - Updated)
Kolom	Tipe	Keterangan
id	UUID	Primary Key
created_by	UUID	User ID yang menginput
channel	ENUM	Kanal penjualan
payment_method	ENUM	tunai, debit, qris, murabahah
total_amount	DECIMAL	Grand total
evidence_doc_id	UUID	Link ke foto struk (untuk expense)
status	ENUM	completed, pending_void, voided
Tabel: audit_logs (Fix Gap Security)
Kolom	Tipe	Keterangan
id	UUID	Primary Key
user_id	UUID	Siapa yang melakukan perubahan
action	VARCHAR	Nama aksi (Update_Stock, Delete_Trans)
old_value	JSONB	Data sebelum diubah
new_value	JSONB	Data setelah diubah
________________________________________
5. Integrasi Eksternal & Asumsi (Klarifikasi)
•	Gold Price API: Menggunakan GoldAPI.io.
•	Update Frequency: Data ditarik 1x setiap 24 jam (jam 00:00).
•	Fallback: Jika API gagal, sistem menggunakan harga terakhir yang tersimpan atau mengizinkan Owner menginput harga emas manual melalui menu Pengaturan.
________________________________________
6. Rencana Rilis Terintegrasi (Kohesif)
1.	Fase Alpha (6 Minggu):
o	Setup Database Header-Detail.
o	Modul Inventaris (Multi-unit conversion) & Kalkulator HPP.
o	POS Dasar (Online only).
2.	Fase Beta (8 Minggu):
o	Implementasi PWA & Offline Mode (IndexedDB).
o	Modul Waste Management & Audit Trail.
o	Laporan Keuangan (Laba Rugi & Neraca).
3.	Fase v1.0 - Launch (4 Minggu):
o	Integrasi Gold API & Fitur Auto Zakat.
o	Multi-channel Pricing (Grab/Go/Shopee).
o	Manajemen Hutang-Piutang Syariah.
________________________________________
Kriteria Keberhasilan:
•	Sync Accuracy: 100% data tersinkronisasi tanpa duplikasi setelah koneksi pulih.
•	HPP Accuracy: Selisih antara perhitungan sistem dan stok opname riil < 2%.

