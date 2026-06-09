# COMPLIANCE.md - HEMAT Regulatory & Shariah Framework (v1.2)

## 1. KYC & AML (Know Your Customer & Anti-Money Laundering)
Untuk menjaga integritas platform dan kepatuhan terhadap regulasi keuangan:
- **Merchant Verification:** Pemilik bisnis wajib mengunggah KTP dan NIB (Nomor Induk Berusaha) saat registrasi akun 'Owner'.
- **Sanction Screening:** Sistem melakukan pengecekan nama bisnis terhadap daftar cekal terorisme/pendanaan ilegal secara berkala.
- **Transaction Monitoring:** Deteksi otomatis untuk transaksi yang mencurigakan (misal: lonjakan nilai transaksi yang tidak wajar dalam waktu singkat).

## 2. Audit Trail Specification
Setiap perubahan data yang berdampak pada nilai finansial harus tercatat secara permanen:
- **Immutable Logs:** Record di tabel `audit_logs` tidak dapat diubah atau dihapus oleh user manapun.
- **Metadata:** Log mencakup: Timestamp, User ID, IP Address, Device ID, Aksi, Nilai Sebelum, dan Nilai Sesudah.
- **Critical Actions:** Penyesuaian stok manual, penghapusan transaksi (Void), perubahan harga menu, dan perubahan hak akses user.

## 3. Four-Eyes Principle (Aturan Verifikasi Ganda)
Mencegah kecurangan internal (fraud) melalui pemisahan tugas:
- **Void Approval:** Kasir hanya bisa mengajukan *request* pembatalan, persetujuan akhir harus dilakukan oleh Manager/Owner.
- **Expense Verification:** Pengeluaran di atas ambang tertentu (misal: > Rp 5.000.000) memerlukan verifikasi dua user dengan level manajerial berbeda.
- **Zakat Disbursement:** Pencatatan pengeluaran zakat mal harus divalidasi oleh Owner sebagai penanggung jawab syar'i.

## 4. Mosque & Social Verification (Integrasi Sedekah)
Jika fitur penyaluran zakat/sedekah diaktifkan:
- **Whitelisted Entities:** Penyaluran hanya diperbolehkan ke lembaga yang terverifikasi (Masjid dengan ID resmi atau LAZ/BAZNAS).
- **Proof of Transfer:** Setiap penyaluran wajib disertai unggahan bukti transfer atau tanda terima resmi dari lembaga penerima.

## 5. Privacy Policy & Data Protection
- **Ownership:** Data keuangan adalah milik penuh pengguna (Owner). HEMAT hanya bertindak sebagai pengelola data (*Data Processor*).
- **Encryption:** Data sensitif (password, detail akad, dokumen KYC) dienkripsi menggunakan standar AES-256.
- **Non-Disclosure:** HEMAT menjamin data tidak akan dijual atau dibagikan kepada pihak ketiga tanpa izin eksplisit, kecuali untuk kepatuhan hukum.

## 6. Data Retention Policy
- **Active Data:** Data transaksi disimpan selama 5 tahun sesuai standar akuntansi dan perpajakan di Indonesia.
- **Archiving:** Setelah 5 tahun, data akan dipindahkan ke *cold storage* selama 5 tahun tambahan sebelum dihapus secara permanen.
- **Account Deletion:** Jika user menghapus akun, data KYC akan dihapus dalam 30 hari, namun data transaksi akan dianonimkan (anonymized) untuk keperluan laporan agregat sistem.

---
**Status:** Approved for Implementation
**Compliance Officer:** [To Be Assigned]
**Last Updated:** 1 Mei 2026
