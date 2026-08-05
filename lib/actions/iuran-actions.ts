"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";

// Schema Zod untuk validasi input setoran iuran
const IuranSchema = z.object({
  keluarga_id: z.string().min(1, "Pilih keluarga terlebih dahulu"),
  nominal: z.coerce.number().min(1000, "Nominal setoran minimal Rp 1.000"),
  pocket_id: z.string().min(1, "Pilih dompet/pocket pembayaran"),
  tanggal_setor: z.string().min(1, "Tanggal setor wajib diisi"),
  keterangan: z.string().optional(),
});

/**
 * Helper Server-Side: Mengambil nominal wajib iuran yang berlaku pada periode tertentu (format 'YYYY-MM')
 */
async function getNominalWajibForPeriod(supabase: any, periodeStr: string) {
  // Karena konfigurasi iuran berbasis bulan, kita bandingkan terhadap awal bulan `${periodeStr}-01`
  const firstDateOfMonth = `${periodeStr}-01`;

  const { data } = await supabase
    .from("configuration")
    .select("nominal_iuran_bulanan")
    .lte("berlaku_mulai", firstDateOfMonth)
    .order("berlaku_mulai", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  return Number(data?.nominal_iuran_bulanan || 100000);
}

/**
 * Server Action: Catat Setoran Iuran Baru dengan Algoritma Smart FIFO Allocation
 */
export async function createIuran(formData: FormData) {
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
    keluarga_id: formData.get("keluarga_id")?.toString(),
    nominal: formData.get("nominal"),
    pocket_id: formData.get("pocket_id")?.toString(),
    tanggal_setor:
      formData.get("tanggal_setor")?.toString() ||
      new Date().toISOString().split("T")[0],
    keterangan: formData.get("keterangan")?.toString(),
  };

  const validated = IuranSchema.safeParse(rawData);

  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const {
    keluarga_id,
    nominal: totalNominalInput,
    pocket_id,
    tanggal_setor,
    keterangan,
  } = validated.data;

  // 3. Ambil histori iuran dan tanggal terdaftar keluarga ini untuk menentukan alokasi FIFO
  const { data: keluarga } = await supabase
    .from("keluarga")
    .select("created_at")
    .eq("id", keluarga_id)
    .single();

  const { data: historiIuran } = await supabase
    .from("iuran")
    .select("periode, nominal")
    .eq("keluarga_id", keluarga_id);

  // Rekap total nominal terbayar per periode (YYYY-MM)
  const setoranPerPeriode: Record<string, number> = {};
  (historiIuran || []).forEach((row: any) => {
    setoranPerPeriode[row.periode] =
      (setoranPerPeriode[row.periode] || 0) + Number(row.nominal);
  });

  // Tentukan titik awal pencarian dari tanggal terdaftar keluarga atau Januari tahun berjalan
  let sisaUang = totalNominalInput;
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  // Titik awal tahun & bulan: dari tanggal keluarga terdaftar
  const regDate = keluarga?.created_at
    ? new Date(keluarga.created_at)
    : currentDate;
  const startYear = Math.min(regDate.getFullYear(), currentYear);
  const startMonth =
    regDate.getFullYear() < currentYear
      ? 1
      : Math.min(regDate.getMonth() + 1, currentDate.getMonth() + 1);

  let checkYear = startYear;
  let checkMonth = startMonth;

  // Cari titik awal bulan yang belum lunas penuh
  let startFound = false;
  for (let y = startYear; y <= currentYear + 2; y++) {
    const mStart = y === startYear ? startMonth : 1;
    for (let m = mStart; m <= 12; m++) {
      const monthStr = m < 10 ? `0${m}` : `${m}`;
      const periodeStr = `${y}-${monthStr}`;

      const nominalWajib = await getNominalWajibForPeriod(
        supabase,
        periodeStr
      );
      const sudahSetor = setoranPerPeriode[periodeStr] || 0;

      if (sudahSetor < nominalWajib) {
        checkYear = y;
        checkMonth = m;
        startFound = true;
        break;
      }
    }
    if (startFound) break;
  }

  // ALGORITMA SMART FIFO ALLOCATION: Pecah uang masuk ke bulan-bulan tertunggak / mendatang
  const iuranInserts = [];

  while (sisaUang > 0) {
    const monthStr = checkMonth < 10 ? `0${checkMonth}` : `${checkMonth}`;
    const periodeStr = `${checkYear}-${monthStr}`;

    const nominalWajib = await getNominalWajibForPeriod(
      supabase,
      periodeStr
    );
    const sudahSetor = setoranPerPeriode[periodeStr] || 0;
    const kurang = Math.max(0, nominalWajib - sudahSetor);

    if (kurang > 0) {
      const nominalAlokasi = Math.min(sisaUang, kurang);

      iuranInserts.push({
        keluarga_id,
        periode: periodeStr,
        tanggal_setor,
        nominal: nominalAlokasi,
        pocket_id,
        keterangan: keterangan || `Alokasi iuran periode ${periodeStr}`,
      });

      sisaUang -= nominalAlokasi;
      setoranPerPeriode[periodeStr] = sudahSetor + nominalAlokasi;
    } else {
      // Jika bulan ini sudah lunas, lanjut ke bulan berikutnya
    }

    // Geser ke bulan berikutnya
    checkMonth++;
    if (checkMonth > 12) {
      checkMonth = 1;
      checkYear++;
    }
  }

  // Insert semua baris iuran hasil alokasi FIFO
  if (iuranInserts.length > 0) {
    const { error: insertErr } = await supabase
      .from("iuran")
      .upsert(iuranInserts);

    if (insertErr) {
      return { error: `Gagal mencatat setoran iuran: ${insertErr.message}` };
    }
  }

  // 4. Revalidate cache halaman
  revalidatePath("/dashboard/iuran");
  revalidatePath("/dashboard");

  return { error: null, success: true };
}

/**
 * Server Action: Hapus Catatan Iuran
 */
export async function deleteIuran(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sesi Anda telah berakhir. Silakan login kembali." };
  }

  if (!id) {
    return { error: "ID iuran tidak valid." };
  }

  const { error } = await supabase.from("iuran").delete().eq("id", id);

  if (error) {
    return { error: `Gagal menghapus catatan iuran: ${error.message}` };
  }

  revalidatePath("/dashboard/iuran");
  revalidatePath("/dashboard");

  return { error: null, success: true };
}
