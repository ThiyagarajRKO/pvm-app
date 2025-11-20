'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import NewRecordPanel from './NewRecordPanel';

export default function NewRecordLauncher({
  triggerIsFAB = false,
  onSuccess,
}: {
  triggerIsFAB?: boolean;
  onSuccess?: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [showTrigger, setShowTrigger] = React.useState(true);

  const handleOpen = () => {
    setOpen(true);
    setShowTrigger(false);
  };

  const handleBeginClose = () => {
    // as soon as closing starts, show the trigger immediately
    setShowTrigger(true);
  };

  const handleClose = () => {
    // complete the close and unmount panel
    setOpen(false);
    setShowTrigger(true);
  };

  return (
    <>
      {/* Trigger button: always rendered but hidden when we don't want it visible */}
      {triggerIsFAB ? (
        <Button
          aria-label="Create new record"
          title="Create new record"
          onClick={handleOpen}
          className={`flex h-12 w-12 items-center justify-center rounded-full p-0 shadow-lg ${
            showTrigger ? '' : 'pointer-events-none invisible'
          }`}
        >
          <Plus className="h-5 w-5" />
        </Button>
      ) : (
        <Button
          onClick={handleOpen}
          className={`${showTrigger ? '' : 'hidden'}`}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Record
        </Button>
      )}

      {open && (
        <NewRecordPanel
          redirectTo={undefined}
          onClose={handleClose}
          onBeginClose={handleBeginClose}
          onSuccess={onSuccess}
        />
      )}
    </>
  );
}
