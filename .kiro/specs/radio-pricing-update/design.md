# Design Document

## Overview

Este design aborda a atualização da tabela de preços do RadioInternetCalculator com novos valores baseados na tabela de referência fornecida. A solução envolve a atualização dos valores iniciais no array `initialRadioPlans` e a implementação de lógica para aplicar os maiores valores das faixas de preço, com tratamento especial para prazos de 48 e 60 meses.

## Architecture

A atualização será implementada diretamente no componente `RadioInternetCalculator.tsx`, modificando:

- **Dados Iniciais**: Array `initialRadioPlans` com novos valores da tabela de referência
- **Lógica de Preços**: Aplicação dos maiores valores das faixas para cada prazo
- **Tratamento Especial**: Prazos de 48 e 60 meses usarão valores de 36 meses
- **Validação**: Garantia de que todos os valores estão corretos e consistentes

## Components and Interfaces

### Estrutura de Dados Existente
```typescript
interface RadioPlan {
    speed: number;
    price12: number;
    price24: number;
    price36: number;
    price48: number;
    price60: number;
    installationCost: number;
    description: string;
    baseCost: number;
}
```

### Mapeamento de Preços da Tabela de Referência

Baseado na imagem fornecida, os novos valores serão:

**12 meses (coluna "12 Valor"):**
- 25 Mbps: R$ 720,00
- 30 Mbps: R$ 740,08
- 40 Mbps: R$ 915,01
- 50 Mbps: R$ 1.103,39
- 60 Mbps: R$ 1.547,44
- 80 Mbps: R$ 1.825,98
- 100 Mbps: R$ 2.017,05
- 150 Mbps: R$ 2.543,18
- 200 Mbps: R$ 3.215,98
- 300 Mbps: R$ 7.522,00
- 400 Mbps: R$ 9.469,00
- 500 Mbps: R$ 11.174,00

**24 meses (maior valor da faixa "24 Valor"):**
- 25 Mbps: R$ 527,00
- 30 Mbps: R$ 579,00
- 40 Mbps: R$ 632,00
- 50 Mbps: R$ 685,00
- 60 Mbps: R$ 790,00
- 80 Mbps: R$ 1.000,00
- 100 Mbps: R$ 1.578,00
- 150 Mbps: R$ 1.789,00
- 200 Mbps: R$ 2.053,00
- 300 Mbps: R$ 4.316,00
- 400 Mbps: R$ 5.211,00
- 500 Mbps: R$ 5.789,00
- 600 Mbps: R$ 6.315,00

**36 meses (maior valor da faixa "36 Valor"):**
- 25 Mbps: R$ 474,00
- 30 Mbps: R$ 527,00
- 40 Mbps: R$ 579,00
- 50 Mbps: R$ 632,00
- 60 Mbps: R$ 737,00
- 80 Mbps: R$ 948,00
- 100 Mbps: R$ 1.316,00
- 150 Mbps: R$ 1.527,00
- 200 Mbps: R$ 1.737,00
- 300 Mbps: R$ 4.000,00
- 400 Mbps: R$ 4.736,00
- 500 Mbps: R$ 5.253,00
- 600 Mbps: R$ 5.790,00

**48 e 60 meses:** Usarão os mesmos valores de 36 meses conforme solicitado.

### Velocidades Não Definidas na Tabela

Para velocidades não especificadas na tabela de referência (700, 800, 900, 1000 Mbps), será aplicada uma lógica de extrapolação baseada na progressão dos valores existentes.

## Data Models

### Atualização do Array initialRadioPlans

O array será completamente atualizado com os novos valores, mantendo a mesma estrutura mas com preços corretos para cada velocidade e prazo contratual.

### Custos de Instalação

Os custos de instalação serão mantidos conforme a lógica atual:
- Até R$ 4.500,00: R$ 998,00
- De R$ 4.500,01 até R$ 8.000,00: R$ 1.996,00
- Acima de R$ 8.000,00: R$ 2.500,00

## Error Handling

### Validação de Valores
- Verificação se todos os preços são números positivos
- Validação de que os preços seguem uma progressão lógica (geralmente decrescente com prazos maiores)
- Tratamento de casos onde valores podem estar ausentes

### Fallback para Valores Não Definidos
- Para velocidades sem preços definidos, aplicar interpolação baseada em velocidades similares
- Manter valores existentes como fallback em caso de erro na atualização

## Testing Strategy

### Validação Manual
- Verificar se todos os valores da tabela de referência foram aplicados corretamente
- Testar cálculos com diferentes combinações de velocidade e prazo
- Confirmar que prazos de 48 e 60 meses usam valores de 36 meses

### Testes de Integração
- Verificar se os novos preços são aplicados corretamente nos cálculos de propostas
- Testar persistência dos valores quando salvos pelo administrador
- Confirmar que a interface exibe os valores corretos

## Implementation Considerations

### Precisão de Valores
- Manter precisão de centavos nos cálculos
- Usar formatação adequada para exibição de valores monetários
- Garantir que arredondamentos não causem inconsistências

### Compatibilidade
- Manter compatibilidade com propostas existentes
- Não quebrar funcionalidades existentes do calculador
- Preservar a estrutura de dados atual

### Performance
- A atualização não deve impactar significativamente o desempenho
- Valores são carregados uma vez na inicialização do componente
- Cálculos permanecem eficientes com os novos valores