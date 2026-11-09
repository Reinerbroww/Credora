# STEP 2 — USER PERSONA & USER FLOW

**Project:** Credora  
**Version:** 1.0  
**Status:** Draft

---

## 1. User Persona

### Persona Utama: Risk Analyst

**Profil:**  
Seorang analis risiko yang bekerja pada perusahaan penyedia layanan PayLater dan bertanggung jawab membantu proses penilaian risiko pengajuan kredit pelanggan.

**Tujuan:**
- Mengelola dan memeriksa pengajuan kredit pelanggan.
- Mengetahui estimasi kemungkinan gagal bayar.
- Memahami faktor yang memengaruhi hasil prediksi.
- Memantau distribusi risiko portofolio.
- Menyediakan informasi pendukung bagi proses pemeriksaan kredit.

**Permasalahan:**  
Informasi pengajuan dan hasil analisis risiko perlu dikelola secara terstruktur. Jika proses tersebut tersebar di berbagai tempat, petugas akan lebih sulit memantau pengajuan, membandingkan tingkat risiko, dan mencatat hasil pemeriksaan.

**Kebutuhan:**  
Platform terpusat untuk mengelola pengajuan, menjalankan penilaian risiko, melihat hasil prediksi, memantau portofolio, dan mencatat hasil pemeriksaan.

### Persona Pendukung: Credit Officer

**Profil:**  
Petugas perusahaan yang bertanggung jawab memeriksa informasi pengajuan dan mempertimbangkan hasil analisis sebelum mencatat keputusan akhir.

**Kebutuhan:**  
Melihat informasi pengajuan, hasil prediksi risiko, faktor pendukung, serta memberikan catatan dan keputusan pemeriksaan.

---

## 2. User Flow

Alur utama penggunaan Credora oleh Risk Analyst dan Credit Officer:

1. **Login**  
   Pengguna masuk ke Credora menggunakan akun perusahaan.

2. **Dashboard**  
   Pengguna melihat ringkasan jumlah pengajuan, status pengajuan, dan distribusi risiko kredit.

3. **Application Management**  
   Pengguna membuka daftar pengajuan, mencari data pelanggan, atau membuat pengajuan baru.

4. **Application Detail**  
   Pengguna memilih salah satu pengajuan untuk melihat informasi pelanggan dan data keuangan yang diperlukan.

5. **Credit Risk Assessment**  
   Pengguna menjalankan penilaian risiko menggunakan model LightGBM berdasarkan data yang telah diisi dan divalidasi.

6. **Prediction Result**  
   Sistem menampilkan probabilitas gagal bayar, kategori risiko, serta faktor yang memengaruhi hasil prediksi.

7. **Underwriting Review**  
   Credit Officer atau petugas yang memiliki izin memeriksa informasi pengajuan dan hasil prediksi.

8. **Record Decision**  
   Petugas mencatat keputusan akhir, alasan, dan catatan pemeriksaan.

9. **Portfolio Analytics**  
   Pengguna kembali ke dashboard untuk melihat ringkasan portofolio yang diperbarui berdasarkan data pengajuan dan hasil pemeriksaan.

---

## 3. Catatan

Risk Analyst menjadi persona utama dalam penggunaan Credora. Credit Officer berperan sebagai pengguna pendukung dalam proses pemeriksaan dan pencatatan keputusan. Hak akses kedua peran perlu dibedakan agar proses pengelolaan dan pemeriksaan berjalan sesuai tanggung jawab masing-masing.

Hasil prediksi machine learning merupakan informasi pendukung. Keputusan akhir tetap dilakukan oleh petugas perusahaan.