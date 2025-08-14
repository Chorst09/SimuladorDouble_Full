# Design Document - Correção do Analisador de Editais

## Overview

O design da correção do Analisador de Editais foca em implementar extração real de texto de documentos PDF e DOCX, análise inteligente do conteúdo extraído, e geração de insights precisos baseados no documento real. A solução utilizará bibliotecas especializadas para extração de texto e algoritmos de processamento de linguagem natural para identificar produtos, especificações e informações relevantes.

## Architecture

### Componente Principal: EditalAnalyzer
- **Responsabilidade**: Interface principal para upload, análise e exibição de resultados
- **Estado**: Gerencia arquivo selecionado, tipo de análise, progresso e resultados
- **Integração**: Coordena extração de texto, análise de conteúdo e renderização

### Módulo de Extração de Texto
- **PDF Processing**: Utiliza abordagem híbrida para extrair texto de PDFs
- **DOCX Processing**: Extrai texto preservando estrutura e formatação
- **Error Handling**: Trata diferentes tipos de arquivos e cenários de erro
- **Logging**: Registra progresso e problemas para debugging

### Módulo de Análise de Conteúdo
- **Pattern Recognition**: Identifica produtos, especificações e valores usando regex avançado
- **Content Classification**: Categoriza informações por tipo (produtos, prazos, valores)
- **Smart Extraction**: Adapta extração baseada no tipo de análise selecionado
- **Data Enrichment**: Adiciona sugestões e análises baseadas no conteúdo extraído

## Components and Interfaces

### 1. TextExtractor Interface
```typescript
interface TextExtractor {
  extractFromPDF(file: File): Promise<ExtractedContent>;
  extractFromDOCX(file: File): Promise<ExtractedContent>;
  validateFile(file: File): boolean;
}

interface ExtractedContent {
  text: string;
  metadata: {
    pageCount?: number;
    wordCount: number;
    extractionMethod: string;
    confidence: number;
  };
  sections?: TextSection[];
}

interface TextSection {
  title: string;
  content: string;
  type: 'header' | 'paragraph' | 'list' | 'table';
}
```

### 2. ContentAnalyzer Interface
```typescript
interface ContentAnalyzer {
  analyzeContent(content: ExtractedContent, analysisType: AnalysisType): Promise<AnalysisResult>;
  extractProducts(text: string): ProductItem[];
  extractValues(text: string): ValueInfo[];
  extractDeadlines(text: string): DeadlineInfo[];
  extractDocuments(text: string): DocumentRequirement[];
}

interface ValueInfo {
  amount: number;
  currency: string;
  context: string;
  confidence: number;
}

interface DeadlineInfo {
  date: string;
  description: string;
  type: 'delivery' | 'submission' | 'installation' | 'other';
}
```

### 3. Enhanced ProductItem Interface
```typescript
interface ProductItem {
  // Dados básicos extraídos
  item: string;
  description: string;
  quantity: number;
  unit: string;
  
  // Especificações extraídas
  specifications: TechnicalSpec[];
  extractedSpecs: string[];
  
  // Análise e sugestões
  estimatedValue: number;
  category: ProductCategory;
  priority: Priority;
  complianceLevel: ComplianceLevel;
  riskLevel: RiskLevel;
  
  // Informações de mercado
  suggestedModels: SuggestedModel[];
  marketAnalysis: string;
  technicalJustification: string;
  alternativeOptions: string[];
  
  // Metadados
  extractionConfidence: number;
  sourceSection: string;
}

interface TechnicalSpec {
  category: string;
  requirement: string;
  value: string;
  mandatory: boolean;
  extractionConfidence: number;
}
```

## Data Models

### 1. File Processing Models
```typescript
interface FileProcessingResult {
  success: boolean;
  content?: ExtractedContent;
  error?: ProcessingError;
  processingTime: number;
  method: ExtractionMethod;
}

interface ProcessingError {
  code: string;
  message: string;
  details: string;
  suggestions: string[];
}

enum ExtractionMethod {
  PDF_TEXT_LAYER = 'pdf-text-layer',
  PDF_OCR = 'pdf-ocr',
  PDF_HYBRID = 'pdf-hybrid',
  DOCX_STRUCTURED = 'docx-structured',
  DOCX_RAW = 'docx-raw'
}
```

### 2. Analysis Configuration
```typescript
interface AnalysisConfig {
  type: AnalysisType;
  focusAreas: FocusArea[];
  extractionRules: ExtractionRule[];
  confidenceThreshold: number;
  includeMarketAnalysis: boolean;
  includeSuggestions: boolean;
}

interface ExtractionRule {
  pattern: RegExp;
  type: 'product' | 'specification' | 'value' | 'deadline';
  priority: number;
  postProcessor?: (match: RegExpMatchArray) => any;
}
```

## Error Handling

### 1. File Processing Errors
- **Unsupported Format**: Arquivo não é PDF ou DOCX válido
- **Corrupted File**: Arquivo corrompido ou protegido por senha
- **Empty Content**: Arquivo sem texto extraível (imagens escaneadas)
- **Size Limit**: Arquivo muito grande para processamento

### 2. Content Analysis Errors
- **No Products Found**: Nenhum produto identificado no documento
- **Insufficient Data**: Dados insuficientes para análise completa
- **Pattern Mismatch**: Formato do documento não reconhecido
- **Low Confidence**: Baixa confiança na extração de dados

### 3. Error Recovery Strategies
- **Fallback Methods**: Tentar métodos alternativos de extração
- **Partial Results**: Retornar resultados parciais quando possível
- **User Guidance**: Fornecer orientações para melhorar o arquivo
- **Manual Override**: Permitir ajustes manuais nos resultados

## Testing Strategy

### 1. Unit Tests
- **Text Extraction**: Testar extração com diferentes tipos de PDF/DOCX
- **Pattern Matching**: Validar regex patterns com exemplos reais
- **Data Processing**: Verificar transformação e enriquecimento de dados
- **Error Handling**: Testar cenários de erro e recovery

### 2. Integration Tests
- **End-to-End Flow**: Upload → Extração → Análise → Resultados
- **File Format Support**: Testar com arquivos reais de editais
- **Performance**: Medir tempo de processamento com arquivos grandes
- **Memory Usage**: Verificar uso de memória com múltiplos arquivos

### 3. User Acceptance Tests
- **Real Documents**: Testar com editais reais de órgãos públicos
- **Accuracy Validation**: Comparar resultados com análise manual
- **Usability**: Verificar facilidade de uso e clareza dos resultados
- **Export Functions**: Validar geração de PDF e JSON

## Implementation Approach

### Phase 1: Text Extraction Enhancement
1. **PDF Processing**: Implementar extração robusta de texto de PDFs
2. **DOCX Processing**: Melhorar extração de documentos Word
3. **Error Handling**: Implementar tratamento abrangente de erros
4. **Logging**: Adicionar logs detalhados para debugging

### Phase 2: Content Analysis Improvement
1. **Pattern Recognition**: Desenvolver regex patterns mais precisos
2. **Data Extraction**: Melhorar identificação de produtos e especificações
3. **Value Processing**: Implementar extração precisa de valores e datas
4. **Categorization**: Aprimorar classificação automática de produtos

### Phase 3: Analysis Enhancement
1. **Market Intelligence**: Melhorar sugestões de produtos e preços
2. **Technical Analysis**: Aprofundar análise de especificações técnicas
3. **Risk Assessment**: Implementar avaliação de riscos e oportunidades
4. **Recommendations**: Gerar recomendações mais precisas

### Phase 4: User Experience
1. **Interface Improvements**: Melhorar feedback visual durante processamento
2. **Result Presentation**: Aprimorar exibição de resultados
3. **Export Functions**: Melhorar geração de PDF e JSON
4. **Performance**: Otimizar velocidade de processamento

## Technical Considerations

### 1. PDF Processing Challenges
- **Text Layer vs OCR**: Decidir quando usar cada método
- **Encoding Issues**: Lidar com diferentes codificações de caracteres
- **Layout Preservation**: Manter estrutura do documento original
- **Performance**: Otimizar processamento de arquivos grandes

### 2. Content Analysis Complexity
- **Variability**: Editais têm formatos muito variados
- **Context Understanding**: Associar especificações aos produtos corretos
- **Ambiguity Resolution**: Lidar com informações ambíguas ou incompletas
- **Accuracy vs Coverage**: Balancear precisão com abrangência

### 3. Scalability Considerations
- **Memory Management**: Processar arquivos grandes sem esgotar memória
- **Concurrent Processing**: Permitir múltiplas análises simultâneas
- **Caching**: Cache de resultados para arquivos similares
- **Progressive Loading**: Carregar resultados progressivamente