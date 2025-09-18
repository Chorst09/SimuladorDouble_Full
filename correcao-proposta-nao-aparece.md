# Correção: Proposta Salva Não Aparece na Lista

## Problema Identificado
Após salvar uma proposta na InternetFibraCalculator, a proposta não estava aparecendo na lista de propostas na tela de busca.

## Causa Raiz
A proposta estava sendo salva no Firestore **sem o campo `userId`**, mas a função `fetchProposals` estava filtrando as propostas por `userId` para usuários que não são admin ou diretor.

### Query de Busca (fetchProposals):
```tsx
// Para usuários normais (não admin/diretor)
q = query(proposalsCol, where('userId', '==', user.uid), where('baseId', '>=', prefix), where('baseId', '<', prefix + 'z'));
```

### Problema no Salvamento:
```tsx
// ANTES - sem userId
await setDoc(newDocRef, {
    ...newProposal,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
});
```

## Solução Implementada

### ✅ Correção 1: Salvamento de Nova Proposta
Adicionado o campo `userId` ao salvar nova proposta:

```tsx
// DEPOIS - com userId
await setDoc(newDocRef, {
    ...newProposal,
    userId: user.uid,  // ← ADICIONADO
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
});
```

### ✅ Correção 2: Atualização de Proposta Existente
Adicionado o campo `userId` ao atualizar proposta existente:

```tsx
// DEPOIS - com userId
await setDoc(proposalRef, {
    ...proposalToSave,
    userId: user.uid,  // ← ADICIONADO
    updatedAt: serverTimestamp()
});
```

## Verificação de Outras Calculadoras

Verifiquei todas as outras calculadoras e confirmei que elas já estão salvando o `userId` corretamente:

- ✅ **PABXSIPCalculator** - Já salva `userId: currentUser.uid`
- ✅ **RadioInternetCalculator** - Já salva `userId: user.uid`
- ✅ **InternetManCalculator** - Já salva `userId: user.uid`
- ✅ **DoubleFibraRadioCalculator** - Já salva `userId: authUser.uid`
- ✅ **MaquinasVirtuaisCalculator** - Já salva `userId: currentUser.uid`

## Resultado

Agora, quando um usuário salvar uma proposta na InternetFibraCalculator:

1. ✅ A proposta será salva com o campo `userId` correto
2. ✅ A função `fetchProposals` conseguirá encontrar a proposta na query
3. ✅ A proposta aparecerá na lista de propostas na tela de busca
4. ✅ O comportamento será consistente com todas as outras calculadoras

## Teste Recomendado

Para testar a correção:
1. Faça login como usuário normal (não admin/diretor)
2. Acesse a InternetFibraCalculator
3. Crie uma nova proposta
4. Salve a proposta
5. Verifique se a proposta aparece na lista de propostas na tela de busca

A proposta agora deve aparecer corretamente na lista!