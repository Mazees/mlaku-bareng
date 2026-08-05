"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";

// Schema Zod untuk validasi input form keluarga
const KeluargaSchema = z.object({
  nama_keluarga: z
    .string()
    .min(3, "Nama keluarga minimal harus 3 karakter")
    .max(100, "Nama keluarga terlalu panjang"),
});

/**
 * Server Action: Tambah Keluarga Baru
 */
export async function createKeluarga(formData: FormData) {
  const supabase = await createClient();

  // 1. Cek autentikasi user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sesi Anda telah berakhir. Silakan login kembali." };
  }

  // 2. Validasi input menggunakan Zod
  const validated = KeluargaSchema.safeParse({
    nama_keluarga: formData.get("nama_keluarga")?.toString().trim(),
  });

  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  // 3. Operasi database insert ke tabel keluarga
  const { error } = await supabase
    .from("keluarga")
    .insert({
      nama_keluarga: validated.data.nama_keluarga,
    });

  if (error) {
    if (error.code === "23505") {
      return { error: "Nama keluarga tersebut sudah terdaftar." };
    }
    return { error: `Gagal menyimpan data keluarga: ${error.message}` };
  }

  // 4. Revalidate cache halaman
  revalidatePath("/dashboard/keluarga");
  revalidatePath("/dashboard");

  return { error: null, success: true };
}

/**
 * Server Action: Edit / Perbarui Data Keluarga
 */
export async function updateKeluarga(id: string, formData: FormData) {
  const supabase = await createClient();

  // 1. Cek auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sesi Anda telah berakhir. Silakan login kembali." };
  }

  // 2. Validasi ID dan input
  if (!id) {
    return { error: "ID keluarga tidak valid." };
  }

  const validated = KeluargaSchema.safeParse({
    nama_keluarga: formData.get("nama_keluarga")?.toString().trim(),
  });

  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  // 3. Update database
  const { error } = await supabase
    .from("keluarga")
    .update({
      nama_keluarga: validated.data.nama_keluarga,
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { error: "Nama keluarga tersebut sudah terdaftar." };
    }
    return { error: `Gagal memperbarui data keluarga: ${error.message}` };
  }

  // 4. Revalidate
  revalidatePath("/dashboard/keluarga");
  revalidatePath("/dashboard");

  return { error: null, success: true };
}

/**
 * Server Action: Hapus Keluarga
 */
export async function deleteKeluarga(id: string) {
  const supabase = await createClient();

  // 1. Cek auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sesi Anda telah berakhir. Silakan login kembali." };
  }

  if (!id) {
    return { error: "ID keluarga tidak valid." };
  }

  // 2. Operasi delete
  const { error } = await supabase.from("keluarga").delete().eq("id", id);

  if (error) {
    if (error.code === "23503") {
      return {
        error:
          "Keluarga ini tidak bisa dihapus karena memiliki riwayat setoran iuran aktif.",
      };
    }
    return { error: `Gagal menghapus keluarga: ${error.message}` };
  }

  // 3. Revalidate
  revalidatePath("/dashboard/keluarga");
  revalidatePath("/dashboard");

  return { error: null, success: true };
}
