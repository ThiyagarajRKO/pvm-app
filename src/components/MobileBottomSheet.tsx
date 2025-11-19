'use client';

import React from 'react';
import { BottomSheet } from 'react-spring-bottom-sheet';
import 'react-spring-bottom-sheet/dist/style.css';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export default function MobileBottomSheet({
  open = true,
  onDismiss,
  onSpringEnd,
  title,
  children,
}: {
  open?: boolean;
  onDismiss?: () => void;
  onSpringEnd?: (event: any) => void;
  title?: string;
  children?: React.ReactNode;
}) {
  return (
    <BottomSheet
      onSpringEnd={onSpringEnd}
      open={open}
      onDismiss={onDismiss}
      snapPoints={({ maxHeight }) => [maxHeight * 0.9, maxHeight * 0.5]}
    >
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="text-lg font-medium">{title}</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDismiss}
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-4">{children}</div>
    </BottomSheet>
  );
}
