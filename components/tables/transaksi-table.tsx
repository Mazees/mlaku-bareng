"use client";

import React, { useState, useMemo } from "react";
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiCreditCard,
  FiEye,
  FiImage,
  FiArrowUpRight,
  FiArrowDownRight,
  FiAlertTriangle,
  FiFilter,
} from "react-icons/fi";
import { TransaksiForm } from "@/components/forms/transaksi-form";
import {
  TransaksiDetailModal,
  TransaksiDetailItem,
} from "@/components/transaksi/transaksi-detail-modal";
import { deleteTransaksi } from "@/lib/actions/transaksi-actions";
import {
  showConfirmModal,
  showSuccessToast,
  showErrorAlert,
} from "@/lib/utils/swal";

export interface TransaksiItem {
  id: string;
  tanggal: string;
  jenis: "masuk" | "keluar";
  kategori: string;
  nominal: number;
  keterangan?: string;
  bukti_url?: string[];
  pocket_id: string;
  pocket: {
    id: string;
    nama_pocket: string;
  };
}

interface TransaksiTableProps {
  listTransaksi: TransaksiItem[];
  listPocket: { id: string; nama_pocket: string }[];
}

export function TransaksiTable({
  listTransaksi,
  listPocket,
}: TransaksiTableProps) {
  const [search, setSearch] = useState("");
  const [filterJenis, setFilterJenis] = useState<string>("all");
  const [filterPocket, setFilterPocket] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editData, setEditData] = useState<TransaksiItem | null>(null);

  const [detailData, setDetailData] = useState<TransaksiDetailItem | null>(
    null,
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const filteredList = useMemo(() => {
    return listTransaksi.filter((item) => {
      const matchSearch = (item.keterangan || "")
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchJenis = filterJenis === "all" || item.jenis === filterJenis;
      const matchPocket =
        filterPocket === "all" || item.pocket_id === filterPocket;
      const matchStartDate = !startDate || item.tanggal >= startDate;
      const matchEndDate = !endDate || item.tanggal <= endDate;

      return (
        matchSearch &&
        matchJenis &&
        matchPocket &&
        matchStartDate &&
        matchEndDate
      );
    });
  }, [listTransaksi, search, filterJenis, filterPocket, startDate, endDate]);

  const handleResetFilter = () => {
    setSearch("");
    setFilterJenis("all");
    setFilterPocket("all");
    setStartDate("");
    setEndDate("");
  };

  const handleOpenCreate = () => {
    setEditData(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: TransaksiItem) => {
    setEditData(item);
    setIsFormOpen(true);
  };

  const handleOpenDetail = (item: TransaksiItem) => {
    setDetailData(item);
    setIsDetailOpen(true);
  };

  const handleDelete = async (id: string, ket: string, nominal: number) => {
    const labelKet = ket ? `"${ket}"` : "ini";
    const result = await showConfirmModal({
      title: "Hapus Transaksi Kas?",
      text: `Apakah Anda yakin ingin menghapus transaksi ${labelKet} nominal Rp ${nominal.toLocaleString(
        "id-ID",
      )}?`,
      confirmButtonText: "Ya, Hapus Transaksi",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    setDeletingId(id);
    setDeleteError(null);

    const res = await deleteTransaksi(id);
    if (res.error) {
      setDeleteError(res.error);
      showErrorAlert("Gagal Menghapus", res.error);
    } else {
      showSuccessToast("Transaksi kas berhasil dihapus.");
    }
    setDeletingId(null);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header & Quick Action */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-base sm:text-lg font-bold flex items-center gap-2">
            Catatan Transaksi Kas
          </h1>
          <p className="text-xs text-base-content/70">
            Kelola transaksi kas masuk dan pengeluaran operasional / acara
            keluarga
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="btn btn-primary font-semibold shadow-sm"
        >
          <FiPlus className="w-4 h-4 mr-1" />
          Catat Transaksi Baru
        </button>
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

      {/* Filter Toolbar Card */}
      <div className="card bg-base-200 border border-base-300 shadow-xs">
        <div className="card-body">
          <div className="flex items-center justify-between border-b border-base-300/80 pb-2">
            <span className="text-sm font-bold text-base-content/80 uppercase tracking-wider flex items-center gap-1.5">
              Filter Transaksi
            </span>
            <div className="flex items-center gap-3">
              {(search ||
                filterJenis !== "all" ||
                filterPocket !== "all" ||
                startDate ||
                endDate) && (
                <button
                  onClick={handleResetFilter}
                  className="btn btn-xs btn-ghost text-error font-semibold"
                >
                  Reset Filter
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 items-end">
            {/* 1. Cari Keterangan */}
            <div className="form-control w-full">
              <label className="label py-0.5">
                <span className="label-text text-[11px] font-semibold text-base-content/70">
                  Cari Keterangan
                </span>
              </label>
              <label className="flex input input-bordered input-sm items-center gap-2">
                <input
                  type="text"
                  placeholder="Ketik kata kunci..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full text-xs"
                />
              </label>
            </div>

            {/* 2. Jenis Transaksi */}
            <div className="form-control w-full">
              <label className="label py-0.5">
                <span className="label-text text-[11px] font-semibold text-base-content/70">
                  Jenis Transaksi
                </span>
              </label>
              <select
                value={filterJenis}
                onChange={(e) => setFilterJenis(e.target.value)}
                className="select select-bordered select-sm text-xs font-semibold bg-base-100 w-full"
              >
                <option value="all">Semua (Masuk &amp; Keluar)</option>
                <option value="keluar">Pengeluaran Kas</option>
                <option value="masuk">Pemasukan Kas</option>
              </select>
            </div>

            {/* 3. Akun Pocket */}
            <div className="form-control w-full">
              <label className="label py-0.5">
                <span className="label-text text-[11px] font-semibold text-base-content/70">
                  Akun Pocket
                </span>
              </label>
              <select
                value={filterPocket}
                onChange={(e) => setFilterPocket(e.target.value)}
                className="select select-bordered select-sm text-xs font-semibold bg-base-100 w-full"
              >
                <option value="all">Semua Pocket</option>
                {listPocket.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama_pocket}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Dari Tanggal */}
            <div className="form-control w-full">
              <label className="label py-0.5">
                <span className="label-text text-[11px] font-semibold text-base-content/70">
                  Dari Tanggal
                </span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input input-bordered input-sm text-xs font-semibold bg-base-100 w-full"
              />
            </div>

            {/* 5. Sampai Tanggal */}
            <div className="form-control w-full">
              <label className="label py-0.5">
                <span className="label-text text-[11px] font-semibold text-base-content/70">
                  Sampai Tanggal
                </span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input input-bordered input-sm text-xs font-semibold bg-base-100 w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table Transaksi */}
      <div className="card bg-base-200 shadow-sm border border-base-300">
        <div className="card-body p-0 overflow-x-auto">
          <table className="table table-zebra w-full text-sm text-nowrap">
            <thead className="bg-base-300 text-base-content font-bold">
              <tr>
                <th>Tanggal</th>
                <th>Jenis</th>
                <th>Pocket</th>
                <th>Keterangan</th>
                <th className="text-center">Bukti Transaksi</th>
                <th className="text-right">Nominal</th>
                <th className="text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length > 0 ? (
                filteredList.map((item) => {
                  const isMasuk = item.jenis === "masuk";
                  const hasBukti = item.bukti_url && item.bukti_url.length > 0;
                  return (
                    <tr key={item.id}>
                      <td className="text-xs font-medium whitespace-nowrap">
                        {new Date(item.tanggal).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td>
                        <span
                          className={`badge badge-xs font-semibold gap-1 ${
                            isMasuk
                              ? "badge-success text-success-content"
                              : "badge-error text-error-content"
                          }`}
                        >
                          {isMasuk ? (
                            <FiArrowUpRight className="w-3 h-3" />
                          ) : (
                            <FiArrowDownRight className="w-3 h-3" />
                          )}
                          {isMasuk ? "Masuk" : "Keluar"}
                        </span>
                      </td>
                      <td className="font-semibold text-primary text-xs">
                        {item.pocket?.nama_pocket || "-"}
                      </td>
                      <td className="max-w-xs truncate text-xs text-base-content/80 font-medium">
                        {item.keterangan || "-"}
                      </td>
                      <td className="text-center">
                        {hasBukti ? (
                          <button
                            onClick={() => handleOpenDetail(item)}
                            className="badge badge-primary badge-sm font-semibold gap-1 hover:scale-105 transition-transform"
                          >
                            <FiImage className="w-3 h-3" />
                            {item.bukti_url?.length} Foto
                          </button>
                        ) : (
                          <span className="text-xs text-base-content/40 italic">
                            Tanpa Bukti
                          </span>
                        )}
                      </td>
                      <td
                        className={`text-right font-extrabold text-sm ${
                          isMasuk ? "text-primary" : "text-error"
                        }`}
                      >
                        {isMasuk ? "+" : "-"} Rp{" "}
                        {Number(item.nominal).toLocaleString("id-ID")}
                      </td>
                      <td className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenDetail(item)}
                            className="btn btn-xs btn-ghost text-primary"
                            title="Lihat Detail Transaksi"
                          >
                            <FiEye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="btn btn-xs btn-ghost text-base-content"
                            title="Edit"
                          >
                            <FiEdit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              handleDelete(
                                item.id,
                                item.keterangan || "",
                                item.nominal,
                              )
                            }
                            disabled={deletingId === item.id}
                            className="btn btn-xs btn-ghost text-error"
                            title="Hapus"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-8 text-base-content/60"
                  >
                    Belum ada catatan transaksi kas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      <TransaksiForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        listPocket={listPocket}
        editData={editData}
      />

      {/* Detail Modal */}
      <TransaksiDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        data={detailData}
      />
    </div>
  );
}
