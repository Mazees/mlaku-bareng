import { createClient } from "@/utils/supabase/server";
import { PocketTable, PocketViewItem } from "@/components/tables/pocket-table";

export const metadata = {
  title: "Dompet — MLAKUBARENG",
  description: "Kelola akun pocket kas tunai dan rekening bank",
};

export default async function PocketPage() {
  const supabase = await createClient();

  // Ambil saldo real-time per pocket dari view SQL v_saldo_pocket
  const { data: listPocket, error } = await supabase
    .from("v_saldo_pocket")
    .select("*");

  if (error) {
    console.error("Gagal mengambil data pocket:", error.message);
  }

  const formattedPockets: PocketViewItem[] = (listPocket || []).map(
    (item: any) => ({
      pocket_id: item.pocket_id,
      nama_pocket: item.nama_pocket,
      saldo_awal: Number(item.saldo_awal || 0),
      saldo: Number(item.saldo || 0),
    }),
  );

  return (
    <div className="max-w-6xl">
      <PocketTable listPocket={formattedPockets} />
    </div>
  );
}
