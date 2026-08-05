import React from "react";
import { PublicNavbar } from "@/components/layout/public-navbar";

export default function PublicLaporanLoading() {
  return (
    <PublicNavbar>
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 lg:p-8 animate-pulse space-y-6">
        {/* Header Tabs Skeleton */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-base-300 pb-4">
          <div className="space-y-2">
            <div className="skeleton h-7 w-56 rounded-md bg-base-300" />
            <div className="skeleton h-4 w-72 rounded-md bg-base-300/70" />
          </div>
          <div className="skeleton h-10 w-60 rounded-xl bg-base-300" />
        </div>

        {/* DaisyUI Stats Component Skeleton (Persis Dashboard) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 bg-base-200 p-4 rounded-xl border border-base-300 shadow-sm">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2 p-2">
              <div className="skeleton h-4 w-28 bg-base-300" />
              <div className="skeleton h-7 w-36 bg-base-300" />
              <div className="skeleton h-3 w-44 bg-base-300/60" />
            </div>
          ))}
        </div>

        {/* Grid: Saldo Per Pocket & Transaksi Terakhir Skeleton (Persis Dashboard) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card bg-base-200 shadow-sm border border-base-300 p-5 space-y-4">
            <div className="skeleton h-5 w-48 bg-base-300" />
            <div className="space-y-2.5 pt-1">
              {[1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className="skeleton h-12 w-full rounded-lg bg-base-300"
                />
              ))}
            </div>
          </div>

          <div className="card bg-base-200 shadow-sm border border-base-300 p-5 lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <div className="skeleton h-5 w-48 bg-base-300" />
              <div className="skeleton h-4 w-24 bg-base-300" />
            </div>
            <div className="skeleton h-44 w-full rounded-lg bg-base-300" />
          </div>
        </div>

        {/* Rekap Iuran Bulanan Skeleton */}
        <div className="card bg-base-200 shadow-sm border border-base-300 p-5 space-y-4">
          <div className="skeleton h-6 w-48 bg-base-300" />
          <div className="skeleton h-40 w-full rounded-xl bg-base-300" />
        </div>

        {/* Rekap Iuran Tahunan Skeleton */}
        <div className="card bg-base-200 shadow-sm border border-base-300 p-5 space-y-4">
          <div className="skeleton h-6 w-48 bg-base-300" />
          <div className="skeleton h-52 w-full rounded-xl bg-base-300" />
        </div>
      </main>
    </PublicNavbar>
  );
}
