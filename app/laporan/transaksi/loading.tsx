import React from "react";
import { PublicNavbar } from "@/components/layout/public-navbar";

export default function PublicTransaksiLoading() {
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

        {/* Search & Filter Bar Skeleton */}
        <div className="card bg-base-200 border border-base-300 shadow-sm p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="skeleton h-9 w-72 rounded-lg bg-base-300" />
          <div className="skeleton h-5 w-36 rounded-md bg-base-300" />
        </div>

        {/* Table Transaksi Skeleton */}
        <div className="card bg-base-200 shadow-sm border border-base-300 p-6 space-y-4">
          <div className="skeleton h-10 w-full rounded-md bg-base-300" />
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-4 py-3 border-b border-base-300/40"
              >
                <div className="skeleton h-4 w-20 rounded bg-base-300" />
                <div className="skeleton h-6 w-24 rounded-full bg-base-300" />
                <div className="skeleton h-4 w-32 rounded bg-base-300" />
                <div className="skeleton h-4 w-24 rounded bg-base-300" />
                <div className="skeleton h-4 w-40 rounded bg-base-300" />
                <div className="skeleton h-7 w-16 rounded bg-base-300" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </PublicNavbar>
  );
}
