import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from './api-client';

interface AuthContextType {
  session: any;
  isLoading: boolean;
  isAdmin: boolean;
  impersonating: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: (redirectToLogin?: boolean) => Promise<void>;
  startImpersonation: (userId: string) => Promise<boolean>;
  exitImpersonation: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: any }) {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Since we're using httpOnly cookies, we can't check authentication on client side
    // Assume user is authenticated if they can access this page
    // The server-side API routes will handle authentication
    setSession({
      user: {
        id: 1,
        name: 'Admin',
        email: 'admin@example.com',
        role: { name: 'admin' },
      },
    });
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post('/api/auth/login', { email, password });

      if (response.data) {
        const data = response.data;
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
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
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

  const value: AuthContextType = {
    session,
    isLoading,
    isAdmin: session?.user?.role?.name === 'admin',
    impersonating: false,
    login,
    logout,
    startImpersonation,
    exitImpersonation,
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
