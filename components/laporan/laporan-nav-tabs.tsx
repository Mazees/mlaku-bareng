"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiGrid, FiCreditCard } from "react-icons/fi";

export function LaporanNavTabs() {
  const pathname = usePathname();
  const isOverview = pathname === "/laporan";
  const isTransaksi = pathname.startsWith("/laporan/transaksi");

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-base-300 pb-4">
      <div>
        <h1 className="text-base sm:text-lg font-bold flex items-center gap-2">
          {isOverview ? (
            <>
              <FiGrid className="w-5 h-5 text-primary shrink-0" />
              <span>Ringkasan Kas Keluarga</span>
            </>
          ) : (
            <>
              <FiCreditCard className="w-5 h-5 text-primary shrink-0" />
              <span>Daftar Transaksi Kas Publik</span>
            </>
          )}
        </h1>
        <p className="text-xs text-base-content/70">
          {isOverview
            ? "Transparansi uang kas keluarga MLAKUBARENG, mudah dibaca oleh seluruh anggota keluarga."
            : "Daftar lengkap riwayat pemasukan dan pengeluaran kas beserta bukti foto struk."}
        </p>
      </div>

      <div className="flex bg-base-200 p-1 rounded-xl border border-base-300 shrink-0">
        <Link
          href="/laporan"
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
            isOverview
              ? "bg-primary text-primary-content shadow-sm"
              : "text-base-content/70 hover:text-base-content hover:bg-base-300/50"
          }`}
        >
          <FiGrid className="w-4 h-4" />
          <span>Ringkasan Kas</span>
        </Link>
        <Link
          href="/laporan/transaksi"
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
            isTransaksi
              ? "bg-primary text-primary-content shadow-sm"
              : "text-base-content/70 hover:text-base-content hover:bg-base-300/50"
          }`}
        >
          <FiCreditCard className="w-4 h-4" />
          <span>Daftar Transaksi</span>
        </Link>
      </div>
    </div>
  );
}
