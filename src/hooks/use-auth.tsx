// src/hooks/use-auth.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User as SupabaseUser } from '@supabase/supabase-js';

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

  const handleUserSession = useCallback(async (supabaseUser: SupabaseUser) => {
    try {
      // Check if user has role in Supabase users table
      const { data: userData, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', supabaseUser.id)
        .single();

      let role: 'admin' | 'diretor' | 'user' = 'user';

      if (!error && userData) {
        role = userData.role || 'user';
      } else {
        // If no user document exists, check if user is admin by email
        if (supabaseUser.email === 'admin@example.com' || supabaseUser.email === 'carlos.horst@doubletelecom.com.br') {
          role = 'admin';
          
          // Create user record with admin role
          await supabase
            .from('users')
            .upsert({
              id: supabaseUser.id,
              email: supabaseUser.email,
              role: 'admin'
            });
        }
      }

      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email,
        role: role
      });
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email,
        role: 'user'
      });
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setLoading(false);
          }
          return;
        }
        
        if (session?.user && mounted) {
          await handleUserSession(session.user);
        } else if (mounted) {
          setUser(null);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      if (session?.user) {
        await handleUserSession(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [handleUserSession]);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
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
