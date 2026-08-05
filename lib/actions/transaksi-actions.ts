"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";

// Schema Zod untuk validasi input Transaksi Kas
const TransaksiSchema = z
  .object({
    jenis: z.enum(["masuk", "keluar"], {
      message: "Jenis transaksi wajib dipilih",
    }),
    kategori: z.string().optional(),
    nominal: z.coerce.number().min(100, "Nominal transaksi minimal Rp 100"),
    pocket_id: z.string().min(1, "Pocket kas/bank wajib dipilih"),
    tanggal: z.string().min(1, "Tanggal transaksi wajib diisi"),
    keterangan: z.string().optional(),
    bukti_urls: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      // PRD & AGENTS.md Rule: Transaksi keluar WAJIB ada keterangan
      if (data.jenis === "keluar") {
        return !!data.keterangan && data.keterangan.trim().length > 0;
      }
      return true;
    },
    {
      message: "Keterangan wajib diisi untuk transaksi pengeluaran kas!",
      path: ["keterangan"],
    }
  );

/**
 * Server Action: Catat Transaksi Kas Baru (Masuk / Keluar)
 */
export async function createTransaksi(formData: FormData) {
  const supabase = await createClient();

  // 1. Cek autentikasi admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sesi Anda telah berakhir. Silakan login kembali." };
  }

  // Parse bukti_urls dari JSON string jika ada
  const buktiUrlsRaw = formData.get("bukti_urls")?.toString();
  let bukti_urls: string[] = [];
  if (buktiUrlsRaw) {
    try {
      bukti_urls = JSON.parse(buktiUrlsRaw);
    } catch {
      bukti_urls = [];
    }
  }

  // 2. Validasi input Zod
  const rawData = {
    jenis: formData.get("jenis")?.toString(),
    kategori: formData.get("kategori")?.toString().trim() || "Umum",
    nominal: formData.get("nominal"),
    pocket_id: formData.get("pocket_id")?.toString(),
    tanggal:
      formData.get("tanggal")?.toString() ||
      new Date().toISOString().split("T")[0],
    keterangan: formData.get("keterangan")?.toString().trim(),
    bukti_urls,
  };

  const validated = TransaksiSchema.safeParse(rawData);

  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { jenis, nominal, pocket_id, tanggal, keterangan, bukti_urls: finalBukti } =
    validated.data;

  // 3. Simpan ke database transaksi
  const { error } = await supabase.from("transaksi").insert({
    jenis,
    nominal,
    pocket_id,
    tanggal,
    keterangan: keterangan || null,
    bukti_url: finalBukti && finalBukti.length > 0 ? finalBukti : null,
  });

  if (error) {
    return { error: `Gagal mencatat transaksi: ${error.message}` };
  }

  // 4. Revalidate cache
  revalidatePath("/dashboard/transaksi");
  revalidatePath("/dashboard/pocket");
  revalidatePath("/dashboard");

  return { error: null, success: true };
}

/**
 * Server Action: Perbarui Transaksi Kas
 */
export async function updateTransaksi(id: string, formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sesi Anda telah berakhir. Silakan login kembali." };
  }

  const buktiUrlsRaw = formData.get("bukti_urls")?.toString();
  let bukti_urls: string[] = [];
  if (buktiUrlsRaw) {
    try {
      bukti_urls = JSON.parse(buktiUrlsRaw);
    } catch {
      bukti_urls = [];
    }
  }

  const rawData = {
    jenis: formData.get("jenis")?.toString(),
    nominal: formData.get("nominal"),
    pocket_id: formData.get("pocket_id")?.toString(),
    tanggal:
      formData.get("tanggal")?.toString() ||
      new Date().toISOString().split("T")[0],
    keterangan: formData.get("keterangan")?.toString().trim(),
    bukti_urls,
  };

  const validated = TransaksiSchema.safeParse(rawData);

  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { jenis, nominal, pocket_id, tanggal, keterangan, bukti_urls: finalBukti } =
    validated.data;

  const { error } = await supabase
    .from("transaksi")
    .update({
      jenis,
      nominal,
      pocket_id,
      tanggal,
      keterangan: keterangan || null,
      bukti_url: finalBukti && finalBukti.length > 0 ? finalBukti : null,
    })
    .eq("id", id);

  if (error) {
    return { error: `Gagal memperbarui transaksi: ${error.message}` };
  }

  revalidatePath("/dashboard/transaksi");
  revalidatePath("/dashboard/pocket");
  revalidatePath("/dashboard");

  return { error: null, success: true };
}

/**
 * Server Action: Hapus Transaksi Kas
 */
export async function deleteTransaksi(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sesi Anda telah berakhir. Silakan login kembali." };
  }

  const { error } = await supabase.from("transaksi").delete().eq("id", id);

  if (error) {
    return { error: `Gagal menghapus transaksi: ${error.message}` };
  }

  revalidatePath("/dashboard/transaksi");
  revalidatePath("/dashboard/pocket");
  revalidatePath("/dashboard");

  return { error: null, success: true };
}

/**
 * Server Action: Pindah Saldo (Transfer Antar Pocket)
 */
export async function transferSaldo(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sesi Anda telah berakhir. Silakan login kembali." };
  }

  const fromPocketId = formData.get("from_pocket_id")?.toString();
  const toPocketId = formData.get("to_pocket_id")?.toString();
  const nominal = Number(formData.get("nominal"));
  const tanggal = formData.get("tanggal")?.toString() || new Date().toISOString().split("T")[0];
  const keterangan = formData.get("keterangan")?.toString().trim();

  if (!fromPocketId || !toPocketId) return { error: "Pocket asal dan tujuan harus dipilih!" };
  if (fromPocketId === toPocketId) return { error: "Pocket asal dan tujuan tidak boleh sama!" };
  if (!nominal || nominal < 100) return { error: "Nominal transfer minimal Rp 100!" };
  if (!keterangan) return { error: "Keterangan transfer wajib diisi!" };

  // 1. Buat record PENGELUARAN dari Pocket Asal
  const outRecord = {
    jenis: "keluar",
    kategori: "Transfer Keluar",
    nominal: nominal,
    pocket_id: fromPocketId,
    tanggal: tanggal,
    keterangan: keterangan,
    bukti_url: null,
  };

  // 2. Buat record PEMASUKAN ke Pocket Tujuan
  const inRecord = {
    jenis: "masuk",
    kategori: "Transfer Masuk",
    nominal: nominal,
    pocket_id: toPocketId,
    tanggal: tanggal,
    keterangan: keterangan,
    bukti_url: null,
  };

  // Insert kedua record sekaligus
  const { error } = await supabase.from("transaksi").insert([outRecord, inRecord]);

  if (error) {
    return { error: `Gagal memproses pindah saldo: ${error.message}` };
  }

  revalidatePath("/dashboard/transaksi");
  revalidatePath("/dashboard/pocket");
  revalidatePath("/dashboard");

  return { error: null, success: true };
}
