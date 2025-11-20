'use client';

import React from 'react';
import { Info } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import MobileBottomSheet from '@/components/MobileBottomSheet';
import DesktopSlidePanel from '@/components/DesktopSlidePanel';
import RecordForm from '@/components/RecordForm';

interface Record {
  id: number;
  date: string;
  name: string;
  fatherName: string;
  street: string;
  place: string;
  weightGrams: number;
  itemType: 'Gold' | 'Silver';
  itemCategory: 'active' | 'archived' | 'big';
  amount: number;
  mobile: string;
  personImageUrl?: string;
  itemImageUrl?: string;
  itemReturnImageUrl?: string;
}

interface EditRecordPanelProps {
  record: Record;
  redirectTo?: string;
  onClose?: () => void;
  onBeginClose?: () => void;
  onSuccess?: () => void;
}

export default function EditRecordPanel({
  record,
  redirectTo = `/records/${record.id}`,
  onClose,
  onBeginClose,
  onSuccess,
}: EditRecordPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobile, setIsMobile] = React.useState(false);
  const [isSheetOpen, setIsSheetOpen] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(true);

  React.useEffect(() => {
    // Set initial mobile state based on screen width
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    // Set initial state immediately
    checkMobile();

    // Listen for window resize
    const handleResize = () => checkMobile();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleClose = () => {
    // notify parent to close inline launcher
    onClose?.();
    // Only navigate if onClose is not provided (i.e., we're in a separate page)
    // and redirectTo is different from current path
    if (!onClose && redirectTo && redirectTo !== pathname) {
      setTimeout(() => router.push(redirectTo), 60);
    }
  };

  if (isMobile) {
    return (
      <MobileBottomSheet
        open={isSheetOpen}
        onDismiss={() => setIsSheetOpen(false)}
        onBeginClose={() => onBeginClose?.()}
        onAfterDismiss={handleClose}
        title="Edit Record"
        initialSnapPct={0.8}
        description="Update record details"
        descriptionIcon={<Info className="h-4 w-4 opacity-70" />}
      >
        <RecordForm
          initialData={record}
          isEdit={true}
          recordId={record.id.toString()}
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
      title="Edit Record"
      maxWidth={400}
    >
      <RecordForm
        initialData={record}
        isEdit={true}
        recordId={record.id.toString()}
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
