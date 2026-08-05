"use client";

import React, { useState, useMemo } from "react";
import {
  FiSearch,
  FiFilter,
  FiArrowUpRight,
  FiArrowDownRight,
  FiEye,
  FiImage,
} from "react-icons/fi";
import {
  TransaksiDetailModal,
  TransaksiDetailItem,
} from "@/components/transaksi/transaksi-detail-modal";
import { LaporanNavTabs } from "./laporan-nav-tabs";
import { LaporanPocketItem, LaporanTransaksiItem } from "./laporan-view";

interface PublicTransaksiListProps {
  listTransaksi: LaporanTransaksiItem[];
  listPocket: LaporanPocketItem[];
}

export function PublicTransaksiList({
  listTransaksi,
  listPocket,
}: PublicTransaksiListProps) {
  const [search, setSearch] = useState("");
  const [filterJenis, setFilterJenis] = useState<string>("semua");
  const [filterPocket, setFilterPocket] = useState<string>("semua");

  const [detailData, setDetailData] = useState<TransaksiDetailItem | null>(
    null,
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filteredTransaksi = useMemo(() => {
    return (listTransaksi || []).filter((tx) => {
      const matchSearch =
        search === "" ||
        (tx.keterangan || "").toLowerCase().includes(search.toLowerCase()) ||
        tx.nominal.toString().includes(search);

      const matchJenis =
        filterJenis === "semua" || tx.jenis === filterJenis;

      const matchPocket =
        filterPocket === "semua" ||
        tx.pocket.id === filterPocket ||
        tx.pocket.nama_pocket === filterPocket;

      return matchSearch && matchJenis && matchPocket;
    });
  }, [listTransaksi, search, filterJenis, filterPocket]);

  const handleRowClick = (tx: LaporanTransaksiItem) => {
    setDetailData({
      id: tx.id,
      tanggal: tx.tanggal,
      jenis: tx.jenis,
      nominal: tx.nominal,
      keterangan: tx.keterangan,
      bukti_url: tx.bukti_url,
      pocket: {
        id: tx.pocket.id,
        nama_pocket: tx.pocket.nama_pocket,
      },
    });
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* 1. Navigation / Header Tabs */}
      <LaporanNavTabs />

      {/* 2. Search & Filter Toolbar */}
      <div className="card bg-base-200 border border-base-300 shadow-sm">
        <div className="card-body p-4 flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <label className="flex w-64 input input-bordered input-sm items-center gap-2">
              <FiSearch className="w-4 h-4 text-base-content/50" />
              <input
                type="text"
                placeholder="Cari keterangan / nominal..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full"
              />
            </label>

            {/* Filter Jenis */}
            <div className="flex items-center gap-1.5">
              <FiFilter className="w-4 h-4 text-base-content/60" />
              <select
                value={filterJenis}
                onChange={(e) => setFilterJenis(e.target.value)}
                className="select select-bordered select-sm text-xs font-semibold"
              >
                <option value="semua">Semua Jenis</option>
                <option value="masuk">Pemasukan (+)</option>
                <option value="keluar">Pengeluaran (-)</option>
              </select>
            </div>

            {/* Filter Pocket */}
            <select
              value={filterPocket}
              onChange={(e) => setFilterPocket(e.target.value)}
              className="select select-bordered select-sm text-xs font-semibold"
            >
              <option value="semua">Semua Dompet Kas</option>
              {listPocket.map((p) => (
                <option key={p.pocket_id} value={p.pocket_id}>
                  {p.nama_pocket}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs font-semibold text-base-content/70">
            Menampilkan:{" "}
            <span className="text-base-content font-bold">
              {filteredTransaksi.length} dari {listTransaksi.length} Transaksi
            </span>
          </div>
        </div>
      </div>

      {/* 3. Table Transaksi */}
      <div className="card bg-base-200 shadow-sm border border-base-300">
        <div className="card-body p-0 overflow-x-auto">
          <table className="table table-zebra w-full text-sm text-left text-nowrap">
            <thead className="bg-base-300 text-base-content font-bold">
              <tr>
                <th>No</th>
                <th>Tanggal</th>
                <th>Jenis</th>
                <th>Nominal</th>
                <th>Dompet</th>
                <th>Keterangan</th>
                <th className="text-center">Bukti</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransaksi && filteredTransaksi.length > 0 ? (
                filteredTransaksi.map((tx, idx) => {
                  const isMasuk = tx.jenis === "masuk";
                  const dateObj = new Date(tx.tanggal);
                  const formattedTanggal = dateObj.toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  });

                  return (
                    <tr
                      key={tx.id}
                      onClick={() => handleRowClick(tx)}
                      className="hover:bg-base-300/40 cursor-pointer transition-colors"
                    >
                      <td className="font-semibold text-xs">{idx + 1}</td>
                      <td className="whitespace-nowrap font-semibold text-xs">
                        {formattedTanggal}
                      </td>
                      <td>
                        <span
                          className={`badge badge-sm font-semibold gap-1 ${
                            isMasuk
                              ? "badge-success text-success-content"
                              : "badge-error text-error-content"
                          }`}
                        >
                          {isMasuk ? (
                            <FiArrowUpRight className="w-3.5 h-3.5" />
                          ) : (
                            <FiArrowDownRight className="w-3.5 h-3.5" />
                          )}
                          {isMasuk ? "Masuk" : "Keluar"}
                        </span>
                      </td>
                      <td
                        className={`font-bold whitespace-nowrap ${
                          isMasuk ? "text-primary" : "text-error"
                        }`}
                      >
                        {isMasuk ? "+" : "-"} Rp{" "}
                        {tx.nominal.toLocaleString("id-ID")}
                      </td>
                      <td className="whitespace-nowrap text-xs font-semibold">
                        {tx.pocket?.nama_pocket || "-"}
                      </td>
                      <td className="max-w-[220px] truncate text-xs text-base-content/80">
                        {tx.keterangan || "-"}
                      </td>
                      <td className="text-center">
                        {tx.bukti_url && tx.bukti_url.length > 0 ? (
                          <span className="badge badge-neutral badge-xs font-bold gap-1 py-2 px-2.5">
                            <FiImage className="w-3 h-3" />
                            {tx.bukti_url.length} Foto
                          </span>
                        ) : (
                          <span className="text-base-content/40 text-xs">-</span>
                        )}
                      </td>
                      <td className="text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(tx);
                          }}
                          className="btn btn-xs btn-ghost gap-1 font-semibold"
                        >
                          <FiEye className="w-3.5 h-3.5" />
                          <span>Lihat</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-8 text-xs text-base-content/60"
                  >
                    Tidak ada transaksi yang cocok dengan filter pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail Transaksi (Read-Only) */}
      <TransaksiDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        data={detailData}
      />
    </div>
  );
}
