# Design Document

## Overview

Esta implementação adicionará um botão "Voltar" consistente nas telas de busca de propostas de todas as calculadoras individuais. A solução será implementada modificando cada calculadora para incluir o botão na seção de busca de propostas, mantendo a consistência visual e funcional em todo o sistema.

## Architecture

A implementação será feita modificando cada componente de calculadora individualmente para adicionar o botão "Voltar" na tela de busca de propostas. Cada calculadora já possui um sistema de navegação baseado em `currentView` que controla qual tela está sendo exibida.

### Component Hierarchy

```
Calculator Components (PABXSIPCalculator, MaquinasVirtuaisCalculator, etc.)
├── Main Calculator View (currentView === 'calculator')
├── Search Proposals View (currentView === 'search') ← Modificação aqui
│   ├── Header Section
│   │   ├── Title "Buscar Propostas"
│   │   └── Back Button (novo) ← Adição
│   ├── Search Input
│   └── Proposals Table
└── Other Views...
```

## Components and Interfaces

### Back Button Component

O botão será implementado usando os componentes UI existentes do projeto:

```typescript
// Usando Button component existente
<Button 
  variant="outline" 
  onClick={() => setCurrentView('calculator')}
  className="flex items-center mb-4"
>
  <ArrowLeft className="h-4 w-4 mr-2" />
  Voltar
</Button>
```

### Calculator Components Modifications

Cada calculadora que possui funcionalidade de busca de propostas será modificada:

1. **PABXSIPCalculator** - Adicionar botão na seção `currentView === 'search'`
2. **MaquinasVirtuaisCalculator** - Adicionar botão na seção de busca
3. **RadioInternetCalculator** - Adicionar botão na seção de busca
4. **InternetFibraCalculator** - Adicionar botão na seção de busca
5. **DoubleFibraRadioCalculator** - Adicionar botão na seção de busca
6. **InternetManCalculator** - Adicionar botão na seção de busca

### Design Consistency

Para manter consistência, o botão seguirá o mesmo padrão usado no ProposalsView:

- **Posicionamento**: Acima do título "Buscar Propostas"
- **Estilo**: Button com variant="outline"
- **Ícone**: ArrowLeft do lucide-react
- **Texto**: "Voltar"
- **Comportamento**: onClick altera currentView para 'calculator'

## Data Models

Não há necessidade de modificações nos modelos de dados existentes. A funcionalidade utiliza apenas o estado local `currentView` que já existe em cada calculadora.

## Error Handling

### Navigation Errors
- Se `setCurrentView` falhar, o usuário ainda pode usar a navegação do navegador
- Fallback para console.error em caso de problemas

### State Management
- Garantir que o estado da calculadora seja preservado ao voltar da busca
- Manter dados preenchidos na calculadora quando retornar da busca

## Testing Strategy

### Unit Tests
1. **Button Rendering**: Verificar se o botão é renderizado corretamente na view de busca
2. **Navigation Function**: Testar se o clique no botão altera currentView corretamente
3. **Accessibility**: Verificar se o botão é acessível via teclado e screen readers

### Integration Tests
1. **Calculator Flow**: Testar navegação completa: calculadora → busca → voltar
2. **State Preservation**: Verificar se dados da calculadora são mantidos após navegação
3. **Cross-Calculator Consistency**: Verificar se o comportamento é consistente entre calculadoras

### Manual Testing
1. Testar em cada calculadora individualmente
2. Verificar responsividade em diferentes tamanhos de tela
3. Testar acessibilidade com navegação por teclado
4. Verificar feedback visual (hover, focus states)