# STEP 0 — IDEA & CATEGORY SELECTION

**Project Name:** Credora  
**Product Name:** Credit Intelligence Platform  
**Tagline:** Smarter Credit. Better Decisions.  
**Version:** 1.0  
**Status:** DRAFT — Menunggu Persetujuan Mentor

---

## 1. Kategori Aplikasi

**Kategori:** Financial Technology (FinTech) — Credit Risk Intelligence.

Credora merupakan aplikasi berbasis web yang berfokus pada pengelolaan dan analisis risiko kredit. Platform ini dirancang untuk membantu perusahaan penyedia layanan PayLater mengelola pengajuan pelanggan, memperoleh estimasi risiko gagal bayar menggunakan machine learning, dan memantau kondisi portofolio kredit.

## 2. Ide Aplikasi

Credora adalah platform intelijen risiko kredit yang menggabungkan pengelolaan pengajuan kredit, penilaian risiko berbasis machine learning, dan analisis portofolio dalam satu sistem. Platform ini memiliki dua target pengguna, yaitu perusahaan penyedia layanan PayLater (B2B) sebagai target utama dan individu (B2C) sebagai target pengembangan berikutnya.

## 3. Masalah yang Ingin Diselesaikan

Perusahaan penyedia layanan PayLater perlu memeriksa banyak pengajuan pelanggan dan memperkirakan kemungkinan gagal bayar. Proses tersebut membutuhkan pengelolaan informasi pelanggan, analisis risiko, pencatatan hasil pemeriksaan, serta pemantauan portofolio secara terstruktur.

Credora bertujuan membantu menyatukan proses tersebut dalam satu platform sehingga petugas dapat melihat informasi pengajuan, memperoleh estimasi risiko, memahami faktor yang memengaruhi hasil prediksi, dan mencatat hasil pemeriksaan secara lebih terorganisasi.

## 4. Riset Aplikasi Sejenis

Beberapa produk yang memiliki fungsi atau bidang yang berdekatan dengan Credora:

| Produk | Fokus Utama | Referensi |
|---|---|---|
| Experian | Credit decisioning, credit scoring, dan pengelolaan risiko kredit. | https://www.experian.com/business/solutions/credit-decisioning |
| Zest AI | AI-based credit underwriting dan portfolio risk management. | https://www.zest.ai/ |
| Taktile | Pengelolaan strategi pengambilan keputusan risiko dan pemantauan portofolio. | https://taktile.com/credit-solution |
| Qredi | Alternative credit scoring dan insight kredit untuk UMKM di Indonesia. | https://www.qredi.id/ |
| CBI Polaris | Pengembangan, validasi, dan pemantauan model risiko kredit untuk industri keuangan Indonesia. | https://www.cbi.id/product/risk-solutions/polaris/ |

**Hasil pengamatan:**

Produk-produk tersebut menunjukkan bahwa penggunaan teknologi analisis data dan machine learning dalam penilaian risiko kredit telah diterapkan oleh berbagai perusahaan. Namun, Credora akan mengambil pendekatan pengembangan yang lebih terfokus pada pengelolaan pengajuan, estimasi risiko individual, dan analisis portofolio dalam satu MVP.

## 5. Peluang dan Nilai yang Ditawarkan

Credora akan dikembangkan sebagai prototipe platform yang mengintegrasikan beberapa kebutuhan operasional penilaian risiko kredit dalam satu aplikasi. Fokus utamanya adalah menyediakan alur kerja yang sederhana, hasil prediksi yang dapat dipahami, dan pencatatan pemeriksaan oleh manusia.

Nilai yang ingin ditawarkan adalah:

- Pengelolaan pengajuan kredit dalam satu platform.
- Estimasi risiko gagal bayar menggunakan model LightGBM.
- Penyajian kategori risiko dan faktor yang memengaruhi hasil prediksi.
- Pemantauan ringkasan dan distribusi risiko portofolio.
- Pencatatan hasil pemeriksaan dan keputusan oleh petugas.

Credora tidak bertujuan menggantikan seluruh sistem kredit perusahaan berskala besar. Fokus awalnya adalah membangun MVP yang dapat menunjukkan bagaimana proses penilaian dan pemantauan risiko kredit dapat diintegrasikan.

## 6. Kelayakan Pengembangan MVP

Credora dinilai memungkinkan untuk dikembangkan secara bertahap oleh satu pengembang dengan membatasi ruang lingkup fitur pada kebutuhan utama.

Pengembangan awal akan memanfaatkan model LightGBM yang telah tersedia sebagai dasar komponen prediksi risiko kredit. Aplikasi utama akan dibangun menggunakan teknologi yang telah ditentukan dalam SOP, yaitu Next.js, React, TypeScript, Tailwind CSS, dan PostgreSQL melalui Neon.

Integrasi model dan layanan prediksi yang sudah tersedia perlu diperiksa kompatibilitasnya sebelum tahap implementasi.

**Fokus MVP:**

1. Credit Application Management.
2. ML Credit Risk Assessment.
3. Credit Portfolio Analytics.
4. Underwriting & Review.

Fitur B2C, integrasi eksternal dengan penyedia PayLater, dan pelatihan ulang model melalui dashboard belum menjadi prioritas pengembangan awal.

## 7. Batasan dan Catatan Validasi

Model LightGBM yang digunakan merupakan model awal dan belum dapat dianggap sebagai model yang tervalidasi untuk keputusan kredit PayLater di dunia nyata. Kesesuaian dataset, ketersediaan fitur saat pengajuan, kemungkinan data leakage, kalibrasi, dan performa model perlu diperiksa lebih lanjut.

Hasil prediksi hanya berfungsi sebagai informasi pendukung analisis dan tidak secara otomatis menentukan keputusan pemberian kredit.

Selain itu, peluang pasar dan kebutuhan calon pengguna masih perlu divalidasi melalui diskusi atau masukan dari calon pengguna maupun mentor.

---

## 8. Keputusan STEP 0

| Aspek | Keputusan |
|---|---|
| Nama aplikasi | Credora |
| Kategori | Financial Technology (FinTech) |
| Fokus produk | Credit Risk Intelligence |
| Target utama | Perusahaan penyedia layanan PayLater (B2B) |
| Target tambahan | Individu (B2C) |
| Model utama | LightGBM |
| Pendekatan MVP | Credit Risk Assessment & Portfolio Monitoring |
| Kelayakan awal | Dapat dikembangkan secara bertahap |
| Status persetujuan | Menunggu mentor |

**Tujuan pengajuan kepada mentor:**

Meminta persetujuan atas ide Credora sebagai proyek web application dalam kategori Financial Technology, dengan fokus utama pada pengelolaan pengajuan dan analisis risiko kredit untuk penyedia layanan PayLater.

**Dokumen ini merupakan hasil perencanaan STEP 0 dan belum menjadi persetujuan untuk memulai tahap pengembangan aplikasi.**