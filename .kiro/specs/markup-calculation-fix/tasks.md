# Implementation Plan - Correção do Cálculo de Markup

- [ ] 1. Corrigir fórmula de conversão markup para margem líquida
  - Implementar fórmula correta: Margem = Markup / (1 + Markup/100)
  - Substituir a fórmula incorreta atual na função calculateNetMargin
  - Adicionar validação para markup negativo ou zero
  - Incluir logs detalhados do cálculo para debugging
  - _Requirements: 1.1, 1.3, 2.1, 2.2_

- [ ] 2. Implementar aplicação correta de impostos e comissões
  - Modificar cálculo para subtrair impostos e comissões do markup antes da conversão
  - Implementar validação quando markup < (impostos + comissões)
  - Atualizar função calculateTotalTaxes para retornar valores corretos
  - Adicionar recálculo automático quando impostos ou comissões mudarem
  - _Requirements: 1.2, 1.4, 2.3, 2.4_

- [ ] 3. Corrigir cálculo do preço final das VMs
  - Revisar função calculateVMPrice para aplicar markup corretamente sobre custo base
  - Implementar aplicação de impostos sobre valor com markup (não sobre custo base)
  - Garantir que descontos contratuais sejam aplicados após todos os cálculos
  - Adicionar validação de consistência entre preço calculado e margem exibida
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 4. Implementar sistema de cores azul escuro e claro




  - Criar paleta de cores baseada em azul escuro (#1e3a8a) e azul claro (#3b82f6)
  - Substituir cores brancas dos cards por tons de azul com contraste adequado
  - Implementar gradientes azuis para profundidade visual em cards principais
  - Ajustar cores de texto para branco em fundos azuis escuros
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 5. Atualizar componentes Card com novo esquema de cores
  - Modificar Card components para usar background azul escuro
  - Implementar variantes de cards (primary, secondary) com diferentes tons de azul
  - Adicionar gradientes sutis para melhorar profundidade visual
  - Garantir contraste mínimo WCAG AA (4.5:1) para acessibilidade
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 6. Implementar sistema de logging transparente dos cálculos
  - Adicionar logs detalhados de cada etapa do cálculo de markup e margem
  - Implementar exibição da fórmula aplicada no console para auditoria
  - Criar sistema de rastreamento de mudanças nos valores de configuração
  - Adicionar alertas claros quando cálculos resultarem em valores inconsistentes
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 7. Implementar validação e tratamento de erros nos cálculos
  - Adicionar validação para markup maior que 1000% com aviso ao usuário
  - Implementar tratamento para divisão por zero nos cálculos de margem
  - Criar mensagens de erro claras para configurações inválidas de impostos
  - Adicionar correção automática de valores fora da faixa válida
  - _Requirements: 5.4, 6.1, 6.2_

- [ ] 8. Atualizar interface de configurações com cores azuis
  - Aplicar esquema de cores azul na aba "Configurações"
  - Modificar inputs e selects para usar bordas azuis e backgrounds adequados
  - Implementar feedback visual azul para campos ativos e validação
  - Ajustar tipografia para máximo contraste em fundos azuis
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 9. Implementar fórmulas financeiras seguindo padrões contábeis
  - Documentar e implementar fórmula padrão de conversão markup-margem
  - Garantir que impostos sigam legislação brasileira (PIS/COFINS/ISS)
  - Implementar cálculo de comissões baseado no valor de venda final
  - Criar configurações específicas para cada regime tributário brasileiro
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 10. Atualizar componente DREAnalysis com cores azuis
  - Modificar backgrounds dos elementos de breakdown financeiro para tons azuis
  - Implementar gradientes azuis nos elementos de destaque (Lucro Bruto, Lucro Líquido)
  - Ajustar cores do gráfico de pizza para usar paleta azul consistente
  - Garantir legibilidade de todos os textos em fundos azuis
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 11. Implementar testes unitários para fórmulas financeiras
  - Criar testes para conversão markup 50% → margem 33.33%
  - Testar conversão markup 100% → margem 50%
  - Validar cálculos com impostos de 15% e comissões de 5%
  - Testar casos extremos (markup 0%, negativo, muito alto)
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 12. Implementar sistema de validação de contraste visual
  - Criar função para verificar contraste mínimo WCAG AA em todas as combinações
  - Implementar testes automatizados de acessibilidade visual
  - Adicionar fallbacks para casos onde contraste seja insuficiente
  - Documentar todas as combinações de cores aprovadas
  - _Requirements: 4.3, 4.4_

- [ ] 13. Otimizar performance dos cálculos em tempo real
  - Implementar debounce para recálculos quando usuário digita valores
  - Otimizar função calculateNetMargin para execução mais rápida
  - Adicionar memoização para cálculos complexos que não mudam frequentemente
  - Implementar lazy loading para componentes de análise DRE
  - _Requirements: 1.4, 5.3_

- [ ] 14. Criar documentação das fórmulas implementadas
  - Documentar todas as fórmulas financeiras com exemplos práticos
  - Criar guia de referência para conversões markup-margem
  - Documentar configurações de impostos por regime tributário
  - Adicionar exemplos de cálculos passo-a-passo para auditoria
  - _Requirements: 5.1, 5.2, 6.1_

- [ ] 15. Realizar testes finais e validação completa
  - Testar todos os cálculos com valores reais de mercado
  - Validar precisão das fórmulas comparando com cálculos manuais
  - Verificar contraste visual em diferentes dispositivos e navegadores
  - Testar acessibilidade com leitores de tela e ferramentas de auditoria
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2_