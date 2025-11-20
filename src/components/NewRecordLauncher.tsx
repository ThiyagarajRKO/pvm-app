'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import NewRecordPanel from './NewRecordPanel';

export default function NewRecordLauncher({
  triggerIsFAB = false,
  onSuccess,
  defaultCategory = 'active',
}: {
  triggerIsFAB?: boolean;
  onSuccess?: () => void;
  defaultCategory?: 'active' | 'archived' | 'big';
}) {
  const [open, setOpen] = React.useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      {/* Trigger button */}
      {triggerIsFAB ? (
        <Button
          aria-label="Create new record"
          title="Create new record"
          onClick={handleOpen}
          className="flex h-12 w-12 items-center justify-center rounded-full p-0 shadow-lg"
        >
          <Plus className="h-5 w-5" />
        </Button>
      ) : (
        <Button onClick={handleOpen}>
          <Plus className="mr-2 h-4 w-4" />
          New Record
        </Button>
      )}

      {open && (
        <NewRecordPanel
          redirectTo={undefined}
          onClose={handleClose}
          onBeginClose={() => {}}
          onSuccess={onSuccess}
          defaultCategory={defaultCategory}
        />
      )}
    </>
  );
}
