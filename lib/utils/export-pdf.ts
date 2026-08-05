import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export interface LaporanPDFData {
  periodeLabel: string;
  totalPemasukan: number;
  totalPengeluaran: number;
  saldoBersih: number;
  listPocket: { nama_pocket: string; saldo: number }[];
  statusIuran: {
    nama_keluarga: string;
    nominal_setor: number;
    status: string;
  }[];
  listTransaksi: {
    tanggal: string;
    jenis: string;
    pocket: string;
    keterangan: string;
    nominal: number;
  }[];
  rekapTahunan?: {
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
    total: number;
  }[];
}

/**
 * PDF Exporter Utility
 * -------------------
 * Membuat file PDF Laporan Kas Keluarga MLAKUBARENG dengan
 * SELURUH TABEL RATA KIRI (LEFT-ALIGNED) RAPI & SERAGAM.
 */
export function generateLaporanPDF(data: LaporanPDFData) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Colors
  const primaryColor: [number, number, number] = [34, 197, 94]; // Emerald green #22c55e
  const darkTextColor: [number, number, number] = [30, 41, 59]; // Slate 800

  // 1. Header & Branding
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 18, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text("MLAKUBARENG — LAPORAN KAS KELUARGA", 14, 12);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Periode: ${data.periodeLabel}`, 196, 12, { align: "right" });

  // 2. Executive Summary Cards Box
  doc.setTextColor(...darkTextColor);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("RINGKASAN KEUANGAN", 14, 28);

  const startY = 32;

  // Box Total Pemasukan
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(14, startY, 57, 22, 2, 2, "F");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(22, 101, 52);
  doc.text("TOTAL PEMASUKAN", 18, startY + 6);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(
    `Rp ${data.totalPemasukan.toLocaleString("id-ID")}`,
    18,
    startY + 15,
  );

  // Box Total Pengeluaran
  doc.setFillColor(254, 242, 242);
  doc.roundedRect(76, startY, 57, 22, 2, 2, "F");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(153, 27, 27);
  doc.text("TOTAL PENGELUARAN", 80, startY + 6);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(
    `Rp ${data.totalPengeluaran.toLocaleString("id-ID")}`,
    80,
    startY + 15,
  );

  // Box Saldo Kas Bersih
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(138, startY, 58, 22, 2, 2, "F");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text("SALDO KAS BERSIH", 142, startY + 6);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`Rp ${data.saldoBersih.toLocaleString("id-ID")}`, 142, startY + 15);

  let currentY = startY + 28;

  // 3. Tabel Rekap Pocket Kas (SEMUA RATA KIRI)
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...darkTextColor);
  doc.text("REKAP SALDO PER POCKET / AKUN KAS", 14, currentY);

  autoTable(doc, {
    startY: currentY + 3,
    head: [["Nama Pocket", "Saldo Real-Time"]],
    body: data.listPocket.map((p) => [
      p.nama_pocket,
      `Rp ${p.saldo.toLocaleString("id-ID")}`,
    ]),
    theme: "striped",
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      halign: "left",
    },
    styles: { fontSize: 8, halign: "left" },
    margin: { left: 14, right: 14 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // 4. Tabel Status Setoran Iuran Keluarga (Hanya untuk Bulanan)
  const isYearly = data.rekapTahunan && data.rekapTahunan.length > 0;
  if (data.statusIuran && data.statusIuran.length > 0 && !isYearly) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...darkTextColor);
    doc.text("STATUS SETORAN IURAN KELUARGA BULAN INI", 14, currentY);

    autoTable(doc, {
      startY: currentY + 3,
      head: [["Nama Keluarga", "Nominal Setor", "Status"]],
      body: data.statusIuran.map((s) => [
        s.nama_keluarga,
        `Rp ${s.nominal_setor.toLocaleString("id-ID")}`,
        s.status,
      ]),
      theme: "striped",
      headStyles: {
        fillColor: [71, 85, 105], // slate
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8,
        halign: "left",
      },
      styles: { fontSize: 8, halign: "left" },
      margin: { left: 14, right: 14 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // 4.5. Tabel Rekap Iuran Tahunan (12 Bulan)
  if (data.rekapTahunan && data.rekapTahunan.length > 0) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...darkTextColor);
    doc.text("REKAP IURAN TAHUNAN", 14, currentY);

    const fmt = (n: number) =>
      n > 0 ? (n >= 1000 ? `${n / 1000}K` : `${n}`) : "-";

    autoTable(doc, {
      startY: currentY + 3,
      head: [
        [
          "Nama Keluarga",
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "Mei",
          "Jun",
          "Jul",
          "Agu",
          "Sep",
          "Okt",
          "Nov",
          "Des",
          "Total",
        ],
      ],
      body: data.rekapTahunan.map((r) => [
        r.nama_keluarga,
        fmt(r.jan),
        fmt(r.feb),
        fmt(r.mar),
        fmt(r.apr),
        fmt(r.mei),
        fmt(r.jun),
        fmt(r.jul),
        fmt(r.agu),
        fmt(r.sep),
        fmt(r.okt),
        fmt(r.nov),
        fmt(r.des),
        `Rp ${r.total.toLocaleString("id-ID")}`,
      ]),
      theme: "striped",
      headStyles: {
        fillColor: [71, 85, 105], // slate
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 7,
        halign: "left",
      },
      styles: { fontSize: 7, halign: "left" },
      margin: { left: 14, right: 14 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // 5. Tabel Catatan Transaksi Kas (SEMUA RATA KIRI)
  if (data.listTransaksi && data.listTransaksi.length > 0) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...darkTextColor);
    doc.text("RIWAYAT TRANSAKSI KAS", 14, currentY);

    autoTable(doc, {
      startY: currentY + 3,
      head: [["Tanggal", "Jenis", "Pocket", "Keterangan", "Nominal"]],
      body: data.listTransaksi.map((t) => [
        t.tanggal,
        t.jenis.toUpperCase(),
        t.pocket,
        t.keterangan || "-",
        `Rp ${t.nominal.toLocaleString("id-ID")}`,
      ]),
      theme: "striped",
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8,
        halign: "left",
      },
      styles: { fontSize: 8, halign: "left" },
      margin: { left: 14, right: 14 },
    });
  }

  // Footer Watermark
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Dicetak otomatis oleh MLAKUBARENG — Halaman ${i} dari ${pageCount}`,
      105,
      290,
      { align: "center" },
    );
  }

  // Save PDF file
  const sanitizePeriode = data.periodeLabel.replace(/[^a-zA-Z0-9]/g, "_");
  doc.save(`Laporan_Kas_Mlaku Bareng_Pocket_${sanitizePeriode}.pdf`);
}
