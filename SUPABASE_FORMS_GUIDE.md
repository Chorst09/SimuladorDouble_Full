# Guia de Formulários com Supabase

Este guia explica como implementar formulários que inserem dados no Supabase usando Next.js API Routes.

## Arquivos Criados

### 1. Componente do Formulário
- **Arquivo**: `src/components/ContactForm.tsx`
- **Descrição**: Componente React com TypeScript para formulário de contato
- **Recursos**:
  - Validação client-side
  - Estados de loading
  - Tratamento de erros
  - Interface moderna com Shadcn/UI

### 2. API Route
- **Arquivo**: `src/app/api/contact/route.ts`
- **Descrição**: Endpoint para processar dados do formulário
- **Recursos**:
  - Validação server-side
  - Integração com Supabase
  - Tratamento de erros robusto
  - Respostas padronizadas

### 3. Schema do Banco de Dados
- **Arquivo**: `supabase-schema.sql`
- **Descrição**: Script SQL para criar a tabela de contatos
- **Recursos**:
  - Tabela `contacts` com campos otimizados
  - Índices para performance
  - Triggers para atualização automática
  - Comentários para documentação

### 4. Hook Personalizado
- **Arquivo**: `src/hooks/useSupabaseForm.ts`
- **Descrição**: Hook reutilizável para formulários
- **Recursos**:
  - Gerenciamento de estado
  - Callbacks personalizáveis
  - Tipagem TypeScript
  - Reutilizável para outros formulários

### 5. Página de Exemplo
- **Arquivo**: `src/app/contact/page.tsx`
- **Descrição**: Página demonstrando o uso do componente

## Como Configurar

### 1. Configurar o Banco de Dados
Execute o script SQL no Supabase:
```sql
-- Cole o conteúdo do arquivo supabase-schema.sql
-- no SQL Editor do Supabase Dashboard
```

### 2. Configurar Variáveis de Ambiente
Certifique-se de que as variáveis estão no `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui
```

### 3. Usar o Componente
```tsx
import ContactForm from '@/components/ContactForm';

export default function MyPage() {
  return (
    <div>
      <h1>Contato</h1>
      <ContactForm />
    </div>
  );
}
```

## Estrutura da API Response

Todas as respostas seguem o padrão:
```typescript
interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}
```

### Códigos de Status
- `200`: GET bem-sucedido
- `201`: POST bem-sucedido (dados criados)
- `400`: Erro de validação
- `500`: Erro interno do servidor

## Validações Implementadas

### Client-side (Componente)
- Campos obrigatórios
- Formato de email
- Estados de loading

### Server-side (API Route)
- Campos obrigatórios
- Formato de email (regex)
- Tamanho máximo dos campos:
  - Nome: 100 caracteres
  - Mensagem: 1000 caracteres
- Sanitização de dados (trim, toLowerCase para email)

## Segurança

### Medidas Implementadas
- Validação dupla (client + server)
- Sanitização de dados
- Tratamento seguro de erros
- Logs de erro no servidor

### Recomendações Adicionais
- Implementar rate limiting
- Adicionar CAPTCHA para produção
- Configurar RLS (Row Level Security) no Supabase
- Monitorar logs de erro

## Extensibilidade

### Para Criar Novos Formulários
1. Copie o padrão do `ContactForm.tsx`
2. Crie nova API route seguindo `api/contact/route.ts`
3. Use o hook `useSupabaseForm` para lógica reutilizável
4. Crie schema SQL para nova tabela

### Exemplo de Uso do Hook
```tsx
const { isLoading, error, success, submitForm } = useSupabaseForm({
  endpoint: '/api/meu-formulario',
  onSuccess: (data) => console.log('Sucesso:', data),
  onError: (error) => console.error('Erro:', error)
});
```

## Testes

### Testar a API Diretamente
```bash
# GET - Verificar se API está funcionando
curl http://localhost:3000/api/contact

# POST - Enviar dados de teste
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste","email":"teste@email.com","message":"Mensagem de teste"}'
```

### Testar no Browser
1. Acesse `/contact`
2. Preencha o formulário
3. Verifique os dados no Supabase Dashboard

## Monitoramento

### Logs Importantes
- Erros de validação
- Falhas de conexão com Supabase
- Tentativas de inserção maliciosas

### Métricas Sugeridas
- Taxa de sucesso de envios
- Tempo de resposta da API
- Erros por tipo

## Próximos Passos

1. **Configurar RLS no Supabase** para maior segurança
2. **Implementar rate limiting** para prevenir spam
3. **Adicionar notificações por email** quando novos contatos chegarem
4. **Criar dashboard admin** para gerenciar contatos
5. **Implementar testes automatizados**
