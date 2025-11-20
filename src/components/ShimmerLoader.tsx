'use client';

import React from 'react';

interface ShimmerLoaderProps {
  className?: string;
}

export function ShimmerLoader({ className = '' }: ShimmerLoaderProps) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="mb-2 h-4 w-full rounded bg-gray-200"></div>
      <div className="h-4 w-3/4 rounded bg-gray-200"></div>
    </div>
  );
}

interface TableShimmerLoaderProps {
  rows?: number;
  columns?: number;
  columnStructure?: { width?: string; align?: 'left' | 'right' }[];
}

export function TableShimmerLoader({
  rows = 5,
  columns = 8,
  columnStructure,
}: TableShimmerLoaderProps) {
  const defaultStructure = [
    { width: 'w-28', align: 'left' }, // Date
    { width: 'w-48', align: 'left' }, // Name
    { width: 'w-28', align: 'left' }, // Mobile
    { width: 'w-32', align: 'left' }, // Place
    { width: 'w-20', align: 'left' }, // Type
    { width: 'w-20', align: 'right' }, // Weight
    { width: 'w-28', align: 'right' }, // Amount
    { width: 'w-24', align: 'right' }, // Actions
  ];
  const structure = columnStructure || defaultStructure.slice(0, columns);
  return (
    <div className="space-y-4">
      {/* Stats shimmer */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-white p-4">
            <ShimmerLoader className="mb-2 h-4 w-20" />
            <ShimmerLoader className="h-8 w-16" />
          </div>
        ))}
      </div>

      {/* Search and filter shimmer */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <ShimmerLoader className="h-10 flex-1" />
        <ShimmerLoader className="h-10 w-48" />
      </div>

      {/* Table shimmer */}
      <div className="overflow-hidden rounded-md border">
        <table className="w-full table-fixed">
          <thead className="border-b bg-muted/50">
            <tr>
              {structure.map((col, i) => (
                <th
                  key={i}
                  className={`px-4 py-3 align-middle ${col.align === 'right' ? 'text-right' : 'text-left'} ${col.width || ''}`}
                >
                  <div className="skeleton h-4" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex} className="border-b">
                {structure.map((col, colIndex) => (
                  <td
                    key={colIndex}
                    className={`px-4 py-3 align-middle ${col.align === 'right' ? 'text-right' : 'text-left'} ${col.width || ''}`}
                  >
                    <div className="skeleton h-4" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile list shimmer */}
      <div className="mt-4 block md:hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <ShimmerLoader className="mb-2 h-4 w-32" />
                <ShimmerLoader className="h-4 w-48" />
              </div>
              <ShimmerLoader className="h-10 w-10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ShimmerLoader;
