'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  UserPlus, 
  Edit, 
  Trash2, 
  Shield, 
  User, 
  Users,
  Loader2 
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'diretor' | 'user';
  name?: string;
  createdAt?: any;
}

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Form states
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'diretor' | 'user'>('user');
  const [addUserError, setAddUserError] = useState<string | null>(null);

  // Check if current user is admin
  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  const loadUsers = async () => {
    try {
      const { data: usersData, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setUsers(usersData || []);
    } catch (error: any) {
      console.error('Erro ao carregar usuários:', error);
      const description = error?.message || 'Não foi possível carregar os usuários.';
      toast({
        title: 'Erro',
        description,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    setAddUserError(null);
    if (!newUserEmail || !newUserPassword) {
      toast({
        title: 'Erro',
        description: 'Email e senha são obrigatórios.',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Verifica se já existe usuário com este email
      const { data: existingUsers, error: checkError } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', newUserEmail)
        .limit(1);

      if (checkError) {
        console.error('Erro ao verificar usuário existente:', checkError);
      }

      if (existingUsers && existingUsers.length > 0) {
        // Usuário já existe, apenas atualiza
        const { error: updateError } = await supabase
          .from('users')
          .update({
            role: newUserRole
          })
          .eq('email', newUserEmail);

        if (updateError) {
          throw updateError;
        }

        toast({
          title: 'Usuário já existente',
          description: 'Email já cadastrado. Role foi atualizada com sucesso.'
        });
      } else {
        // Cria usuário no Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: newUserEmail,
          password: newUserPassword,
        });

        if (authError) {
          throw authError;
        }

        if (authData.user) {
          // Cria documento na tabela users
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: authData.user.id,
              email: newUserEmail,
              role: newUserRole
            });

          if (insertError) {
            console.error('Erro ao inserir usuário na tabela:', insertError);
            // Don't throw here as the user was created successfully in auth
          }

          toast({
            title: 'Sucesso',
            description: 'Usuário criado com sucesso!'
          });
        }
      }

      // Reset form
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserName('');
      setNewUserRole('user');
      setIsAddDialogOpen(false);

      // Reload users
      loadUsers();
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);

      let description = 'Não foi possível criar o usuário.';
      if (error.message.includes('User already registered')) {
        description = 'Este email já está em uso. Tente usar outro email.';
      } else if (error.message.includes('Invalid email')) {
        description = 'Email inválido. Verifique e tente novamente.';
      } else if (error.message.includes('Password should be at least')) {
        description = 'Senha fraca. Use uma senha com pelo menos 6 caracteres.';
      }
      
      toast({
        title: 'Erro',
        description,
        variant: 'destructive'
      });
    }
  };

  const handleEditUser = async () => {
    if (!editingUser) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({
          role: editingUser.role
        })
        .eq('id', editingUser.id);

      if (error) {
        throw error;
      }

      toast({
        title: 'Sucesso',
        description: 'Usuário atualizado com sucesso!'
      });

      setIsEditDialogOpen(false);
      setEditingUser(null);
      loadUsers();
    } catch (error: any) {
      console.error('Erro ao atualizar usuário:', error);
      const description = error?.message || 'Não foi possível atualizar o usuário.';
      toast({
        title: 'Erro',
        description,
        variant: 'destructive'
      });
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário ${userEmail}?`)) {
      return;
    }

    try {
      // Delete user from users table
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) {
        throw error;
      }

      toast({
        title: 'Sucesso',
        description: 'Usuário excluído com sucesso!'
      });

      loadUsers();
    } catch (error: any) {
      console.error('Erro ao excluir usuário:', error);
      const description = error?.message || 'Não foi possível excluir o usuário.';
      toast({
        title: 'Erro',
        description,
        variant: 'destructive'
      });
    }
  };

  if (!isAdmin) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardContent className="text-center py-8">
          <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Acesso Negado</h3>
          <p className="text-muted-foreground">
            Você precisa ser administrador para acessar esta página.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando usuários...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie usuários, permissões e acessos do sistema
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Adicionar Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Usuário</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {addUserError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                  <strong className="font-bold">Erro!</strong>
                  <span className="block sm:inline"> {addUserError}</span>
                </div>
              )}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="usuario@exemplo.com"
                />
              </div>
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="Senha do usuário"
                />
              </div>
              <div>
                <Label htmlFor="name">Nome (Opcional)</Label>
                <Input
                  id="name"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Nome do usuário"
                />
              </div>
              <div>
                <Label htmlFor="role">Função</Label>
                <Select value={newUserRole} onValueChange={(value: 'admin' | 'diretor' | 'user') => setNewUserRole(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuário</SelectItem>
                    <SelectItem value="diretor">Diretor</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddUser}>
                  Criar Usuário
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Usuários do Sistema ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>{user.name || '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {user.role === 'admin' ? (
                        <Shield className="h-4 w-4 mr-1 text-orange-500" />
                      ) : (
                        <User className="h-4 w-4 mr-1 text-blue-500" />
                      )}
                      {user.role === 'admin' ? 'Administrador' : user.role === 'diretor' ? 'Diretor' : 'Usuário'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.createdAt ? 
                      new Date(user.createdAt.seconds * 1000).toLocaleDateString('pt-BR') 
                      : '-'
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingUser(user);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {user.email !== currentUser?.email && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id, user.email)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  value={editingUser.email}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <Label htmlFor="edit-name">Nome</Label>
                <Input
                  id="edit-name"
                  value={editingUser.name || ''}
                  onChange={(e) => setEditingUser({
                    ...editingUser,
                    name: e.target.value
                  })}
                  placeholder="Nome do usuário"
                />
              </div>
              <div>
                <Label htmlFor="edit-role">Função</Label>
                <Select 
                  value={editingUser.role} 
                  onValueChange={(value: 'admin' | 'diretor' | 'user') => 
                    setEditingUser({...editingUser, role: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuário</SelectItem>
                    <SelectItem value="diretor">Diretor</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleEditUser}>
                  Salvar Alterações
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
