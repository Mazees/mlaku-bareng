import { createClient } from "@/utils/supabase/server";
import { ConfigView, ConfigItem } from "@/components/settings/config-view";

/**
 * SettingsPage (Server Component)
 * --------------------------------
 * Halaman admin untuk mengelola Konfigurasi Nominal Iuran Bulanan.
 * Mengambil data live histori kebijakan nominal dari Supabase.
 */
export default async function SettingsPage() {
  const supabase = await createClient();

  // Ambil daftar riwayat konfigurasi nominal iuran urut dari yang terbaru
  const { data, error } = await supabase
    .from("configuration")
    .select("id, nominal_iuran_bulanan, berlaku_mulai, created_at")
    .order("berlaku_mulai", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Gagal mengambil data konfigurasi:", error.message);
  }

  const listConfig = (data || []) as ConfigItem[];
  
  // Tentukan nominal aktif saat ini (konfigurasi teratas yang berlaku_mulai <= hari ini)
  const todayStr = new Date().toISOString().split("T")[0];
  const activeConfig =
    listConfig.find((item) => item.berlaku_mulai <= todayStr) ||
    listConfig[0];

  const activeNominal = Number(activeConfig?.nominal_iuran_bulanan || 100000);
  const activeBerlakuMulai = activeConfig?.berlaku_mulai || todayStr;

  return (
    <ConfigView
      listConfig={listConfig}
      activeNominal={activeNominal}
      activeBerlakuMulai={activeBerlakuMulai}
    />
  );
}
