import { createClient } from "@/utils/supabase/server";
import {
  KeluargaTable,
  KeluargaItem,
} from "@/components/tables/keluarga-table";

/**
 * KeluargaPage (Server Component)
 * -------------------------------
 * Halaman admin untuk mengelola daftar Kepala Keluarga (Member KK).
 * Mengambil data secara live dari tabel "keluarga" di Supabase.
 */
export default async function KeluargaPage() {
  const supabase = await createClient();

  // Ambil daftar keluarga urut abjad
  const { data, error } = await supabase
    .from("keluarga")
    .select("id, nama_keluarga, created_at")
    .order("nama_keluarga", { ascending: true });

  if (error) {
    console.error("Gagal mengambil data keluarga:", error.message);
  }

  const listKeluarga = (data || []) as KeluargaItem[];

  return (
    <div className="max-w-6xl mx-auto">
      <KeluargaTable listKeluarga={listKeluarga} />
    </div>
  );
}
