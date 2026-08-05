# 📖 Mlaku Bareng

**Mlaku Bareng** adalah aplikasi pencatatan dan pelaporan transparansi kas berbasis web yang dibangun khusus untuk mengawal target liburan bersama (Jalan-Jalan 2027) para Anggota Mlaku Bareng. Aplikasi ini memastikan pengelolaan dana iuran, pengeluaran acara, serta saldo kas berjalan secara jujur, rapi, dan transparan.

![Mlaku Bareng](https://img.shields.io/badge/Status-Active-blue)
![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwind-css)

---

## ✨ Keunggulan & Tujuan Utama

*   **Fokus Liburan 2027:** Dirancang khusus untuk memonitor tabungan bersama demi mewujudkan rencana jalan-jalan tahun 2027.
*   **Transparan & Terbuka:** Semua anggota dapat memantau laporan dana kas secara langsung kapan saja.
*   **Bebas Ribet:** Mengecek laporan keuangan cukup dari layar HP, tanpa perlu repot bertanya kepada bendahara.

---

## 🛠️ Fitur Utama

### 1. 🌐 Portal Publik (Transparansi)
*   **Tanpa Login:** Siapapun anggota dapat memantau saldo, daftar pemasukan/pengeluaran, dan status pembayaran kapan saja melalui tautan publik.
*   **Ringkasan Keuangan:** Tampilan langsung mengenai sisa Saldo Bersih, Pemasukan Bulan Ini, dan Pengeluaran Bulan Ini.
*   **Rekap Iuran Lengkap:** Tabel rekapitulasi setoran iuran per anggota per bulan, lengkap dengan Matriks 12 Bulan + Total Setoran setahun.
*   **Export File:** Dukungan untuk mengunduh arsip laporan dalam bentuk resmi **PDF** maupun lembar kerja spreadsheet **Excel** (.xlsx).

### 2. 🔐 Dasbor Admin (Bendahara)
*   **Keamanan Ekstra:** Autentikasi ketat menggunakan *Supabase Auth* dan pembatasan data via *Row-Level Security (RLS)* di database.
*   **Kelola Data Anggota:** Pendaftaran anggota baru, pengelolaan tarif iuran bulanan wajib yang bisa disesuaikan secara dinamis.
*   **Pencatatan Transaksi:** Mencatat pemasukan (Iuran/Lainnya), pengeluaran, serta fitur Transfer Antar Pocket dengan dukungan unggah bukti foto (*receipt*).
*   **Manajemen Multi-Pocket:** Sistem pembagian kas (Kas Tunai, Rekening Bank, dll) agar arus dana selalu tercatat akurat.

---

## 💻 Teknologi yang Digunakan

*   **Framework Utama:** [Next.js](https://nextjs.org/) (App Router, React Server Components, Server Actions)
*   **Bahasa Pemrograman:** TypeScript (Strict Mode)
*   **Styling & UI:** [Tailwind CSS v4](https://tailwindcss.com/) + [DaisyUI v5](https://daisyui.com/), [React Icons](https://react-icons.github.io/react-icons/), [SweetAlert2](https://sweetalert2.github.io/)
*   **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL Database, Auth, Storage, Views)
*   **Export Data:** `jspdf`, `jspdf-autotable`, `xlsx` (SheetJS)

---

## 🚀 Cara Menjalankan (Development)

1.  **Clone Repository:**
    ```bash
    git clone https://github.com/yourusername/mlakubareng.git
    cd mlakubareng
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Pengaturan Environment (.env):**
    Buat file `.env.local` di *root directory* dan masukkan kredensial Supabase Anda:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
    ```

4.  **Jalankan Aplikasi:**
    ```bash
    npm run dev
    ```
    Buka [http://localhost:3000](http://localhost:3000) di browser Anda untuk melihat aplikasi lokal.

---

## 📂 Struktur Proyek

```text
mlakubareng/
├── app/
│   ├── dashboard/       # Dasbor Admin (Protected via Middleware)
│   ├── laporan/         # Portal Transparansi Publik
│   ├── login/           # Halaman Login Admin
│   └── page.tsx         # Halaman Utama (Landing Page)
├── components/
│   ├── forms/           # Komponen Form (Iuran, Transaksi, Anggota, Konfigurasi)
│   ├── laporan/         # Komponen Render Tampilan Laporan (Publik & Admin)
│   ├── layout/          # Navbar Publik & Sidebar Admin Dasbor
│   ├── tables/          # Komponen Tabel Interaktif
│   └── ui/              # Komponen User Interface Reusable
├── lib/
│   ├── actions/         # Server Actions (Mutasi DB secara aman)
│   ├── supabase/        # Konfigurasi Supabase Client & Server
│   └── utils/           # Helper Utils (Export PDF/Excel, SweetAlert Config)
└── 001_init.sql         # Berkas Skema Database & Row-Level Security
```

---

<p align="center">
  <b>Dari kita, oleh kita, dan untuk kita. Guyub Rukun, Transparan & Siap Jalan-jalan 2027!</b>
</p>
