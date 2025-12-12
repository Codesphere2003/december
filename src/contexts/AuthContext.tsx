import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
<<<<<<< HEAD
import { auth, firebaseApi, seedDemoCases } from '@/lib/firebase';
=======
import { auth } from '@/lib/firebase';
>>>>>>> f0e24a90fe166a1340dfe92a24e2fe5cc526c71e

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
<<<<<<< HEAD
    // Seed demo cases on app load
    seedDemoCases().catch(console.error);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        try {
          const result = await firebaseApi.verifyToken();
          setIsAdmin(result.user?.admin || false);
        } catch (error) {
          console.error('Error verifying admin status:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      
=======
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      // For now, any authenticated user is considered admin
      setIsAdmin(!!user);
>>>>>>> f0e24a90fe166a1340dfe92a24e2fe5cc526c71e
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
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
