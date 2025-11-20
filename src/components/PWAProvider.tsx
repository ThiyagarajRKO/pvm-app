'use client';

import { usePWA } from '@/hooks/use-pwa';

export function PWAProvider({ children }: { children: React.ReactNode }) {
  usePWA();
  return <>{children}</>;
}
