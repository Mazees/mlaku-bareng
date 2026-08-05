"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FiX, FiCheck, FiAlertCircle } from "react-icons/fi";
import {
  createKeluarga,
  updateKeluarga,
} from "@/lib/actions/keluarga-actions";
import { showErrorAlert, showSuccessToast } from "@/lib/utils/swal";

interface KeluargaFormProps {
  isOpen: boolean;
  onClose: () => void;
  editData?: { id: string; nama_keluarga: string } | null;
}

/**
 * KeluargaForm
 * ------------
 * Komponen Client modal untuk menambah atau memperbarui nama Keluarga.
 */
export function KeluargaForm({
  isOpen,
  onClose,
  editData,
}: KeluargaFormProps) {
  const [namaKeluarga, setNamaKeluarga] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editData) {
      setNamaKeluarga(editData.nama_keluarga);
    } else {
      setNamaKeluarga("");
    }
    setError(null);
  }, [editData, isOpen]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("nama_keluarga", namaKeluarga);

    try {
      let res;
      if (editData?.id) {
        res = await updateKeluarga(editData.id, formData);
      } else {
        res = await createKeluarga(formData);
      }

      if (res.error) {
        setError(res.error);
        showErrorAlert("Validasi Gagal", res.error);
      } else {
        setNamaKeluarga("");
        onClose();
        showSuccessToast(
          editData
            ? "Data keluarga berhasil diperbarui!"
            : "Anggota baru berhasil ditambahkan!"
        );
      }
    } catch {
      const msg = "Terjadi kesalahan pada sistem. Silakan coba kembali.";
      setError(msg);
      showErrorAlert("Terjadi Kesalahan", msg);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="modal modal-open z-[99999] fixed inset-0 flex items-center justify-center p-4">
      <div className="modal-box bg-base-100 border border-base-300 shadow-2xl max-w-md max-h-[90vh] overflow-y-auto z-10">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-base-300">
          <h3 className="font-bold text-lg text-base-content">
            {editData ? "Edit Data Anggota" : "Tambah Anggota Baru"}
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
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {error && (
            <div className="alert alert-error py-2 text-xs font-semibold">
              <FiAlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-semibold">
                Nama Anggota
              </span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Anggota Budi"
              value={namaKeluarga}
              onChange={(e) => setNamaKeluarga(e.target.value)}
              className="input input-bordered w-full font-medium"
              disabled={loading}
              autoFocus
            />
            <label className="label">
              <span className="label-text-alt text-base-content/60">
                Gunakan nama lengkap keluarga agar mudah dikenali
              </span>
            </label>
          </div>

          {/* Modal Actions */}
          <div className="modal-action pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost font-semibold"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn btn-primary font-semibold"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                <FiCheck className="w-4 h-4 mr-1" />
              )}
              {editData ? "Simpan Perubahan" : "Daftarkan Anggota"}
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
    document.body
  );
}
