import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { apiClient } from '@/lib/api';
import { mockApiClient } from '@/lib/mockApi';

// Use mock API if Firebase is not configured
const isDemoMode = import.meta.env.VITE_FIREBASE_PROJECT_ID === 'demo-project-id';
const client = isDemoMode ? mockApiClient : apiClient;

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDemoMode) {
      // Demo mode - simulate authentication
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        try {
          const result = await client.verifyToken();
          setIsAdmin(result.user?.admin || false);
        } catch (error) {
          console.error('Error verifying admin status:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    if (isDemoMode) {
      await client.login(email, password);
      setUser({ email } as User);
      setIsAdmin(true);
    } else {
      await signInWithEmailAndPassword(auth, email, password);
    }
  };

  const logout = async () => {
    if (isDemoMode) {
      await client.logout();
      setUser(null);
      setIsAdmin(false);
    } else {
      await signOut(auth);
    }
  };

  const value = {
    user,
    isAdmin,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};