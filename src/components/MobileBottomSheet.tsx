'use client';

import React from 'react';
import { BottomSheet } from 'react-spring-bottom-sheet';
import 'react-spring-bottom-sheet/dist/style.css';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export default function MobileBottomSheet({
  open = true,
  onDismiss,
  onAfterDismiss,
  onSpringEnd,
  title,
  children,
}: {
  open?: boolean;
  onDismiss?: () => void;
  onAfterDismiss?: () => void;
  onSpringEnd?: (event: any) => void;
  title?: string;
  children?: React.ReactNode;
}) {
  const [localOpen, setLocalOpen] = React.useState(open);
  const alreadyDismissedRef = React.useRef(false);

  React.useEffect(() => {
    setLocalOpen(open);
  }, [open]);

  const handleDismiss = () => {
    // When user requests dismiss, mark closed locally. We will
    // call onAfterDismiss when the spring animation completes via onSpringEnd.
    alreadyDismissedRef.current = false;
    setLocalOpen(false);
    onDismiss?.();
  };

  const internalOnSpringEnd = (event: any) => {
    onSpringEnd?.(event);
    // only call onAfterDismiss when the sheet has finished closing
    if (!localOpen && !alreadyDismissedRef.current) {
      alreadyDismissedRef.current = true;
      onAfterDismiss?.();
    }
  };

  return (
    <BottomSheet
      onSpringEnd={internalOnSpringEnd}
      open={localOpen}
      onDismiss={handleDismiss}
      snapPoints={({ maxHeight }) => [maxHeight * 0.9, maxHeight * 0.5]}
    >
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="text-lg font-medium">{title}</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDismiss}
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-4">{children}</div>
    </BottomSheet>
  );
}
