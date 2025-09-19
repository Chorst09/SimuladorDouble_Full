// src/app/login-test/page.tsx
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/use-auth-simple';

export default function LoginTestPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        alert('Erro: ' + error.message);
      } else {
        alert('Login realizado com sucesso!');
      }
    } catch (err) {
      alert('Erro inesperado: ' + err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <div style={{ padding: '20px' }}>Carregando autenticação...</div>;
  }

  if (user) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Usuário Logado!</h1>
        <p>Email: {user.email}</p>
        <p>Role: {user.role}</p>
        <button onClick={() => supabase.auth.signOut()}>Logout</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h1>Login Teste (Simples)</h1>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '10px', border: '1px solid #ccc' }}
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: '10px', border: '1px solid #ccc' }}
        />
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            padding: '10px', 
            backgroundColor: loading ? '#ccc' : '#007bff', 
            color: 'white', 
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
      
      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        <p>Debug Info:</p>
        <p>Auth Loading: {authLoading ? 'Sim' : 'Não'}</p>
        <p>User: {user ? 'Logado' : 'Não logado'}</p>
      </div>
    </div>
  );
}
