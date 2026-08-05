"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FiX, FiCheck, FiAlertCircle, FiDollarSign } from "react-icons/fi";
import { createIuran } from "@/lib/actions/iuran-actions";
import { showErrorAlert, showSuccessToast } from "@/lib/utils/swal";

interface KeluargaOption {
  id: string;
  nama_keluarga: string;
}

interface PocketOption {
  id: string;
  nama_pocket: string;
}

interface IuranFormProps {
  isOpen: boolean;
  onClose: () => void;
  listKeluarga: KeluargaOption[];
  listPocket: PocketOption[];
  defaultNominal?: number;
}

export function IuranForm({
  isOpen,
  onClose,
  listKeluarga,
  listPocket,
  defaultNominal = 100000,
}: IuranFormProps) {
  const [keluargaId, setKeluargaId] = useState("");
  const [nominal, setNominal] = useState(defaultNominal.toString());
  const [pocketId, setPocketId] = useState("");
  const [tanggalSetor, setTanggalSetor] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [keterangan, setKeterangan] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (listPocket.length > 0 && !pocketId) {
        setPocketId(listPocket[0].id);
      }
      if (listKeluarga.length > 0 && !keluargaId) {
        setKeluargaId(listKeluarga[0].id);
      }
    }
  }, [isOpen, listPocket, listKeluarga]);

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
    formData.append("keluarga_id", keluargaId);
    formData.append("nominal", nominal);
    formData.append("pocket_id", pocketId);
    formData.append("tanggal_setor", tanggalSetor);
    if (keterangan.trim()) {
      formData.append("keterangan", keterangan.trim());
    }

    try {
      const res = await createIuran(formData);

      if (res.error) {
        setError(res.error);
        showErrorAlert("Validasi Gagal", res.error);
      } else {
        onClose();
        showSuccessToast("Setoran iuran berhasil dicatat!");
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
            Catat Setoran Iuran
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

          {/* Pilih Anggota */}
          <div className="form-control w-full">
            <label className="label py-1">
              <span className="label-text font-semibold">Pilih Anggota</span>
            </label>
            <select
              required
              value={keluargaId}
              onChange={(e) => setKeluargaId(e.target.value)}
              className="select select-bordered select-sm w-full font-medium"
              disabled={loading}
            >
              {listKeluarga.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama_keluarga}
                </option>
              ))}
            </select>
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
                  min={1000}
                  step={1000}
                  placeholder="100000"
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

          {/* Tanggal Setor */}
          <div className="form-control w-full">
            <label className="label py-1">
              <span className="label-text font-semibold">Tanggal Setor</span>
            </label>
            <input
              type="date"
              required
              value={tanggalSetor}
              onChange={(e) => setTanggalSetor(e.target.value)}
              className="input input-bordered input-sm w-full font-medium"
              disabled={loading}
            />
          </div>

          {/* Keterangan */}
          <div className="form-control w-full">
            <label className="label py-1">
              <span className="label-text font-semibold">Catatan (Opsional)</span>
            </label>
            <input
              type="text"
              placeholder="Catatan tambahan..."
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="input input-bordered input-sm w-full font-medium"
              disabled={loading}
            />
          </div>

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
              Simpan Setoran
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
