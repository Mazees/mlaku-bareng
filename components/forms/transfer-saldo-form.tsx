"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { FiX, FiCheck, FiRepeat } from "react-icons/fi";
import { transferSaldo } from "@/lib/actions/transaksi-actions";
import { showErrorAlert, showSuccessToast } from "@/lib/utils/swal";

interface TransferSaldoFormProps {
  onClose: () => void;
  listPocket: { pocket_id: string; nama_pocket: string; saldo: number }[];
}

export function TransferSaldoForm({ onClose, listPocket }: TransferSaldoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fromPocketId, setFromPocketId] = useState("");
  const [toPocketId, setToPocketId] = useState("");
  const [nominal, setNominal] = useState("");
  const [tanggal, setTanggal] = useState(
    new Date().toISOString().split("T")[0],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fromPocketId || !toPocketId) {
      showErrorAlert("Validasi Gagal", "Pilih pocket asal dan tujuan!");
      return;
    }
    if (fromPocketId === toPocketId) {
      showErrorAlert("Validasi Gagal", "Pocket asal dan tujuan tidak boleh sama!");
      return;
    }

    const numNominal = Number(nominal.replace(/[^0-9]/g, ""));
    if (numNominal < 100) {
      showErrorAlert("Validasi Gagal", "Nominal transfer minimal Rp 100");
      return;
    }

    const fromPocket = listPocket.find((p) => p.pocket_id === fromPocketId);
    if (fromPocket && fromPocket.saldo < numNominal) {
      showErrorAlert(
        "Saldo Tidak Cukup",
        `Saldo ${fromPocket.nama_pocket} tidak mencukupi untuk transfer ini.`
      );
      return;
    }

    const toPocket = listPocket.find((p) => p.pocket_id === toPocketId);

    setIsSubmitting(true);

    const autoKeterangan = `Pindah saldo dari ${fromPocket?.nama_pocket || "Kas"} ke ${toPocket?.nama_pocket || "Lainnya"}`;

    const formData = new FormData();
    formData.append("from_pocket_id", fromPocketId);
    formData.append("to_pocket_id", toPocketId);
    formData.append("nominal", numNominal.toString());
    formData.append("tanggal", tanggal);
    formData.append("keterangan", autoKeterangan);

    const result = await transferSaldo(formData);

    if (result.error) {
      showErrorAlert("Gagal Transfer Saldo", result.error);
      setIsSubmitting(false);
    } else {
      showSuccessToast("Saldo berhasil dipindahkan!");
      setIsSubmitting(false);
      onClose();
    }
  };

  const handleNominalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, "");
    if (!rawValue) {
      setNominal("");
      return;
    }
    const formatted = parseInt(rawValue, 10).toLocaleString("id-ID");
    setNominal(formatted);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-base-200 flex items-center justify-between bg-base-100 sticky top-0 z-10">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              Pindah Saldo Pocket
            </h3>
            <p className="text-xs text-base-content/60 mt-0.5">
              Pindahkan saldo antar dompet / akun bank
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost text-base-content/70 hover:text-error hover:bg-error/10 transition-colors"
            disabled={isSubmitting}
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto">
          <form id="transferForm" onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold">Pocket Asal <span className="text-error">*</span></span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={fromPocketId}
                  onChange={(e) => setFromPocketId(e.target.value)}
                  required
                >
                  <option value="" disabled>Pilih Asal...</option>
                  {listPocket.map((p) => (
                    <option key={p.pocket_id} value={p.pocket_id}>
                      {p.nama_pocket} (Rp {p.saldo.toLocaleString("id-ID")})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold">Pocket Tujuan <span className="text-error">*</span></span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={toPocketId}
                  onChange={(e) => setToPocketId(e.target.value)}
                  required
                >
                  <option value="" disabled>Pilih Tujuan...</option>
                  {listPocket.map((p) => (
                    <option key={p.pocket_id} value={p.pocket_id}>
                      {p.nama_pocket}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold">
                    Nominal Transfer <span className="text-error">*</span>
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/50 font-semibold">
                    Rp
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={nominal}
                    onChange={handleNominalChange}
                    className="input input-bordered w-full pl-10 font-bold"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold">
                    Tanggal Transfer <span className="text-error">*</span>
                  </span>
                </label>
                <input
                  type="date"
                  required
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="input input-bordered w-full font-medium"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-base-200 bg-base-50 flex items-center justify-end gap-3 sticky bottom-0">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Batal
          </button>
          <button
            type="submit"
            form="transferForm"
            className="btn btn-primary min-w-[120px]"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <>
                <FiCheck className="w-5 h-5 mr-1" />
                Transfer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
}
