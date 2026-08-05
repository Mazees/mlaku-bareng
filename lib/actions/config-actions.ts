"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";

// Schema Zod untuk validasi input perubahan nominal iuran
const ConfigSchema = z.object({
  nominal_iuran_bulanan: z
    .coerce
    .number()
    .min(1000, "Nominal iuran minimal Rp 1.000"),
  berlaku_mulai: z.string().min(1, "Bulan berlaku mulai wajib dipilih"),
});

/**
 * Server Action: Tambah / Update Kebijakan Nominal Iuran per Bulan (Selalu dipatok ke tanggal 1 YYYY-MM-01)
 */
export async function createConfiguration(formData: FormData) {
  const supabase = await createClient();

  // 1. Cek autentikasi admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sesi Anda telah berakhir. Silakan login kembali." };
  }

  // 2. Validasi input Zod
  const rawData = {
    nominal_iuran_bulanan: formData.get("nominal_iuran_bulanan"),
    berlaku_mulai: formData.get("berlaku_mulai")?.toString(),
  };

  const validated = ConfigSchema.safeParse(rawData);

  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { nominal_iuran_bulanan, berlaku_mulai: inputMulai } = validated.data;

  // Pastikan tanggal berlaku_mulai SELALU dipatok ke awal bulan: YYYY-MM-01
  const parts = inputMulai.split("-");
  const year = parts[0];
  const month = parts[1];
  const formattedBerlakuMulai = `${year}-${month}-01`;

  // 3. UPSERT ke tabel configuration berdasar berlaku_mulai (awal bulan)
  const { error } = await supabase.from("configuration").upsert(
    {
      nominal_iuran_bulanan,
      berlaku_mulai: formattedBerlakuMulai,
    },
    { onConflict: "berlaku_mulai" }
  );

  if (error) {
    return {
      error: `Gagal menyimpan konfigurasi nominal baru: ${error.message}`,
    };
  }

  // 4. Revalidate cache halaman dashboard, iuran, dan settings
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/iuran");
  revalidatePath("/dashboard");

  return { error: null, success: true };
}
