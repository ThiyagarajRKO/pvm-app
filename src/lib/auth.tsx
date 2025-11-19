// Simple authentication context for PVM
'use client';

import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
  session: any;
  isLoading: boolean;
  isAdmin: boolean;
  impersonating: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: (redirectToLogin?: boolean) => Promise<void>;
  startImpersonation: (userId: string) => Promise<boolean>;
  exitImpersonation: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: any }) {
  // Simple mock session for PVM
  const [session] = useState<any>({
    user: {
      name: 'PVM Admin',
      email: 'admin@pvm.com',
      role: { name: 'Admin' },
    },
  });

  const value: AuthContextType = {
    session,
    isLoading: false,
    isAdmin: true,
    impersonating: false,
    login: async () => true,
    logout: async () => {},
    startImpersonation: async () => false,
    exitImpersonation: async () => {},
    refreshSession: async () => {},
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
