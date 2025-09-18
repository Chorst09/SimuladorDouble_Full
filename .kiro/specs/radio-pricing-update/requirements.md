# Requirements Document

## Introduction

A tabela de preços do calculador de Internet Rádio precisa ser atualizada com novos valores baseados em uma tabela de referência fornecida. Os preços atuais estão desatualizados e todos os planos estão com o mesmo valor (R$ 579,00), o que não reflete a estrutura de preços real. A atualização deve considerar os maiores valores das faixas de preço para cada prazo contratual, e para os prazos de 48 e 60 meses, deve-se usar o maior valor da coluna de 36 meses.

## Requirements

### Requirement 1

**User Story:** Como administrador do sistema, eu quero atualizar a tabela de preços de Internet Rádio com os novos valores, para que os cálculos de propostas reflitam os preços corretos de mercado.

#### Acceptance Criteria

1. WHEN o administrador acessa a tabela de preços THEN o sistema SHALL exibir os novos valores atualizados conforme a tabela de referência
2. WHEN os preços são atualizados THEN o sistema SHALL aplicar os maiores valores das faixas de preço para cada velocidade e prazo
3. WHEN o prazo é 48 ou 60 meses THEN o sistema SHALL usar o maior valor da coluna de 36 meses
4. WHEN os preços são salvos THEN o sistema SHALL persistir os novos valores para uso em cálculos futuros

### Requirement 2

**User Story:** Como usuário do calculador, eu quero que os cálculos de propostas usem os preços atualizados, para que as propostas geradas tenham valores corretos e competitivos.

#### Acceptance Criteria

1. WHEN uma nova proposta é criada THEN o sistema SHALL usar os preços atualizados da tabela
2. WHEN diferentes velocidades são selecionadas THEN o sistema SHALL aplicar o preço correto correspondente à velocidade escolhida
3. WHEN diferentes prazos contratuais são selecionados THEN o sistema SHALL aplicar o preço correto para o prazo escolhido
4. WHEN o cálculo é realizado THEN o sistema SHALL exibir o valor mensal correto baseado na nova tabela de preços

### Requirement 3

**User Story:** Como desenvolvedor, eu quero que a estrutura de dados seja atualizada corretamente, para que não haja inconsistências entre os dados iniciais e os valores salvos.

#### Acceptance Criteria

1. WHEN o sistema é inicializado THEN o sistema SHALL carregar os novos preços padrão na estrutura RadioPlan
2. WHEN os preços são modificados pelo administrador THEN o sistema SHALL validar os valores inseridos
3. WHEN os dados são persistidos THEN o sistema SHALL manter a integridade dos dados entre sessões
4. WHEN há erro na validação THEN o sistema SHALL exibir mensagens de erro apropriadas

### Requirement 4

**User Story:** Como administrador, eu quero que as velocidades sem preços definidos na tabela de referência sejam tratadas adequadamente, para que o sistema não apresente valores incorretos.

#### Acceptance Criteria

1. WHEN uma velocidade não tem preço definido na tabela de referência THEN o sistema SHALL manter o valor atual ou definir um valor padrão apropriado
2. WHEN velocidades altas (700-1000 Mbps) são acessadas THEN o sistema SHALL aplicar preços consistentes com a estrutura de preços
3. WHEN há lacunas na tabela de preços THEN o sistema SHALL interpolar valores de forma lógica
4. WHEN novos planos são adicionados THEN o sistema SHALL seguir a mesma estrutura de preços estabelecida