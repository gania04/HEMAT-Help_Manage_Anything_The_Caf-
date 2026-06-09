# DEV_GUIDE.md - Developer Onboarding & Guidelines (v1.2)

Panduan ini berisi standar teknis dan prosedur operasional untuk tim pengembang proyek **HEMAT**.

## 1. Coding Standards
Konsistensi kode adalah kunci untuk pemeliharaan jangka panjang.

### Frontend (Next.js/React)
- **Language:** TypeScript (Strict Mode).
- **Styling:** Tailwind CSS.
- **Component Structure:** Functional Components dengan Hooks.
- **Naming Convention:** - PascalCase untuk nama file komponen (e.g., `PosCart.tsx`).
  - camelCase untuk variabel dan fungsi (e.g., `calculateHpp()`).
- **State Management:** - Local state: `useState`.
  - Global state (jika diperlukan): `Zustand`.
  - Server state: `React Query` atau Supabase Hooks.

### Database (PostgreSQL)
- Gunakan **Snake Case** untuk nama tabel dan kolom (e.g., `unit_conversions`).
- Setiap tabel wajib memiliki kolom `id (UUID)`, `created_at`, dan `updated_at`.
- Aktifkan **RLS (Row Level Security)** di Supabase untuk setiap tabel baru.

---

## 2. Git Workflow
Kita menggunakan model **Feature Branching**.

- **Main Branch:** Kode yang siap produksi. Jangan pernah melakukan push langsung ke sini.
- **Staging/Develop Branch:** Kode yang sedang dalam tahap pengujian integrasi.
- **Feature Branches:** Dibuat dari `main` atau `develop`. 
  - Penamaan: `feat/nama-fitur` atau `fix/nama-bug`.
- **Pull Request (PR):**
  - Wajib mendapatkan minimal 1 approval dari rekan tim.
  - Deskripsi PR harus mencakup apa yang diubah dan cara pengujiannya.

---

## 3. Testing Strategy
Kualitas kode dipastikan melalui tiga lapis pengujian:

1. **Unit Testing (Jest):** Fokus pada fungsi logika bisnis (kalkulasi HPP, perhitungan zakat, konversi satuan).
2. **Integration Testing:** Memastikan komponen frontend berinteraksi dengan Supabase API secara benar.
3. **E2E Testing (Playwright):** Menguji alur kritis seperti:
   - Login -> Input Order -> Sync Offline ke Online.
   - Request Void -> Manager Approval.

---

## 4. Deployment Guide

### Development & Staging
- Setiap push ke branch `feat/*` akan memicu **Preview Deployment** di Vercel.
- Database staging menggunakan project terpisah di Supabase.

### Production Release
1. **Merge to Main:** Setelah PR di-approve dan tes lulus.
2. **Environment Variables:** Pastikan semua API Key (GoldAPI, WA Gateway) sudah dikonfigurasi di dashboard Vercel.
3. **Database Migration:** Jalankan migrasi skema SQL melalui Supabase CLI sebelum deployment frontend selesai.
4. **Monitoring:** Gunakan **Sentry** untuk pelacakan error secara real-time setelah rilis.

---

## 5. Offline-First Readiness
Setiap developer yang menyentuh modul POS wajib memastikan:
- Data transaksi disimpan ke `IndexedDB` sebelum dikirim ke API.
- Gunakan *Background Sync API* untuk menangani kondisi internet yang tidak stabil.
- Tambahkan loading states dan offline indicators pada UI.

---
**Lead Developer:** [To Be Assigned]
**Last Revision:** 1 Mei 2026
