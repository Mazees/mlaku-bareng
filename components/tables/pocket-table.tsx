"use client";

import React, { useState, useMemo } from "react";
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiFolder,
  FiCreditCard,
  FiDollarSign,
  FiAlertTriangle,
  FiRepeat,
} from "react-icons/fi";
import { PocketForm } from "@/components/forms/pocket-form";
import { TransferSaldoForm } from "@/components/forms/transfer-saldo-form";
import { deletePocket } from "@/lib/actions/pocket-actions";
import {
  showConfirmModal,
  showSuccessToast,
  showErrorAlert,
} from "@/lib/utils/swal";

export interface PocketViewItem {
  pocket_id: string;
  nama_pocket: string;
  saldo_awal: number;
  saldo: number;
}

interface PocketTableProps {
  listPocket: PocketViewItem[];
}

/**
 * PocketTable Component
 * ---------------------
 * Tampilan Client Component untuk merender daftar pocket kas (Cash & Bank),
 * dilengkapi pencarian, ringkasan saldo, serta aksi tambah/edit/hapus.
 */
export function PocketTable({ listPocket }: PocketTableProps) {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [editData, setEditData] = useState<{
    id: string;
    nama_pocket: string;
    saldo_awal: number;
  } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const filteredList = useMemo(() => {
    if (!search.trim()) return listPocket;
    return listPocket.filter((item) =>
      item.nama_pocket.toLowerCase().includes(search.toLowerCase()),
    );
  }, [listPocket, search]);

  const totalSaldoSemua = useMemo(() => {
    return listPocket.reduce((acc, item) => acc + Number(item.saldo || 0), 0);
  }, [listPocket]);

  const handleOpenCreate = () => {
    setEditData(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: PocketViewItem) => {
    setEditData({
      id: item.pocket_id,
      nama_pocket: item.nama_pocket,
      saldo_awal: Number(item.saldo_awal || 0),
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, nama: string) => {
    const result = await showConfirmModal({
      title: "Hapus Akun Pocket?",
      text: `Apakah Anda yakin ingin menghapus pocket "${nama}"?`,
      confirmButtonText: "Ya, Hapus Pocket",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    setDeletingId(id);
    setDeleteError(null);

    const res = await deletePocket(id);
    if (res.error) {
      setDeleteError(res.error);
      showErrorAlert("Gagal Menghapus", res.error);
    } else {
      showSuccessToast(`Pocket "${nama}" berhasil dihapus.`);
    }
    setDeletingId(null);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header & Quick Action */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-base sm:text-lg font-bold flex items-center gap-2">
            Dompet Kas
          </h1>
          <p className="text-xs text-base-content/70">
            Kelola akun tempat penyimpanan dana kas tunai maupun rekening bank
          </p>
        </div>
        <div className="flex not-lg:flex-col gap-2">
          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="btn btn-primary btn-outline font-semibold shadow-sm"
          >
            <FiRepeat className="w-4 h-4 mr-1" />
            Pindah Saldo
          </button>
          <button
            onClick={handleOpenCreate}
            className="btn btn-primary font-semibold shadow-sm"
          >
            <FiPlus className="w-4 h-4 mr-1" />
            Tambah Pocket Baru
          </button>
        </div>
      </div>

      {/* Pesan error jika ada */}
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

      {/* Grid Summary Cards Per Pocket */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {listPocket.map((pocket) => {
          const isBank = pocket.nama_pocket.toLowerCase().includes("bank");
          return (
            <div
              key={pocket.pocket_id}
              className="card bg-base-200 shadow-sm border border-base-300 relative overflow-hidden"
            >
              <div className="card-body p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
                      {isBank ? (
                        <FiCreditCard className="w-5 h-5" />
                      ) : (
                        <FiDollarSign className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-base">
                        {pocket.nama_pocket}
                      </h3>
                      <p className="text-xs text-base-content/60 font-medium">
                        Saldo Awal: Rp{" "}
                        {Number(pocket.saldo_awal || 0).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(pocket)}
                      className="btn btn-xs btn-ghost btn-square"
                      title="Edit Pocket"
                    >
                      <FiEdit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        handleDelete(pocket.pocket_id, pocket.nama_pocket)
                      }
                      disabled={deletingId === pocket.pocket_id}
                      className="btn btn-xs btn-ghost text-error btn-square"
                      title="Hapus Pocket"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-base-300/80 flex items-center justify-between">
                  <span className="text-xs font-semibold text-base-content/70">
                    Saldo Real-Time saat ini:
                  </span>
                  <span className="text-sm sm:text-base font-extrabold text-primary">
                    Rp {Number(pocket.saldo || 0).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table Data Pocket */}
      <div className="card bg-base-200 shadow-sm border border-base-300">
        <div className="card-body p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-2">
            <label className="flex w-72 input input-bordered input-sm items-center gap-2">
              <input
                type="text"
                placeholder="Cari nama Pocket..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs sm:text-sm"
              />
            </label>
            <div className="text-xs font-bold text-base-content/70">
              Total Seluruh Kas:{" "}
              <span className="text-primary text-sm font-extrabold">
                Rp {totalSaldoSemua.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="table table-zebra w-full text-sm text-nowrap">
              <thead className="bg-base-300 text-base-content font-bold">
                <tr>
                  <th>Nama Pocket</th>
                  <th className="text-right">Saldo Awal</th>
                  <th className="text-right">Saldo Saat Ini</th>
                  <th className="text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.length > 0 ? (
                  filteredList.map((item) => (
                    <tr key={item.pocket_id}>
                      <td className="font-bold">{item.nama_pocket}</td>
                      <td className="text-right text-base-content/70 font-medium">
                        Rp{" "}
                        {Number(item.saldo_awal || 0).toLocaleString("id-ID")}
                      </td>
                      <td className="text-right font-extrabold text-primary">
                        Rp {Number(item.saldo || 0).toLocaleString("id-ID")}
                      </td>
                      <td className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="btn btn-xs btn-ghost text-primary font-semibold"
                          >
                            <FiEdit2 className="w-3.5 h-3.5 mr-0.5" />
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              handleDelete(item.pocket_id, item.nama_pocket)
                            }
                            disabled={deletingId === item.pocket_id}
                            className="btn btn-xs btn-ghost text-error font-semibold"
                          >
                            <FiTrash2 className="w-3.5 h-3.5 mr-0.5" />
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-6 text-base-content/60"
                    >
                      Belum ada data pocket kas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      <PocketForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editData={editData}
      />
      {/* Modal Form Pindah Saldo */}
      {isTransferModalOpen && (
        <TransferSaldoForm
          listPocket={listPocket}
          onClose={() => setIsTransferModalOpen(false)}
        />
      )}
    </div>
  );
}
