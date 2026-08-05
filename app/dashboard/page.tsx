import Link from "next/link";
import {
  FiUsers,
  FiTrendingDown,
  FiTrendingUp,
  FiPlus,
  FiCreditCard,
  FiArrowUpRight,
  FiArrowDownRight,
  FiCheckCircle,
  FiXCircle,
  FiCalendar,
  FiGrid,
} from "react-icons/fi";
import { MdAccountBalanceWallet } from "react-icons/md";
import { createClient } from "@/utils/supabase/server";
import {
  MonthDateFilter,
  YearFilter,
} from "@/components/dashboard/dashboard-filters";

interface DashboardPageProps {
  searchParams: Promise<{
    bulan?: string;
    tahun_date?: string;
    tahun?: string;
  }>;
}

export default async function DashboardOverviewPage(props: DashboardPageProps) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();

  const currentDate = new Date();
  const defaultBulan = currentDate.toISOString().slice(0, 7); // e.g. "2026-08"
  const defaultTahun = currentDate.getFullYear().toString(); // e.g. "2026"

  const selectedBulan = searchParams.bulan || defaultBulan;

  // Tanggal untuk filter tahunan (diambil dari date input)
  const selectedTahunDate =
    searchParams.tahun_date ||
    (searchParams.tahun
      ? `${searchParams.tahun}-01-01`
      : `${defaultTahun}-01-01`);
  const selectedTahun = selectedTahunDate.slice(0, 4);

  // 1. Ambil data Pocket, Rekap, dan Transaksi Terakhir
  const { data: listPocket } = await supabase
    .from("v_saldo_pocket")
    .select("*");

  const { data: rekapBulanIni } = await supabase
    .from("v_rekap_bulan_ini")
    .select("*")
    .single();

  const { data: transaksiTerakhir } = await supabase
    .from("transaksi")
    .select("*")
    .order("tanggal", { ascending: false })
    .limit(5);

  // 2. Ambil seluruh data keluarga (urut abjad)
  const { data: listKeluarga } = await supabase
    .from("keluarga")
    .select("id, nama_keluarga")
    .order("nama_keluarga", { ascending: true });

  // 3. Hitung Status Bulanan (Tabel 1) untuk selectedBulan
  const { data: iuranBulanSelected } = await supabase
    .from("iuran")
    .select("keluarga_id, nominal")
    .eq("periode", selectedBulan);

  // Ambil tarif wajib untuk selectedBulan
  const firstDateOfSelectedBulan = `${selectedBulan}-01`;
  const { data: configSelectedBulan } = await supabase
    .from("configuration")
    .select("nominal_iuran_bulanan")
    .lte("berlaku_mulai", firstDateOfSelectedBulan)
    .order("berlaku_mulai", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const targetNominalBulanan = Number(
    configSelectedBulan?.nominal_iuran_bulanan || 100000,
  );

  const totalSetorMap: Record<string, number> = {};
  (iuranBulanSelected || []).forEach((row: any) => {
    totalSetorMap[row.keluarga_id] =
      (totalSetorMap[row.keluarga_id] || 0) + Number(row.nominal);
  });

  const statusBulanIni = (listKeluarga || []).map((k: any) => {
    const totalSetor = totalSetorMap[k.id] || 0;
    return {
      keluarga_id: k.id,
      nama_keluarga: k.nama_keluarga,
      total_setor_bulan_ini: totalSetor,
      sudah_setor: totalSetor > 0,
      lunas_bulan_ini: totalSetor >= targetNominalBulanan,
    };
  });

  // 4. Hitung Matriks 12 Bulan (Tabel 2) untuk selectedTahun
  const { data: iuranTahunSelected } = await supabase
    .from("iuran")
    .select("keluarga_id, periode, nominal")
    .gte("periode", `${selectedTahun}-01`)
    .lte("periode", `${selectedTahun}-12`);

  const monthKeys = [
    "jan",
    "feb",
    "mar",
    "apr",
    "mei",
    "jun",
    "jul",
    "agu",
    "sep",
    "okt",
    "nov",
    "des",
  ];

  const matrixMap: Record<string, any> = {};
  (listKeluarga || []).forEach((k: any) => {
    matrixMap[k.id] = {
      keluarga_id: k.id,
      nama_keluarga: k.nama_keluarga,
      jan: 0,
      feb: 0,
      mar: 0,
      apr: 0,
      mei: 0,
      jun: 0,
      jul: 0,
      agu: 0,
      sep: 0,
      okt: 0,
      nov: 0,
      des: 0,
      total_setor_tahun_ini: 0,
    };
  });

  (iuranTahunSelected || []).forEach((row: any) => {
    if (matrixMap[row.keluarga_id] && row.periode) {
      const mIndex = parseInt(row.periode.split("-")[1], 10) - 1;
      if (mIndex >= 0 && mIndex < 12) {
        const mKey = monthKeys[mIndex];
        const val = Number(row.nominal);
        matrixMap[row.keluarga_id][mKey] += val;
        matrixMap[row.keluarga_id].total_setor_tahun_ini += val;
      }
    }
  });

  const statusTahunIni = Object.values(matrixMap);

  // 5. Hitung statistik kartu atas
  const totalSaldo =
    (listPocket as any[])?.reduce(
      (acc, item) => acc + Number(item.saldo || 0),
      0,
    ) ?? 0;
  const totalPemasukanBulanIni = Number(
    (rekapBulanIni as any)?.total_pemasukan ?? 0,
  );
  const totalPengeluaran = Number(
    (rekapBulanIni as any)?.total_pengeluaran ?? 0,
  );

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Title & Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-base sm:text-lg font-bold flex items-center gap-2">
            Ringkasan Keuangan
          </h1>
          <p className="text-xs text-base-content/70">
            Pantau arus kas masuk dari iuran dan pengeluaran operasional
          </p>
        </div>
        <div className="flex not-lg:flex-col items-center gap-3">
          <Link
            href="/dashboard/iuran"
            className="btn btn-primary font-semibold not-lg:w-full"
          >
            <FiPlus className="w-4 h-4 mr-1" />
            Catat Iuran Baru
          </Link>
          <Link
            href="/dashboard/transaksi"
            className="btn btn-secondary font-semibold not-lg:w-full"
          >
            <FiCreditCard className="w-4 h-4 mr-1" />
            Catat Pengeluaran
          </Link>
        </div>
      </div>

      {/* DaisyUI Stats Component */}
      <div className="stats stats-vertical lg:stats-horizontal shadow w-full bg-base-200 border border-base-300">
        <div className="stat gap-1">
          <div className="stat-figure text-primary">
            <MdAccountBalanceWallet className="w-6 h-6" />
          </div>
          <div className="stat-title text-sm font-semibold">
            Total Saldo Kas
          </div>
          <div className="stat-value text-sm sm:text-base font-bold text-primary">
            Rp {totalSaldo.toLocaleString("id-ID")}
          </div>
          <div className="stat-desc text-[11px]">
            Gabungan Kas Tunai &amp; Rekening Bank
          </div>
        </div>

        <div className="stat gap-1">
          <div className="stat-figure text-primary">
            <FiTrendingUp className="w-6 h-6" />
          </div>
          <div className="stat-title text-sm font-semibold">
            Pemasukan Bulan Ini
          </div>
          <div className="stat-value text-sm sm:text-base font-bold text-primary">
            Rp {totalPemasukanBulanIni.toLocaleString("id-ID")}
          </div>
          <div className="stat-desc text-[11px] flex items-center text-primary gap-1">
            <FiArrowUpRight className="w-3.5 h-3.5" />
            Setoran iuran &amp; kas masuk
          </div>
        </div>

        <div className="stat gap-1">
          <div className="stat-figure text-primary">
            <FiTrendingDown className="w-6 h-6" />
          </div>
          <div className="stat-title text-sm font-semibold">
            Pengeluaran Bulan Ini
          </div>
          <div className="stat-value text-sm sm:text-base font-bold text-primary">
            Rp {totalPengeluaran.toLocaleString("id-ID")}
          </div>
          <div className="stat-desc flex items-center text-primary gap-1">
            <FiArrowDownRight className="w-4 h-4" />
            Beban operasional &amp; acara
          </div>
        </div>
      </div>

      {/* Grid: Saldo Per Pocket & Transaksi Terakhir */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card bg-base-200 shadow-sm border border-base-300">
          <div className="card-body">
            <h2 className="card-title text-base">Rincian Saldo Per Pocket</h2>
            <div className="space-y-3 mt-2">
              {listPocket && listPocket.length > 0 ? (
                (listPocket as any[]).map((pocket) => (
                  <div
                    key={pocket.pocket_id}
                    className="flex items-center justify-between p-3 rounded-lg bg-base-100 border border-base-300"
                  >
                    <span className="font-semibold text-sm">
                      {pocket.nama_pocket}
                    </span>
                    <span className="font-extrabold text-primary">
                      Rp {Number(pocket.saldo || 0).toLocaleString("id-ID")}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-base-content/60">
                  Belum ada data pocket.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="card bg-base-200 shadow-sm border border-base-300 lg:col-span-2">
          <div className="card-body">
            <div className="flex not-lg:flex-col lg:items-center lg:justify-between not-lg:gap-2">
              <h2 className="card-title text-base">Transaksi Kas Terakhir</h2>
              <Link
                href="/dashboard/transaksi"
                className="text-xs text-primary font-bold hover:underline"
              >
                Lihat Semua &rarr;
              </Link>
            </div>
            <div className="overflow-x-auto mt-2">
              <table className="table table-sm w-full text-nowrap">
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Jenis</th>
                    <th>Keterangan</th>
                    <th className="text-right">Nominal</th>
                  </tr>
                </thead>
                <tbody>
                  {transaksiTerakhir && transaksiTerakhir.length > 0 ? (
                    (transaksiTerakhir as any[]).map((item) => (
                      <tr key={item.id}>
                        <td className="text-xs">
                          {new Date(item.tanggal).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                          })}
                        </td>
                        <td>
                          <span
                            className={`badge badge-xs font-semibold ${
                              item.jenis === "masuk"
                                ? "badge-success text-success-content"
                                : "badge-error text-error-content"
                            }`}
                          >
                            {item.jenis === "masuk" ? "Masuk" : "Keluar"}
                          </span>
                        </td>
                        <td className="text-xs truncate max-w-xs font-medium">
                          {item.keterangan || "-"}
                        </td>
                        <td
                          className={`text-right font-bold text-xs ${
                            item.jenis === "masuk"
                              ? "text-primary"
                              : "text-error"
                          }`}
                        >
                          {item.jenis === "masuk" ? "+" : "-"} Rp{" "}
                          {Number(item.nominal).toLocaleString("id-ID")}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center py-4 text-xs text-base-content/60"
                      >
                        Belum ada transaksi kas tercatat.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* 1. Ringkasan Bulanan (Tabel Status per Anggota dengan Client Month Input) */}
      <div className="card bg-base-200 shadow-sm border border-base-300">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="card-title text-lg font-bold flex items-center gap-2">
                <FiCalendar className="w-4 h-4 text-primary" />
                Rekap Iuran Bulanan
              </h2>
              <p className="text-xs text-base-content/70">
                Status pembayaran iuran bulanan per Anggota pada bulan terpilih
              </p>
            </div>
            <div className="flex items-center gap-3">
              <MonthDateFilter defaultValue={selectedBulan} />
              <Link
                href="/dashboard/iuran"
                className="btn btn-sm btn-outline font-semibold hidden lg:inline-flex"
              >
                Lihat Seluruh Iuran &rarr;
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="table table-zebra w-full text-xs text-nowrap">
              <thead className="bg-base-300 text-base-content font-bold">
                <tr>
                  <th className="text-left">Nama Anggota</th>
                  <th className="text-left">Nominal Setor</th>
                  <th className="text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {statusBulanIni && statusBulanIni.length > 0 ? (
                  (statusBulanIni as any[]).map((item) => (
                    <tr key={item.keluarga_id}>
                      <td className="text-left font-bold">
                        {item.nama_keluarga}
                      </td>
                      <td className="text-left font-extrabold text-primary">
                        Rp{" "}
                        {Number(item.total_setor_bulan_ini || 0).toLocaleString(
                          "id-ID",
                        )}
                      </td>
                      <td className="text-left text-xs">
                        {item.lunas_bulan_ini ? (
                          <span className="badge badge-xs w-20 font-semibold gap-1 text-success-content badge-success">
                            Lunas
                          </span>
                        ) : item.sudah_setor ? (
                          <span className="badge badge-xs w-20 font-semibold gap-1 text-warning-content badge-warning">
                            Kurang
                          </span>
                        ) : (
                          <span className="badge badge-xs w-20 font-semibold gap-1 text-error-content badge-error">
                            Belum Setor
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="text-center py-6 text-base-content/60"
                    >
                      Belum ada data anggota di database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 2. Ringkasan Tahun Ini (Matriks 12 Bulan dengan Client Year Date Input) */}
      <div className="card bg-base-200 shadow-sm border border-base-300">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="card-title text-lg font-bold flex items-center gap-2">
                <FiUsers className="w-4 h-4 text-primary" />
                Rekap Iuran Tahunan
              </h2>
              <p className="text-xs text-base-content/70">
                Status pembayaran iuran bulanan per Anggota pada bulan terpilih
              </p>
            </div>
            <YearFilter defaultValue={selectedTahun} />
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="table table-zebra w-full text-xs text-nowrap">
              <thead className="bg-base-300 text-base-content font-bold">
                <tr>
                  <th className="min-w-44">Nama Anggota</th>
                  <th className="text-center">Jan</th>
                  <th className="text-center">Feb</th>
                  <th className="text-center">Mar</th>
                  <th className="text-center">Apr</th>
                  <th className="text-center">Mei</th>
                  <th className="text-center">Jun</th>
                  <th className="text-center">Jul</th>
                  <th className="text-center">Agu</th>
                  <th className="text-center">Sep</th>
                  <th className="text-center">Okt</th>
                  <th className="text-center">Nov</th>
                  <th className="text-center">Des</th>
                  <th className="text-right font-extrabold text-primary">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {statusTahunIni && statusTahunIni.length > 0 ? (
                  (statusTahunIni as any[]).map((item) => {
                    const months = [
                      "jan",
                      "feb",
                      "mar",
                      "apr",
                      "mei",
                      "jun",
                      "jul",
                      "agu",
                      "sep",
                      "okt",
                      "nov",
                      "des",
                    ];
                    return (
                      <tr key={item.keluarga_id}>
                        <td className="font-bold">{item.nama_keluarga}</td>
                        {months.map((m) => {
                          const nominal = Number(item[m] || 0);
                          return (
                            <td key={m} className="text-center">
                              {nominal > 0 ? (
                                <span className="badge badge-xs lg:badge-sm badge-primary font-bold">
                                  {nominal >= 1000
                                    ? `${nominal / 1000}K`
                                    : nominal}
                                </span>
                              ) : (
                                <span className="text-base-content/30">-</span>
                              )}
                            </td>
                          );
                        })}
                        <td className="text-right font-extrabold text-primary">
                          Rp{" "}
                          {Number(
                            item.total_setor_tahun_ini || 0,
                          ).toLocaleString("id-ID")}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={14}
                      className="text-center py-6 text-base-content/60"
                    >
                      Belum ada data rekap tahunan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
