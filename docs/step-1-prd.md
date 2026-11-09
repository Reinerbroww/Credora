# STEP 1 — PRODUCT REQUIREMENTS DOCUMENT

**Project:** Credora  
**Product:** Credit Intelligence Platform  
**Version:** 1.0  
**Status:** Draft

---

## 1. Latar Belakang

Layanan PayLater membutuhkan proses pengelolaan pengajuan dan penilaian risiko kredit yang terstruktur. Perusahaan perlu mengolah informasi pelanggan, memperkirakan kemungkinan gagal bayar, serta memantau kondisi risiko dari keseluruhan pengajuan.

Credora dikembangkan sebagai platform yang mengintegrasikan pengelolaan pengajuan kredit, penilaian risiko berbasis machine learning, dan pemantauan portofolio dalam satu aplikasi.

## 2. Tujuan Produk

Membantu perusahaan penyedia layanan PayLater mengelola pengajuan pelanggan, memperoleh estimasi risiko gagal bayar, dan memantau distribusi risiko portofolio melalui satu platform.

## 3. Target Pengguna

**Target utama — B2B:** Perusahaan penyedia layanan PayLater, khususnya Risk Analyst dan Credit Officer yang bertugas menganalisis pengajuan dan melakukan pemeriksaan risiko kredit.

**Target pengembangan berikutnya — B2C:** Individu yang ingin memperoleh gambaran estimasi profil risiko kredit berdasarkan informasi keuangan pribadi.

MVP akan difokuskan pada pengguna B2B.

## 4. Fitur Utama MVP

1. **Credit Application Management**  
   Mengelola data pengajuan kredit pelanggan, menampilkan daftar pengajuan, serta memantau status setiap pengajuan.

2. **AI Credit Risk Assessment**  
   Memproses data pengajuan menggunakan model LightGBM untuk menghasilkan estimasi probabilitas gagal bayar, kategori risiko, dan faktor yang memengaruhi hasil prediksi.

3. **Credit Portfolio Analytics**  
   Menampilkan ringkasan pengajuan dan distribusi kategori risiko berdasarkan data yang tersimpan di dalam platform.

4. **Underwriting Management**  
   Membantu petugas memeriksa hasil prediksi, menambahkan catatan pemeriksaan, dan mencatat keputusan akhir.

## 5. Batasan Pengembangan

Fitur berikut belum termasuk dalam MVP:

- Penilaian mandiri untuk pengguna individu.
- Integrasi langsung dengan marketplace, bank, atau penyedia PayLater.
- Pengumpulan data keuangan eksternal secara otomatis.
- Pelatihan ulang model melalui dashboard.
- Pengambilan keputusan kredit secara otomatis.
- Analisis pembayaran dan keterlambatan yang membutuhkan data transaksi historis yang belum tersedia.

## 6. Teknologi

- Next.js, React, dan TypeScript untuk aplikasi web.
- Tailwind CSS untuk antarmuka.
- PostgreSQL melalui Neon untuk penyimpanan data.
- Auth.js (NextAuth) untuk autentikasi dan manajemen sesi.
- LightGBM sebagai model prediksi risiko kredit.
- Layanan prediksi akan diintegrasikan dengan aplikasi setelah kompatibilitas dan kebutuhan teknisnya diperiksa.

## 7. Catatan

Hasil prediksi Credora merupakan estimasi untuk mendukung proses analisis, bukan keputusan kredit otomatis. Model yang digunakan perlu divalidasi terhadap data yang relevan sebelum digunakan dalam operasional perusahaan.

**Tujuan dokumen:** Menjadi acuan ruang lingkup pengembangan MVP Credora.