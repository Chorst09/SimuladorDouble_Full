'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';
import { 
  collection, 
  getDocs, 
  query, 
  where,
  getFirestore 
} from 'firebase/firestore';
import { app } from '@/lib/firebase';

export function useAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasAnyAdmin, setHasAnyAdmin] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!app) {
      setLoading(false);
      return;
    }

    try {
      const db = getFirestore(app);
      const usersCollection = collection(db, 'users');
      
      // Check if any admin exists in the system
      const adminQuery = query(usersCollection, where('role', '==', 'admin'));
      const adminSnapshot = await getDocs(adminQuery);
      
      const hasAdmin = !adminSnapshot.empty;
      setHasAnyAdmin(hasAdmin);
      
      // Check if current user is admin
      setIsAdmin(user?.role === 'admin');
      
      console.log('Admin check result:', { hasAdmin, userRole: user?.role });
      
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
