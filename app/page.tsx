import Link from "next/link";
import Image from "next/image";
import {
  FiEye,
  FiArrowRight,
  FiCheckCircle,
  FiHeart,
  FiCompass,
  FiSmile,
  FiGrid,
} from "react-icons/fi";
import { PublicNavbar } from "@/components/layout/public-navbar";

export default function Home() {
  return (
    <PublicNavbar>
      {/* 1. Clean Centered Family Welcoming Hero */}
      <main className="relative w-full h-[calc(100vh-72px)]">
        <Image
          src="/bg-hero.jpeg"
          alt="Latar belakang hero"
          fill
          className="object-cover object-bottom"
          priority
        />
        <div className="bg-black/70 h-full w-full absolute left-0 top-0 flex flex-col items-center justify-center text-center">
          <h1 className="text-3xl lg:text-5xl max-w-3xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6 text-white">
            Transparansi Kas Anggota <br /> Mlaku Bareng
          </h1>

          <p className="text-xs text-blue-400 lg:text-sm max-w-xl not-lg:w-[80%] mx-auto mb-10 tracking-widest">
            Portal Informasi Untuk Mengelola dan Memantau Setoran Iuran dan
            Saldo Kas Anggota Secara Terbuka.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/laporan"
              className="btn btn-primary btn-md lg:btn-lg font-semibold rounded-lg px-8 shadow-xs"
            >
              <FiEye className="w-5 h-5 mr-1.5" />
              Lihat Laporan Keuangan
            </Link>
          </div>
        </div>
      </main>

      {/* 2. Section: Tujuan & Alokasi Dana Kas Keluarga */}
      <section className="bg-base-200/60 border-t border-base-300 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">
              Keunggulan Aplikasi Ini
            </h2>
            <p className="text-sm text-base-content/70 mt-2">
              Mengapa kita menggunakan aplikasi ini untuk persiapan jalan-jalan
              di 2027?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Transparan */}
            <div className="card bg-base-100 border border-base-300 shadow-xs rounded-lg hover:shadow-md transition-shadow">
              <div className="card-body p-6">
                <div className="w-11 h-11 rounded-md bg-secondary flex items-center justify-center mb-3">
                  <FiEye className="w-5 h-5 text-primary" />
                </div>
                <h3 className="card-title text-lg font-bold">
                  Transparan & Terbuka
                </h3>
                <p className="text-sm text-base-content/75 leading-relaxed mt-1">
                  Semua anggota bisa memantau laporan dana kas secara langsung.
                  Pengumpulan dana jalan-jalan jadi lebih jelas dan jujur.
                </p>
              </div>
            </div>

            {/* Card 2: Fokus Liburan */}
            <div className="card bg-base-100 border border-base-300 shadow-xs rounded-lg hover:shadow-md transition-shadow">
              <div className="card-body p-6">
                <div className="w-11 h-11 rounded-md bg-secondary flex items-center justify-center mb-3">
                  <FiCompass className="w-5 h-5 text-primary" />
                </div>
                <h3 className="card-title text-lg font-bold">
                  Fokus Target Liburan
                </h3>
                <p className="text-sm text-base-content/75 leading-relaxed mt-1">
                  Pencatatan iuran yang rapi membantu kita disiplin menabung,
                  memastikan rencana jalan-jalan di 2027 benar-benar terwujud!
                </p>
              </div>
            </div>

            {/* Card 3: Mudah & Praktis */}
            <div className="card bg-base-100 border border-base-300 shadow-xs rounded-lg hover:shadow-md transition-shadow">
              <div className="card-body p-6">
                <div className="w-11 h-11 rounded-md bg-secondary flex items-center justify-center mb-3">
                  <FiCheckCircle className="w-5 h-5 text-primary" />
                </div>
                <h3 className="card-title text-lg font-bold">Bebas Ribet</h3>
                <p className="text-sm text-base-content/75 leading-relaxed mt-1">
                  Status iuran dan mutasi kas bisa dicek kapan saja dari HP
                  tanpa harus menunggu kumpul. Persiapan liburan pun jadi makin
                  praktis.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Official DaisyUI Footer Component */}
      <footer className="footer footer-center bg-base-100 text-base-content py-8 border-t border-base-300">
        <aside>
          <div className="w-9 h-9 rounded-md bg-secondary flex items-center justify-center mx-auto mb-2">
            <FiGrid className="w-4 h-4 text-primary" />
          </div>
          <p className="text-sm font-bold">Anggota Mlaku Bareng</p>
          <p className="text-xs font-semibold text-base-content/60">
            Guyub Rukun, Transparan &amp; Selamanya Bersatu
          </p>
        </aside>
      </footer>
    </PublicNavbar>
  );
}
