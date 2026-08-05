import Link from "next/link";
import React from "react";
import { FiMenu } from "react-icons/fi";
import { ListDrawer } from "@/components/layout/list-drawer";
import { LogoutButton } from "@/components/layout/logout-button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="drawer lg:drawer-open bg-base-100 text-base-content min-h-screen">
      {/* Drawer Toggle Checkbox for Mobile */}
      <input id="dashboard-drawer" type="checkbox" className="drawer-toggle" />

      {/* Main Content Area */}
      <div className="drawer-content flex flex-col">
        {/* Top Navbar Component (Microsoft Excel 365 Ribbon Header Style) */}
        <div className="navbar bg-base-100 border-b border-base-300 shadow-xs lg:px-8">
          <div className="flex-none lg:hidden">
            <label
              htmlFor="dashboard-drawer"
              aria-label="open sidebar"
              className="btn btn-square btn-ghost btn-sm"
            >
              <FiMenu className="w-5 h-5" />
            </label>
          </div>
          <div className="flex-1 ml-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-base lg:text-lg">Dashboard</span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto bg-base-100">
          {children}
        </main>
      </div>

      {/* Sidebar Drawer Area */}
      <div className="drawer-side z-30">
        <label
          htmlFor="dashboard-drawer"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>

        <div className="menu bg-base-200 text-base-content min-h-full w-72 p-4 flex flex-col justify-between border-r border-base-300">
          <div>
            {/* Brand Title (Microsoft Excel Green Style) */}
            <div className="p-2 mb-4 flex items-center gap-3">
              <img
                src="/icon.png"
                alt="MLAKUBARENG Logo"
                className="w-9 h-9 object-contain shrink-0"
              />
              <div>
                <h2 className="font-bold text-base tracking-tight leading-none text-base-content">
                  MLAKUBARENG
                </h2>
                <p className="text-xs text-base-content/60 mt-1 font-medium">
                  Admin Bendahara
                </p>
              </div>
            </div>

            {/* Navigation Menu (ListDrawer Client Component) */}
            <ListDrawer />
          </div>

          {/* Sidebar Footer Action (With REAL Logout Server Action!) */}
          <div className="pt-4 border-t border-base-300 space-y-2">
            <label htmlFor="dashboard-drawer" className="w-full">
              <Link
                href="/"
                className="btn btn-sm btn-outline border-base-300 w-full justify-center gap-2 font-semibold rounded-md"
              >
                Lihat Web Publik
              </Link>
            </label>
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  );
}
