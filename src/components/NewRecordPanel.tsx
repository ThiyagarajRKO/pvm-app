'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import MobileBottomSheet from './MobileBottomSheet';
import DesktopSlidePanel from './DesktopSlidePanel';
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

  if (isMobile) {
    return (
      <MobileBottomSheet
        open={isSheetOpen}
        onDismiss={() => setIsSheetOpen(false)}
        onAfterDismiss={handleClose}
        title="Create New Record"
      >
        <RecordForm compact onCancel={() => setIsSheetOpen(false)} />
      </MobileBottomSheet>
    );
  }
  return (
    <DesktopSlidePanel
      open={isDialogOpen}
      onClose={() => setIsDialogOpen(false)}
      onAfterClose={handleClose}
      title="Create New Record"
      maxWidth={400}
    >
      <RecordForm compact onCancel={() => setIsDialogOpen(false)} />
    </DesktopSlidePanel>
  );
}
