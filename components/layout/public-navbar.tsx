"use client";

import React, { useEffect } from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiGrid, FiEye, FiLock, FiMenu, FiHome } from "react-icons/fi";
import { useIsLoggedIn } from "@/lib/hooks/use-auth";

interface PublicNavbarProps {
  children: React.ReactNode;
}

export function PublicNavbar({ children }: PublicNavbarProps) {
  const isLoggedIn = useIsLoggedIn();
  const pathname = usePathname();

  // Tutup drawer mobile secara instan saat link diklik (0ms delay)
  const handleCloseDrawer = () => {
    const drawer = document.getElementById(
      "public-drawer",
    ) as HTMLInputElement | null;

    if (drawer && drawer.checked) {
      drawer.checked = false;
    }
  };

  return (
    <div className="drawer bg-base-100 text-base-content font-sans min-h-screen">
      {/* Checkbox Toggle Drawer untuk Mobile */}
      <input id="public-drawer" type="checkbox" className="drawer-toggle" />

      {/* Area Konten Utama */}
      <div className="drawer-content flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="navbar bg-base-100 border-t-4 border-t-primary border-b border-base-300 px-4 lg:px-8 py-3.5 sticky top-0 z-40 h-18">
          <div className="flex-1 min-w-0">
            <Link
              href="/"
              onClick={handleCloseDrawer}
              className="flex items-center gap-3"
            >
              <img
                src="/icon.png"
                alt="MLAKUBARENG Logo"
                className="w-10 h-10 object-contain shrink-0"
              />
              <div className="truncate">
                <span className="font-bold text-primary lg:text-lg block leading-tight truncate tracking-tight">
                  MLAKUBARENG
                </span>
                <span className="text-xs text-base-content/60 hidden lg:block mt-0.5 font-medium">
                  Portal Kas &amp; Transparansi Keuangan Anggota Mlaku
                  Bareng
                </span>
              </div>
            </Link>
          </div>

          <div className="flex-none flex items-center gap-2 lg:gap-3">
            {/* Tombol Beranda (Versi Desktop) */}
            <Link
              href="/"
              className={`btn btn-sm lg:btn-md font-semibold rounded-lg hidden lg:inline-flex items-center ${
                pathname === "/" ? "btn-primary" : "btn-outline border-base-300"
              }`}
            >
              <FiHome className="w-4 h-4 mr-1" />
              Beranda
            </Link>

            {/* Tombol Laporan (Versi Desktop) */}
            <Link
              href="/laporan"
              className={`btn btn-sm lg:btn-md font-semibold rounded-lg hidden lg:inline-flex items-center ${
                pathname.startsWith("/laporan")
                  ? "btn-primary"
                  : "btn-outline border-base-300"
              }`}
            >
              <FiEye className="w-4 h-4 mr-1" />
              Laporan Publik
            </Link>

            {/* Tombol Login Admin (Versi Desktop) */}
            <Link
              href="/login"
              className="btn btn-sm btn-outline border-base-300 lg:btn-md font-semibold rounded-lg hidden lg:inline-flex items-center"
            >
              <FiLock className="w-4 h-4 mr-1" />
              {isLoggedIn ? "Buka Dashboard" : "Login"}
            </Link>

            {/* Tombol Hamburger Drawer (Versi Mobile) */}
            <label
              htmlFor="public-drawer"
              aria-label="open sidebar"
              className="btn btn-square btn-ghost lg:hidden"
            >
              <FiMenu className="w-6 h-6" />
            </label>
          </div>
        </header>

        {/* Isi Halaman */}
        <div className="flex-1 flex flex-col">{children}</div>
      </div>

      {/* Area Drawer Sidebar Mobile */}
      <div className="drawer-side z-50">
        <label
          htmlFor="public-drawer"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <div className="menu bg-base-200 text-base-content min-h-full w-72 p-6 flex flex-col justify-between border-r border-base-300">
          <div>
            {/* Brand Header */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-base-300">
              <img
                src="/icon.png"
                alt="MLAKUBARENG Logo"
                className="w-10 h-10 object-contain shrink-0"
              />
              <div>
                <h2 className="font-bold text-base tracking-tight leading-none">
                  MLAKUBARENG
                </h2>
                <p className="text-xs text-base-content/60 mt-1 font-medium">
                  Kas &amp; Transparansi
                </p>
              </div>
            </div>

            {/* Menu Navigasi Mobile */}
            <ul className="menu w-full gap-2 p-0">
              <li>
                <Link
                  href="/"
                  onClick={handleCloseDrawer}
                  className={`flex items-center gap-3 py-3 px-4 font-semibold rounded-lg w-full transition-colors ${
                    pathname === "/"
                      ? "bg-primary text-primary-content"
                      : "hover:bg-base-300/60"
                  }`}
                >
                  <FiHome className="w-5 h-5" />
                  <span>Beranda</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/laporan"
                  onClick={handleCloseDrawer}
                  className={`flex items-center gap-3 py-3 px-4 font-semibold rounded-lg w-full transition-colors ${
                    pathname.startsWith("/laporan")
                      ? "bg-primary text-primary-content"
                      : "hover:bg-base-300/60"
                  }`}
                >
                  <FiEye className="w-5 h-5" />
                  <span>Laporan Publik</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  onClick={handleCloseDrawer}
                  className="justify-start gap-3 py-3 px-4 font-semibold rounded-lg w-full transition-colors btn btn-outline btn-primary"
                >
                  <FiLock className="w-5 h-5" />
                  <span>{isLoggedIn ? "Buka Dashboard" : "Login"}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Footer Drawer */}
          <div className="pt-4 border-t border-base-300 text-center">
            <p className="text-xs font-bold text-base-content/60">
              Anggota Mlaku Bareng
            </p>
            <p className="text-[10px] text-base-content/40 mt-0.5">
              Versi 1.0 — Transparan &amp; Jujur
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
