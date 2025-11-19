'use client';

import NewRecordLauncher from './NewRecordLauncher';
import { usePathname } from 'next/navigation';
import React from 'react';

export default function FloatingNewRecord() {
  const pathname = usePathname();

  // Hide FAB when already in the new record route
  if (pathname === '/records/new') return null;
  return (
    <div className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-4 z-40 sm:hidden">
      <NewRecordLauncher triggerIsFAB />
    </div>
  );
}
