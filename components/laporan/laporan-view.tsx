"use client";

import React, { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FiFileText,
  FiPrinter,
  FiDownload,
  FiCalendar,
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiFolder,
  FiCheckCircle,
  FiAlertCircle,
  FiImage,
  FiEye,
} from "react-icons/fi";
import { generateLaporanPDF } from "@/lib/utils/export-pdf";
import { generateLaporanExcel } from "@/lib/utils/export-excel";
import {
  TransaksiDetailModal,
  TransaksiDetailItem,
} from "@/components/transaksi/transaksi-detail-modal";

export interface LaporanPocketItem {
  pocket_id: string;
  nama_pocket: string;
  saldo_awal: number;
  saldo: number;
}

export interface LaporanStatusKKItem {
  keluarga_id: string;
  nama_keluarga: string;
  nominal_setor: number;
  nominal_wajib: number;
  status: "Lunas" | "Kurang" | "Belum Bayar";
}

export interface LaporanTransaksiItem {
  id: string;
  tanggal: string;
  jenis: "masuk" | "keluar";
  nominal: number;
  keterangan?: string;
  bukti_url?: string[];
  pocket: {
    id: string;
    nama_pocket: string;
  };
}

interface LaporanViewProps {
  currentBulanStr: string; // e.g. "2026-08"
  currentTahunStr: string; // e.g. "2026"
  listPocket: LaporanPocketItem[];
  listStatusKK: LaporanStatusKKItem[];
  listTransaksi: LaporanTransaksiItem[];
  totalIuranPeriode: number;
  totalTransaksiMasukPeriode: number;
  totalPengeluaranPeriode: number;
  isPublic?: boolean;
  statusTahunIni?: any[];
}

export function LaporanView({
  currentBulanStr,
  currentTahunStr,
  listPocket,
  listStatusKK,
  listTransaksi,
  totalIuranPeriode,
  totalTransaksiMasukPeriode,
  totalPengeluaranPeriode,
  isPublic = false,
  statusTahunIni,
}: LaporanViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [modeFilter, setModeFilter] = useState<"bulan" | "tahun">("bulan");
  const [selectedBulan, setSelectedBulan] = useState(currentBulanStr);
  const [selectedTahun, setSelectedTahun] = useState(currentTahunStr);

  const [detailData, setDetailData] = useState<TransaksiDetailItem | null>(
    null,
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Perhitungan Ringkasan Kas
  const totalPemasukan = useMemo(() => {
    return totalIuranPeriode + totalTransaksiMasukPeriode;
  }, [totalIuranPeriode, totalTransaksiMasukPeriode]);

  const saldoBersih = useMemo(() => {
    return totalPemasukan - totalPengeluaranPeriode;
  }, [totalPemasukan, totalPengeluaranPeriode]);

  // Persentase Kelancaran Setoran Iuran KK
  const kelancaranKK = useMemo(() => {
    if (!listStatusKK || listStatusKK.length === 0) return 0;
    const lunasCount = listStatusKK.filter((k) => k.status === "Lunas").length;
    return Math.round((lunasCount / listStatusKK.length) * 100);
  }, [listStatusKK]);

  const handleFilterBulanChange = (val: string) => {
    setSelectedBulan(val);
    const params = new URLSearchParams(searchParams.toString());
    params.set("bulan", val);
    params.delete("tahun");
    router.push(`?${params.toString()}`);
  };

  const handleFilterTahunChange = (val: string) => {
    setSelectedTahun(val);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tahun", val);
    params.delete("bulan");
    router.push(`?${params.toString()}`);
  };

  const periodeLabelFormatted = useMemo(() => {
    if (modeFilter === "bulan") {
      const [y, m] = selectedBulan.split("-");
      const date = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
      return date.toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
      });
    }
    return `Tahun ${selectedTahun}`;
  }, [modeFilter, selectedBulan, selectedTahun]);

  // Format data untuk exporter PDF & Excel
  const exportDataFormatted = useMemo(() => {
    return {
      periodeLabel: periodeLabelFormatted,
      totalPemasukan,
      totalPengeluaran: totalPengeluaranPeriode,
      saldoBersih,
      listPocket: listPocket.map((p) => ({
        nama_pocket: p.nama_pocket,
        saldo: p.saldo,
      })),
      statusIuran: listStatusKK.map((s) => ({
        nama_keluarga: s.nama_keluarga,
        nominal_setor: s.nominal_setor,
        status: s.status,
      })),
      listTransaksi: listTransaksi.map((t) => ({
        tanggal: t.tanggal,
        jenis: t.jenis,
        pocket: t.pocket?.nama_pocket || "-",
        keterangan: t.keterangan || "",
        nominal: t.nominal,
      })),
      rekapTahunan: modeFilter === "tahun" && statusTahunIni ? statusTahunIni.map((t) => ({
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
      })) : undefined,
    };
  }, [
    periodeLabelFormatted,
    totalPemasukan,
    totalPengeluaranPeriode,
    saldoBersih,
    listPocket,
    listStatusKK,
    listTransaksi,
    modeFilter,
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
      {/* Header */}
      <div>
        <h1 className="text-base sm:text-lg font-bold flex items-center gap-2">
          Laporan &amp; Export Data
        </h1>
        <p className="text-xs text-base-content/70">
          Unduh rekap kas resmi keluarga dalam format PDF atau Excel (.xlsx)
        </p>
      </div>

      {/* Filter Periode Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div
          role="tablist"
          className="tabs tabs-lift gap-5 tabs-sm flex flex-nowrap"
        >
          <button
            role="tab"
            onClick={() => {
              setModeFilter("bulan");
              const params = new URLSearchParams(searchParams.toString());
              params.set("bulan", selectedBulan);
              params.delete("tahun");
              router.push(`?${params.toString()}`);
            }}
            className={`tab text-nowrap text-sm ${
              modeFilter === "bulan" ? "tab-active" : ""
            }`}
          >
            Laporan Bulanan
          </button>
          <button
            role="tab"
            onClick={() => {
              setModeFilter("tahun");
              const params = new URLSearchParams(searchParams.toString());
              params.set("tahun", selectedTahun);
              params.delete("bulan");
              router.push(`?${params.toString()}`);
            }}
            className={`tab text-nowrap text-sm ${
              modeFilter === "tahun" ? "tab-active" : ""
            }`}
          >
            Laporan Tahunan
          </button>
        </div>

        <div className="flex items-center gap-2">
          <FiCalendar className="w-4 h-4 text-primary shrink-0" />
          {modeFilter === "bulan" ? (
            <input
              type="month"
              value={selectedBulan}
              onChange={(e) => handleFilterBulanChange(e.target.value)}
              className="input input-bordered input-sm font-semibold text-xs bg-base-100"
            />
          ) : (
            <input
              type="number"
              min="2000"
              max="2099"
              step="1"
              placeholder="YYYY"
              value={selectedTahun}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedTahun(val);
                if (val.length === 4) {
                  handleFilterTahunChange(val);
                }
              }}
              className="input input-bordered input-sm font-bold text-xs bg-base-100 w-24 text-center"
            />
          )}
        </div>
      </div>

      {/* Ringkasan Singkat Periode */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-lg bg-base-200 border border-base-300">
          <span className="text-[11px] font-semibold text-base-content/70 block">
            Pemasukan
          </span>
          <span className="text-xs sm:text-sm font-bold text-primary">
            Rp {totalPemasukan.toLocaleString("id-ID")}
          </span>
        </div>
        <div className="p-3 rounded-lg bg-base-200 border border-base-300">
          <span className="text-[11px] font-semibold text-base-content/70 block">
            Pengeluaran
          </span>
          <span className="text-xs sm:text-sm font-bold text-error">
            Rp {totalPengeluaranPeriode.toLocaleString("id-ID")}
          </span>
        </div>
        <div className="p-3 rounded-lg bg-base-200 border border-base-300">
          <span className="text-[11px] font-semibold text-base-content/70 block">
            Saldo Bersih
          </span>
          <span className="text-xs sm:text-sm font-bold text-primary">
            Rp {saldoBersih.toLocaleString("id-ID")}
          </span>
        </div>
      </div>

      {/* Export Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Export PDF */}
        <div className="card bg-base-200 border border-base-300 shadow-sm hover:border-primary transition-colors">
          <div className="card-body p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
                <FiPrinter className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Unduh File PDF</h3>
                <p className="text-xs text-base-content/60">
                  Siap Cetak &amp; Share WA
                </p>
              </div>
            </div>
            <p className="text-xs text-base-content/70 leading-relaxed">
              Format laporan PDF resmi berlogo MLAKUBARENG. Berisi ringkasan kas,
              rekap pocket, status setoran iuran keluarga, dan riwayat
              transaksi.
            </p>
            <button
              onClick={handleExportPDF}
              className="btn btn-sm btn-primary font-semibold w-full gap-2 mt-2"
            >
              <FiPrinter className="w-4 h-4" />
              Download File PDF
            </button>
          </div>
        </div>

        {/* Export Excel */}
        <div className="card bg-base-200 border border-base-300 shadow-sm hover:border-primary transition-colors">
          <div className="card-body p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
                <FiDownload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Unduh File Excel (.xlsx)</h3>
                <p className="text-xs text-base-content/60">
                  Multisheet Spreadsheet
                </p>
              </div>
            </div>
            <p className="text-xs text-base-content/70 leading-relaxed">
              Format file Excel (.xlsx) dengan 3 sheet terpisah: Ringkasan Kas,
              Status Setoran Iuran Keluarga, dan Riwayat Transaksi Kas.
            </p>
            <button
              onClick={handleExportExcel}
              className="btn btn-sm btn-primary font-semibold w-full gap-2 mt-2"
            >
              <FiDownload className="w-4 h-4" />
              Download File Excel (.xlsx)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
