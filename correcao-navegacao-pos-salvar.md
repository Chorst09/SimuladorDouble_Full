# Correção de Navegação Após Salvar Proposta

## Problema Identificado
Na InternetFibraCalculator, após salvar uma proposta, o sistema não estava retornando automaticamente para a tela de "Buscar Propostas", permanecendo na tela da calculadora.

## Solução Implementada

### ✅ InternetFibraCalculator - CORRIGIDO
**Arquivo**: `src/components/calculators/InternetFibraCalculator.tsx`

**Problema**: Faltava navegação após salvar proposta
**Solução**: Adicionado `clearForm()` e `setViewMode('search')` após `fetchProposals()`

**Código corrigido:**
```tsx
fetchProposals();
clearForm();
setViewMode('search');
```

## Verificação de Outras Calculadoras

### ✅ PABXSIPCalculator - JÁ CORRETO
- Já implementa `clearForm()` e `setCurrentView('search')` após salvar
- Não precisa de correção

### ✅ RadioInternetCalculator - JÁ CORRETO  
- Já implementa `clearForm()` e `setViewMode('search')` após salvar
- Não precisa de correção

### ✅ InternetManCalculator - JÁ CORRETO
- Já implementa `setViewMode('search')` após salvar
- Não precisa de correção

### ✅ DoubleFibraRadioCalculator - JÁ CORRETO
- Já implementa `clearForm()` e `setViewMode('search')` após salvar
- Não precisa de correção

### ✅ MaquinasVirtuaisCalculator - JÁ CORRETO
- Já implementa `setViewMode('search')` após salvar
- Não precisa de correção

## Padrão Implementado

Todas as calculadoras agora seguem o padrão correto após salvar uma proposta:

```tsx
const saveProposal = async () => {
    try {
        // ... lógica de salvamento ...
        
        fetchProposals();    // Atualiza lista de propostas
        clearForm();         // Limpa o formulário
        setViewMode('search'); // Navega para tela de busca
        
    } catch (error) {
        // ... tratamento de erro ...
    }
};
```

## Status Final
✅ **PROBLEMA RESOLVIDO**: A InternetFibraCalculator agora navega corretamente para a tela de buscar propostas após salvar uma proposta, seguindo o mesmo padrão das outras calculadoras.