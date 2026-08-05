"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";

// Schema Zod untuk validasi input Pocket
const PocketSchema = z.object({
  nama_pocket: z.string().min(1, "Nama pocket wajib diisi"),
  saldo_awal: z.coerce.number().min(0, "Saldo awal tidak boleh negatif"),
});

/**
 * Server Action: Tambah Pocket Baru
 */
export async function createPocket(formData: FormData) {
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
    nama_pocket: formData.get("nama_pocket")?.toString().trim(),
    saldo_awal: formData.get("saldo_awal") || 0,
  };

  const validated = PocketSchema.safeParse(rawData);

  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { nama_pocket, saldo_awal } = validated.data;

  // 3. Simpan ke database
  const { error } = await supabase.from("pocket").insert({
    nama_pocket,
    saldo_awal,
  });

  if (error) {
    return { error: `Gagal menambah pocket baru: ${error.message}` };
  }

  // 4. Revalidate cache
  revalidatePath("/dashboard/pocket");
  revalidatePath("/dashboard");

  return { error: null, success: true };
}

/**
 * Server Action: Perbarui Data Pocket
 */
export async function updatePocket(id: string, formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sesi Anda telah berakhir. Silakan login kembali." };
  }

  const rawData = {
    nama_pocket: formData.get("nama_pocket")?.toString().trim(),
    saldo_awal: formData.get("saldo_awal") || 0,
  };

  const validated = PocketSchema.safeParse(rawData);

  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { nama_pocket, saldo_awal } = validated.data;

  const { error } = await supabase
    .from("pocket")
    .update({
      nama_pocket,
    })
    .eq("id", id);

  if (error) {
    return { error: `Gagal memperbarui pocket: ${error.message}` };
  }

  revalidatePath("/dashboard/pocket");
  revalidatePath("/dashboard");

  return { error: null, success: true };
}

/**
 * Server Action: Hapus Pocket
 */
export async function deletePocket(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sesi Anda telah berakhir. Silakan login kembali." };
  }

  const { error } = await supabase.from("pocket").delete().eq("id", id);

  if (error) {
    if (error.code === "23503") {
      return {
        error:
          "Pocket ini tidak dapat dihapus karena sudah memiliki riwayat iuran atau transaksi kas.",
      };
    }
    return { error: `Gagal menghapus pocket: ${error.message}` };
  }

  revalidatePath("/dashboard/pocket");
  revalidatePath("/dashboard");

  return { error: null, success: true };
}
