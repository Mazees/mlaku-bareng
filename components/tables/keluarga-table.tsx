"use client";

import React, { useState, useMemo } from "react";
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiUsers,
  FiAlertTriangle,
} from "react-icons/fi";
import { KeluargaForm } from "@/components/forms/keluarga-form";
import { deleteKeluarga } from "@/lib/actions/keluarga-actions";
import {
  showConfirmModal,
  showSuccessToast,
  showErrorAlert,
} from "@/lib/utils/swal";

export interface KeluargaItem {
  id: string;
  nama_keluarga: string;
  created_at: string;
}

interface KeluargaTableProps {
  listKeluarga: KeluargaItem[];
}

/**
 * KeluargaTable
 * -------------
 * Komponen Client untuk merender tabel daftar Keluarga beserta fitur
 * pencarian (search) dan tombol modal tambah/edit/hapus.
 */
export function KeluargaTable({ listKeluarga }: KeluargaTableProps) {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<KeluargaItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Filter daftar keluarga berdasar kata kunci pencarian
  const filteredList = useMemo(() => {
    if (!search.trim()) return listKeluarga;
    return listKeluarga.filter((item) =>
      item.nama_keluarga.toLowerCase().includes(search.toLowerCase()),
    );
  }, [listKeluarga, search]);

  const handleOpenCreate = () => {
    setEditData(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: KeluargaItem) => {
    setEditData(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, nama: string) => {
    const result = await showConfirmModal({
      title: "Hapus Data Anggota?",
      text: `Apakah Anda yakin ingin menghapus "${nama}"?`,
      confirmButtonText: "Ya, Hapus Data",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    setDeletingId(id);
    setDeleteError(null);

    const res = await deleteKeluarga(id);
    if (res.error) {
      setDeleteError(res.error);
      showErrorAlert("Gagal Menghapus", res.error);
    } else {
      showSuccessToast(`Keluarga "${nama}" berhasil dihapus.`);
    }
    setDeletingId(null);
  };

  // Fungsi utilitas untuk mengambil 2 huruf inisial (contoh: "KB")
  const getInitials = (nama: string) => {
    const words = nama
      .replace(/^(keluarga\s+)/i, "")
      .trim()
      .split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return nama.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header & Quick Action */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-base sm:text-lg font-bold flex items-center gap-2">
            Daftar Anggota
          </h1>
          <p className="text-xs text-base-content/70">
            Kelola data keluarga peserta iuran kas MLAKUBARENG
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="btn btn-primary font-semibold shadow-sm"
        >
          <FiPlus className="w-4 h-4 mr-1" />
          Tambah Anggota Baru
        </button>
      </div>

      {/* Pesan error hapus jika ada */}
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

      {/* Filter & Search Bar in DaisyUI Card */}
      <div className="card bg-base-200 border border-base-300 shadow-sm">
        <div className="card-body p-4 flex-row flex-wrap items-center justify-between gap-4">
          <label className="flex w-72 input input-bordered input-sm items-center gap-2">
            <input
              type="text"
              placeholder="Cari nama Anggota..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full"
            />
          </label>
          <div className="text-xs font-semibold text-base-content/70">
            Total Terdaftar:{" "}
            <span className="text-base-content font-bold">
              {listKeluarga.length} Anggota
            </span>
          </div>
        </div>
      </div>

      {/* Table Data Anggota */}
      <div className="card bg-base-200 shadow-sm border border-base-300">
        <div className="card-body p-0 overflow-x-auto">
          <table className="table table-zebra w-full text-sm text-nowrap">
            <thead className="bg-base-300 text-base-content font-bold">
              <tr>
                <th>Nama Anggota</th>
                <th className="text-center w-36">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length > 0 ? (
                filteredList.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-bold text-base-content">
                            {item.nama_keluarga}
                          </p>
                          <p className="text-xs text-base-content/60">
                            Terdaftar sejak{" "}
                            {new Date(item.created_at).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="btn btn-xs btn-outline"
                          title="Edit Nama Anggota"
                        >
                          <FiEdit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(item.id, item.nama_keluarga)
                          }
                          className="btn btn-xs btn-error btn-outline"
                          disabled={deletingId === item.id}
                          title="Hapus Anggota"
                        >
                          {deletingId === item.id ? (
                            <span className="loading loading-spinner loading-xs" />
                          ) : (
                            <FiTrash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={2}
                    className="text-center py-8 text-base-content/60"
                  >
                    {search ? (
                      <span>
                        Tidak ditemukan keluarga dengan kata kunci &quot;
                        <b>{search}</b>&quot;.
                      </span>
                    ) : (
                      <span>Belum ada data anggota terdaftar.</span>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form Tambah / Edit */}
      <KeluargaForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editData={editData}
      />
    </div>
  );
}
