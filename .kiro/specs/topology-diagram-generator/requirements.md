# Requirements Document

## Introduction

Este documento define os requisitos para implementar um sistema de geração automática de desenhos de topologia no Site Survey. O sistema deve criar diagramas visuais baseados no tipo de serviço selecionado (Internet via Fibra, Internet via Rádio, Access Points Wi-Fi, e o novo tipo SD-WAN), permitindo uma visualização clara da arquitetura de rede proposta para cada cliente.

## Requirements

### Requirement 1

**User Story:** Como um técnico realizando site survey, eu quero que o sistema gere automaticamente um desenho da topologia de rede baseado no tipo de serviço selecionado, para que eu possa visualizar e apresentar a arquitetura proposta ao cliente de forma clara e profissional.

#### Acceptance Criteria

1. WHEN o usuário seleciona um tipo de survey (fibra, rádio, wifi, ou sd-wan) THEN o sistema SHALL gerar automaticamente um diagrama de topologia correspondente
2. WHEN o diagrama é gerado THEN o sistema SHALL exibir os componentes de rede apropriados para o tipo de serviço selecionado
3. WHEN o usuário visualiza o diagrama THEN o sistema SHALL apresentar uma representação visual clara e profissional da topologia

### Requirement 2

**User Story:** Como um técnico, eu quero ter acesso ao novo tipo de survey "SD-WAN" na lista de opções, para que eu possa realizar levantamentos para soluções de rede definida por software.

#### Acceptance Criteria

1. WHEN o usuário acessa o formulário de seleção de tipo de survey THEN o sistema SHALL incluir "SD-WAN" como uma opção disponível
2. WHEN o usuário seleciona "SD-WAN" THEN o sistema SHALL permitir prosseguir com o formulário específico para este tipo de serviço
3. WHEN "SD-WAN" é selecionado THEN o sistema SHALL gerar um diagrama de topologia específico para arquitetura SD-WAN

### Requirement 3

**User Story:** Como um técnico, eu quero que cada tipo de serviço (fibra, rádio, wifi, sd-wan) tenha seu próprio template de diagrama de topologia, para que a representação visual seja precisa e específica para cada tecnologia.

#### Acceptance Criteria

1. WHEN o tipo "fibra" é selecionado THEN o sistema SHALL gerar um diagrama mostrando OLT, splitters, ONT e equipamentos do cliente
2. WHEN o tipo "rádio" é selecionado THEN o sistema SHALL gerar um diagrama mostrando torres, antenas, enlaces ponto-a-ponto e equipamentos terminais
3. WHEN o tipo "wifi" é selecionado THEN o sistema SHALL gerar um diagrama mostrando access points, controladores, switches e cobertura de área
4. WHEN o tipo "sd-wan" é selecionado THEN o sistema SHALL gerar um diagrama mostrando appliances SD-WAN, conexões WAN múltiplas, cloud controller e sites remotos

### Requirement 4

**User Story:** Como um técnico, eu quero poder visualizar o diagrama de topologia durante o preenchimento do formulário de survey, para que eu possa validar se a configuração proposta atende às necessidades do cliente.

#### Acceptance Criteria

1. WHEN o usuário está preenchendo o formulário detalhado do survey THEN o sistema SHALL exibir o diagrama de topologia correspondente
2. WHEN o diagrama é exibido THEN o sistema SHALL posicioná-lo de forma que não interfira no preenchimento do formulário
3. WHEN o usuário completa seções do formulário THEN o sistema SHALL manter o diagrama visível e atualizado

### Requirement 5

**User Story:** Como um técnico, eu quero poder exportar ou salvar o diagrama de topologia gerado, para que eu possa incluí-lo em relatórios e apresentações para o cliente.

#### Acceptance Criteria

1. WHEN o diagrama de topologia é exibido THEN o sistema SHALL fornecer opções para exportar o diagrama
2. WHEN o usuário solicita exportação THEN o sistema SHALL permitir salvar o diagrama em formatos comuns (PNG, PDF, SVG)
3. WHEN o diagrama é exportado THEN o sistema SHALL incluir informações básicas do cliente e tipo de serviço no arquivo

### Requirement 6

**User Story:** Como um técnico, eu quero que o diagrama seja responsivo e se adapte a diferentes tamanhos de tela, para que eu possa visualizá-lo adequadamente em tablets e dispositivos móveis durante visitas em campo.

#### Acceptance Criteria

1. WHEN o diagrama é exibido em dispositivos móveis THEN o sistema SHALL ajustar automaticamente o tamanho e layout dos componentes
2. WHEN a orientação da tela muda THEN o sistema SHALL reorganizar o diagrama para melhor aproveitamento do espaço
3. WHEN o usuário faz zoom ou pan no diagrama THEN o sistema SHALL manter a qualidade visual e legibilidade dos elementos