# STEP 6 — TECH STACK & BACKEND SETUP

**Project:** Credora  
**Version:** 1.1  
**Status:** Draft — Pending Compatibility Check

## 1. Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js |
| UI Library | React |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL (Neon) |
| Backend Platform | Neon |
| Authentication | Auth.js (NextAuth) |
| Database Security | Otorisasi aplikasi (organization_id + role) |
| ML Service | FastAPI + LightGBM |
| Version Control | Git + GitHub |

## 2. Backend Architecture

Credora menggunakan Neon sebagai penyedia PostgreSQL. Berbeda dengan Supabase, Neon hanya menyediakan database sehingga autentikasi dan otorisasi ditangani oleh aplikasi Next.js.

Autentikasi menggunakan Auth.js (NextAuth) dengan database adapter, dan data disimpan pada tabel Auth.js standar (`users`, `accounts`, `sessions`, `verification_tokens`) beserta tabel `profiles` milik aplikasi.

FastAPI dipertimbangkan sebagai layanan terpisah untuk menjalankan model LightGBM yang sudah tersedia dalam proyek sebelumnya.

Next.js menjadi aplikasi utama yang menghubungkan antarmuka, database, dan layanan prediksi.

Arsitektur ini masih memerlukan pemeriksaan kompatibilitas terhadap repository dan model lama.

## 3. Database Platform

**Selected Platform: Neon**

Kebutuhan:
- PostgreSQL database (Neon serverless PostgreSQL).
- Auth.js (NextAuth) untuk autentikasi.
- Otorisasi berbasis `organization_id` dan `role` pada lapisan aplikasi/server.
- Pemisahan data berdasarkan organisasi.
- Environment variables untuk koneksi aplikasi.
- Connection string pooled untuk runtime serverless dan direct connection untuk migrasi.

Project database dibuat khusus untuk Credora.

## 4. Authentication & Security

Autentikasi menggunakan Auth.js (NextAuth).

Ketentuan:
- Login dan logout.
- Session management (session table atau JWT).
- Pembatasan halaman berdasarkan autentikasi (middleware / server component).
- Role-based access.
- Organization-based data isolation yang ditegakkan di server.
- Tidak ada RLS bawaan dari Neon; seluruh query wajib memfilter `organization_id` dari sesi pengguna.

## 5. Machine Learning Integration

Model LightGBM tetap menggunakan ekosistem Python.

FastAPI dipertimbangkan untuk menyediakan endpoint prediksi.

Sebelum implementasi, audit:
- Model artifact.
- Preprocessing pipeline.
- Feature schema.
- Prediction output.
- Dependencies.
- Existing API endpoints.

Hasil prediksi harus divalidasi dan tidak boleh langsung menjadi keputusan kredit otomatis.

## 6. AI App Builder

**Recommended Tool: Antigravity**

Tool utama akan digunakan untuk mengembangkan aplikasi berdasarkan coldstart.md.

AI app builder harus:
1. Membaca seluruh coldstart.md.
2. Memeriksa kompatibilitas teknologi.
3. Menjelaskan arsitektur yang diusulkan.
4. Mengidentifikasi risiko teknis.
5. Tidak mulai coding sebelum pemeriksaan selesai.
6. Memperbarui coldstart.md setelah keputusan disetujui.

## 7. Environment Preparation

Environment variables yang direncanakan:

```env
# Neon PostgreSQL
# Pooled connection untuk runtime Next.js/serverless
DATABASE_URL=
# Direct (non-pooled) connection untuk migrasi
DATABASE_URL_UNPOOLED=

# Auth.js (NextAuth)
AUTH_SECRET=
AUTH_URL=

# Email provider (opsional, bila memakai magic link)
AUTH_EMAIL_SERVER=
AUTH_EMAIL_FROM=

# ML service
ML_SERVICE_URL=
ML_SERVICE_API_KEY=
ML_IDR_PER_USD=4000

# Seed demo assessments with the ML service (opsional)
SEED_RESCORE_ML=
```

Nilai aktual disimpan secara lokal atau pada konfigurasi deployment yang aman. Secret key tidak boleh diekspos ke browser atau dimasukkan ke repository.

## 8. Compatibility Checklist

- [x] Repository lama berhasil diperiksa.
- [x] Model LightGBM berhasil diidentifikasi.
- [x] Input features berhasil didokumentasikan.
- [x] FastAPI compatibility diperiksa.
- [x] Neon project dan database berhasil dibuat.
- [x] Authentication architecture (Auth.js) diperiksa.
- [x] Otorisasi organization_id/role pada lapisan server diperiksa.
- [ ] AI app builder ditentukan.
- [ ] AI app builder mengonfirmasi kompatibilitas stack.
- [ ] Arsitektur akhir disetujui sebelum coding.

## 9. Development Status

Implementasi database dan autentikasi sudah diterapkan:

- Schema Neon tersedia di `db/schema.sql` dan dijalankan dengan `npm run db:migrate`.
- Data demo di-seed melalui `npm run db:seed` (atau `npm run db:setup` untuk keduanya).
- Auth.js (credentials + JWT) terhubung ke tabel `users` dan `profiles`.
- Data aplikasi diakses melalui route handler server dengan filter `organization_id`.
- Store client tidak lagi memakai `localStorage`.
- Layanan LightGBM tersedia di `ml/` (FastAPI: `/health`, `/model/info`, `/predict`), dengan adapter `src/lib/ml-client.ts`, autentikasi opsional `ML_SERVICE_API_KEY`, Dockerfile, serta validasi model `ml/validate_model.py`.
- Assessment baru memakai model asli bila `ML_SERVICE_URL` diatur; jika tidak, aplikasi memakai fallback heuristik yang berlabel jujur.

Langkah berikutnya: validasi statistik model dengan data berlabel, lalu deploy layanan ML dan aplikasi Next.js.

**Next Step:** Finalize architecture and prepare STEP 7 — Full-Stack Development.