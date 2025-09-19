// src/hooks/use-auth-simple.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';

// Define o tipo para o objeto de usuário, incluindo a role
interface User {
  id: string;
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
    let isMounted = true;
    let subscription: any = null;

    const checkUser = async () => {
      try {
        console.log('🔍 Verificando usuário atual...');
        
        const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('❌ Erro ao obter usuário:', error);
          if (isMounted) {
            setUser(null);
            setLoading(false);
          }
          return;
        }

        if (supabaseUser && isMounted) {
          console.log('👤 Usuário encontrado:', supabaseUser.email);
          
          // Buscar role do usuário
          let role: 'admin' | 'diretor' | 'user' = 'user';
          
          try {
            const { data: userData } = await supabase
              .from('users')
              .select('role')
              .eq('id', supabaseUser.id)
              .single();

            if (userData?.role) {
              role = userData.role;
            } else if (supabaseUser.email === 'carlos.horst@doubletelecom.com.br') {
              role = 'admin';
            }
          } catch (roleError) {
            console.log('⚠️ Erro ao buscar role, usando padrão:', roleError);
          }

          setUser({
            id: supabaseUser.id,
            email: supabaseUser.email || null,
            role: role
          });
        } else if (isMounted) {
          console.log('❌ Nenhum usuário encontrado');
          setUser(null);
        }

        if (isMounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ Erro na verificação de usuário:', error);
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    // Verificação inicial
    checkUser();

    // Listener para mudanças de autenticação - SIMPLIFICADO
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔔 Auth change:', event);
      
      if (!isMounted) return;

      if (event === 'SIGNED_OUT' || !session?.user) {
        setUser(null);
        setLoading(false);
      } else if (event === 'SIGNED_IN' && session?.user) {
        // Re-verificar usuário após login
        checkUser();
      }
    });

    subscription = data.subscription;

    return () => {
      isMounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []); // SEM DEPENDÊNCIAS - isso é crucial

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
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
