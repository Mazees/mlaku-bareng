import { createClient } from "@/utils/supabase/server";
import { PublicOverviewView } from "@/components/laporan/public-overview-view";
import { PublicNavbar } from "@/components/layout/public-navbar";

export const metadata = {
  title: "Laporan Transparansi Kas — MLAKUBARENG",
  description: "Laporan transparansi kas publik kas keluarga MLAKUBARENG",
};

interface PublicLaporanPageProps {
  searchParams: Promise<{ bulan?: string; tahun?: string }>;
}

export default async function PublicLaporanPage({ searchParams }: PublicLaporanPageProps) {
  const supabase = await createClient();
  const params = await searchParams;

  const currentDate = new Date();
  const selectedBulan = params.bulan || currentDate.toISOString().slice(0, 7); // e.g. "2026-08"
  const selectedTahun = params.tahun || currentDate.getFullYear().toString(); // e.g. "2026"

  // 1. Ambil data Pocket, Rekap, dan Transaksi Terakhir (Persis seperti Dashboard)
  const { data: listPocketRaw } = await supabase
    .from("v_saldo_pocket")
    .select("*");

  const { data: rekapBulanIni } = await supabase
    .from("v_rekap_bulan_ini")
    .select("*")
    .single();

  const { data: transaksiTerakhirRaw } = await supabase
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
    .order("tanggal", { ascending: false })
    .limit(5);

  // 2. Ambil seluruh data keluarga (urut abjad)
  const { data: listKeluarga } = await supabase
    .from("keluarga")
    .select("id, nama_keluarga")
    .order("nama_keluarga", { ascending: true });

  // 3. Hitung Status Bulanan (Tabel 1) untuk selectedBulan
  const { data: iuranBulanSelected } = await supabase
    .from("iuran")
    .select("keluarga_id, nominal")
    .eq("periode", selectedBulan);

  // Ambil tarif wajib untuk selectedBulan
  const firstDateOfSelectedBulan = `${selectedBulan}-01`;
  const { data: configSelectedBulan } = await supabase
    .from("configuration")
    .select("nominal_iuran_bulanan")
    .lte("berlaku_mulai", firstDateOfSelectedBulan)
    .order("berlaku_mulai", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const targetNominalBulanan = Number(
    configSelectedBulan?.nominal_iuran_bulanan || 100000,
  );

  const totalSetorMap: Record<string, number> = {};
  (iuranBulanSelected || []).forEach((row: any) => {
    totalSetorMap[row.keluarga_id] =
      (totalSetorMap[row.keluarga_id] || 0) + Number(row.nominal);
  });

  const statusBulanIni = (listKeluarga || []).map((k: any) => {
    const totalSetor = totalSetorMap[k.id] || 0;
    return {
      keluarga_id: k.id,
      nama_keluarga: k.nama_keluarga,
      total_setor_bulan_ini: totalSetor,
      sudah_setor: totalSetor > 0,
      lunas_bulan_ini: totalSetor >= targetNominalBulanan,
    };
  });

  // 4. Hitung Matriks 12 Bulan (Tabel 2) untuk selectedTahun
  const { data: iuranTahunSelected } = await supabase
    .from("iuran")
    .select("keluarga_id, periode, nominal")
    .gte("periode", `${selectedTahun}-01`)
    .lte("periode", `${selectedTahun}-12`);

  const monthKeys = [
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

  const matrixMap: Record<string, any> = {};
  (listKeluarga || []).forEach((k: any) => {
    matrixMap[k.id] = {
      keluarga_id: k.id,
      nama_keluarga: k.nama_keluarga,
      jan: 0,
      feb: 0,
      mar: 0,
      apr: 0,
      mei: 0,
      jun: 0,
      jul: 0,
      agu: 0,
      sep: 0,
      okt: 0,
      nov: 0,
      des: 0,
      total_setor_tahun_ini: 0,
    };
  });

  (iuranTahunSelected || []).forEach((row: any) => {
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

  const statusTahunIni = Object.values(matrixMap);

  // 5. Hitung statistik kartu atas
  const totalSaldo =
    (listPocketRaw as any[])?.reduce(
      (acc, item) => acc + Number(item.saldo || 0),
      0,
    ) ?? 0;
  const totalPemasukanBulanIni = Number(
    (rekapBulanIni as any)?.total_pemasukan ?? 0,
  );
  const totalPengeluaran = Number(
    (rekapBulanIni as any)?.total_pengeluaran ?? 0,
  );

  const formattedPocket = (listPocketRaw || []).map((p: any) => ({
    pocket_id: p.pocket_id,
    nama_pocket: p.nama_pocket,
    saldo: Number(p.saldo || 0),
  }));

  const formattedTransaksiTerakhir = (transaksiTerakhirRaw || []).map(
    (tx: any) => ({
      id: tx.id,
      tanggal: tx.tanggal,
      jenis: tx.jenis,
      nominal: Number(tx.nominal || 0),
      keterangan: tx.keterangan || "",
      bukti_url: tx.bukti_url || "",
      pocket_id: tx.pocket_id,
      pocket: {
        nama_pocket: tx.pocket?.nama_pocket || "-",
      },
    }),
  );

  const [yStr, mStr] = selectedBulan.split("-");
  const selectedDateObj = new Date(parseInt(yStr, 10), parseInt(mStr, 10) - 1, 1);
  const currentMonthName = selectedDateObj.toLocaleString("id-ID", {
    month: "long",
  });
  const periodeLabelFormatted = `${currentMonthName} ${selectedTahun}`;

  return (
    <PublicNavbar>
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 lg:p-8">
        <PublicOverviewView
          totalSaldo={totalSaldo}
          totalPemasukanBulanIni={totalPemasukanBulanIni}
          totalPengeluaran={totalPengeluaran}
          listPocket={formattedPocket}
          transaksiTerakhir={formattedTransaksiTerakhir}
          statusBulanIni={statusBulanIni}
          statusTahunIni={statusTahunIni}
          periodeLabel={periodeLabelFormatted}
          currentBulanStr={selectedBulan}
          currentTahunStr={selectedTahun}
        />
      </main>
    </PublicNavbar>
  );
}
