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
}

export function TableShimmerLoader({
  rows = 5,
  columns = 8,
}: TableShimmerLoaderProps) {
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
      <div className="rounded-md border">
        <div className="border-b bg-muted/50 px-4 py-3">
          <div className="grid grid-cols-8 gap-4">
            {Array.from({ length: columns }).map((_, i) => (
              <ShimmerLoader key={i} className="h-4" />
            ))}
          </div>
        </div>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="border-b px-4 py-3">
            <div className="grid grid-cols-8 gap-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <ShimmerLoader key={colIndex} className="h-4" />
              ))}
            </div>
          </div>
        ))}
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
