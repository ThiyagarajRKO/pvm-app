'use client';

import Link from 'next/link';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function FloatingNewRecord() {
  return (
    <div className="fixed bottom-6 right-4 z-40 sm:hidden">
      <Link href="/records/new">
        <Button
          aria-label="Create new record"
          title="Create new record"
          className="flex h-12 w-12 items-center justify-center rounded-full p-0 shadow-lg"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </Link>
    </div>
  );
}
