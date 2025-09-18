# Guia da Pages API com Supabase

Este guia explica como usar a Pages API (Serverless Functions) do Next.js para inserir dados no Supabase.

## Diferenças entre App Router e Pages API

### App Router (src/app/api)
- **Localização**: `src/app/api/route.ts`
- **Formato**: Route Handlers (Next.js 13+)
- **Funções**: `GET`, `POST`, `PUT`, `DELETE` como funções nomeadas
- **Moderno**: Abordagem mais recente do Next.js

### Pages API (pages/api)
- **Localização**: `pages/api/contact.js`
- **Formato**: API Routes tradicionais
- **Função**: `handler` única que gerencia todos os métodos
- **Compatível**: Funciona em todas as versões do Next.js

## Arquivos Criados

### 1. API Route JavaScript
- **Arquivo**: `pages/api/contact.js`
- **Descrição**: Versão JavaScript da API Route
- **Uso**: Para projetos que preferem JavaScript

### 2. API Route TypeScript
- **Arquivo**: `pages/api/contact.ts`
- **Descrição**: Versão TypeScript com tipagem completa
- **Uso**: Para projetos TypeScript (recomendado)

### 3. Componente do Formulário
- **Arquivo**: `src/components/ContactFormPagesAPI.tsx`
- **Descrição**: Componente que consome a Pages API
- **Diferença**: Usa `/api/contact` em vez de `/api/contact/route`

### 4. Página de Exemplo
- **Arquivo**: `src/app/contact-pages-api/page.tsx`
- **Descrição**: Demonstra o uso do formulário com Pages API

## Estrutura da Pages API

```javascript
export default async function handler(req, res) {
  // Verificar método HTTP
  if (req.method === 'POST') {
    // Lógica para POST
    const { name, email, message } = req.body;
    
    // Inserir no Supabase
    const { data, error } = await supabase
      .from('contacts')
      .insert([{ name, email, message }]);
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    return res.status(200).json({ message: 'Sucesso', data });
  } else {
    // Método não permitido
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
```

## Validações Implementadas

### Server-side
- ✅ Campos obrigatórios (name, email, message)
- ✅ Formato de email válido
- ✅ Tamanho máximo dos campos
- ✅ Sanitização de dados (trim, toLowerCase)
- ✅ Tratamento de erros do Supabase

### Client-side
- ✅ Validação HTML5 (required, type="email")
- ✅ Estados de loading
- ✅ Feedback visual de sucesso/erro

## Configuração CORS

A API inclui headers CORS para permitir requisições de diferentes origens:

```javascript
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
```

## Como Testar

### 1. Teste Manual no Browser
```
1. Acesse: http://localhost:3000/contact-pages-api
2. Preencha o formulário
3. Clique em "Enviar Mensagem"
4. Verifique os dados no Supabase Dashboard
```

### 2. Teste com cURL
```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@email.com",
    "message": "Mensagem de teste"
  }'
```

### 3. Teste com Postman
```
POST http://localhost:3000/api/contact
Content-Type: application/json

{
  "name": "Maria Santos",
  "email": "maria@email.com",
  "message": "Teste via Postman"
}
```

## Respostas da API

### Sucesso (200)
```json
{
  "message": "Mensagem enviada com sucesso! Entraremos em contato em breve.",
  "data": {
    "id": "uuid-aqui",
    "name": "João Silva",
    "email": "joao@email.com",
    "message": "Mensagem de teste",
    "created_at": "2024-01-01T10:00:00Z",
    "status": "pending"
  }
}
```

### Erro de Validação (400)
```json
{
  "error": "Todos os campos são obrigatórios (nome, email, mensagem)."
}
```

### Erro do Servidor (500)
```json
{
  "error": "Erro interno do servidor. Tente novamente mais tarde."
}
```

### Método Não Permitido (405)
```json
{
  "error": "Method GET Not Allowed"
}
```

## Vantagens da Pages API

### ✅ Prós
- **Simplicidade**: Estrutura mais simples e familiar
- **Compatibilidade**: Funciona em todas as versões do Next.js
- **Flexibilidade**: Fácil de personalizar e estender
- **Debugging**: Mais fácil de debugar com uma função única

### ⚠️ Contras
- **Menos moderno**: App Router é a abordagem mais recente
- **Menos performático**: App Router tem otimizações mais recentes
- **Menos recursos**: Menos features avançadas que Route Handlers

## Quando Usar Pages API

### Use Pages API quando:
- Projeto existente já usa Pages API
- Equipe prefere a sintaxe mais simples
- Compatibilidade com versões antigas do Next.js
- Migração gradual de projeto existente

### Use App Router quando:
- Projeto novo
- Quer usar as features mais recentes
- Performance é crítica
- Equipe está confortável com a nova sintaxe

## Migração

Para migrar de Pages API para App Router:

1. **Mover arquivo**:
   ```
   pages/api/contact.js → src/app/api/contact/route.ts
   ```

2. **Alterar estrutura**:
   ```javascript
   // Pages API
   export default async function handler(req, res) {
     if (req.method === 'POST') { /* ... */ }
   }
   
   // App Router
   export async function POST(request) { /* ... */ }
   ```

3. **Atualizar imports**:
   ```javascript
   // Pages API
   import { NextApiRequest, NextApiResponse } from 'next';
   
   // App Router
   import { NextRequest, NextResponse } from 'next/server';
   ```

## Monitoramento

### Logs Importantes
```javascript
console.log('Dados recebidos:', req.body);
console.error('Erro Supabase:', error);
console.log('Inserção bem-sucedida:', data);
```

### Métricas Sugeridas
- Taxa de sucesso das requisições
- Tempo de resposta da API
- Tipos de erro mais comuns
- Volume de requisições por período

## Segurança

### Implementado
- ✅ Validação de entrada
- ✅ Sanitização de dados
- ✅ Tratamento de erros
- ✅ Headers CORS configurados

### Recomendações Adicionais
- 🔒 Rate limiting
- 🔒 CAPTCHA para produção
- 🔒 Autenticação para APIs sensíveis
- 🔒 Logs de auditoria
