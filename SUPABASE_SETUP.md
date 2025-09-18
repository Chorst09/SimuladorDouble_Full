# Configuração do Supabase

## Variáveis de Ambiente

Para usar o Supabase neste projeto, você precisa adicionar as seguintes variáveis de ambiente ao seu arquivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://wfuhtdckdgovfbgnlyie.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmdWh0ZGNrZGdvdmZiZ25seWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxOTU1MjksImV4cCI6MjA3Mzc3MTUyOX0.3bet4TkkR-A6V4H9b05iulxshV1bfx0i0oVYh_uWbUc
```

## Como Configurar

1. Abra o arquivo `.env.local` na raiz do projeto
2. Adicione as variáveis de ambiente listadas acima
3. Salve o arquivo
4. Reinicie o servidor de desenvolvimento se estiver rodando

## Uso do Cliente Supabase

O cliente do Supabase já está configurado em `src/lib/supabaseClient.ts`. Para usar em seus componentes:

```typescript
import { supabase } from '@/lib/supabaseClient';

// Exemplo de uso
const { data, error } = await supabase
  .from('sua_tabela')
  .select('*');
```

## Segurança

- O arquivo `.env.local` está no `.gitignore` para proteger suas credenciais
- As variáveis com prefixo `NEXT_PUBLIC_` são expostas no cliente (browser)
- Nunca commite credenciais sensíveis no código fonte

## Instalação da Dependência

Se ainda não instalou o Supabase, execute:

```bash
npm install @supabase/supabase-js
```
