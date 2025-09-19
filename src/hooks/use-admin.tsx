'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';
import { supabase } from '@/lib/supabaseClient';

export function useAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasAnyAdmin, setHasAnyAdmin] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    try {
      // Check if any admin exists in the system
      const { data: adminUsers, error } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'admin')
        .limit(1);
      
      if (error) {
        console.error('Erro ao verificar admins:', error);
        setHasAnyAdmin(false);
      } else {
        const hasAdmin = adminUsers && adminUsers.length > 0;
        setHasAnyAdmin(hasAdmin);
      }
      
      // Check if current user is admin
      setIsAdmin(user?.role === 'admin');
      
      console.log('Admin check result:', { 
        hasAdmin: adminUsers && adminUsers.length > 0, 
        userRole: user?.role 
      });
      
    } catch (error) {
      console.error('Erro ao verificar status de admin:', error);
      // If there's an error, assume no admin exists to show setup
      setHasAnyAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  return {
    isAdmin,
    hasAnyAdmin,
    loading,
    checkAdminStatus
  };
}
