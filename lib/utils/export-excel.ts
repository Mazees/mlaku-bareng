import * as XLSX from "xlsx";
import { LaporanPDFData } from "./export-pdf";

/**
 * Excel Exporter Utility
 * ---------------------
 * Membuat file spreadsheet Excel (.xlsx) rapi dengan 3 lembar kerja (sheets):
 * 1. Ringkasan Kas & Pocket
 * 2. Status Setoran Iuran KK
 * 3. Riwayat Transaksi Kas
 */
export function generateLaporanExcel(data: LaporanPDFData) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Ringkasan Kas
  const ringkasanData = [
    ["LAPORAN KAS KELUARGA — MLAKUBARENG"],
    [`Periode: ${data.periodeLabel}`],
    [],
    ["METRIK KELEPASAN / RINGKASAN", "NOMINAL (RP)"],
    ["Total Pemasukan Kas", data.totalPemasukan],
    ["Total Pengeluaran Kas", data.totalPengeluaran],
    ["Saldo Kas Bersih", data.saldoBersih],
    [],
    ["NAMA POCKET / AKUN", "SALDO REAL-TIME (RP)"],
    ...data.listPocket.map((p) => [p.nama_pocket, p.saldo]),
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(ringkasanData);
  XLSX.utils.book_append_sheet(wb, ws1, "Ringkasan Kas");

  // Sheet 2: Status Setoran Iuran (Hanya untuk Laporan Bulanan)
  const isYearly = data.rekapTahunan && data.rekapTahunan.length > 0;
  if (data.statusIuran && data.statusIuran.length > 0 && !isYearly) {
    const iuranData = [
      ["NAMA KELUARGA", "NOMINAL SETOR (RP)", "STATUS SETORAN"],
      ...data.statusIuran.map((s) => [
        s.nama_keluarga,
        s.nominal_setor,
        s.status,
      ]),
    ];
    const ws2 = XLSX.utils.aoa_to_sheet(iuranData);
    XLSX.utils.book_append_sheet(wb, ws2, "Status Iuran Anggota");
  }

  // Sheet 2.5: Rekap Iuran Tahunan (12 Bulan)
  if (data.rekapTahunan && data.rekapTahunan.length > 0) {
    const tahunanData = [
      [
        "NAMA KELUARGA",
        "JAN",
        "FEB",
        "MAR",
        "APR",
        "MEI",
        "JUN",
        "JUL",
        "AGU",
        "SEP",
        "OKT",
        "NOV",
        "DES",
        "TOTAL (RP)",
      ],
      ...data.rekapTahunan.map((r) => [
        r.nama_keluarga,
        r.jan,
        r.feb,
        r.mar,
        r.apr,
        r.mei,
        r.jun,
        r.jul,
        r.agu,
        r.sep,
        r.okt,
        r.nov,
        r.des,
        r.total,
      ]),
    ];
    const wsTahunan = XLSX.utils.aoa_to_sheet(tahunanData);
    XLSX.utils.book_append_sheet(wb, wsTahunan, "Rekap Iuran Tahunan");
  }

  // Sheet 3: Riwayat Transaksi
  if (data.listTransaksi && data.listTransaksi.length > 0) {
    const transaksiData = [
      ["TANGGAL", "JENIS", "POCKET", "KETERANGAN", "NOMINAL (RP)"],
      ...data.listTransaksi.map((t) => [
        t.tanggal,
        t.jenis.toUpperCase(),
        t.pocket,
        t.keterangan || "-",
        t.nominal,
      ]),
    ];
    const ws3 = XLSX.utils.aoa_to_sheet(transaksiData);
    XLSX.utils.book_append_sheet(wb, ws3, "Riwayat Transaksi");
  }

  // Download Excel File via Blob (works safely in client browsers & mobile without Node.js fs dependency)
  const sanitizePeriode = data.periodeLabel.replace(/[^a-zA-Z0-9]/g, "_");
  const filename = `Laporan_Kas_Mlaku Bareng_Pocket_${sanitizePeriode}.xlsx`;
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
