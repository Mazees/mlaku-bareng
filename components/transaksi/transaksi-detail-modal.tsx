"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  FiX,
  FiCalendar,
  FiFolder,
  FiFileText,
  FiImage,
  FiExternalLink,
  FiCheckCircle,
  FiArrowUpRight,
  FiArrowDownRight,
  FiMaximize2,
} from "react-icons/fi";

export interface TransaksiDetailItem {
  id: string;
  tanggal: string;
  jenis: "masuk" | "keluar";
  kategori?: string;
  nominal: number;
  keterangan?: string;
  bukti_url?: string[];
  pocket: {
    id: string;
    nama_pocket: string;
  };
}

interface TransaksiDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: TransaksiDetailItem | null;
}

export function TransaksiDetailModal({
  isOpen,
  onClose,
  data,
}: TransaksiDetailModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !data || !mounted) return null;

  const isMasuk = data.jenis === "masuk";
  const formattedTanggal = new Date(data.tanggal).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return createPortal(
    <div className="modal modal-open z-[99999] fixed inset-0 flex items-center justify-center p-4">
      <div className="modal-box bg-base-100 border border-base-300 shadow-2xl max-w-lg p-6 max-h-[90vh] overflow-y-auto z-10">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-base-300">
          <div className="flex items-center gap-2">
            <span
              className={`badge font-bold gap-1 text-xs py-2 px-3 ${
                isMasuk
                  ? "badge-success text-success-content"
                  : "badge-error text-error-content"
              }`}
            >
              {isMasuk ? (
                <FiArrowUpRight className="w-4 h-4" />
              ) : (
                <FiArrowDownRight className="w-4 h-4" />
              )}
              {isMasuk ? "Pemasukan Kas" : "Pengeluaran Kas"}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Nominal & Summary Card */}
        <div className="py-5 text-center bg-base-200/70 border border-base-300 rounded-2xl my-4">
          <p className="text-xs font-bold text-base-content/60 uppercase tracking-wider">
            Total Nominal Transaksi
          </p>
          <h2
            className={`text-sm sm:text-base font-extrabold mt-1 ${
              isMasuk ? "text-primary" : "text-error"
            }`}
          >
            {isMasuk ? "+" : "-"} Rp {data.nominal.toLocaleString("id-ID")}
          </h2>
          <p className="text-xs text-base-content/70 mt-1 font-medium flex items-center justify-center gap-1">
            <FiCalendar className="w-3.5 h-3.5" />
            {formattedTanggal}
          </p>
        </div>

        {/* Transaction Detail Properties List */}
        <div className="space-y-3.5 text-sm">
          {/* Pocket / Akun Kas */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-base-200/50 border border-base-300">
            <span className="text-xs font-semibold text-base-content/70 flex items-center gap-2">
              <FiFolder className="w-4 h-4 text-primary" />
              Sumber / Tujuan Pocket
            </span>
            <span className="font-bold text-primary">
              {data.pocket?.nama_pocket || "-"}
            </span>
          </div>

          {/* Keterangan */}
          <div className="p-3.5 rounded-xl bg-base-200/50 border border-base-300 space-y-1">
            <span className="text-xs font-semibold text-base-content/70 flex items-center gap-2">
              <FiFileText className="w-4 h-4 text-primary" />
              Keterangan Transaksi
            </span>
            <p className="text-xs lg:text-sm font-medium text-base-content whitespace-pre-line pt-0.5">
              {data.keterangan || "Tidak ada catatan keterangan."}
            </p>
          </div>

          {/* Galeri Foto Bukti Transaksi */}
          <div className="p-3.5 rounded-xl bg-base-200/50 border border-base-300 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-base-content/70 flex items-center gap-2">
                <FiImage className="w-4 h-4 text-primary" />
                Bukti Transaksi
              </span>
              <span className="text-[10px] font-bold badge badge-neutral">
                {data.bukti_url?.length || 0} Foto
              </span>
            </div>

            {data.bukti_url && data.bukti_url.length > 0 ? (
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                {data.bukti_url.map((url, idx) => (
                  <div
                    key={idx}
                    className="group relative rounded-lg overflow-hidden border border-base-300 aspect-video bg-base-300 cursor-pointer shadow-xs"
                    onClick={() => setSelectedImage(url)}
                  >
                    <img
                      src={url}
                      alt={`Bukti transaksi ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1">
                      <FiMaximize2 className="w-4 h-4" />
                      Perbesar
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-base-content/50 italic pt-1">
                Belum ada foto bukti transaksi yang diunggah.
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="modal-action pt-2">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-primary font-semibold w-full"
          >
            <FiCheckCircle className="w-4 h-4 mr-1" />
            Tutup Detail
          </button>
        </div>
      </div>

      {/* Lightbox Modal / Popup Perbesar Foto Struk */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-3xl w-full max-h-[90vh] bg-base-100 rounded-2xl overflow-hidden shadow-2xl p-2">
            <div className="flex items-center justify-between p-2 border-b border-base-300">
              <span className="text-xs font-bold text-base-content">
                Pratinjau Bukti Struk Transaksi
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={selectedImage}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-xs btn-outline font-semibold gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FiExternalLink className="w-3 h-3" />
                  Buka Asli
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="btn btn-xs btn-circle btn-ghost"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-2 flex items-center justify-center overflow-auto max-h-[80vh]">
              <img
                src={selectedImage}
                alt="Foto Struk Transaksi Full"
                className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-md"
              />
            </div>
          </div>
        </div>
      )}

      <div
        role="button"
        tabIndex={0}
        aria-label="Close modal"
        className="modal-backdrop fixed inset-0 bg-black/50 -z-10 cursor-pointer"
        onClick={onClose}
      />
    </div>,
    document.body
  );
}
