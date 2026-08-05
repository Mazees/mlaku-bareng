import { createClient } from "@/utils/supabase/server";
import { PublicNavbar } from "@/components/layout/public-navbar";
import {
  LaporanPocketItem,
  LaporanTransaksiItem,
} from "@/components/laporan/laporan-view";
import { PublicTransaksiList } from "@/components/laporan/public-transaksi-list";

export const metadata = {
  title: "Daftar Transaksi Kas Publik — MLAKUBARENG",
  description: "Daftar riwayat transaksi dan bukti kas keluarga MLAKUBARENG",
};

export default async function PublicTransaksiPage() {
  const supabase = await createClient();

  // 1. Ambil daftar pocket
  const { data: listPocketRaw } = await supabase
    .from("v_saldo_pocket")
    .select("*");

  const formattedPocket: LaporanPocketItem[] = (listPocketRaw || []).map(
    (p: any) => ({
      pocket_id: p.pocket_id,
      nama_pocket: p.nama_pocket,
      saldo_awal: Number(p.saldo_awal || 0),
      saldo: Number(p.saldo || 0),
    }),
  );

  // 2. Ambil seluruh riwayat transaksi kas (tanpa filter bulan/tahun)
  const { data: listTransaksiRaw } = await supabase
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

  return (
    <PublicNavbar>
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 lg:p-8">
        <PublicTransaksiList
          listTransaksi={formattedTransaksi}
          listPocket={formattedPocket}
        />
      </main>
    </PublicNavbar>
  );
}
