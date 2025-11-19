'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import MobileBottomSheet from './MobileBottomSheet';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import RecordForm from './RecordForm';

export default function NewRecordPanel({
  redirectTo = '/records/active',
  onClose,
}: {
  redirectTo?: string;
  onClose?: () => void;
}) {
  const router = useRouter();
  const [isMobile, setIsMobile] = React.useState(false);
  const [isSheetOpen, setIsSheetOpen] = React.useState(true);

  React.useEffect(() => {
    const query = '(max-width: 639px)';
    const m = window.matchMedia(query);
    const update = () => setIsMobile(m.matches);
    update();
    m.addEventListener('change', update);
    return () => m.removeEventListener('change', update);
  }, []);

  const handleClose = () => {
    // notify parent to close inline launcher
    onClose?.();

    // when redirectTo provided, navigate back
    if (redirectTo) router.push(redirectTo);
  };

  const [isDialogOpen, setIsDialogOpen] = React.useState(true);

  // Close dialog by setting state to false; wait for animation to finish then perform navigations
  React.useEffect(() => {
    if (!isDialogOpen) {
      const timeout = setTimeout(() => {
        handleClose();
      }, 500); // should match the CSS duration in DialogContent (duration-500)

      return () => clearTimeout(timeout);
    }
  }, [isDialogOpen]);

  if (isMobile) {
    return (
      <MobileBottomSheet
        open={isSheetOpen}
        onDismiss={() => setIsSheetOpen(false)}
        onSpringEnd={(event: any) => {
          // event.type === 'CLOSE' indicates closure animation finished
          if (event?.type === 'CLOSE') {
            handleClose();
          }
        }}
        title="Create New Record"
      >
        <RecordForm />
      </MobileBottomSheet>
    );
  }

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => !open && setIsDialogOpen(false)}
    >
      <DialogContent className="fixed right-0 top-0 h-full w-full max-w-2xl translate-x-0 gap-0 overflow-y-auto border-l bg-background p-0 shadow-lg duration-500 ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-lg md:max-w-xl lg:max-w-2xl">
        <div className="flex h-full flex-col">
          <DialogHeader className="flex-shrink-0 border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold">
                Create New Record
              </DialogTitle>
              <DialogClose asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label="Close panel"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </DialogClose>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6">
            <RecordForm />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
