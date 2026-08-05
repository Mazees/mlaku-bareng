import { createClient } from "@/utils/supabase/server";
import {
  LaporanView,
  LaporanPocketItem,
  LaporanStatusKKItem,
  LaporanTransaksiItem,
} from "@/components/laporan/laporan-view";

export const metadata = {
  title: "Laporan Transparansi Kas — MLAKUBARENG",
  description:
    "Laporan transparansi kas keluarga lengkap dengan cetak PDF & Excel",
};

interface LaporanPageProps {
  searchParams: Promise<{ bulan?: string; tahun?: string }>;
}

export default async function DashboardLaporanPage({
  searchParams,
}: LaporanPageProps) {
  const supabase = await createClient();
  const params = await searchParams;

  const now = new Date();
  const currentBulanStr =
    params.bulan ||
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const currentTahunStr = params.tahun || `${now.getFullYear()}`;

  // 1. Ambil rekap saldo per pocket dari view v_saldo_pocket
  const { data: listPocketRaw } = await supabase
    .from("v_saldo_pocket")
    .select("*");

  // 2. Ambil daftar keluarga & iuran pada periode terpilih
  const { data: listKeluarga } = await supabase
    .from("keluarga")
    .select("id, nama_keluarga")
    .order("nama_keluarga", { ascending: true });

  let queryIuranPeriode = supabase.from("iuran").select("keluarga_id, nominal, periode");
  if (params.tahun) {
    queryIuranPeriode = queryIuranPeriode
      .gte("periode", `${currentTahunStr}-01`)
      .lte("periode", `${currentTahunStr}-12`);
  } else {
    queryIuranPeriode = queryIuranPeriode.eq("periode", currentBulanStr);
  }
  const { data: iuranPeriodeRaw } = await queryIuranPeriode;

  const totalSetorPerKK: Record<string, number> = {};
  (iuranPeriodeRaw || []).forEach((row: any) => {
    totalSetorPerKK[row.keluarga_id] =
      (totalSetorPerKK[row.keluarga_id] || 0) + Number(row.nominal || 0);
  });

  const nominalWajib = params.tahun ? 1200000 : 100000;
  const formattedStatusKK: LaporanStatusKKItem[] = (listKeluarga || []).map(
    (k: any) => {
      const nominalSetor = totalSetorPerKK[k.id] || 0;
      let status: "Lunas" | "Kurang" | "Belum Bayar" = "Belum Bayar";
      if (nominalSetor >= nominalWajib) {
        status = "Lunas";
      } else if (nominalSetor > 0) {
        status = "Kurang";
      }
      return {
        keluarga_id: k.id,
        nama_keluarga: k.nama_keluarga,
        nominal_setor: nominalSetor,
        nominal_wajib: nominalWajib,
        status,
      };
    },
  );

  // 3. Ambil riwayat transaksi kas pada periode terpilih
  let queryTx = supabase
    .from("transaksi")
    .select(
      `
      id,
      tanggal,
      jenis,
      nominal,
      keterangan,
      bukti_url,
      pocket_id,
      pocket (
        id,
        nama_pocket
      )
    `,
    )
    .order("tanggal", { ascending: false });

  if (params.tahun) {
    queryTx = queryTx
      .gte("tanggal", `${currentTahunStr}-01-01`)
      .lte("tanggal", `${currentTahunStr}-12-31`);
  } else {
    // Bulanan: misal "2026-08" -> dari "2026-08-01" s/d "2026-08-31"
    const [y, m] = currentBulanStr.split("-");
    const lastDay = new Date(parseInt(y, 10), parseInt(m, 10), 0).getDate();
    queryTx = queryTx
      .gte("tanggal", `${currentBulanStr}-01`)
      .lte("tanggal", `${currentBulanStr}-${String(lastDay).padStart(2, "0")}`);
  }
  const { data: listTransaksiRaw } = await queryTx;

  // 4. Hitung Total Iuran pada periode terpilih
  let queryIuranSum = supabase.from("iuran").select("nominal");
  if (params.tahun) {
    queryIuranSum = queryIuranSum
      .gte("periode", `${currentTahunStr}-01`)
      .lte("periode", `${currentTahunStr}-12`);
  } else {
    queryIuranSum = queryIuranSum.eq("periode", currentBulanStr);
  }
  const { data: iuranSumRaw } = await queryIuranSum;
  const totalIuranPeriode = (iuranSumRaw || []).reduce(
    (acc, row) => acc + Number(row.nominal || 0),
    0,
  );

  // Formatting Data
  const formattedPocket: LaporanPocketItem[] = (listPocketRaw || []).map(
    (p: any) => ({
      pocket_id: p.pocket_id,
      nama_pocket: p.nama_pocket,
      saldo_awal: Number(p.saldo_awal || 0),
      saldo: Number(p.saldo || 0),
    }),
  );

  const formattedTransaksi: LaporanTransaksiItem[] = (
    listTransaksiRaw || []
  ).map((t: any) => ({
    id: t.id,
    tanggal: t.tanggal,
    jenis: t.jenis,
    nominal: Number(t.nominal || 0),
    keterangan: t.keterangan || undefined,
    bukti_url: t.bukti_url || undefined,
    pocket: {
      id: t.pocket?.id || t.pocket_id,
      nama_pocket: t.pocket?.nama_pocket || "Pocket Unmapped",
    },
  }));

  const totalTransaksiMasuk = formattedTransaksi
    .filter((t) => t.jenis === "masuk")
    .reduce((acc, t) => acc + t.nominal, 0);

  const totalPengeluaran = formattedTransaksi
    .filter((t) => t.jenis === "keluar")
    .reduce((acc, t) => acc + t.nominal, 0);

  let statusTahunIni: any[] | undefined = undefined;
  if (params.tahun) {
    const monthKeys = ["jan", "feb", "mar", "apr", "mei", "jun", "jul", "agu", "sep", "okt", "nov", "des"];
    const matrixMap: Record<string, any> = {};
    (listKeluarga || []).forEach((k: any) => {
      matrixMap[k.id] = {
        keluarga_id: k.id,
        nama_keluarga: k.nama_keluarga,
        jan: 0, feb: 0, mar: 0, apr: 0, mei: 0, jun: 0, jul: 0, agu: 0, sep: 0, okt: 0, nov: 0, des: 0,
        total_setor_tahun_ini: 0,
      };
    });
    
    (iuranPeriodeRaw || []).forEach((row: any) => {
      if (matrixMap[row.keluarga_id] && row.periode) {
        const mIndex = parseInt(row.periode.split("-")[1], 10) - 1;
        if (mIndex >= 0 && mIndex < 12) {
          const mKey = monthKeys[mIndex];
          const val = Number(row.nominal);
          matrixMap[row.keluarga_id][mKey] += val;
          matrixMap[row.keluarga_id].total_setor_tahun_ini += val;
        }
      }
    });
    statusTahunIni = Object.values(matrixMap).sort((a, b) =>
      a.nama_keluarga.localeCompare(b.nama_keluarga),
    );
  }

  return (
    <div className="max-w-6xl">
      <LaporanView
        currentBulanStr={currentBulanStr}
        currentTahunStr={currentTahunStr}
        listPocket={formattedPocket}
        listStatusKK={formattedStatusKK}
        listTransaksi={formattedTransaksi}
        totalIuranPeriode={totalIuranPeriode}
        totalTransaksiMasukPeriode={totalTransaksiMasuk}
        totalPengeluaranPeriode={totalPengeluaran}
        statusTahunIni={statusTahunIni}
      />
    </div>
  );
}
