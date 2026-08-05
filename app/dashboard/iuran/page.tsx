import { createClient } from "@/utils/supabase/server";
import { IuranTable, IuranItem } from "@/components/tables/iuran-table";

/**
 * IuranPage (Server Component)
 * ----------------------------
 * Halaman admin untuk mengelola & mencatat setoran iuran bulanan kas keluarga.
 * Mengambil data live dari Supabase untuk iuran, daftar keluarga, pocket, dan konfigurasi.
 */
export default async function IuranPage() {
  const supabase = await createClient();

  // 1. Ambil riwayat setoran iuran beserta relasi keluarga dan pocket
  const { data: iuranData, error: iuranErr } = await supabase
    .from("iuran")
    .select(
      `
      id,
      periode,
      tanggal_setor,
      nominal,
      keterangan,
      keluarga:keluarga_id (id, nama_keluarga),
      pocket:pocket_id (id, nama_pocket)
    `
    )
    .order("tanggal_setor", { ascending: false })
    .order("created_at", { ascending: false });

  if (iuranErr) {
    console.error("Gagal mengambil data iuran:", iuranErr.message);
  }

  // 2. Ambil daftar keluarga untuk dropdown modal form
  const { data: keluargaData } = await supabase
    .from("keluarga")
    .select("id, nama_keluarga")
    .order("nama_keluarga", { ascending: true });

  // 3. Ambil daftar pocket (Cash / Bank)
  const { data: pocketData } = await supabase
    .from("pocket")
    .select("id, nama_pocket")
    .order("created_at", { ascending: true });

  // 4. Ambil nominal iuran bulanan aktif dari konfigurasi
  const { data: configData } = await supabase
    .from("configuration")
    .select("nominal_iuran_bulanan")
    .lte("berlaku_mulai", new Date().toISOString().split("T")[0])
    .order("berlaku_mulai", { ascending: false })
    .limit(1)
    .single();

  const defaultNominal = Number(configData?.nominal_iuran_bulanan || 100000);
  const listIuran = (iuranData || []) as unknown as IuranItem[];
  const listKeluarga = (keluargaData || []) as {
    id: string;
    nama_keluarga: string;
  }[];
  const listPocket = (pocketData || []) as {
    id: string;
    nama_pocket: string;
  }[];

  return (
    <div className="max-w-6xl mx-auto">
      <IuranTable
        listIuran={listIuran}
        listKeluarga={listKeluarga}
        listPocket={listPocket}
        defaultNominal={defaultNominal}
      />
    </div>
  );
}
