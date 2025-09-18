# Implementation Plan

- [x] 1. Atualizar valores da tabela de preços no array initialRadioPlans
  - Substituir todos os valores atuais (R$ 579,00) pelos novos valores da tabela de referência
  - Aplicar os maiores valores das faixas de preço para cada velocidade e prazo contratual
  - Configurar prazos de 48 e 60 meses para usar os valores de 36 meses
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Implementar valores para velocidades de 25 a 100 Mbps
  - Atualizar preços para 25 Mbps: 12m=720,00, 24m=527,00, 36m=474,00
  - Atualizar preços para 30 Mbps: 12m=740,08, 24m=579,00, 36m=527,00
  - Atualizar preços para 40 Mbps: 12m=915,01, 24m=632,00, 36m=579,00
  - Atualizar preços para 50 Mbps: 12m=1103,39, 24m=685,00, 36m=632,00
  - Atualizar preços para 60 Mbps: 12m=1547,44, 24m=790,00, 36m=737,00
  - Atualizar preços para 80 Mbps: 12m=1825,98, 24m=1000,00, 36m=948,00
  - Atualizar preços para 100 Mbps: 12m=2017,05, 24m=1578,00, 36m=1316,00
  - _Requirements: 1.1, 1.2, 2.1, 2.2_

- [x] 3. Implementar valores para velocidades de 150 a 600 Mbps
  - Atualizar preços para 150 Mbps: 12m=2543,18, 24m=1789,00, 36m=1527,00
  - Atualizar preços para 200 Mbps: 12m=3215,98, 24m=2053,00, 36m=1737,00
  - Atualizar preços para 300 Mbps: 12m=7522,00, 24m=4316,00, 36m=4000,00
  - Atualizar preços para 400 Mbps: 12m=9469,00, 24m=5211,00, 36m=4736,00
  - Atualizar preços para 500 Mbps: 12m=11174,00, 24m=5789,00, 36m=5253,00
  - Atualizar preços para 600 Mbps: 24m=6315,00, 36m=5790,00 (12m não definido na tabela)
  - _Requirements: 1.1, 1.2, 2.1, 2.2_

- [x] 4. Definir valores para velocidades altas não especificadas na tabela
  - Implementar lógica para velocidades 700, 800, 900, 1000 Mbps baseada em extrapolação
  - Aplicar progressão consistente com os valores existentes
  - Garantir que valores sejam realistas e seguem a tendência de preços
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 5. Configurar prazos de 48 e 60 meses para usar valores de 36 meses
  - Copiar todos os valores de price36 para price48 e price60
  - Verificar que a lógica está aplicada para todas as velocidades
  - Testar que os cálculos usam os valores corretos para esses prazos
  - _Requirements: 1.3, 2.3_

- [x] 6. Validar e testar os novos valores na interface
  - Verificar se a tabela de preços exibe os valores corretos na interface administrativa
  - Testar cálculos com diferentes combinações de velocidade e prazo contratual
  - Confirmar que os valores são aplicados corretamente nas propostas geradas
  - Verificar formatação monetária e exibição dos valores
  - _Requirements: 2.1, 2.2, 2.3, 3.1_

- [x] 7. Testar persistência e carregamento dos valores atualizados
  - Verificar que os novos valores são carregados corretamente na inicialização
  - Testar que modificações feitas pelo administrador são salvas adequadamente
  - Confirmar que não há regressões na funcionalidade de salvar/carregar preços
  - _Requirements: 1.4, 3.2, 3.3_