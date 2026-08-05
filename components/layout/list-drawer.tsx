"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  FiHome,
  FiUsers,
  FiDollarSign,
  FiCreditCard,
  FiFileText,
  FiSettings,
  FiFolder,
} from "react-icons/fi";

const NAV_LINKS = [
  { href: "/dashboard", label: "Overview", icon: FiHome },
  { href: "/dashboard/keluarga", label: "Keluarga", icon: FiUsers },
  { href: "/dashboard/iuran", label: "Setoran Iuran", icon: FiDollarSign },
  { href: "/dashboard/transaksi", label: "Transaksi Kas", icon: FiCreditCard },
  { href: "/dashboard/pocket", label: "Dompet", icon: FiFolder },
  { href: "/dashboard/laporan", label: "Export Laporan", icon: FiFileText },
  { href: "/dashboard/settings", label: "Pengaturan", icon: FiSettings },
];

export function ListDrawer() {
  const pathname = usePathname();

  // Fungsi tutup drawer instan 0ms saat menu diklik (tanpa nunggu fetch Next.js selesai)
  const handleLinkClick = () => {
    const drawer = document.getElementById(
      "dashboard-drawer",
    ) as HTMLInputElement | null;

    if (drawer && drawer.checked) {
      drawer.checked = false;
    }
  };

  useEffect(() => {
    // Backup: otomatis tutup juga jika navigasi terjadi lewat tombol back/forward browser
    handleLinkClick();
  }, [pathname]);

  return (
    <ul className="menu w-full gap-1 p-0">
      {NAV_LINKS.map((item) => {
        const IconComponent = item.icon;
        const isActive =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={handleLinkClick}
              className={`flex items-center gap-3 py-2.5 px-4 font-medium rounded-md transition-colors ${
                isActive
                  ? "bg-primary text-primary-content font-bold"
                  : "hover:bg-base-300/60 text-base-content"
              }`}
            >
              <IconComponent className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
