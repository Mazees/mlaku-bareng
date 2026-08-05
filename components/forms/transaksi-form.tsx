"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  FiX,
  FiCheck,
  FiAlertCircle,
  FiCreditCard,
  FiUploadCloud,
  FiTrash2,
  FiArrowUpRight,
  FiArrowDownRight,
} from "react-icons/fi";
import {
  createTransaksi,
  updateTransaksi,
} from "@/lib/actions/transaksi-actions";
import { createClient } from "@/utils/supabase/client";
import { compressImage } from "@/lib/utils/image-compressor";
import { showErrorAlert, showSuccessToast } from "@/lib/utils/swal";

interface PocketOption {
  id: string;
  nama_pocket: string;
}

interface PreviewItem {
  id: string;
  url: string;
  file?: File;
  isExisting: boolean;
}

interface TransaksiFormProps {
  isOpen: boolean;
  onClose: () => void;
  listPocket: PocketOption[];
  editData?: {
    id: string;
    jenis: "masuk" | "keluar";
    nominal: number;
    pocket_id: string;
    tanggal: string;
    keterangan?: string;
    bukti_url?: string[];
  } | null;
}

export function TransaksiForm({
  isOpen,
  onClose,
  listPocket,
  editData,
}: TransaksiFormProps) {
  const [jenis, setJenis] = useState<"masuk" | "keluar">("keluar");
  const [nominal, setNominal] = useState("");
  const [pocketId, setPocketId] = useState("");
  const [tanggal, setTanggal] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [keterangan, setKeterangan] = useState("");
  const [previewItems, setPreviewItems] = useState<PreviewItem[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setStatusMessage(null);
      if (editData) {
        setJenis(editData.jenis);
        setNominal(editData.nominal.toString());
        setPocketId(editData.pocket_id);
        setTanggal(editData.tanggal);
        setKeterangan(editData.keterangan || "");
        const existingPreviews: PreviewItem[] = (editData.bukti_url || []).map(
          (url, idx) => ({
            id: `existing_${idx}_${Date.now()}`,
            url,
            isExisting: true,
          }),
        );
        setPreviewItems(existingPreviews);
      } else {
        setJenis("keluar");
        setNominal("");
        setTanggal(new Date().toISOString().split("T")[0]);
        setKeterangan("");
        setPreviewItems([]);
        if (listPocket.length > 0) {
          setPocketId(listPocket[0].id);
        }
      }
    }
  }, [isOpen, editData, listPocket]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  // Handler Pilihan File Gambar (Hanya buat local preview URL, TANPA upload dulu!)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const newItems: PreviewItem[] = Array.from(selectedFiles).map((file) => ({
      id: `new_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      url: URL.createObjectURL(file),
      file,
      isExisting: false,
    }));

    setPreviewItems((prev) => [...prev, ...newItems]);
    e.target.value = "";
  };

  const handleRemoveImage = (idToRemove: string) => {
    setPreviewItems((prev) => {
      const item = prev.find((i) => i.id === idToRemove);
      if (item && !item.isExisting && item.url.startsWith("blob:")) {
        URL.revokeObjectURL(item.url);
      }
      return prev.filter((i) => i.id !== idToRemove);
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (jenis === "keluar" && !keterangan.trim()) {
      const msg = "Keterangan wajib diisi untuk transaksi pengeluaran kas!";
      setError(msg);
      showErrorAlert("Validasi Gagal", msg);
      return;
    }

    setLoading(true);
    setStatusMessage("Mengompresi & mengunggah bukti transaksi...");

    try {
      const supabase = createClient();
      const finalBuktiUrls: string[] = [];

      // 1. Proses foto yang dipilih: kompres & upload HANYA saat submit!
      for (const item of previewItems) {
        if (item.isExisting) {
          finalBuktiUrls.push(item.url);
        } else if (item.file) {
          // Kompresi adaptif di browser (WebP max 1000px, target <= 100 KB)
          const compressedFile = await compressImage(item.file, 1000, 100);
          const fileName = `bukti_${Date.now()}_${Math.random()
            .toString(36)
            .substring(2, 7)}.webp`;

          const { data: uploadData, error: uploadErr } = await supabase.storage
            .from("bukti")
            .upload(fileName, compressedFile, {
              cacheControl: "3600",
              upsert: true,
            });

          if (uploadErr) {
            console.warn("Storage upload warning:", uploadErr.message);
          } else if (uploadData?.path) {
            const { data: publicUrlData } = supabase.storage
              .from("bukti")
              .getPublicUrl(uploadData.path);

            if (publicUrlData?.publicUrl) {
              finalBuktiUrls.push(publicUrlData.publicUrl);
            }
          }
        }
      }

      setStatusMessage("Menyimpan catatan transaksi...");

      // 2. Simpan transaksi ke database
      const formData = new FormData();
      formData.append("jenis", jenis);
      formData.append("nominal", nominal);
      formData.append("pocket_id", pocketId);
      formData.append("tanggal", tanggal);
      formData.append("keterangan", keterangan);
      formData.append("bukti_urls", JSON.stringify(finalBuktiUrls));

      let res;
      if (editData?.id) {
        res = await updateTransaksi(editData.id, formData);
      } else {
        res = await createTransaksi(formData);
      }

      if (res.error) {
        setError(res.error);
        showErrorAlert("Validasi Gagal", res.error);
      } else {
        onClose();
        showSuccessToast(
          editData
            ? "Transaksi berhasil diperbarui!"
            : "Transaksi kas berhasil dicatat!",
        );
      }
    } catch {
      const msg = "Terjadi kesalahan pada sistem. Silakan coba kembali.";
      setError(msg);
      showErrorAlert("Terjadi Kesalahan", msg);
    } finally {
      setLoading(false);
      setStatusMessage(null);
    }
  };

  return createPortal(
    <div className="modal modal-open z-[99999] fixed inset-0 flex items-center justify-center p-4">
      <div className="modal-box bg-base-100 border border-base-300 shadow-2xl max-w-md max-h-[90vh] overflow-y-auto z-10">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-base-300">
          <h3 className="font-bold text-lg text-base-content flex items-center gap-2">
            {editData ? "Edit Transaksi Kas" : "Catat Transaksi Baru"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost"
            disabled={loading}
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="space-y-3 pt-3">
          {error && (
            <div className="alert alert-error py-2 text-xs font-semibold">
              <FiAlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Toggle Jenis */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setJenis("keluar")}
              className={`btn btn-sm font-bold justify-center gap-1.5 ${
                jenis === "keluar"
                  ? "btn-error text-error-content"
                  : "btn-outline border-base-300"
              }`}
            >
              <FiArrowDownRight className="w-4 h-4" />
              Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => setJenis("masuk")}
              className={`btn btn-sm font-bold justify-center gap-1.5 ${
                jenis === "masuk"
                  ? "btn-success text-success-content"
                  : "btn-outline border-base-300"
              }`}
            >
              <FiArrowUpRight className="w-4 h-4" />
              Pemasukan
            </button>
          </div>

          {/* Nominal & Pocket Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="form-control w-full">
              <label className="label py-1">
                <span className="label-text font-semibold">Nominal (Rp)</span>
              </label>
              <label className="input input-bordered input-sm flex items-center gap-1 font-bold text-primary">
                <span>Rp</span>
                <input
                  type="number"
                  required
                  min={100}
                  step={100}
                  placeholder="50000"
                  value={nominal}
                  onChange={(e) => setNominal(e.target.value)}
                  className="grow text-sm"
                  disabled={loading}
                />
              </label>
            </div>

            <div className="form-control w-full">
              <label className="label py-1">
                <span className="label-text font-semibold">Pocket</span>
              </label>
              <select
                required
                value={pocketId}
                onChange={(e) => setPocketId(e.target.value)}
                className="select select-bordered select-sm w-full font-medium"
                disabled={loading}
              >
                {listPocket.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama_pocket}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tanggal Transaksi */}
          <div className="form-control w-full">
            <label className="label py-1">
              <span className="label-text font-semibold">Tanggal</span>
            </label>
            <input
              type="date"
              required
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="input input-bordered input-sm w-full font-medium"
              disabled={loading}
            />
          </div>

          {/* Keterangan */}
          <div className="form-control w-full">
            <label className="label py-1">
              <span className="label-text font-semibold">
                Keterangan
                {jenis === "keluar" && (
                  <span className="text-error font-bold ml-1">*</span>
                )}
              </span>
            </label>
            <textarea
              required={jenis === "keluar"}
              rows={2}
              placeholder="Catatan transaksi..."
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="textarea textarea-bordered w-full font-medium text-xs"
              disabled={loading}
            />
          </div>

          {/* Upload Bukti Transaksi */}
          <div className="form-control w-full text-xs">
            <label className="label py-1">
              <span className="label-text font-semibold text-wrap">
                Bukti Transaksi (Struk, invoice, nota, atau transfer)
              </span>
            </label>

            <div className="border border-dashed border-base-300 rounded-lg p-3 text-center hover:bg-base-200/50 transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                id="bukti-upload"
                onChange={handleFileChange}
                className="hidden"
                disabled={loading}
              />
              <label
                htmlFor="bukti-upload"
                className="cursor-pointer flex flex-col items-center justify-center gap-1"
              >
                <FiUploadCloud className="w-5 h-5 text-primary" />
                <span className="text-xs font-semibold text-base-content">
                  Pilih Foto Bukti Transaksi
                </span>
                <span className="text-[10px] text-base-content/50">
                  Foto di-upload &amp; dioptimasi otomatis saat transaksi
                  dicatat
                </span>
              </label>
            </div>

            {/* List Pratinjau Foto (Local Object URLs) */}
            {previewItems.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {previewItems.map((item) => (
                  <div
                    key={item.id}
                    className="relative group rounded-md overflow-hidden border border-base-300 aspect-video bg-base-300"
                  >
                    <img
                      src={item.url}
                      alt="Pratinjau Bukti"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(item.id)}
                      className="absolute top-1 right-1 btn btn-xs btn-circle btn-error text-white"
                      disabled={loading}
                    >
                      <FiTrash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Status Message saat loading submit */}
          {statusMessage && (
            <div className="text-xs font-semibold text-primary flex items-center justify-center gap-1.5 py-1">
              <span className="loading loading-spinner loading-xs" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Modal Actions */}
          <div className="modal-action pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-sm btn-ghost font-semibold"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn btn-sm btn-primary font-semibold"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                <FiCheck className="w-4 h-4 mr-1" />
              )}
              {editData ? "Simpan" : "Catat Transaksi"}
            </button>
          </div>
        </form>
      </div>
      <div
        role="button"
        tabIndex={0}
        aria-label="Close modal"
        className="modal-backdrop fixed inset-0 bg-black/50 -z-10 cursor-pointer"
        onClick={onClose}
      />
    </div>,
    document.body,
  );
}
