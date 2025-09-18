// src/hooks/use-auth.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signOut, getAuth } from 'firebase/auth';
import { doc, getDoc, getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { app } from '@/lib/firebase';

// Define o tipo para o objeto de usuário, incluindo a role
interface User {
  uid: string;
  email: string | null;
  role: 'admin' | 'diretor' | 'user';
}

// Define o tipo para o contexto de autenticação
interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!app) {
      setLoading(false);
      return;
    }

    const auth = getAuth(app);
    const db = getFirestore(app);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          // Check if user has role in Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          let role: 'admin' | 'diretor' | 'user' = 'user';

          if (userDoc.exists()) {
            const userData = userDoc.data();
            role = userData.role || 'user';
          } else {
            // If no user document exists, check if user is admin by email
            if (firebaseUser.email === 'admin@example.com' || firebaseUser.email === 'carlos.horst@doubletelecom.com.br') {
              role = 'admin';
            }
          }

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: role
          });
        } catch (error) {
          console.error('Error fetching user role:', error);
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: 'user'
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook customizado para usar o contexto de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
