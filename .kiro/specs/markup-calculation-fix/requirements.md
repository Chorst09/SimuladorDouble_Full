# Requirements Document - Correção do Cálculo de Markup

## Introduction

O sistema de precificação de máquinas virtuais possui um erro no cálculo da margem líquida baseada no markup. A fórmula atual não está calculando corretamente a margem líquida, e o sistema também precisa de melhorias visuais com cores azuis escuras e claras para melhor contraste em fundos brancos.

## Requirements

### Requirement 1

**User Story:** Como um usuário do sistema de precificação, eu quero que o cálculo da margem líquida seja preciso e baseado nas fórmulas financeiras corretas, para que eu possa tomar decisões de precificação confiáveis.

#### Acceptance Criteria

1. WHEN o markup for inserido THEN o sistema deve calcular a margem líquida usando a fórmula correta: Margem Líquida = (Markup / (1 + Markup/100)) * 100
2. WHEN impostos e comissões forem configurados THEN estes devem ser deduzidos do markup antes do cálculo da margem líquida
3. WHEN o markup for zero ou negativo THEN a margem líquida deve ser exibida como 0%
4. WHEN os valores de impostos ou comissões mudarem THEN a margem líquida deve ser recalculada automaticamente

### Requirement 2

**User Story:** Como um usuário, eu quero que o sistema use a fórmula correta para converter markup em margem líquida, para que os cálculos financeiros sejam precisos.

#### Acceptance Criteria

1. WHEN o markup for 50% THEN a margem líquida deve ser calculada como 33.33%
2. WHEN o markup for 100% THEN a margem líquida deve ser calculada como 50%
3. WHEN houver impostos de 15% e comissões de 5% THEN estes devem ser subtraídos do markup antes da conversão
4. IF o markup for menor que a soma de impostos e comissões THEN a margem líquida deve ser 0%

### Requirement 3

**User Story:** Como um usuário, eu quero que o preço final seja calculado corretamente aplicando o markup sobre o custo base, para que a precificação seja consistente.

#### Acceptance Criteria

1. WHEN o custo base for calculado THEN o markup deve ser aplicado sobre este valor
2. WHEN o markup for aplicado THEN os impostos devem ser calculados sobre o valor com markup
3. WHEN o preço final for exibido THEN deve incluir custo base + markup + impostos
4. IF houver descontos contratuais THEN devem ser aplicados após todos os cálculos

### Requirement 4

**User Story:** Como um usuário, eu quero uma interface com melhor contraste visual usando tons de azul, para que seja mais fácil de ler e usar.

#### Acceptance Criteria

1. WHEN a interface for exibida em fundo branco THEN os cards devem usar azul escuro (#1e3a8a ou similar)
2. WHEN elementos secundários forem exibidos THEN devem usar azul mais claro (#3b82f6 ou similar)
3. WHEN texto for exibido sobre fundos azuis THEN deve usar branco para máximo contraste
4. IF houver elementos de destaque THEN devem usar gradientes de azul para profundidade visual

### Requirement 5

**User Story:** Como um usuário, eu quero que os cálculos sejam transparentes e auditáveis, para que eu possa verificar a precisão dos resultados.

#### Acceptance Criteria

1. WHEN cálculos forem realizados THEN o sistema deve logar os passos intermediários no console
2. WHEN a margem líquida for calculada THEN deve mostrar a fórmula aplicada
3. WHEN valores forem alterados THEN deve exibir como isso afeta o resultado final
4. IF houver erros nos cálculos THEN deve alertar o usuário com mensagens claras

### Requirement 6

**User Story:** Como um desenvolvedor, eu quero que as fórmulas financeiras sejam implementadas seguindo padrões contábeis, para que o sistema seja confiável e auditável.

#### Acceptance Criteria

1. WHEN markup for convertido em margem THEN deve usar a fórmula padrão: Margem = Markup / (1 + Markup)
2. WHEN impostos forem aplicados THEN devem seguir a legislação brasileira (PIS/COFINS/ISS)
3. WHEN comissões forem calculadas THEN devem ser baseadas no valor de venda
4. IF múltiplos regimes tributários existirem THEN cada um deve ter suas alíquotas específicas