"use client";

import React, { useState } from "react";
import { FiLogOut } from "react-icons/fi";
import { logout } from "@/app/login/actions";
import { showConfirmModal } from "@/lib/utils/swal";

/**
 * LogoutButton Component
 * ----------------------
 * Tombol Logout interaktif dengan konfirmasi SweetAlert2 seragam.
 */
export function LogoutButton() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const res = await showConfirmModal({
      title: "Keluar dari Sesi Admin?",
      text: "Apakah Anda yakin ingin keluar? Anda harus login kembali untuk mengelola kas.",
      confirmButtonText: "Ya, Keluar",
      cancelButtonText: "Batal",
      isDanger: true,
    });

    if (res.isConfirmed) {
      setLoading(true);
      await logout();
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="btn btn-sm btn-error w-full justify-center gap-2 font-semibold rounded-md shadow-xs"
    >
      {loading ? (
        <span className="loading loading-spinner loading-xs" />
      ) : (
        <FiLogOut className="w-4 h-4" />
      )}
      Keluar (Logout)
    </button>
  );
}
