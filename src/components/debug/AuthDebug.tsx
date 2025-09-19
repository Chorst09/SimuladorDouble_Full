// src/components/debug/AuthDebug.tsx
'use client';

import { useAuth } from '@/hooks/use-auth-simple';
import { useEffect, useState } from 'react';

export default function AuthDebug() {
  const { user, loading } = useAuth();
  const [renderCount, setRenderCount] = useState(0);

  useEffect(() => {
    setRenderCount(prev => prev + 1);
    console.log(`🔄 AuthDebug render #${renderCount + 1}`, { 
      user: user ? { email: user.email, role: user.role } : null, 
      loading 
    });
  });

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed top-0 right-0 bg-black text-white p-2 text-xs z-50 max-w-xs">
      <div>🔄 Renders: {renderCount}</div>
      <div>📊 Loading: {loading ? '✅' : '❌'}</div>
      <div>👤 User: {user ? `${user.email} (${user.role})` : 'null'}</div>
      <div>🕒 {new Date().toLocaleTimeString()}</div>
    </div>
  );
}
