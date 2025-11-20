'use client';

import NewRecordLauncher from './NewRecordLauncher';
import { usePathname } from 'next/navigation';
import React from 'react';

export default function FloatingNewRecord() {
  const pathname = usePathname();

  // Hide FAB when already in the new record route
  if (pathname === '/records/new') return null;

  // Determine default category based on current path
  let defaultCategory: 'active' | 'archived' | 'big' = 'active';
  if (pathname.includes('/records/archived')) {
    defaultCategory = 'archived';
  } else if (pathname.includes('/records/big')) {
    defaultCategory = 'big';
  }

  return (
    <div className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-4 z-40 sm:hidden">
      <NewRecordLauncher triggerIsFAB defaultCategory={defaultCategory} />
    </div>
  );
}
