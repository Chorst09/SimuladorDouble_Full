# Configuração de Variáveis de Ambiente no Vercel

## Problema Identificado
O erro "Serviço indisponível" no login ocorre porque o projeto estava configurado para usar Firebase, mas você está usando Supabase. As variáveis de ambiente do Supabase não estavam configuradas no Vercel.

## Solução Implementada
1. **Migração completa para Supabase Auth**: Removido Firebase Auth e implementado Supabase Auth
2. **Atualização dos componentes**: Login e Signup agora usam Supabase
3. **Schema do banco atualizado**: Criada tabela `users` para gerenciar roles

## Configuração no Vercel

### 1. Acesse o painel do Vercel
- Vá para [vercel.com](https://vercel.com)
- Acesse seu projeto
- Vá em **Settings** > **Environment Variables**

### 2. Adicione as seguintes variáveis:

```
NEXT_PUBLIC_SUPABASE_URL=https://wfuhtdckdgovfbgnlyie.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmdWh0ZGNrZGdvdmZiZ25seWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxOTU1MjksImV4cCI6MjA3Mzc3MTUyOX0.3bet4TkkR-A6V4H9b05iulxshV1bfx0i0oVYh_uWbUc
```

### 3. Configure o ambiente
- Marque as variáveis para todos os ambientes: **Production**, **Preview**, e **Development**

## Configuração no Supabase

### 1. Execute o Schema SQL
No painel do Supabase, vá em **SQL Editor** e execute o conteúdo do arquivo `supabase-schema.sql`:

```sql
-- Cria tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'diretor', 'user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

### 2. Configure Authentication
- Vá em **Authentication** > **Settings**
- Certifique-se que **Enable email confirmations** está habilitado
- Configure **Site URL** para sua URL do Vercel (ex: `https://seu-projeto.vercel.app`)

### 3. Crie um usuário admin
Execute no SQL Editor:
```sql
-- Após criar um usuário via signup, promova para admin
UPDATE users SET role = 'admin' WHERE email = 'carlos.horst@doubletelecom.com.br';
```

## Redeploy
Após configurar as variáveis de ambiente:
1. Vá em **Deployments**
2. Clique nos três pontos do último deploy
3. Selecione **Redeploy**

## Teste
1. Acesse sua aplicação no Vercel
2. Tente fazer signup com um novo email
3. Confirme o email (verifique spam)
4. Faça login com as credenciais

## Arquivos Alterados
- `src/hooks/use-auth.tsx` - Migrado para Supabase Auth
- `src/app/login/page.tsx` - Atualizado para usar Supabase
- `src/app/signup/page.tsx` - Atualizado para usar Supabase
- `supabase-schema.sql` - Adicionada tabela users e triggers

## Próximos Passos
1. Configure as variáveis no Vercel
2. Execute o schema SQL no Supabase
3. Faça o redeploy
4. Teste o login/signup
