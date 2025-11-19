// Real authentication context for PVM
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

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
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem('authToken');
    if (token) {
      // Validate token and set session
      validateToken(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const validateToken = async (token: string) => {
    try {
      // You can add a /api/auth/verify endpoint if needed
      // For now, assume token is valid if present
      const payload = JSON.parse(atob(token.split('.')[1]));
      setSession({
        user: {
          id: payload.userId,
          name: payload.name || 'Admin',
          email: payload.email,
          role: { name: payload.role },
        },
      });
    } catch (error) {
      localStorage.removeItem('authToken');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('authToken', data.token);
        setSession({
          user: {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: { name: data.user.role },
          },
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async (redirectToLogin = true) => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('authToken');
    setSession(null);
    if (redirectToLogin) {
      window.location.href = '/login';
    }
  };

  const startImpersonation = async (userId: string): Promise<boolean> => {
    // Not implemented for single user
    return false;
  };

  const exitImpersonation = async () => {
    // Not implemented
  };

  const refreshSession = async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      await validateToken(token);
    }
  };

  const value: AuthContextType = {
    session,
    isLoading,
    isAdmin: session?.user?.role?.name === 'admin',
    impersonating: false,
    login,
    logout,
    startImpersonation,
    exitImpersonation,
    refreshSession,
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
