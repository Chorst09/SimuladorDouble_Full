'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Shield, UserPlus, Loader2 } from 'lucide-react';

export default function AdminSetup() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [hasAdmin, setHasAdmin] = useState(false);
  const [creating, setCreating] = useState(false);
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    checkForAdmin();
  }, []);

  const checkForAdmin = async () => {
    try {
      const { data: adminUsers, error } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'admin')
        .limit(1);
      
      if (error) {
        console.error('Erro ao verificar administradores:', error);
        setHasAdmin(false);
      } else {
        setHasAdmin(adminUsers && adminUsers.length > 0);
      }
    } catch (error) {
      console.error('Erro ao verificar administradores:', error);
      setHasAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const createFirstAdmin = async () => {
    if (!email || !password) {
      toast({
        title: 'Erro',
        description: 'Email e senha são obrigatórios.',
        variant: 'destructive'
      });
      return;
    }

    setCreating(true);

    try {
      // Check if user already exists in Supabase users table
      const { data: existingUsers, error: checkError } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', email)
        .limit(1);
      
      if (checkError) {
        console.error('Erro ao verificar usuário existente:', checkError);
      }
      
      if (existingUsers && existingUsers.length > 0) {
        // User exists in users table, just update to admin
        const { error: updateError } = await supabase
          .from('users')
          .update({
            role: 'admin'
          })
          .eq('email', email);
        
        if (updateError) {
          throw updateError;
        }
        
        toast({
          title: 'Sucesso',
          description: 'Usuário promovido a administrador! Redirecionando para login...'
        });
        
        setHasAdmin(true);
        
        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
        return;
      }
      
      // Create user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (authError) {
        throw authError;
      }

      if (authData.user) {
        // Create admin user document in users table
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: email,
            role: 'admin'
          });

        if (insertError) {
          console.error('Erro ao inserir usuário na tabela:', insertError);
          // Don't throw here as the user was created successfully in auth
        }

        toast({
          title: 'Sucesso',
          description: 'Primeiro administrador criado com sucesso! Verifique seu email para confirmar a conta.'
        });

        setHasAdmin(true);
        
        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      }
    } catch (error: any) {
      console.error('Erro ao criar primeiro admin:', error);
      let errorMessage = 'Não foi possível criar o administrador.';
      
      if (error.message.includes('User already registered')) {
        errorMessage = 'Este email já está em uso. Tente fazer login ou use outro email.';
      } else if (error.message.includes('Password should be at least')) {
        errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
      } else if (error.message.includes('Invalid email')) {
        errorMessage = 'Email inválido.';
      }
      
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Verificando sistema...</span>
      </div>
    );
  }

  if (hasAdmin) {
    // If admin was just created, show a message and redirect
    return (
      <div className="max-w-md mx-auto mt-8">
        <Card>
          <CardContent className="text-center py-8">
            <Shield className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-semibold mb-2">Administrador Criado!</h3>
            <p className="text-muted-foreground">
              Redirecionando para a página de login...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <Card>
        <CardHeader className="text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
          <CardTitle>Configuração Inicial</CardTitle>
          <p className="text-muted-foreground">
            Nenhum administrador encontrado. Crie o primeiro administrador do sistema.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="admin-email">Email do Administrador</Label>
            <Input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@empresa.com"
            />
          </div>
          <div>
            <Label htmlFor="admin-password">Senha</Label>
            <Input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha segura"
            />
          </div>
          <div>
            <Label htmlFor="admin-name">Nome (Opcional)</Label>
            <Input
              id="admin-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do administrador"
            />
          </div>
          <Button 
            onClick={createFirstAdmin} 
            disabled={creating}
            className="w-full"
          >
            {creating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Criar Primeiro Administrador
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
