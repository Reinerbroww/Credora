# COLDSTART — CREDORA

**Product Name:** Credora  
**Product Category:** FinTech — Credit Risk Intelligence  
**Product Tagline:** Smarter Credit. Better Decisions.  
**Document Version:** 1.0  
**Date:** November 2026  
**Status:** Draft — Consolidated Planning Document

---

# 1. PROJECT OVERVIEW

## 1.1 Product Description

Credora adalah Credit Intelligence Platform yang dirancang untuk membantu perusahaan penyedia layanan PayLater mengelola pengajuan kredit, memperkirakan risiko gagal bayar menggunakan machine learning, serta memantau kondisi portofolio kredit.

Platform ini mengintegrasikan pengelolaan pengajuan, penilaian risiko berbasis AI, analisis portofolio, dan pemeriksaan kredit oleh petugas dalam satu aplikasi.

Pada pengembangan berikutnya, Credora juga berpotensi menyediakan fitur penilaian risiko kredit mandiri bagi pengguna individu.

## 1.2 Product Identity

| Aspek | Keterangan |
|---|---|
| Nama | Credora |
| Product | Credit Intelligence Platform |
| Tagline | Smarter Credit. Better Decisions. |
| Kategori | Financial Technology |
| Fokus | Credit Risk Intelligence |
| Target utama | B2B — PayLater Providers |
| Target pengembangan berikutnya | B2C — Individuals |
| Core ML Model | LightGBM |

## 1.3 Existing Project

Credora dikembangkan berdasarkan proyek machine learning yang telah dibuat sebelumnya.

**Existing Application:**  
https://paylatercreditscoringengine.streamlit.app/

**GitHub Repository:**  
https://github.com/Reinerbroww/paylater-credit-scoring-engine

Teknologi proyek awal:
- Python
- FastAPI
- LightGBM
- Scikit-learn
- Streamlit
- Joblib

Model yang sudah tersedia akan menjadi dasar pengembangan fitur Credit Risk Assessment.

Metrik model yang pernah dilaporkan:
- Accuracy: 93.01%
- Default Precision: 88%
- Default Recall: 78%
- F1-Score: 0.83
- ROC-AUC: 0.9476

Metrik tersebut merupakan hasil pengujian proyek sebelumnya dan belum dianggap sebagai bukti kesiapan penggunaan operasional.

---

# 2. STEP 0 — IDEA VALIDATION

## 2.1 Problem Statement

Perusahaan penyedia layanan PayLater membutuhkan proses pengelolaan pengajuan dan analisis risiko kredit yang terstruktur.

Permasalahan yang ingin dibantu oleh Credora:

1. Pengelolaan data pengajuan kredit membutuhkan sistem yang terpusat.
2. Petugas membutuhkan informasi pendukung untuk memperkirakan risiko gagal bayar.
3. Hasil penilaian risiko perlu disajikan dengan cara yang mudah dipahami.
4. Perusahaan membutuhkan gambaran distribusi risiko dari keseluruhan pengajuan.
5. Hasil pemeriksaan dan keputusan kredit perlu dicatat secara terstruktur.

## 2.2 Proposed Solution

Credora menyediakan platform yang menggabungkan:

- Credit Application Management.
- AI Credit Risk Assessment.
- Credit Portfolio Analytics.
- Underwriting Management.

## 2.3 Competitor and Market References

Beberapa platform yang dijadikan referensi penelitian:

| Platform | Fokus |
|---|---|
| Experian | Credit decisioning dan credit scoring |
| Zest AI | AI underwriting dan portfolio risk |
| Taktile | Risk decisioning dan monitoring |
| Qredi | Alternative credit scoring |
| CBI Polaris | Risk model development dan monitoring |

Referensi:
- https://www.experian.com/business/solutions/credit-decisioning
- https://www.zest.ai/
- https://taktile.com/credit-solution
- https://www.qredi.id/
- https://www.cbi.id/product/risk-solutions/polaris/

## 2.4 Product Positioning

Credora diposisikan sebagai platform Credit Risk Intelligence yang berfokus pada integrasi pengelolaan pengajuan, estimasi risiko kredit, analisis portofolio, dan pemeriksaan manual.

Credora tidak mengklaim sebagai produk pertama atau satu-satunya di kategori ini.

## 2.5 MVP Feasibility

Pengembangan MVP dilakukan secara bertahap dengan memanfaatkan model LightGBM yang sudah tersedia.

Fokus awal adalah membangun platform B2B dengan fitur inti yang dapat digunakan dan diuji secara terstruktur.

---

# 3. STEP 1 — PRODUCT REQUIREMENTS DOCUMENT

## 3.1 Product Objective

Membantu perusahaan penyedia layanan PayLater mengelola pengajuan pelanggan, memperoleh estimasi risiko gagal bayar, dan memantau distribusi risiko portofolio melalui satu platform.

## 3.2 Target Users

**Primary Target — B2B**

Perusahaan penyedia layanan PayLater.

Pengguna utama:
- Risk Analyst.
- Credit Officer.

**Future Target — B2C**

Individu yang ingin memperoleh gambaran estimasi profil risiko kredit berdasarkan informasi keuangan pribadi.

B2C bukan bagian dari MVP.

## 3.3 Main Features

### Feature 1 — Credit Application Management

Mengelola data pengajuan kredit pelanggan.

Fungsi:
- Membuat pengajuan baru.
- Melihat daftar pengajuan.
- Mencari pengajuan.
- Memfilter status pengajuan.
- Melihat detail pengajuan.

### Feature 2 — AI Credit Risk Assessment

Melakukan estimasi risiko gagal bayar menggunakan LightGBM.

Fungsi:
- Memproses data pengajuan.
- Menghasilkan probabilitas gagal bayar.
- Menampilkan kategori risiko.
- Menampilkan faktor yang memengaruhi hasil prediksi.

### Feature 3 — Credit Portfolio Analytics

Menyajikan ringkasan kondisi portofolio kredit.

Fungsi:
- Melihat jumlah pengajuan.
- Melihat distribusi kategori risiko.
- Melihat tren pengajuan.
- Memantau ringkasan status pengajuan.

### Feature 4 — Underwriting Management

Mendukung proses pemeriksaan manual oleh petugas.

Fungsi:
- Memeriksa informasi pengajuan.
- Melihat hasil prediksi.
- Menambahkan catatan pemeriksaan.
- Mencatat keputusan akhir dan alasannya.

## 3.4 Out of Scope

Fitur yang tidak termasuk dalam MVP:

- Penilaian mandiri untuk individu.
- Integrasi langsung dengan bank atau marketplace.
- Pengumpulan data keuangan eksternal secara otomatis.
- Pelatihan ulang model melalui dashboard.
- Optimasi threshold secara otomatis.
- Pengambilan keputusan kredit secara otomatis.

---

# 4. STEP 2 — USER PERSONA & USER FLOW

## 4.1 Primary Persona — Risk Analyst

**Profil:**  
Analis risiko yang bekerja pada perusahaan penyedia layanan PayLater.

**Goals:**
- Mengelola pengajuan kredit.
- Memahami estimasi risiko gagal bayar.
- Melihat faktor yang memengaruhi hasil prediksi.
- Memantau distribusi risiko portofolio.
- Menyediakan informasi pendukung untuk pemeriksaan kredit.

**Problems:**
- Informasi pengajuan perlu dikelola secara terstruktur.
- Hasil analisis perlu mudah dipahami.
- Distribusi risiko perlu dipantau melalui informasi yang terpusat.

**Needs:**
Platform untuk mengelola pengajuan, menjalankan penilaian risiko, dan memantau portofolio kredit.

## 4.2 Supporting Persona — Credit Officer

**Profil:**  
Petugas yang bertanggung jawab memeriksa informasi pengajuan dan mencatat keputusan akhir.

**Needs:**
- Melihat informasi pelanggan.
- Memahami hasil penilaian risiko.
- Memeriksa faktor pendukung.
- Menambahkan catatan.
- Mencatat keputusan akhir dan alasannya.

## 4.3 Main User Flow

1. Login.
2. Masuk ke Dashboard.
3. Melihat ringkasan pengajuan dan risiko.
4. Membuka Application Management.
5. Membuat atau memilih pengajuan.
6. Membuka Application Detail.
7. Menjalankan Credit Risk Assessment.
8. Melihat Prediction Result.
9. Melakukan Underwriting Review.
10. Mencatat keputusan dan alasan.
11. Kembali ke Dashboard atau Portfolio Analytics.

Keputusan akhir tetap berada pada petugas perusahaan.

---

# 5. STEP 3 — WIREFRAME

## 5.1 Navigation Structure

Sidebar:

1. Overview
2. Applications
3. Portfolio Analytics
4. Underwriting Reviews
5. Settings
6. Logout

Topbar:

- Search applications.
- Notification.
- User profile.
- User role.

## 5.2 Required Pages

### Page 1 — Login

- Logo Credora.
- Email input.
- Password input.
- Login button.
- Error message.

### Page 2 — Dashboard

- Sidebar navigation.
- Topbar.
- Dashboard heading.
- Total Applications card.
- Pending Review card.
- Assessed card.
- High Risk card.
- Risk Portfolio Distribution chart.
- Application Trend chart.
- Recent Applications table.

### Page 3 — Application Management

- Page heading.
- Add Application button.
- Search input.
- Status filter.
- Risk category filter.
- Application table.
- Pagination.

### Page 4 — Add Application

- Customer information.
- Financial information.
- Employment information.
- Input validation.
- Save Application button.
- Cancel button.

### Page 5 — Application Detail

- Application ID.
- Customer information.
- Financial information.
- Application status.
- Assessment history.
- Run Risk Assessment button.

### Page 6 — Credit Risk Assessment Result

- Application information.
- Default probability.
- Risk category.
- Contributing factors.
- Model information.
- Assessment timestamp.
- Continue to Review button.

### Page 7 — Underwriting Reviews

- Page heading.
- Search.
- Review status filter.
- Review table.
- Review detail action.

### Page 8 — Underwriting Review Detail

- Application information.
- Prediction result.
- Contributing factors.
- Review notes.
- Final decision selection.
- Decision reason.
- Save Review button.

### Page 9 — Portfolio Analytics

- Period filter.
- Total Applications.
- Risk Distribution chart.
- Application Status chart.
- Risk category summary.
- Data update information.

### Page 10 — Settings

- User profile.
- Organization information.
- User role.
- Basic account settings.
- Logout.

---

# 6. STEP 4 — DATABASE SCHEMA

Database menggunakan PostgreSQL melalui Neon. Autentikasi menggunakan Auth.js (NextAuth); Neon tidak menyediakan layanan auth/RLS bawaan sehingga otorisasi data ditegakkan pada lapisan aplikasi/server.

## 6.1 organizations

| Column | Type | Description |
|---|---|---|
| id | UUID | Primary Key |
| name | VARCHAR(150) | Organization name |
| created_at | TIMESTAMPTZ | Creation time |

## 6.2 profiles

| Column | Type | Description |
|---|---|---|
| id | UUID | Primary Key, references users (Auth.js) |
| organization_id | UUID | Foreign Key |
| full_name | VARCHAR(150) | User name |
| role | VARCHAR(30) | User role |
| created_at | TIMESTAMPTZ | Creation time |

## 6.3 applications

| Column | Type | Description |
|---|---|---|
| id | UUID | Primary Key |
| organization_id | UUID | Foreign Key |
| applicant_name | VARCHAR(150) | Applicant name |
| applicant_email | VARCHAR(150) | Applicant email |
| age | INTEGER | Applicant age |
| person_income | NUMERIC(15,2) | Applicant income |
| employment_length | NUMERIC(5,2) | Employment length |
| loan_amnt | NUMERIC(15,2) | Loan amount |
| loan_int_rate | NUMERIC(7,4) | Loan interest rate |
| loan_percent_income | NUMERIC(8,4) | Loan-to-income ratio |
| home_ownership | VARCHAR(30) | Home ownership |
| loan_intent | VARCHAR(50) | Loan purpose |
| status | VARCHAR(30) | Application status |
| created_by | UUID | Foreign Key to profiles |
| created_at | TIMESTAMPTZ | Creation time |
| updated_at | TIMESTAMPTZ | Update time |

## 6.4 risk_assessments

| Column | Type | Description |
|---|---|---|
| id | UUID | Primary Key |
| application_id | UUID | Foreign Key |
| model_name | VARCHAR(100) | Model name |
| model_version | VARCHAR(50) | Model version |
| default_probability | NUMERIC(8,6) | Default probability |
| risk_category | VARCHAR(30) | Risk category |
| contributing_factors | JSONB | Prediction factors |
| assessed_by | UUID | Foreign Key to profiles |
| assessed_at | TIMESTAMPTZ | Assessment time |

## 6.5 underwriting_reviews

| Column | Type | Description |
|---|---|---|
| id | UUID | Primary Key |
| application_id | UUID | Foreign Key |
| reviewer_id | UUID | Foreign Key to profiles |
| review_status | VARCHAR(30) | Review status |
| final_decision | VARCHAR(30) | Final decision |
| decision_reason | TEXT | Decision reason |
| review_notes | TEXT | Review notes |
| reviewed_at | TIMESTAMPTZ | Review time |
| created_at | TIMESTAMPTZ | Creation time |

## 6.6 Database Relationships

- organizations memiliki banyak profiles.
- organizations memiliki banyak applications.
- profiles dapat membuat banyak applications.
- applications memiliki banyak risk_assessments.
- profiles dapat melakukan banyak risk_assessments.
- applications memiliki riwayat underwriting_reviews.
- profiles dapat melakukan banyak underwriting_reviews.

## 6.7 Database Requirements

- Menggunakan UUID sebagai primary key.
- Menggunakan TIMESTAMPTZ untuk pencatatan waktu.
- Menggunakan Foreign Key untuk menjaga relasi data.
- Otorisasi berbasis `organization_id` dan `role` pada lapisan aplikasi/server (Neon tidak menyediakan RLS bawaan).
- Memisahkan data berdasarkan organization_id.
- Menyimpan riwayat penilaian risiko.
- Membatasi akses terhadap informasi pelanggan.

**Implemented:** the application schema now mirrors the 22-feature LightGBM contract (`loan_grade`, `cb_person_cred_hist_length`, `cb_person_default_on_file` added) and is validated in `src/app/api/applications/route.ts`.

---

# 7. STEP 5 — STYLE & MOOD VISUAL

## 7.1 Design Direction

**Mood:** Modern, Minimalist, Professional, Premium, and Trustworthy.

Credora menggunakan konsep Dark FinTech Dashboard dengan dominasi warna hitam dan kombinasi hijau forest.

Desain mengutamakan keterbacaan data, navigasi sederhana, dan visualisasi informasi yang terstruktur.

## 7.2 Color Philosophy — 60/30/10

| Proportion | Color | Hex | Usage |
|---|---|---|---|
| 60% | Near Black | #111714 | Main background |
| 30% | Forest Green | #24543A | Sidebar and panels |
| 10% | Soft Sage | #B8D9A8 | Accent and highlights |

Supporting colors:

| Color | Hex | Usage |
|---|---|---|
| White | #FFFFFF | Main text |
| Soft Gray | #A3AEA7 | Secondary text |
| Dark Border | #26332C | Component borders |
| Risk Green | #58A878 | Low Risk |
| Risk Yellow | #E5B93F | Medium Risk |
| Risk Red | #E45B56 | High Risk |

Warna tambahan digunakan untuk menjaga kontras, keterbacaan, dan membedakan informasi status.

## 7.3 Typography

**Primary Font:** Inter.

- Heading: SemiBold atau Bold.
- Subheading: Medium.
- Body: Regular.
- Numbers: Medium atau SemiBold.

## 7.4 Layout

**Layout:** Sidebar + Main Dashboard.

Sidebar:
- Overview.
- Applications.
- Portfolio Analytics.
- Underwriting Reviews.
- Settings.
- Logout.

Topbar:
- Search.
- Notification.
- User profile.
- User role.

Main content:
- Summary cards.
- Charts.
- Data tables.
- Detail information panels.

## 7.5 Dashboard Components

### Summary Cards

- Total Applications.
- Pending Review.
- Assessed.
- High Risk.

### Risk Portfolio Distribution

Diagram donat untuk menampilkan distribusi Low Risk, Medium Risk, dan High Risk.

### Application Trend

Grafik tren jumlah pengajuan berdasarkan periode waktu.

### Recent Applications

Tabel pengajuan terbaru dengan kolom:
- Application ID.
- Applicant Name.
- Applied Date.
- Loan Amount.
- Status.
- Risk Category.
- Action.

## 7.6 Design References

1. Stripe — https://stripe.com/
2. Linear — https://linear.app/
3. Ramp — https://ramp.com/

Referensi digunakan sebagai inspirasi desain dan bukan untuk menyalin tampilan secara langsung.

## 7.7 Design Principles

1. Clarity.
2. Consistency.
3. Professionalism.
4. Data Readability.
5. Visual Balance.
6. Minimalism.
7. Responsiveness.

## 7.8 Responsive Design

- Desktop: Sidebar dan dashboard lengkap.
- Tablet: Layout menyesuaikan lebar layar.
- Mobile: Navigasi ringkas dan tabel dapat digulir horizontal.

## 7.9 Visual Reference

Mockup dashboard Credora yang telah dipilih menjadi referensi visual utama.

Karakter yang harus dipertahankan:
- Dark background.
- Forest Green sidebar.
- Dark cards dengan border tipis.
- Soft Sage sebagai aksen.
- KPI summary cards.
- Risk distribution chart.
- Application trend chart.
- Recent applications table.
- Tampilan minimalis dan profesional.

Angka dan nama pelanggan pada mockup merupakan data ilustrasi, bukan data aktual.

---

# 8. TECHNICAL CONSIDERATIONS

## 8.1 Planned Technology Stack

| Layer | Technology |
|---|---|
| Frontend Framework | Next.js |
| UI Library | React |
| Programming Language | TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL |
| Backend Platform | Neon |
| Authentication | Auth.js (NextAuth) |
| Machine Learning | LightGBM |
| Existing ML Language | Python |

## 8.2 Machine Learning Integration

Model LightGBM yang sudah tersedia akan digunakan sebagai mesin penilaian risiko.

Arsitektur integrasi dan layanan prediksi akan ditentukan pada STEP 6 setelah memeriksa kompatibilitas aplikasi lama dengan stack baru.

## 8.3 Model Validation

Sebelum digunakan untuk mendukung keputusan operasional, model harus melalui pemeriksaan:

- Relevansi dataset terhadap konteks PayLater.
- Kesesuaian fitur dengan waktu pengajuan.
- Potensi data leakage.
- Pembagian data training dan testing.
- Class imbalance.
- Probability calibration.
- Threshold validation.
- Fairness evaluation.
- Model performance monitoring.

Hasil prediksi hanya berfungsi sebagai alat bantu analisis. Keputusan kredit tetap dilakukan oleh petugas yang berwenang.

---

# 9. MVP SCOPE SUMMARY

## Included

- Login dan autentikasi pengguna.
- Pengelolaan aplikasi kredit.
- Penilaian risiko menggunakan LightGBM.
- Dashboard ringkasan.
- Analisis distribusi risiko.
- Pemeriksaan manual.
- Pencatatan keputusan akhir.
- Pengelolaan akses berdasarkan organisasi dan peran.

## Excluded

- B2C self-assessment.
- Integrasi eksternal.
- Pengumpulan data otomatis.
- Automatic model retraining.
- Automated lending decisions.

---

# 10. DEVELOPMENT ROADMAP

| Step | Activity | Status |
|---|---|---|
| 0 | Idea Validation | Draft completed |
| 1 | Product Requirements Document | Draft completed |
| 2 | User Persona & User Flow | Draft completed |
| 3 | Wireframe | Draft completed |
| 4 | Database Schema | Draft completed |
| 5 | Style & Mood Visual | Draft completed |
| 6 | Setup Tech Stack & Backend | Not started |
| 7 | Full-Stack Development | Not started |
| 8 | Testing & Debugging | Not started |
| 9 | Deployment | Not started |
| 10 | Product Review & Improvement | Not started |

---

# 11. OPEN ITEMS BEFORE DEVELOPMENT

Hal-hal berikut harus diselesaikan atau divalidasi sebelum implementasi:

1. Persetujuan mentor untuk dokumentasi STEP 1–5.
2. Pemeriksaan seluruh fitur MVP.
3. ✅ Pencocokan field database dengan input model LightGBM (22 fitur, termasuk loan grade, credit history length, dan historical default).
4. ⏳ Pemeriksaan dataset dan validitas model — kontrak & sanity check tersedia (`ml/validate_model.py`), evaluasi statistik terhadap data berlabel masih perlu dilakukan.
5. ✅ Arsitektur integrasi Next.js dan layanan prediksi Python (FastAPI di `ml/`, adapter di `src/lib/ml-client.ts`, fallback heuristik).
6. ✅ Konfigurasi autentikasi Auth.js dan otorisasi organization_id/role.
7. ⏳ Penetapan aturan kategori risiko — threshold model 0.35/0.70 sudah dipakai; perlu validasi terhadap kebijakan risiko final.

---

# 12. PROJECT PRINCIPLES

Selama pengembangan Credora, prinsip berikut harus dipertahankan:

1. Fokus utama tetap pada MVP B2B.
2. Jangan menambahkan fitur di luar ruang lingkup tanpa evaluasi.
3. Jangan menganggap hasil prediksi sebagai keputusan kredit otomatis.
4. Jangan menggunakan data ilustrasi seolah-olah merupakan data nyata.
5. Prioritaskan keamanan dan privasi informasi pelanggan.
6. Pertahankan identitas visual yang sudah dipilih.
7. Setiap perubahan keputusan produk harus diperbarui dalam dokumen ini.
8. Validasi teknis harus dilakukan sebelum implementasi fitur yang bergantung pada model.

---

**END OF COLDSTART DOCUMENT**

**Credora — Smarter Credit. Better Decisions.**