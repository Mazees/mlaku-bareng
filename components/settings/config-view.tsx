"use client";

import React, { useState } from "react";
import { FiSettings, FiEdit2, FiShield, FiCheckCircle } from "react-icons/fi";
import { ConfigModal } from "@/components/forms/config-modal";

export interface ConfigItem {
  id: string;
  nominal_iuran_bulanan: number;
  berlaku_mulai: string;
  created_at: string;
}

interface ConfigViewProps {
  listConfig: ConfigItem[];
  activeNominal: number;
  activeBerlakuMulai: string;
}

/**
 * ConfigView Component
 * --------------------
 * Tampilan Pengaturan Nominal Iuran murni berbasis Bulan (Month-Based).
 */
export function ConfigView({
  listConfig,
  activeNominal,
  activeBerlakuMulai,
}: ConfigViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-base sm:text-lg font-bold flex items-center gap-2">
          <FiSettings className="w-5 h-5 text-primary" />
          Pengaturan Sistem Kas
        </h1>
        <p className="text-xs text-base-content/70">
          Konfigurasi nominal iuran bulanan dan histori kebijakan keuangan
        </p>
      </div>

      {/* Card Nominal Aktif & Action */}
      <div className="card bg-base-200 shadow-sm border border-base-300">
        <div className="card-body p-6">
          <div className="flex not-lg:flex-col items-center justify-between border-b border-base-300 pb-4 gap-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                <FiSettings className="w-5 h-5 text-primary-content" />
              </div>
              <div>
                <h2 className="card-title text-sm">
                  Nominal Iuran Bulanan per Anggota
                </h2>
                <p className="text-xs text-base-content/70">
                  Nominal standar yang berlaku untuk setiap Anggota
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn btn-sm not-lg:w-full btn-primary font-semibold shadow-sm"
            >
              <FiEdit2 className="w-4 h-4 mr-1" />
              Ubah / Tambah Tarif Baru
            </button>
          </div>

          {/* Highlight Card Nominal Aktif */}
          <div className="py-4 bg-base-300 rounded-xl px-5 my-2 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-base-content/70 uppercase tracking-wider">
                Nominal Tarif Aktif saat ini
              </p>
              <p className="text-sm sm:text-base font-extrabold text-primary mt-1">
                Rp {activeNominal.toLocaleString("id-ID")}{" "}
                <span className="text-sm font-normal text-base-content/70">
                  / bulan
                </span>
              </p>
            </div>
            <div className="lg:text-right">
              <span className="badge badge-success font-semibold text-xs gap-1 text-white">
                <FiCheckCircle className="w-3.5 h-3.5" />
                Berlaku sejak:{" "}
                {activeBerlakuMulai
                  ? new Date(activeBerlakuMulai).toLocaleDateString("id-ID", {
                      month: "long",
                      year: "numeric",
                    })
                  : "-"}
              </span>
            </div>
          </div>

          {/* Tabel Riwayat Perubahan Nominal */}
          <div className="pt-4">
            <h3 className="font-bold text-sm mb-3">
              Riwayat Perubahan Tarif Nominal
            </h3>
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full text-sm text-nowrap">
                <thead className="bg-base-300 text-base-content font-bold">
                  <tr>
                    <th>Berlaku Mulai Bulan</th>
                    <th>Nominal Iuran</th>
                  </tr>
                </thead>
                <tbody>
                  {listConfig.length > 0 ? (
                    listConfig.map((item, idx) => {
                      return (
                        <tr key={item.id}>
                          <td className="font-medium capitalize">
                            {new Date(item.berlaku_mulai).toLocaleDateString(
                              "id-ID",
                              {
                                month: "long",
                                year: "numeric",
                              },
                            )}
                          </td>
                          <td className="font-extrabold text-primary">
                            Rp{" "}
                            {Number(item.nominal_iuran_bulanan).toLocaleString(
                              "id-ID",
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="text-center py-6 text-base-content/60"
                      >
                        Belum ada riwayat konfigurasi.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Card Info Keamanan Admin */}
      <div className="card bg-base-200 shadow-sm border border-base-300">
        <div className="card-body flex-row items-center justify-between p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shadow-sm">
              <FiShield className="w-5 h-5 text-secondary-content" />
            </div>
            <div>
              <h3 className="card-title text-base">Keamanan Akun Admin</h3>
              <p className="text-xs text-base-content/70">
                Dikelola secara aman melalui Supabase Auth
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Form Tambah Nominal */}
      <ConfigModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        activeNominal={activeNominal}
      />
    </div>
  );
}
