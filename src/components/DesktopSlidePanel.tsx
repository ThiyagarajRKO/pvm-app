'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DesktopSlidePanel({
  open,
  onClose,
  onAfterClose,
  title,
  children,
  maxWidth = 400,
}: {
  open: boolean;
  onClose?: () => void;
  onAfterClose?: () => void;
  title?: string;
  children?: React.ReactNode;
  maxWidth?: number;
}) {
  // onAfterClose handled via AnimatePresence onExitComplete

  const [width, setWidth] = React.useState<number>(maxWidth);

  React.useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      // On small screens, nearly full width; on medium, a portion; on large, cap to maxWidth
      let calculated;
      if (w < 640) calculated = Math.floor(w * 0.95);
      else if (w < 1280) calculated = Math.floor(w * 0.5);
      else calculated = Math.floor(maxWidth);
      // Ensure width doesn't go below a minimum readable value
      const minWidth = 320;
      setWidth(Math.max(minWidth, Math.min(maxWidth, calculated)));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [maxWidth]);

  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <AnimatePresence onExitComplete={() => onAfterClose?.()}>
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <motion.div
            className="fixed inset-0 z-40 !mb-0 !ml-0 !mr-0 !mt-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => onClose?.()}
          />

          <motion.aside
            className="pointer-events-auto fixed bottom-0 right-0 top-0 z-50 !mt-0 bg-background shadow-lg"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.36, ease: 'easeInOut' }}
            style={{ width, maxWidth, minWidth: 360 }}
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b px-6 py-4">
                <h3 className="text-lg font-semibold">{title}</h3>
                <button
                  className="rounded-md p-2 text-muted-foreground hover:bg-muted"
                  onClick={() => onClose?.()}
                  aria-label="Close slide panel"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">{children}</div>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
