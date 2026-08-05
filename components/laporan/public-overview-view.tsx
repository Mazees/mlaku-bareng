"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FiUsers,
  FiTrendingDown,
  FiTrendingUp,
  FiCreditCard,
  FiArrowUpRight,
  FiArrowDownRight,
  FiCalendar,
  FiDownload,
  FiFileText,
} from "react-icons/fi";
import { MdAccountBalanceWallet } from "react-icons/md";
import { generateLaporanPDF } from "@/lib/utils/export-pdf";
import { generateLaporanExcel } from "@/lib/utils/export-excel";
import {
  TransaksiDetailModal,
  TransaksiDetailItem,
} from "@/components/transaksi/transaksi-detail-modal";
import { LaporanNavTabs } from "./laporan-nav-tabs";

interface PublicOverviewViewProps {
  totalSaldo: number;
  totalPemasukanBulanIni: number;
  totalPengeluaran: number;
  listPocket: {
    pocket_id: string;
    nama_pocket: string;
    saldo: number;
  }[];
  transaksiTerakhir: {
    id: string;
    tanggal: string;
    jenis: string;
    nominal: number;
    keterangan: string;
    bukti_url: string;
    pocket_id: string;
    pocket?: {
      nama_pocket?: string;
    };
  }[];
  statusBulanIni: {
    keluarga_id: string;
    nama_keluarga: string;
    total_setor_bulan_ini: number;
    sudah_setor: boolean;
    lunas_bulan_ini: boolean;
  }[];
  statusTahunIni: {
    keluarga_id: string;
    nama_keluarga: string;
    jan: number;
    feb: number;
    mar: number;
    apr: number;
    mei: number;
    jun: number;
    jul: number;
    agu: number;
    sep: number;
    okt: number;
    nov: number;
    des: number;
    total_setor_tahun_ini: number;
    [key: string]: any;
  }[];
  periodeLabel?: string;
  currentBulanStr?: string;
  currentTahunStr?: string;
}

export function PublicOverviewView({
  totalSaldo,
  totalPemasukanBulanIni,
  totalPengeluaran,
  listPocket,
  transaksiTerakhir,
  statusBulanIni,
  statusTahunIni,
  periodeLabel,
  currentBulanStr = "",
  currentTahunStr = "",
}: PublicOverviewViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [detailData, setDetailData] = useState<TransaksiDetailItem | null>(
    null,
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [selectedBulan, setSelectedBulan] = useState(currentBulanStr);
  const [selectedTahun, setSelectedTahun] = useState(currentTahunStr);

  const handleBulanChange = (val: string) => {
    setSelectedBulan(val);
    const params = new URLSearchParams(searchParams.toString());
    params.set("bulan", val);
    router.push(`?${params.toString()}`);
  };

  const handleTahunChange = (val: string) => {
    setSelectedTahun(val);
    if (val.length === 4) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tahun", val);
      router.push(`?${params.toString()}`);
    }
  };

  const handleRowClick = (tx: any) => {
    setDetailData({
      id: tx.id,
      tanggal: tx.tanggal,
      jenis: tx.jenis,
      nominal: tx.nominal,
      keterangan: tx.keterangan,
      bukti_url: tx.bukti_url,
      pocket: {
        id: tx.pocket_id,
        nama_pocket: tx.pocket?.nama_pocket || "-",
      },
    });
    setIsDetailOpen(true);
  };

  const months = [
    "jan",
    "feb",
    "mar",
    "apr",
    "mei",
    "jun",
    "jul",
    "agu",
    "sep",
    "okt",
    "nov",
    "des",
  ];

  const exportDataFormatted = useMemo(() => {
    return {
      periodeLabel: periodeLabel || "Keseluruhan Data Kas (All-Time)",
      totalPemasukan: totalPemasukanBulanIni,
      totalPengeluaran: totalPengeluaran,
      saldoBersih: totalSaldo,
      listPocket: (listPocket || []).map((p) => ({
        nama_pocket: p.nama_pocket,
        saldo: p.saldo,
      })),
      statusIuran: (statusBulanIni || []).map((s) => ({
        nama_keluarga: s.nama_keluarga,
        nominal_setor: s.total_setor_bulan_ini,
        status: s.lunas_bulan_ini
          ? "Lunas"
          : s.sudah_setor
            ? "Kurang"
            : "Belum Bayar",
      })),
      listTransaksi: (transaksiTerakhir || []).map((t) => ({
        tanggal: t.tanggal,
        jenis: t.jenis as "masuk" | "keluar",
        pocket: t.pocket?.nama_pocket || "-",
        keterangan: t.keterangan || "",
        nominal: t.nominal,
      })),
      rekapTahunan: (statusTahunIni || []).map((t) => ({
        nama_keluarga: t.nama_keluarga,
        jan: Number(t.jan || 0),
        feb: Number(t.feb || 0),
        mar: Number(t.mar || 0),
        apr: Number(t.apr || 0),
        mei: Number(t.mei || 0),
        jun: Number(t.jun || 0),
        jul: Number(t.jul || 0),
        agu: Number(t.agu || 0),
        sep: Number(t.sep || 0),
        okt: Number(t.okt || 0),
        nov: Number(t.nov || 0),
        des: Number(t.des || 0),
        total: Number(t.total_setor_tahun_ini || 0),
      })),
    };
  }, [
    totalPemasukanBulanIni,
    totalPengeluaran,
    totalSaldo,
    listPocket,
    statusBulanIni,
    transaksiTerakhir,
    statusTahunIni,
  ]);

  const handleExportPDF = () => {
    try {
      generateLaporanPDF(exportDataFormatted);
    } catch (err: any) {
      console.error("Gagal export PDF:", err);
      alert(
        "Gagal mengunduh file PDF: " + (err?.message || "Terjadi kesalahan"),
      );
    }
  };

  const handleExportExcel = () => {
    try {
      generateLaporanExcel(exportDataFormatted);
    } catch (err: any) {
      console.error("Gagal export Excel:", err);
      alert(
        "Gagal mengunduh file Excel: " + (err?.message || "Terjadi kesalahan"),
      );
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* 1. Navigation / Header Tabs */}
      <LaporanNavTabs />

      {/* 1.5. Export File Laporan Publik */}
      <div className="card bg-base-200 border border-base-300 shadow-sm">
        <div className="card-body p-4 flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2">
              <FiDownload className="w-4 h-4 text-primary" />
              Unduh Laporan &amp; Transparansi
            </h3>
            <p className="text-xs text-base-content/70">
              Unduh salinan berkas resmi laporan kas publik dalam format PDF
              atau Excel
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportPDF}
              className="btn btn-sm btn-error text-error-content font-bold gap-1.5 shadow-sm"
            >
              <FiFileText className="w-4 h-4" />
              <span>Export PDF</span>
            </button>
            <button
              type="button"
              onClick={handleExportExcel}
              className="btn btn-sm btn-success text-success-content font-bold gap-1.5 shadow-sm"
            >
              <FiDownload className="w-4 h-4" />
              <span>Export Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. DaisyUI Stats Component (Persis Dashboard) */}
      <div className="stats stats-vertical lg:stats-horizontal shadow w-full bg-base-200 border border-base-300">
        <div className="stat gap-1">
          <div className="stat-figure text-primary">
            <MdAccountBalanceWallet className="w-6 h-6" />
          </div>
          <div className="stat-title text-sm font-semibold">
            Total Saldo Kas
          </div>
          <div className="stat-value text-sm sm:text-base font-bold text-primary">
            Rp {totalSaldo.toLocaleString("id-ID")}
          </div>
          <div className="stat-desc text-[11px]">
            Gabungan Kas Tunai &amp; Rekening Bank
          </div>
        </div>

        <div className="stat gap-1">
          <div className="stat-figure text-primary">
            <FiTrendingUp className="w-6 h-6" />
          </div>
          <div className="stat-title text-sm font-semibold">
            Pemasukan Bulan Ini
          </div>
          <div className="stat-value text-sm sm:text-base font-bold text-primary">
            Rp {totalPemasukanBulanIni.toLocaleString("id-ID")}
          </div>
          <div className="stat-desc text-[11px] flex items-center text-primary gap-1">
            <FiArrowUpRight className="w-3.5 h-3.5" />
            Setoran iuran &amp; kas masuk
          </div>
        </div>

        <div className="stat gap-1">
          <div className="stat-figure text-primary">
            <FiTrendingDown className="w-6 h-6" />
          </div>
          <div className="stat-title text-sm font-semibold">
            Pengeluaran Bulan Ini
          </div>
          <div className="stat-value text-sm sm:text-base font-bold text-primary">
            Rp {totalPengeluaran.toLocaleString("id-ID")}
          </div>
          <div className="stat-desc flex items-center text-primary gap-1">
            <FiArrowDownRight className="w-4 h-4" />
            Beban operasional &amp; acara
          </div>
        </div>
      </div>

      {/* 3. Grid: Saldo Per Pocket & Transaksi Kas Terakhir (Persis Dashboard) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card bg-base-200 shadow-sm border border-base-300">
          <div className="card-body">
            <h2 className="card-title text-base">Rincian Saldo Per Pocket</h2>
            <div className="space-y-3 mt-2">
              {listPocket && listPocket.length > 0 ? (
                listPocket.map((pocket) => (
                  <div
                    key={pocket.pocket_id}
                    className="flex items-center justify-between p-3 rounded-lg bg-base-100 border border-base-300"
                  >
                    <span className="font-semibold text-sm">
                      {pocket.nama_pocket}
                    </span>
                    <span className="font-extrabold text-primary">
                      Rp {Number(pocket.saldo || 0).toLocaleString("id-ID")}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-base-content/60">
                  Belum ada data pocket.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="card bg-base-200 shadow-sm border border-base-300 lg:col-span-2">
          <div className="card-body">
            <div className="flex not-lg:flex-col lg:items-center lg:justify-between not-lg:gap-2">
              <h2 className="card-title text-base">Transaksi Kas Terakhir</h2>
              <Link
                href="/laporan/transaksi"
                className="text-xs text-primary font-bold hover:underline"
              >
                Lihat Semua &rarr;
              </Link>
            </div>
            <div className="overflow-x-auto mt-2">
              <table className="table table-sm w-full text-nowrap">
                <thead className="bg-base-300 text-base-content font-bold">
                  <tr>
                    <th>Tanggal</th>
                    <th>Jenis</th>
                    <th>Nominal</th>
                    <th>Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {transaksiTerakhir && transaksiTerakhir.length > 0 ? (
                    transaksiTerakhir.map((tx) => {
                      const isMasuk = tx.jenis === "masuk";
                      const dateObj = new Date(tx.tanggal);
                      const formattedTanggal = dateObj.toLocaleDateString(
                        "id-ID",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        },
                      );
                      return (
                        <tr
                          key={tx.id}
                          onClick={() => handleRowClick(tx)}
                          className="hover:bg-base-300/40 cursor-pointer transition-colors"
                        >
                          <td className="whitespace-nowrap text-xs font-semibold">
                            {formattedTanggal}
                          </td>
                          <td>
                            <span
                              className={`badge badge-sm font-semibold gap-1 ${
                                isMasuk
                                  ? "badge-success text-success-content"
                                  : "badge-error text-error-content"
                              }`}
                            >
                              {isMasuk ? (
                                <FiArrowUpRight className="w-3 h-3" />
                              ) : (
                                <FiArrowDownRight className="w-3 h-3" />
                              )}
                              {isMasuk ? "Masuk" : "Keluar"}
                            </span>
                          </td>
                          <td
                            className={`font-bold whitespace-nowrap ${
                              isMasuk ? "text-primary" : "text-error"
                            }`}
                          >
                            {isMasuk ? "+" : "-"} Rp{" "}
                            {Number(tx.nominal || 0).toLocaleString("id-ID")}
                          </td>
                          <td className="max-w-[200px] truncate text-xs text-base-content/80">
                            {tx.keterangan || "-"}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center py-4 text-xs text-base-content/60"
                      >
                        Belum ada transaksi kas tercatat.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Rekap Iuran Bulanan (Persis Dashboard) */}
      <div className="card bg-base-200 shadow-sm border border-base-300">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="card-title text-lg font-bold flex items-center gap-2">
                Rekap Iuran Bulanan
              </h2>
              <p className="text-xs text-base-content/70">
                Status pembayaran iuran bulanan per Anggota
              </p>
            </div>
            <div>
              <input
                type="month"
                value={selectedBulan}
                onChange={(e) => handleBulanChange(e.target.value)}
                className="input input-bordered input-sm font-semibold text-xs bg-base-100"
              />
            </div>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="table table-zebra w-full text-xs text-nowrap">
              <thead className="bg-base-300 text-base-content font-bold">
                <tr>
                  <th className="text-left">Nama Anggota</th>
                  <th className="text-left">Nominal Setor</th>
                  <th className="text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {statusBulanIni && statusBulanIni.length > 0 ? (
                  statusBulanIni.map((item) => (
                    <tr key={item.keluarga_id}>
                      <td className="text-left font-bold">
                        {item.nama_keluarga}
                      </td>
                      <td className="text-left font-extrabold text-primary">
                        Rp{" "}
                        {Number(item.total_setor_bulan_ini || 0).toLocaleString(
                          "id-ID",
                        )}
                      </td>
                      <td className="text-left text-xs">
                        {item.lunas_bulan_ini ? (
                          <span className="badge badge-xs w-20 font-semibold gap-1 text-success-content badge-success">
                            Lunas
                          </span>
                        ) : item.sudah_setor ? (
                          <span className="badge badge-xs w-20 font-semibold gap-1 text-warning-content badge-warning">
                            Kurang
                          </span>
                        ) : (
                          <span className="badge badge-xs w-20 font-semibold gap-1 text-error-content badge-error">
                            Belum Setor
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="text-center py-6 text-base-content/60"
                    >
                      Belum ada data anggota di database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 5. Rekap Iuran Tahunan - Matriks 12 Bulan (Persis Dashboard) */}
      <div className="card bg-base-200 shadow-sm border border-base-300">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="card-title text-lg font-bold flex items-center gap-2">
                Rekap Iuran Tahunan
              </h2>
              <p className="text-xs text-base-content/70">
                Matriks setoran 12 bulan per Anggota tahun ini
              </p>
            </div>
            <div>
              <input
                type="number"
                min="2000"
                max="2099"
                step="1"
                placeholder="YYYY"
                value={selectedTahun}
                onChange={(e) => handleTahunChange(e.target.value)}
                className="input input-bordered input-sm font-bold text-xs bg-base-100 w-24 text-center"
              />
            </div>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="table table-zebra w-full text-xs text-nowrap">
              <thead className="bg-base-300 text-base-content font-bold">
                <tr>
                  <th className="min-w-44">Nama Anggota</th>
                  <th className="text-center">Jan</th>
                  <th className="text-center">Feb</th>
                  <th className="text-center">Mar</th>
                  <th className="text-center">Apr</th>
                  <th className="text-center">Mei</th>
                  <th className="text-center">Jun</th>
                  <th className="text-center">Jul</th>
                  <th className="text-center">Agu</th>
                  <th className="text-center">Sep</th>
                  <th className="text-center">Okt</th>
                  <th className="text-center">Nov</th>
                  <th className="text-center">Des</th>
                  <th className="text-right font-extrabold text-primary">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {statusTahunIni && statusTahunIni.length > 0 ? (
                  statusTahunIni.map((item) => (
                    <tr key={item.keluarga_id}>
                      <td className="font-bold">{item.nama_keluarga}</td>
                      {months.map((m) => {
                        const nominal = Number(item[m] || 0);
                        return (
                          <td key={m} className="text-center">
                            {nominal > 0 ? (
                              <span className="badge badge-xs lg:badge-sm badge-primary font-bold">
                                {nominal >= 1000
                                  ? `${nominal / 1000}K`
                                  : nominal}
                              </span>
                            ) : (
                              <span className="text-base-content/30">-</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="text-right font-extrabold text-primary">
                        Rp{" "}
                        {Number(item.total_setor_tahun_ini || 0).toLocaleString(
                          "id-ID",
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={14}
                      className="text-center py-6 text-base-content/60"
                    >
                      Belum ada data anggota di database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Detail Transaksi (Read-Only) */}
      <TransaksiDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        data={detailData}
      />
    </div>
  );
}
