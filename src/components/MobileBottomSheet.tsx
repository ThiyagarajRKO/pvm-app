'use client';

import React from 'react';
import { BottomSheet } from 'react-spring-bottom-sheet';
import 'react-spring-bottom-sheet/dist/style.css';
import { Button } from '@/components/ui/button';
import { X, Info } from 'lucide-react';

export default function MobileBottomSheet({
  open = true,
  onDismiss,
  onAfterDismiss,
  onSpringEnd,
  onBeginClose,
  title,
  description,
  descriptionIcon,
  children,
  footer,
  initialSnapPct = 0.8,
}: {
  open?: boolean;
  onDismiss?: () => void;
  onAfterDismiss?: () => void;
  onSpringEnd?: (event: any) => void;
  onBeginClose?: () => void;
  title?: string;
  description?: string;
  descriptionIcon?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  initialSnapPct?: number; // fraction of maxHeight to use as initial snap
}) {
  const [localOpen, setLocalOpen] = React.useState(open);
  const alreadyDismissedRef = React.useRef(false);
  const sheetRef = React.useRef<any>(null);

  React.useEffect(() => {
    setLocalOpen(open);
  }, [open]);

  const handleDismiss = () => {
    // Notify parent immediately (so FAB shows) as soon as dismissal starts
    onBeginClose?.();

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

  React.useEffect(() => {
    // When the sheet opens, force it to snap to the top position (index 0).
    if (localOpen) {
      // small delay to ensure bottom sheet is mounted
      setTimeout(() => sheetRef.current?.snapTo?.(0), 10);
    }
  }, [localOpen]);

  return (
    <BottomSheet
      className="mobile-bottom-sheet"
      ref={sheetRef}
      onSpringEnd={internalOnSpringEnd}
      open={localOpen}
      onDismiss={handleDismiss}
      snapPoints={({ maxHeight }) => [
        maxHeight * 1.0, // Full screen
        maxHeight * initialSnapPct,
        maxHeight * 0.5,
      ]}
      // Force the initial snap to initialSnapPct so it opens larger than 50%
      defaultSnap={({ maxHeight }) => maxHeight * initialSnapPct}
      header={
        <div className="bg-background/95 backdrop-blur-sm">
          <div className="my-2 flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                {descriptionIcon ?? (
                  <Info className="h-5 w-5 text-muted-foreground" />
                )}
              </div>

              <div className="min-w-0">
                <h3 className="truncate text-left text-sm font-semibold">
                  {title}
                </h3>
                {description && (
                  <p className="truncate text-xs text-muted-foreground">
                    {description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDismiss}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      }
      footer={footer ? <div className="p-4">{footer}</div> : undefined}
    >
      <div
        className="scrollbar-hide min-h-0 flex-1 overflow-y-auto p-4"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {children}
      </div>
    </BottomSheet>
  );
}
