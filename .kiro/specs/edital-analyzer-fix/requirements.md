# Requirements Document - Correção do Analisador de Editais

## Introduction

O Analisador de Editais e TDR com IA atualmente não está funcionando corretamente para analisar arquivos PDF e DOCX reais. O sistema precisa ser completamente reescrito para extrair e analisar o conteúdo real dos documentos enviados pelos usuários, identificando produtos, especificações técnicas, valores e prazos de forma precisa.

## Requirements

### Requirement 1

**User Story:** Como um usuário do sistema de pré-vendas, eu quero enviar um arquivo PDF ou DOCX de edital e receber uma análise real do conteúdo, para que eu possa identificar produtos, especificações e oportunidades de negócio.

#### Acceptance Criteria

1. WHEN o usuário faz upload de um arquivo PDF THEN o sistema deve extrair o texto real do documento usando uma biblioteca adequada
2. WHEN o usuário faz upload de um arquivo DOCX THEN o sistema deve extrair o texto real do documento preservando a formatação
3. WHEN o arquivo não puder ser processado THEN o sistema deve exibir uma mensagem de erro clara explicando o problema
4. WHEN o texto for extraído com sucesso THEN o sistema deve exibir no console o conteúdo extraído para debug

### Requirement 2

**User Story:** Como um usuário, eu quero que o sistema identifique automaticamente produtos e suas especificações técnicas no edital, para que eu possa entender rapidamente o que está sendo solicitado.

#### Acceptance Criteria

1. WHEN o texto for analisado THEN o sistema deve identificar itens usando padrões regex mais robustos
2. WHEN um item for identificado THEN o sistema deve extrair sua quantidade, unidade e descrição
3. WHEN especificações técnicas forem encontradas THEN o sistema deve associá-las ao item correto
4. WHEN não houver especificações claras THEN o sistema deve indicar que as especificações não foram encontradas
5. IF múltiplos formatos de item existirem THEN o sistema deve reconhecer todos os padrões comuns

### Requirement 3

**User Story:** Como um usuário, eu quero que o sistema extraia valores monetários e prazos do edital, para que eu possa entender o orçamento e cronograma do projeto.

#### Acceptance Criteria

1. WHEN valores monetários forem encontrados THEN o sistema deve extraí-los com formatação brasileira
2. WHEN prazos forem identificados THEN o sistema deve listá-los de forma organizada
3. WHEN datas específicas forem encontradas THEN o sistema deve formatá-las adequadamente
4. IF não houver valores ou prazos THEN o sistema deve indicar claramente essa ausência

### Requirement 4

**User Story:** Como um usuário, eu quero que o sistema forneça sugestões de produtos baseadas nas especificações reais encontradas, para que eu possa preparar uma proposta técnica adequada.

#### Acceptance Criteria

1. WHEN especificações técnicas forem identificadas THEN o sistema deve sugerir produtos compatíveis
2. WHEN um tipo de produto for reconhecido THEN o sistema deve fornecer modelos específicos com preços estimados
3. WHEN múltiplas opções existirem THEN o sistema deve rankeá-las por adequação às especificações
4. IF especificações forem muito genéricas THEN o sistema deve sugerir opções padrão do mercado

### Requirement 5

**User Story:** Como um usuário, eu quero diferentes tipos de análise (Geral, TDR, Documentação, Produtos), para que eu possa focar no aspecto mais relevante do edital.

#### Acceptance Criteria

1. WHEN "Análise Geral" for selecionada THEN o sistema deve fornecer uma visão abrangente do edital
2. WHEN "TDR" for selecionado THEN o sistema deve focar em produtos e especificações técnicas
3. WHEN "Documentação" for selecionada THEN o sistema deve extrair requisitos de habilitação
4. WHEN "Produtos" for selecionado THEN o sistema deve focar exclusivamente em itens técnicos
5. IF o tipo de análise não for compatível com o conteúdo THEN o sistema deve adaptar a análise

### Requirement 6

**User Story:** Como um usuário, eu quero exportar os resultados da análise em PDF e JSON, para que eu possa compartilhar e reutilizar as informações.

#### Acceptance Criteria

1. WHEN o usuário clicar em "Salvar" THEN o sistema deve gerar um arquivo JSON com todos os dados
2. WHEN o usuário clicar em "Imprimir PDF" THEN o sistema deve gerar um relatório formatado
3. WHEN o PDF for gerado THEN deve incluir todas as seções relevantes da análise
4. IF não houver resultados THEN os botões de exportação devem estar desabilitados

### Requirement 7

**User Story:** Como um desenvolvedor, eu quero que o sistema tenha logs detalhados e tratamento de erros, para que eu possa diagnosticar problemas e melhorar a extração de texto.

#### Acceptance Criteria

1. WHEN um arquivo for processado THEN o sistema deve logar o progresso da extração
2. WHEN erros ocorrerem THEN o sistema deve logar detalhes técnicos no console
3. WHEN a extração falhar THEN o sistema deve tentar métodos alternativos
4. IF nenhum método funcionar THEN o sistema deve explicar claramente o problema ao usuário