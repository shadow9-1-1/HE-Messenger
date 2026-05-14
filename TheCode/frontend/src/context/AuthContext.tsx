'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import api from '@/lib/api';

interface AuthContextType {
  user: User | null;
  backendUser: any | null;
  loading: boolean;
  mfaState: 'none' | 'pending' | 'verified';
  setMfaState: (state: 'none' | 'pending' | 'verified') => void;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  backendUser: null,
  loading: true,
  mfaState: 'none',
  setMfaState: () => {},
  loginWithGoogle: async () => {},
  logout: async () => {}
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [backendUser, setBackendUser] = useState<any | null>(null);
  const [mfaState, setMfaState] = useState<'none' | 'pending' | 'verified'>('none');
  const [loading, setLoading] = useState(true);

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      console.log('Firebase ID token retrieved after login:', token.substring(0, 20) + '...');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setBackendUser(null);
      setMfaState('none');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      // Sync user record with backend on login
      if (firebaseUser) {
        try {
          const res = await api.post('/auth/login');
          if (res.data.status === 'PENDING_MFA') {
            setMfaState('pending');
          } else if (res.data.status === 'SUCCESS') {
            setMfaState('verified');
            setBackendUser(res.data.user);
          }
        } catch (err: any) {
          if (err.response?.status === 403 && err.response?.data?.status === 'PENDING_MFA') {
            setMfaState('pending');
          } else {
            console.error('Failed to sync user with backend:', err);
          }
        }
      } else {
        setBackendUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, backendUser, loading, mfaState, setMfaState, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
