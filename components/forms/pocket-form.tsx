"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FiX, FiCheck, FiAlertCircle, FiFolder } from "react-icons/fi";
import { createPocket, updatePocket } from "@/lib/actions/pocket-actions";
import { showErrorAlert, showSuccessToast } from "@/lib/utils/swal";

interface PocketFormProps {
  isOpen: boolean;
  onClose: () => void;
  editData?: { id: string; nama_pocket: string; saldo_awal: number } | null;
}

export function PocketForm({ isOpen, onClose, editData }: PocketFormProps) {
  const [namaPocket, setNamaPocket] = useState("");
  const [saldoAwal, setSaldoAwal] = useState("0");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (editData) {
        setNamaPocket(editData.nama_pocket);
        setSaldoAwal(editData.saldo_awal.toString());
      } else {
        setNamaPocket("");
        setSaldoAwal("0");
      }
    }
  }, [isOpen, editData]);

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
    formData.append("nama_pocket", namaPocket);
    formData.append("saldo_awal", saldoAwal);

    try {
      let res;
      if (editData?.id) {
        res = await updatePocket(editData.id, formData);
      } else {
        res = await createPocket(formData);
      }

      if (res.error) {
        setError(res.error);
        showErrorAlert("Validasi Gagal", res.error);
      } else {
        onClose();
        showSuccessToast(
          editData
            ? "Pocket berhasil diperbarui!"
            : "Pocket baru berhasil ditambahkan!"
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
        <div className="flex items-center justify-between pb-3 border-b border-base-300">
          <h3 className="font-bold text-lg text-base-content flex items-center gap-2">
            {editData ? "Edit Data Pocket" : "Tambah Pocket Baru"}
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

          {/* Nama Pocket */}
          <div className="form-control w-full">
            <label className="label py-1">
              <span className="label-text font-semibold">Nama Pocket</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Kas Cash, Bank BCA"
              value={namaPocket}
              onChange={(e) => setNamaPocket(e.target.value)}
              className="input input-bordered input-sm w-full font-medium"
              disabled={loading}
            />
          </div>

          {/* Saldo Awal (Hanya untuk tambah baru) */}
          {!editData && (
            <div className="form-control w-full">
              <label className="label py-1">
                <span className="label-text font-semibold">Saldo Awal (Rp)</span>
              </label>
              <label className="input input-bordered input-sm flex items-center gap-1 font-bold text-primary">
                <span>Rp</span>
                <input
                  type="number"
                  required
                  min={0}
                  placeholder="0"
                  value={saldoAwal}
                  onChange={(e) => setSaldoAwal(e.target.value)}
                  className="grow text-sm"
                  disabled={loading}
                />
              </label>
            </div>
          )}

          {/* Actions */}
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
              {editData ? "Simpan" : "Tambah Pocket"}
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
