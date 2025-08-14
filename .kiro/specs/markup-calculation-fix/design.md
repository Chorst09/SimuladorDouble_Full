# Design Document - Correção do Cálculo de Markup

## Overview

O design da correção do cálculo de markup foca em implementar fórmulas financeiras corretas para conversão de markup em margem líquida, aplicação adequada de impostos e comissões, e melhorias visuais com esquema de cores azul para melhor contraste. A solução corrigirá os cálculos matemáticos e implementará um sistema de cores consistente baseado em tons de azul.

## Architecture

### Componente Principal: PricingCalculator
- **Responsabilidade**: Gerenciar cálculos de precificação com fórmulas corretas
- **Estado**: Configurações de preços, impostos, comissões e markup
- **Integração**: Coordena cálculos financeiros e renderização visual

### Módulo de Cálculos Financeiros
- **Markup Conversion**: Converte markup em margem líquida usando fórmulas corretas
- **Tax Calculation**: Aplica impostos sobre valores com markup
- **Price Calculation**: Calcula preço final com todos os componentes
- **Validation**: Valida consistência dos cálculos

### Módulo de Interface Visual
- **Color System**: Sistema de cores baseado em azul escuro e claro
- **Card Components**: Cards com contraste adequado para fundos brancos
- **Typography**: Tipografia otimizada para legibilidade em fundos azuis
- **Visual Feedback**: Indicadores visuais para cálculos e estados

## Components and Interfaces

### 1. Financial Calculation Interface
```typescript
interface FinancialCalculator {
  calculateNetMargin(markup: number, taxes: number, commission: number): number;
  calculateFinalPrice(basePrice: number, markup: number, taxes: number): number;
  validateCalculation(config: PricingConfig): ValidationResult;
}

interface PricingFormulas {
  // Fórmula correta: Margem = Markup / (1 + Markup/100)
  markupToMargin(markup: number): number;
  
  // Fórmula inversa: Markup = Margem / (1 - Margem/100)
  marginToMarkup(margin: number): number;
  
  // Aplicação de impostos sobre valor com markup
  applyTaxes(valueWithMarkup: number, taxRate: number): number;
  
  // Cálculo de comissões sobre valor final
  calculateCommission(finalValue: number, commissionRate: number): number;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  calculationSteps: CalculationStep[];
}

interface CalculationStep {
  step: string;
  formula: string;
  input: number;
  output: number;
  description: string;
}
```

### 2. Visual Theme Interface
```typescript
interface BlueTheme {
  colors: {
    primary: {
      dark: '#1e3a8a';      // Azul escuro para cards principais
      medium: '#3b82f6';    // Azul médio para elementos secundários
      light: '#93c5fd';     // Azul claro para backgrounds sutis
      accent: '#1d4ed8';    // Azul de destaque para botões
    };
    text: {
      onDark: '#ffffff';    // Texto branco em fundos escuros
      onLight: '#1e3a8a';   // Texto azul escuro em fundos claros
      muted: '#64748b';     // Texto secundário
    };
    background: {
      card: '#1e3a8a';      // Fundo de cards
      cardSecondary: '#3b82f6'; // Fundo de cards secundários
      page: '#f8fafc';      // Fundo da página
      input: '#ffffff';     // Fundo de inputs
    };
    border: {
      primary: '#3b82f6';   // Bordas principais
      secondary: '#cbd5e1'; // Bordas secundárias
    };
  };
  gradients: {
    cardPrimary: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)';
    cardSecondary: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)';
    button: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)';
  };
}

interface StyledComponents {
  Card: React.ComponentType<CardProps>;
  Button: React.ComponentType<ButtonProps>;
  Input: React.ComponentType<InputProps>;
  Badge: React.ComponentType<BadgeProps>;
}
```

### 3. Enhanced Pricing Configuration
```typescript
interface EnhancedPricingConfig {
  // Configurações básicas
  markup: number;
  netMargin: number; // Calculado automaticamente
  
  // Impostos por regime tributário
  taxes: {
    [regime: string]: {
      pisCofins: number;
      iss: number;
      csllIr: number;
      total: number; // Calculado automaticamente
    };
  };
  
  // Comissões
  commission: number;
  
  // Validação e auditoria
  calculationLog: CalculationStep[];
  lastUpdated: Date;
  isValid: boolean;
}
```

## Data Models

### 1. Calculation Models
```typescript
interface MarkupCalculation {
  basePrice: number;
  markup: number;
  markupValue: number;        // basePrice * (markup/100)
  priceWithMarkup: number;    // basePrice + markupValue
  taxes: number;              // Impostos sobre priceWithMarkup
  commission: number;         // Comissão sobre valor final
  finalPrice: number;         // Preço final total
  netMargin: number;          // Margem líquida calculada
  
  // Auditoria
  formula: string;
  steps: CalculationStep[];
  confidence: number;
}

interface TaxCalculation {
  regime: string;
  baseValue: number;
  pisCofins: number;
  iss: number;
  csllIr: number;
  totalTaxes: number;
  effectiveRate: number;
}
```

### 2. Visual Models
```typescript
interface ThemeConfig {
  name: 'blue-professional';
  colors: BlueTheme['colors'];
  gradients: BlueTheme['gradients'];
  spacing: {
    card: string;
    section: string;
    element: string;
  };
  typography: {
    heading: string;
    body: string;
    caption: string;
  };
  shadows: {
    card: string;
    button: string;
    input: string;
  };
}

interface ComponentVariants {
  card: {
    primary: string;
    secondary: string;
    accent: string;
  };
  button: {
    primary: string;
    secondary: string;
    outline: string;
  };
  badge: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}
```

## Error Handling

### 1. Calculation Errors
- **Invalid Markup**: Markup negativo ou muito alto (>1000%)
- **Tax Configuration**: Alíquotas de impostos inválidas ou inconsistentes
- **Commission Overflow**: Comissão maior que a margem disponível
- **Precision Loss**: Perda de precisão em cálculos com muitas casas decimais

### 2. Visual Errors
- **Color Contrast**: Verificar contraste mínimo WCAG AA (4.5:1)
- **Theme Loading**: Fallback para cores padrão se tema não carregar
- **Responsive Issues**: Adaptação para diferentes tamanhos de tela
- **Browser Compatibility**: Suporte para gradientes em navegadores antigos

### 3. Error Recovery Strategies
- **Calculation Fallback**: Usar fórmulas simplificadas se cálculos complexos falharem
- **Visual Fallback**: Cores sólidas se gradientes não funcionarem
- **Validation Feedback**: Mensagens claras sobre erros de entrada
- **Auto-correction**: Correção automática de valores fora de faixa válida

## Testing Strategy

### 1. Calculation Tests
- **Formula Accuracy**: Testar fórmulas com valores conhecidos
- **Edge Cases**: Markup 0%, 100%, 1000% e valores negativos
- **Tax Scenarios**: Diferentes regimes tributários e alíquotas
- **Precision Tests**: Verificar precisão com números decimais

### 2. Visual Tests
- **Contrast Ratio**: Verificar contraste em todas as combinações de cores
- **Theme Consistency**: Garantir aplicação consistente do tema
- **Responsive Design**: Testar em diferentes resoluções
- **Accessibility**: Verificar compatibilidade com leitores de tela

### 3. Integration Tests
- **Real-time Updates**: Mudanças de markup refletindo na margem
- **Cross-component**: Cálculos consistentes entre componentes
- **Performance**: Tempo de resposta para recálculos
- **Memory Usage**: Uso de memória com múltiplas propostas

## Implementation Approach

### Phase 1: Correção das Fórmulas Financeiras
1. **Markup to Margin**: Implementar fórmula correta de conversão
2. **Tax Application**: Corrigir aplicação de impostos sobre valor com markup
3. **Price Calculation**: Revisar cálculo do preço final
4. **Validation**: Adicionar validação de consistência

### Phase 2: Sistema de Cores Azul
1. **Color Palette**: Definir paleta de azuis com contraste adequado
2. **Component Styling**: Aplicar cores aos componentes existentes
3. **Gradients**: Implementar gradientes para profundidade visual
4. **Typography**: Ajustar cores de texto para máximo contraste

### Phase 3: Auditoria e Transparência
1. **Calculation Logging**: Implementar logs detalhados de cálculos
2. **Step-by-step Display**: Mostrar passos dos cálculos para o usuário
3. **Formula Display**: Exibir fórmulas aplicadas
4. **Validation Feedback**: Mensagens claras sobre validação

### Phase 4: Testes e Refinamentos
1. **Unit Testing**: Testes abrangentes das fórmulas
2. **Visual Testing**: Verificação de contraste e acessibilidade
3. **User Testing**: Validação com usuários reais
4. **Performance**: Otimização de performance dos cálculos

## Technical Considerations

### 1. Mathematical Precision
- **Decimal Handling**: Usar bibliotecas como decimal.js para precisão
- **Rounding Strategy**: Definir estratégia consistente de arredondamento
- **Overflow Protection**: Proteger contra overflow em cálculos
- **Validation Ranges**: Definir faixas válidas para cada parâmetro

### 2. Visual Performance
- **CSS-in-JS**: Usar styled-components ou emotion para temas dinâmicos
- **Color Calculations**: Funções para calcular variações de cor
- **Gradient Optimization**: Otimizar gradientes para performance
- **Theme Switching**: Preparar para futuros temas alternativos

### 3. User Experience
- **Real-time Feedback**: Atualizações instantâneas nos cálculos
- **Visual Hierarchy**: Usar cores para guiar atenção do usuário
- **Error Prevention**: Validação em tempo real para prevenir erros
- **Accessibility**: Garantir usabilidade para todos os usuários

## Formula Reference

### Fórmulas Corretas a Implementar

1. **Conversão Markup → Margem Líquida**:
   ```
   Margem Líquida = Markup / (1 + Markup/100)
   ```

2. **Preço com Markup**:
   ```
   Preço com Markup = Custo Base × (1 + Markup/100)
   ```

3. **Impostos sobre Venda**:
   ```
   Impostos = Preço com Markup × (Taxa de Impostos/100)
   ```

4. **Preço Final**:
   ```
   Preço Final = Preço com Markup + Impostos
   ```

5. **Margem Líquida Real** (considerando impostos e comissões):
   ```
   Margem Real = ((Preço Final - Custo Base - Impostos - Comissões) / Preço Final) × 100
   ```