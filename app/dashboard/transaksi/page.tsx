import { createClient } from "@/utils/supabase/server";
import {
  TransaksiTable,
  TransaksiItem,
} from "@/components/tables/transaksi-table";

export const metadata = {
  title: "Transaksi Kas — MLAKUBARENG",
  description: "Catatan transaksi pengeluaran operasional & kas masuk",
};

export default async function TransaksiPage() {
  const supabase = await createClient();

  // 1. Ambil seluruh transaksi kas diurutkan berdasar tanggal terbaru
  const { data: listTransaksi, error } = await supabase
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
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Gagal mengambil data transaksi:", error.message);
  }

  // 2. Ambil daftar pocket kas/bank untuk dropdown pilihan
  const { data: listPocket } = await supabase
    .from("pocket")
    .select("id, nama_pocket")
    .order("nama_pocket", { ascending: true });

  const formattedTransaksi: TransaksiItem[] = (listTransaksi || []).map(
    (item: any) => ({
      id: item.id,
      tanggal: item.tanggal,
      jenis: item.jenis,
      kategori: item.kategori || "Umum",
      nominal: Number(item.nominal || 0),
      keterangan: item.keterangan || undefined,
      bukti_url: item.bukti_url || undefined,
      pocket_id: item.pocket_id,
      pocket: {
        id: item.pocket?.id || item.pocket_id,
        nama_pocket: item.pocket?.nama_pocket || "Pocket Unmapped",
      },
    }),
  );

  const formattedPocketList = (listPocket || []).map((p: any) => ({
    id: p.id,
    nama_pocket: p.nama_pocket,
  }));

  return (
    <div className="max-w-6xl">
      <TransaksiTable
        listTransaksi={formattedTransaksi}
        listPocket={formattedPocketList}
      />
    </div>
  );
}
