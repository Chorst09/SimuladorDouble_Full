// src/app/test-simple/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function TestSimplePage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    addLog('🔄 Iniciando verificação de usuário...');
    
    const checkUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          addLog('❌ Erro ao obter usuário: ' + error.message);
        } else if (user) {
          addLog('✅ Usuário encontrado: ' + user.email);
          setUser(user);
        } else {
          addLog('ℹ️ Nenhum usuário logado');
        }
      } catch (err) {
        addLog('❌ Erro inesperado: ' + err);
      } finally {
        setAuthLoading(false);
        addLog('✅ Verificação concluída');
      }
    };

    checkUser();

    // Listener simples
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      addLog(`🔔 Auth change: ${event}`);
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    addLog('🔑 Tentando fazer login...');
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        addLog('❌ Erro no login: ' + error.message);
        alert('Erro: ' + error.message);
      } else {
        addLog('✅ Login realizado com sucesso!');
        setUser(data.user);
      }
    } catch (err) {
      addLog('❌ Erro inesperado: ' + err);
      alert('Erro inesperado: ' + err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    addLog('🚪 Fazendo logout...');
    try {
      await supabase.auth.signOut();
      setUser(null);
      addLog('✅ Logout realizado');
    } catch (err) {
      addLog('❌ Erro no logout: ' + err);
    }
  };

  if (authLoading) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Teste Simples - Carregando...</h1>
        <div style={{ marginTop: '20px', fontSize: '12px', fontFamily: 'monospace' }}>
          {logs.map((log, i) => <div key={i}>{log}</div>)}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Teste Simples - Supabase Auth</h1>
      
      {user ? (
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '5px' }}>
          <h2>✅ Usuário Logado!</h2>
          <p><strong>ID:</strong> {user.id}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Confirmado:</strong> {user.email_confirmed_at ? 'Sim' : 'Não'}</p>
          <button 
            onClick={handleLogout}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#dc3545', 
              color: 'white', 
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      ) : (
        <div style={{ marginBottom: '20px' }}>
          <h2>Login</h2>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}
            />
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}
            />
            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                padding: '10px', 
                backgroundColor: loading ? '#6c757d' : '#007bff', 
                color: 'white', 
                border: 'none',
                borderRadius: '5px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      )}

      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#f8f9fa', 
        border: '1px solid #dee2e6', 
        borderRadius: '5px',
        fontSize: '12px',
        fontFamily: 'monospace'
      }}>
        <h3>📋 Debug Logs:</h3>
        <div style={{ maxHeight: '200px', overflow: 'auto' }}>
          {logs.map((log, i) => (
            <div key={i} style={{ marginBottom: '2px' }}>{log}</div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#6c757d' }}>
        <p><strong>Status:</strong></p>
        <p>Auth Loading: {authLoading ? 'Sim' : 'Não'}</p>
        <p>User: {user ? 'Logado' : 'Não logado'}</p>
        <p>Logs: {logs.length} entradas</p>
      </div>
    </div>
  );
}
