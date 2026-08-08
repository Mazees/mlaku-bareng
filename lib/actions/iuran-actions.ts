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

  // 3. Ambil SEMUA konfigurasi iuran (diurutkan dari terlama) untuk menentukan nominal per periode
  const { data: allConfigs } = await supabase
    .from("configuration")
    .select("nominal_iuran_bulanan, berlaku_mulai")
    .order("berlaku_mulai", { ascending: true });

  if (!allConfigs || allConfigs.length === 0) {
    return { error: "Belum ada konfigurasi nominal iuran. Silakan atur di Settings." };
  }

  // 4. Ambil histori iuran keluarga ini
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

  // Helper: cari nominal wajib yang berlaku untuk suatu periode dari array konfigurasi
  function getNominalForPeriod(periodeStr: string): number {
    const firstDate = `${periodeStr}-01`;
    let nominal = Number(allConfigs![0].nominal_iuran_bulanan); // fallback ke config pertama
    for (const cfg of allConfigs!) {
      if (cfg.berlaku_mulai <= firstDate) {
        nominal = Number(cfg.nominal_iuran_bulanan);
      } else {
        break;
      }
    }
    return nominal;
  }

  // 5. Tentukan titik awal: dari berlaku_mulai konfigurasi paling awal
  const earliestConfig = new Date(allConfigs[0].berlaku_mulai);
  let checkYear = earliestConfig.getFullYear();
  let checkMonth = earliestConfig.getMonth() + 1; // 1-indexed

  // 6. ALGORITMA SMART FIFO ALLOCATION
  // Alokasi sampai saldo habis
  let sisaUang = totalNominalInput;
  const iuranInserts = [];

  while (sisaUang > 0) {

    const monthStr = checkMonth < 10 ? `0${checkMonth}` : `${checkMonth}`;
    const periodeStr = `${checkYear}-${monthStr}`;

    const nominalWajib = getNominalForPeriod(periodeStr);
    const sudahSetor = setoranPerPeriode[periodeStr] || 0;
    const kurang = Math.max(0, nominalWajib - sudahSetor);

    if (kurang > 0) {
      // Periode ini belum lunas — alokasikan pembayaran
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
    }
    // Periode sudah lunas — skip, lanjut ke bulan berikutnya

    checkMonth++;
    if (checkMonth > 12) {
      checkMonth = 1;
      checkYear++;
    }
  }

  // Jika masih ada sisa uang setelah semua periode lunas, kembalikan info
  if (sisaUang > 0 && iuranInserts.length === 0) {
    return { error: "Semua periode iuran sampai bulan ini sudah lunas. Tidak ada tunggakan." };
  }

  // 7. Insert semua baris iuran hasil alokasi FIFO
  if (iuranInserts.length > 0) {
    const { error: insertErr } = await supabase
      .from("iuran")
      .insert(iuranInserts);

    if (insertErr) {
      return { error: `Gagal mencatat setoran iuran: ${insertErr.message}` };
    }
  }

  // 8. Revalidate cache halaman
  revalidatePath("/dashboard/iuran");
  revalidatePath("/dashboard");

  const periodeList = iuranInserts.map((i) => i.periode).join(", ");
  const sisaInfo = sisaUang > 0 ? ` (sisa Rp ${sisaUang.toLocaleString("id-ID")} tidak dialokasikan karena semua periode sudah lunas)` : "";

  return {
    error: null,
    success: true,
    message: `Setoran berhasil dialokasikan ke ${iuranInserts.length} periode: ${periodeList}${sisaInfo}`,
  };
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
