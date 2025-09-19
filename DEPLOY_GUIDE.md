# Guia de Deploy - Correção do Erro de Login

## ✅ Problema Resolvido
O erro "Serviço indisponível" no login foi causado pela mistura de tecnologias de autenticação (Firebase + Supabase). A solução foi migrar completamente para **Supabase Auth**.

## 🔧 Mudanças Implementadas

### 1. Migração de Autenticação
- ✅ `src/hooks/use-auth.tsx` - Migrado para Supabase Auth
- ✅ `src/app/login/page.tsx` - Atualizado para usar Supabase
- ✅ `src/app/signup/page.tsx` - Atualizado para usar Supabase
- ✅ `src/hooks/use-admin.tsx` - Migrado para Supabase
- ✅ `src/components/admin/AdminSetup.tsx` - Atualizado para Supabase

### 2. Schema do Banco de Dados
- ✅ Criada tabela `users` para gerenciar roles
- ✅ Adicionados triggers automáticos para novos usuários
- ✅ Configuradas políticas RLS (Row Level Security)

### 3. Documentação
- ✅ `VERCEL_ENV_SETUP.md` - Guia de configuração das variáveis
- ✅ `supabase-schema.sql` - Schema atualizado

## 🚀 Próximos Passos para Deploy

### 1. Configurar Variáveis no Vercel
Acesse seu projeto no Vercel e adicione as variáveis de ambiente:

```bash
# Settings > Environment Variables
NEXT_PUBLIC_SUPABASE_URL=https://wfuhtdckdgovfbgnlyie.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmdWh0ZGNrZGdvdmZiZ25seWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxOTU1MjksImV4cCI6MjA3Mzc3MTUyOX0.3bet4TkkR-A6V4H9b05iulxshV1bfx0i0oVYh_uWbUc
```

**Importante**: Marque para todos os ambientes (Production, Preview, Development)

### 2. Configurar Supabase Database
Execute no **SQL Editor** do Supabase:

```sql
-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'diretor', 'user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow insert for new users" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Função para criar usuário automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, role)
    VALUES (NEW.id, NEW.email, 'user');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para novos usuários
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 3. Configurar Authentication no Supabase
1. Vá em **Authentication** > **Settings**
2. Configure **Site URL**: `https://seu-projeto.vercel.app`
3. Adicione **Redirect URLs**: `https://seu-projeto.vercel.app/**`
4. Certifique-se que **Enable email confirmations** está habilitado

### 4. Fazer Redeploy
1. No Vercel, vá em **Deployments**
2. Clique nos três pontos do último deploy
3. Selecione **Redeploy**

### 5. Criar Primeiro Admin
Após o deploy:
1. Acesse sua aplicação
2. Se não houver admin, aparecerá a tela de setup
3. Crie o primeiro administrador
4. Confirme o email (verifique spam)
5. Faça login

## 🧪 Teste da Solução

### Cenário 1: Novo Usuário
1. Acesse `/signup`
2. Crie uma conta
3. Confirme o email
4. Faça login em `/login`

### Cenário 2: Admin Existente
1. Acesse `/login`
2. Use: `carlos.horst@doubletelecom.com.br`
3. Senha configurada

### Cenário 3: Primeiro Admin
1. Se não houver admin, será redirecionado para setup
2. Crie o primeiro administrador
3. Confirme email e faça login

## 🔍 Verificação de Funcionamento

### ✅ Checklist Pós-Deploy
- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] Schema SQL executado no Supabase
- [ ] Site URL configurada no Supabase Auth
- [ ] Redeploy realizado
- [ ] Login funcionando sem erro "Serviço indisponível"
- [ ] Signup funcionando
- [ ] Confirmação de email funcionando
- [ ] Roles de usuário funcionando

### 🚨 Troubleshooting

**Erro: "Invalid JWT"**
- Verifique se as variáveis de ambiente estão corretas
- Confirme que o redeploy foi feito após configurar as variáveis

**Erro: "User not found"**
- Execute o schema SQL no Supabase
- Verifique se o trigger `handle_new_user` foi criado

**Erro: "Email not confirmed"**
- Verifique a caixa de spam
- Confirme que email confirmations estão habilitados no Supabase

## 📝 Logs Úteis
Para debug, verifique os logs no:
- **Vercel**: Functions > View Function Logs
- **Supabase**: Logs & Analytics
- **Browser**: Console do desenvolvedor

## 🎉 Resultado Esperado
Após seguir este guia, o sistema de login deve funcionar completamente com Supabase, sem erros de "Serviço indisponível".
