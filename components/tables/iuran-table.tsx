"use client";

import React, { useState, useMemo } from "react";
import {
  FiPlus,
  FiSearch,
  FiTrash2,
  FiDollarSign,
  FiAlertTriangle,
  FiFilter,
} from "react-icons/fi";
import { IuranForm } from "@/components/forms/iuran-form";
import { deleteIuran } from "@/lib/actions/iuran-actions";
import {
  showConfirmModal,
  showSuccessToast,
  showErrorAlert,
} from "@/lib/utils/swal";

export interface IuranItem {
  id: string;
  periode: string;
  tanggal_setor: string;
  nominal: number;
  keterangan?: string;
  keluarga: {
    id: string;
    nama_keluarga: string;
  };
  pocket: {
    id: string;
    nama_pocket: string;
  };
}

interface IuranTableProps {
  listIuran: IuranItem[];
  listKeluarga: { id: string; nama_keluarga: string }[];
  listPocket: { id: string; nama_pocket: string }[];
  defaultNominal?: number;
}

/**
 * IuranTable Component
 * --------------------
 * Komponen Client untuk menampilkan tabel riwayat setoran iuran,
 * dilengkapi fitur pencarian, filter periode bulan, badge total terkumpul,
 * serta modal form tambah dan aksi hapus.
 */
export function IuranTable({
  listIuran,
  listKeluarga,
  listPocket,
  defaultNominal = 100000,
}: IuranTableProps) {
  const [search, setSearch] = useState("");
  const [selectedPeriode, setSelectedPeriode] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Ambil daftar unik periode (YYYY-MM) dari data iuran untuk dropdown filter
  const uniquePeriodes = useMemo(() => {
    const periodes = Array.from(new Set(listIuran.map((item) => item.periode)));
    return periodes.sort().reverse();
  }, [listIuran]);

  // Filter daftar iuran berdasar pencarian dan pilihan periode
  const filteredList = useMemo(() => {
    return listIuran.filter((item) => {
      const matchSearch = item.keluarga?.nama_keluarga
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchPeriode =
        selectedPeriode === "all" || item.periode === selectedPeriode;
      return matchSearch && matchPeriode;
    });
  }, [listIuran, search, selectedPeriode]);

  const handleDelete = async (id: string, nama: string, periode: string) => {
    const result = await showConfirmModal({
      title: "Hapus Setoran Iuran?",
      text: `Apakah Anda yakin ingin menghapus catatan iuran "${nama}" periode ${periode}?`,
      confirmButtonText: "Ya, Hapus Setoran",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    setDeletingId(id);
    setDeleteError(null);

    const res = await deleteIuran(id);
    if (res.error) {
      setDeleteError(res.error);
      showErrorAlert("Gagal Menghapus", res.error);
    } else {
      showSuccessToast(`Setoran iuran "${nama}" berhasil dihapus.`);
    }
    setDeletingId(null);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header & Quick Action */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-base sm:text-lg font-bold flex items-center gap-2">
            Catatan Setoran Iuran
          </h1>
          <p className="text-xs text-base-content/70">
            Daftar pembayaran iuran bulanan per Anggota
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary font-semibold shadow-sm"
        >
          <FiPlus className="w-4 h-4 mr-1" />
          Catat Setoran Baru
        </button>
      </div>

      {/* Alert Error jika ada */}
      {deleteError && (
        <div className="alert alert-error text-sm font-semibold">
          <FiAlertTriangle className="w-5 h-5 shrink-0" />
          <span>{deleteError}</span>
          <button
            onClick={() => setDeleteError(null)}
            className="btn btn-xs btn-ghost ml-auto"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Filter Toolbar in DaisyUI Card */}
      <div className="card bg-base-200 border border-base-300 shadow-sm">
        <div className="card-body p-4 flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <label className="flex w-64 input input-bordered input-sm items-center gap-2">
              <input
                type="text"
                placeholder="Cari nama Anggota..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full"
              />
            </label>

            {/* Dropdown Filter Periode */}
            <div className="flex items-center gap-1.5">
              <select
                value={selectedPeriode}
                onChange={(e) => setSelectedPeriode(e.target.value)}
                className="select select-bordered select-sm font-medium"
              >
                <option value="all">Semua Periode</option>
                {uniquePeriodes.map((p) => (
                  <option key={p} value={p}>
                    Periode: {p}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table Data Setoran Iuran */}
      <div className="card bg-base-200 shadow-sm border border-base-300">
        <div className="card-body p-0 overflow-x-auto">
          <table className="table table-zebra w-full text-sm text-nowrap">
            <thead className="bg-base-300 text-base-content font-bold">
              <tr>
                <th>Nama Anggota</th>
                <th className="text-center">Periode</th>
                <th className="text-center">Tanggal Setor</th>
                <th className="text-center">Pocket</th>
                <th className="text-right">Nominal</th>
                <th className="text-center w-20">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length > 0 ? (
                filteredList.map((item) => (
                  <tr key={item.id}>
                    <td className="font-bold">
                      {item.keluarga?.nama_keluarga || "Anggota (Dihapus)"}
                    </td>
                    <td className="text-center">
                      <span className="badge badge-neutral font-mono text-xs font-bold">
                        {item.periode}
                      </span>
                    </td>
                    <td className="text-center text-base-content/80">
                      {new Date(item.tanggal_setor).toLocaleDateString(
                        "id-ID",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </td>
                    <td className="text-center font-medium">
                      {item.pocket?.nama_pocket || "-"}
                    </td>
                    <td className="text-right font-extrabold text-primary">
                      + Rp {Number(item.nominal).toLocaleString("id-ID")}
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() =>
                          handleDelete(
                            item.id,
                            item.keluarga?.nama_keluarga || "Anggota",
                            item.periode
                          )
                        }
                        className="btn btn-xs btn-error btn-outline"
                        disabled={deletingId === item.id}
                        title="Hapus Catatan Iuran"
                      >
                        {deletingId === item.id ? (
                          <span className="loading loading-spinner loading-xs" />
                        ) : (
                          <FiTrash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-8 text-base-content/60"
                  >
                    Belum ada data setoran iuran.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form Catat Setoran Baru */}
      <IuranForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        listKeluarga={listKeluarga}
        listPocket={listPocket}
        defaultNominal={defaultNominal}
      />
    </div>
  );
}
