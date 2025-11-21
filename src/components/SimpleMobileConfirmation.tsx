'use client';

import React from 'react';
import { X, Check } from 'lucide-react';

interface SimpleMobileConfirmationProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export default function SimpleMobileConfirmation({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}: SimpleMobileConfirmationProps) {
  // Toggle body class for dialog state
  React.useEffect(() => {
    if (isOpen) {
      document.body.classList.add('alert-dialog-open');
    } else {
      document.body.classList.remove('alert-dialog-open');
    }

    return () => {
      document.body.classList.remove('alert-dialog-open');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000002] flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-sm rounded-lg border bg-background p-4 shadow-lg">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 rounded border px-4 py-2 text-sm hover:bg-muted"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded bg-destructive px-4 py-2 text-sm text-destructive-foreground hover:bg-destructive/90"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
