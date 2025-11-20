'use client';

import { createContext, useContext } from 'react';
import { usePWA } from '@/hooks/use-pwa';

const PWAContext = createContext<{
  isInstallable: boolean;
  installApp: () => void;
} | null>(null);

export function usePWAContext() {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWAContext must be used within PWAProvider');
  }
  return context;
}

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const pwa = usePWA();

  return <PWAContext.Provider value={pwa}>{children}</PWAContext.Provider>;
}
