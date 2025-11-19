'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import NewRecordPanel from './NewRecordPanel';

export default function NewRecordLauncher({
  triggerIsFAB = false,
}: {
  triggerIsFAB?: boolean;
}) {
  const [open, setOpen] = React.useState(false);

  if (open) {
    // When open hide the trigger and render the panel in-place
    return (
      <NewRecordPanel redirectTo={undefined} onClose={() => setOpen(false)} />
    );
  }

  return triggerIsFAB ? (
    <Button
      aria-label="Create new record"
      title="Create new record"
      onClick={() => setOpen(true)}
      className="flex h-12 w-12 items-center justify-center rounded-full p-0 shadow-lg"
    >
      <Plus className="h-5 w-5" />
    </Button>
  ) : (
    <Button onClick={() => setOpen(true)}>
      <Plus className="mr-2 h-4 w-4" />
      New Record
    </Button>
  );
}
