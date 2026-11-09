# STEP 3 — WIREFRAME

**Project:** Credora  
**Version:** 1.0  
**Status:** Draft

---

## 1. Struktur Navigasi

Credora menggunakan dashboard layout dengan sidebar sebagai navigasi utama.

**Sidebar:**
- Overview
- Applications
- Portfolio Analytics
- Underwriting Reviews
- Settings
- Logout

**Topbar:**
- Nama halaman
- Informasi akun pengguna
- Notifikasi (jika diperlukan)

## 2. Halaman Login

**Tujuan:** Memberikan akses masuk kepada pengguna perusahaan.

**Struktur elemen:**
1. Logo dan nama Credora.
2. Judul halaman Login.
3. Input email.
4. Input password.
5. Tombol Login.
6. Pesan kesalahan jika proses login gagal.

## 3. Halaman Dashboard

**Tujuan:** Menampilkan gambaran umum kondisi pengajuan dan risiko kredit.

**Struktur elemen:**
1. Sidebar navigasi.
2. Topbar dan informasi pengguna.
3. Judul halaman dan deskripsi singkat.
4. Kartu ringkasan:
   - Total pengajuan.
   - Pengajuan menunggu pemeriksaan.
   - Pengajuan yang telah dinilai.
   - Jumlah pengajuan berisiko tinggi.
5. Grafik distribusi kategori risiko.
6. Daftar pengajuan terbaru.
7. Tombol menuju halaman seluruh pengajuan.

Angka dan grafik harus dihitung berdasarkan data aktual yang tersimpan, bukan angka contoh yang ditampilkan seolah-olah data nyata.

## 4. Halaman Application Management

**Tujuan:** Mengelola dan mencari pengajuan kredit pelanggan.

**Struktur elemen:**
1. Judul halaman.
2. Tombol Add Application.
3. Kolom pencarian.
4. Filter status pengajuan.
5. Filter kategori risiko.
6. Tabel pengajuan dengan kolom:
   - ID pengajuan.
   - Nama pelanggan.
   - Tanggal pengajuan.
   - Jumlah pinjaman.
   - Status pengajuan.
   - Kategori risiko.
   - Aksi untuk melihat detail.
7. Navigasi halaman tabel.

## 5. Halaman Add Application

**Tujuan:** Memasukkan data pelanggan untuk pengajuan kredit baru.

**Struktur elemen:**
1. Judul halaman.
2. Bagian informasi pelanggan.
3. Bagian informasi keuangan.
4. Bagian informasi pekerjaan.
5. Validasi input dan pesan kesalahan.
6. Tombol Save Application.
7. Tombol Cancel.

Field input harus mengikuti kebutuhan model LightGBM yang digunakan. Nama, tipe, dan rentang setiap field perlu disesuaikan dengan kontrak input model sebelum implementasi.

## 6. Halaman Application Detail

**Tujuan:** Melihat informasi lengkap suatu pengajuan.

**Struktur elemen:**
1. Identitas dan ID pengajuan.
2. Informasi pelanggan.
3. Informasi pekerjaan dan keuangan.
4. Status pengajuan.
5. Riwayat penilaian risiko.
6. Tombol Run Risk Assessment.
7. Tombol menuju hasil penilaian.

## 7. Halaman Credit Risk Assessment Result

**Tujuan:** Menampilkan hasil penilaian risiko kredit.

**Struktur elemen:**
1. Identitas pengajuan.
2. Probabilitas gagal bayar.
3. Kategori risiko.
4. Visualisasi faktor yang memengaruhi prediksi.
5. Informasi model yang digunakan.
6. Waktu penilaian.
7. Tombol untuk kembali ke detail pengajuan.
8. Tombol untuk melanjutkan ke pemeriksaan.

Hasil prediksi dan faktor pendukung harus berasal dari model, bukan nilai yang dibuat secara acak.

## 8. Halaman Underwriting Reviews

**Tujuan:** Mengelola pengajuan yang memerlukan pemeriksaan petugas.

**Struktur elemen:**
1. Judul halaman.
2. Filter status pemeriksaan.
3. Kolom pencarian.
4. Tabel pemeriksaan dengan kolom:
   - ID pengajuan.
   - Nama pelanggan.
   - Kategori risiko.
   - Status pemeriksaan.
   - Tanggal pengajuan.
   - Aksi untuk memeriksa.

## 9. Halaman Underwriting Review Detail

**Tujuan:** Membantu petugas memeriksa hasil penilaian dan mencatat keputusan.

**Struktur elemen:**
1. Informasi pengajuan.
2. Informasi pelanggan.
3. Hasil prediksi risiko.
4. Faktor yang memengaruhi hasil prediksi.
5. Catatan pemeriksaan.
6. Pilihan keputusan akhir.
7. Alasan keputusan.
8. Tombol Save Review.

Keputusan akhir dicatat oleh petugas dan tidak ditentukan secara otomatis oleh model.

## 10. Halaman Portfolio Analytics

**Tujuan:** Menampilkan analisis ringkasan risiko portofolio kredit.

**Struktur elemen:**
1. Judul halaman.
2. Filter periode.
3. Kartu total pengajuan.
4. Grafik distribusi kategori risiko.
5. Grafik status pengajuan.
6. Ringkasan jumlah pengajuan berdasarkan kategori risiko.
7. Informasi waktu pembaruan data.

Analisis hanya menampilkan metrik yang dapat dihitung dari data yang benar-benar tersedia.

## 11. Halaman Settings

**Tujuan:** Menampilkan dan mengelola informasi akun pengguna.

**Struktur elemen:**
1. Informasi profil pengguna.
2. Informasi organisasi.
3. Peran pengguna.
4. Pengaturan akun dasar.
5. Tombol Logout.

---

## 12. Catatan Wireframe

Struktur halaman dirancang berdasarkan alur kerja utama pengguna B2B. Prioritas desain adalah kemudahan membaca informasi pengajuan, memahami hasil penilaian risiko, dan melakukan pemeriksaan.

Wireframe ini merupakan rancangan struktur awal. Detail komponen, hak akses, serta kebutuhan data dapat disesuaikan setelah evaluasi.