'use client';

import React from 'react';
import { Info } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import MobileBottomSheet from './MobileBottomSheet';
import DesktopSlidePanel from './DesktopSlidePanel';
import RecordForm from './RecordForm';

export default function NewRecordPanel({
  redirectTo = '/records/active',
  onClose,
  onBeginClose,
  onSuccess,
}: {
  redirectTo?: string;
  onClose?: () => void;
  onBeginClose?: () => void;
  onSuccess?: () => void;
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

  const pathname = usePathname();

  const handleClose = () => {
    // notify parent to close inline launcher
    onClose?.();
    // when redirectTo provided, navigate back, but avoid navigating to the same path
    // to prevent unnecessary refresh/scroll. Also delay navigation slightly so the
    // floating bar can re-appear without visual jump.
    if (redirectTo && redirectTo !== pathname) {
      setTimeout(() => router.push(redirectTo), 60);
    }
  };

  const [isDialogOpen, setIsDialogOpen] = React.useState(true);

  if (isMobile) {
    return (
      <MobileBottomSheet
        open={isSheetOpen}
        onDismiss={() => setIsSheetOpen(false)}
        onBeginClose={() => onBeginClose?.()}
        onAfterDismiss={handleClose}
        title="Create New Record"
        initialSnapPct={0.8}
        description="Quickly add a new record"
        descriptionIcon={<Info className="h-4 w-4 opacity-70" />}
      >
        <RecordForm
          compact
          isMobile
          onCancel={() => {
            setIsSheetOpen(false);
            onBeginClose?.();
          }}
          onSuccess={onSuccess}
        />
      </MobileBottomSheet>
    );
  }
  return (
    <DesktopSlidePanel
      open={isDialogOpen}
      onClose={() => {
        setIsDialogOpen(false);
        onBeginClose?.();
      }}
      onAfterClose={handleClose}
      title="Create New Record"
      maxWidth={400}
    >
      <RecordForm
        compact
        onCancel={() => {
          setIsDialogOpen(false);
          onBeginClose?.();
        }}
        onSuccess={onSuccess}
      />
    </DesktopSlidePanel>
  );
}
