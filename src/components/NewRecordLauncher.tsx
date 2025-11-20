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
          className="flex h-14 w-14 items-center justify-center rounded-full p-0 shadow-lg"
        >
          <Plus className="h-6 w-6" />
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
