"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiCalendar, FiFilter } from "react-icons/fi";

interface MonthDateFilterProps {
  defaultValue: string; // Format YYYY-MM
}

interface YearFilterProps {
  defaultValue: string; // Format YYYY (misal: "2026")
  availableYears?: string[];
}

/**
 * MonthDateFilter (Client Component)
 * Native HTML <input type="month"> untuk memfilter bulan di Tabel 1
 */
export function MonthDateFilter({ defaultValue }: MonthDateFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <div className="flex items-center gap-1.5">
      <FiCalendar className="w-4 h-4 text-base-content/60" />
      <input
        type="month"
        defaultValue={defaultValue}
        onChange={(e) => {
          const val = e.target.value;
          if (!val) return;
          const params = new URLSearchParams(searchParams.toString());
          params.set("bulan", val);
          router.push(`/dashboard?${params.toString()}`);
        }}
        className="input input-bordered input-sm font-semibold bg-base-100"
      />
    </div>
  );
}

/**
 * YearFilter (Client Component)
 * Dropdown pilihan Tahun yang sleek (HTML5 tidak memiliki type="year" bawaan)
 */
export function YearFilter({ defaultValue }: YearFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <div className="flex items-center gap-1.5">
      <FiFilter className="w-4 h-4 text-base-content/60" />
      <input
        type="number"
        min="2000"
        max="2099"
        step="1"
        defaultValue={defaultValue}
        placeholder="YYYY"
        onChange={(e) => {
          const val = e.target.value;
          if (val.length === 4) {
            const params = new URLSearchParams(searchParams.toString());
            params.set("tahun", val);
            router.push(`/dashboard?${params.toString()}`);
          }
        }}
        className="input input-bordered input-sm font-bold text-xs bg-base-100 w-24 text-center"
      />
    </div>
  );
}
