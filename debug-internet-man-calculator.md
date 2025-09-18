# Debug - InternetManCalculator

## Problema
Os dados do cliente não estão sendo salvos na InternetManCalculator, resultando em erro "undefined field" no Firestore.

## Debug Implementado

Adicionei console.logs para rastrear o fluxo dos dados:

### 1. Na função `handleClientFormSubmit`:
```tsx
console.log('Setting client data:', client);
console.log('Setting account manager data:', manager);
```

### 2. Na função `saveProposal`:
```tsx
console.log('Client data at save:', clientData);
console.log('Account manager data at save:', accountManagerData);
console.log('Added products at save:', addedProducts);
```

## Como Testar

1. **Abra o Console do Navegador** (F12 → Console)

2. **Acesse a InternetManCalculator**

3. **Clique em "Nova Proposta"**
   - Deve ir para o formulário do cliente

4. **Preencha os dados do cliente e gerente**
   - Nome do cliente: "Teste Cliente"
   - Nome do gerente: "Teste Gerente"
   - Outros campos conforme necessário

5. **Clique em "Continuar"**
   - Verifique no console se aparecem as mensagens:
     - "Setting client data: {name: 'Teste Cliente', ...}"
     - "Setting account manager data: {name: 'Teste Gerente', ...}"

6. **Adicione um produto à proposta**

7. **Tente salvar a proposta**
   - Verifique no console se aparecem as mensagens:
     - "Client data at save: {name: 'Teste Cliente', ...}"
     - "Account manager data at save: {name: 'Teste Gerente', ...}"
     - "Added products at save: [...]"

## Possíveis Cenários

### ✅ Cenário 1: Dados chegam corretamente
Se os console.logs mostram os dados corretos, o problema pode estar na validação ou no salvamento no Firestore.

### ❌ Cenário 2: Dados estão vazios no save
Se os dados estão vazios na função `saveProposal`, significa que estão sendo perdidos entre o formulário e o salvamento.

### ❌ Cenário 3: Dados não são definidos no handleClientFormSubmit
Se os dados não aparecem no `handleClientFormSubmit`, o problema está no formulário do cliente.

## Próximos Passos

Dependendo do resultado do debug:

1. **Se dados estão corretos**: Verificar validação e salvamento
2. **Se dados estão vazios**: Verificar se há algum reset dos estados
3. **Se dados não chegam do formulário**: Verificar o componente ClientManagerForm

## Teste Rápido

Para testar rapidamente, você pode:

1. Ir para InternetManCalculator
2. Clicar em "Nova Proposta"
3. Preencher o formulário
4. Tentar salvar
5. Verificar os logs no console

Me informe o que aparece no console para eu poder identificar onde está o problema!