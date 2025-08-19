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
  role: 'admin' | 'user';
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
      try {
        if (firebaseUser) {
          // Usuário logado, busca o perfil no Firestore
          // Busca por email já que o documento pode ter sido criado com addDoc
          const usersCollection = collection(db, 'users');
          const q = query(usersCollection, where('email', '==', firebaseUser.email));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            console.log('User data found:', userData); // Debug log
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              role: userData.role || 'user', // Padrão para 'user' se não houver role
            });
          } else {
            // Documento do usuário não encontrado, criar um padrão
            console.log('User document not found, creating default user'); // Debug log
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              role: 'user',
            });
          }
        } else {
          // Usuário deslogado
          setUser(null);
        }
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        // Em caso de erro, ainda define o usuário básico se autenticado
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: 'user',
          });
        } else {
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    });

    // Limpa a inscrição ao desmontar
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    if (!app) {
      return;
    }
    const auth = getAuth(app);
    await signOut(auth);
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
