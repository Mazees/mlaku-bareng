import React from "react";
import { FiLoader } from "react-icons/fi";

/**
 * Dashboard Loading Skeleton (Next.js App Router)
 * -----------------------------------------------
 * File resmi Next.js yang otomatis ditampilkan (0ms delay) ketika
 * Server Component di dalam /dashboard sedang mengambil data dari Supabase.
 * Menggunakan utility class "skeleton" dari DaisyUI v5.
 */
export default function DashboardLoading() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-pulse">
      {/* Header Skeleton + Status Loading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="skeleton h-8 w-64 rounded-md bg-base-300" />
          <div className="skeleton h-4 w-96 rounded-md bg-base-300/70" />
        </div>
      </div>

      {/* Filter / Search Bar Card Skeleton */}
      <div className="card bg-base-200 border border-base-300 shadow-xs">
        <div className="card-body p-4 flex-row flex-wrap items-center justify-between gap-4">
          <div className="skeleton h-9 w-72 rounded-lg bg-base-300" />
          <div className="skeleton h-5 w-36 rounded-md bg-base-300" />
        </div>
      </div>

      {/* Main Table Card Skeleton */}
      <div className="card bg-base-200 shadow-xl border border-base-300">
        <div className="card-body p-6 space-y-4">
          {/* Table Header Bar Skeleton */}
          <div className="skeleton h-10 w-full rounded-md bg-base-300" />

          {/* Table Row Skeletons */}
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4, 5].map((idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-4 py-2 border-b border-base-300/40"
              >
                <div className="flex items-center gap-3 w-1/2">
                  <div className="skeleton w-10 h-10 rounded-lg bg-base-300 shrink-0" />
                  <div className="space-y-1.5 w-full">
                    <div className="skeleton h-4 w-3/4 rounded bg-base-300" />
                    <div className="skeleton h-3 w-1/2 rounded bg-base-300/60" />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="skeleton h-7 w-20 rounded-md bg-base-300" />
                  <div className="skeleton h-7 w-7 rounded-md bg-base-300" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
