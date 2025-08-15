# Design Document

## Overview

O sistema de geração automática de desenhos de topologia será implementado como um componente React integrado ao fluxo existente do Site Survey. O sistema utilizará SVG para renderização de diagramas, garantindo escalabilidade e qualidade visual em diferentes resoluções. A arquitetura será modular, permitindo fácil extensão para novos tipos de topologia.

## Architecture

### Component Architecture

```
TopologyDiagramGenerator/
├── TopologyViewer.tsx          # Componente principal de visualização
├── DiagramRenderer.tsx         # Engine de renderização SVG
├── templates/                  # Templates de topologia
│   ├── FiberTopology.tsx      # Template para fibra óptica
│   ├── RadioTopology.tsx      # Template para rádio enlace
│   ├── WiFiTopology.tsx       # Template para access points
│   └── SDWanTopology.tsx      # Template para SD-WAN
├── components/                 # Componentes visuais reutilizáveis
│   ├── NetworkDevice.tsx      # Componente genérico de dispositivo
│   ├── Connection.tsx         # Componente de conexão/linha
│   └── Label.tsx             # Componente de texto/label
├── utils/                     # Utilitários
│   ├── exportUtils.ts        # Funções de exportação
│   ├── layoutUtils.ts        # Algoritmos de layout
│   └── svgUtils.ts           # Utilitários SVG
└── types/                     # Definições de tipos
    └── topology.ts           # Interfaces e tipos
```

### Integration Points

1. **CustomerInfoForm**: Adição da opção "SD-WAN" no select de tipos
2. **DetailedSiteSurveyForm**: Integração do componente TopologyViewer
3. **SurveyDetailsView**: Exibição do diagrama nos detalhes salvos

## Components and Interfaces

### Core Interfaces

```typescript
interface TopologyConfig {
  type: 'fiber' | 'radio' | 'wifi' | 'sdwan';
  customerName: string;
  address: string;
  customizations?: Record<string, any>;
}

interface NetworkDevice {
  id: string;
  type: string;
  label: string;
  position: { x: number; y: number };
  icon: string;
  properties?: Record<string, any>;
}

interface Connection {
  id: string;
  from: string;
  to: string;
  type: 'fiber' | 'ethernet' | 'wireless' | 'wan';
  label?: string;
}

interface TopologyTemplate {
  devices: NetworkDevice[];
  connections: Connection[];
  layout: {
    width: number;
    height: number;
    padding: number;
  };
}
```

### TopologyViewer Component

```typescript
interface TopologyViewerProps {
  config: TopologyConfig;
  showExportOptions?: boolean;
  className?: string;
  onExport?: (format: 'png' | 'pdf' | 'svg') => void;
}
```

### DiagramRenderer Component

Responsável pela renderização SVG dos diagramas, utilizando:
- SVG nativo para máxima compatibilidade
- Responsive design com viewBox
- Animações CSS para transições suaves
- Suporte a zoom e pan para dispositivos móveis

## Data Models

### Topology Templates

#### Fiber Topology
- **Devices**: Provedor (OLT), Splitter Óptico, ONT, Router Cliente, Dispositivos Finais
- **Connections**: Fibra óptica (verde), Ethernet (azul)
- **Layout**: Linear horizontal com ramificações

#### Radio Topology  
- **Devices**: Torre Base, Antena Transmissora, Torre Cliente, Antena Receptora, Router Cliente
- **Connections**: Enlace de rádio (ondas), Ethernet
- **Layout**: Ponto-a-ponto com indicação de linha de visada

#### WiFi Topology
- **Devices**: Switch Central, Controller WiFi, Access Points, Dispositivos Clientes
- **Connections**: Ethernet (cabeado), WiFi (wireless)
- **Layout**: Estrela com cobertura de área

#### SD-WAN Topology
- **Devices**: Cloud Controller, Appliance SD-WAN Principal, Conexões WAN (MPLS, Internet, LTE), Sites Remotos
- **Connections**: Túneis VPN, Conexões WAN, LAN
- **Layout**: Hub-and-spoke com múltiplas conexões WAN

### Export Configuration

```typescript
interface ExportConfig {
  format: 'png' | 'pdf' | 'svg';
  quality: 'low' | 'medium' | 'high';
  includeMetadata: boolean;
  customBranding?: {
    logo?: string;
    companyName?: string;
  };
}
```

## Error Handling

### Rendering Errors
- Fallback para template básico em caso de erro na renderização
- Logs detalhados para debugging
- Mensagens de erro amigáveis ao usuário

### Export Errors
- Validação de formato antes da exportação
- Tratamento de erros de permissão de arquivo
- Feedback visual durante o processo de exportação

### Responsive Errors
- Detecção de viewport muito pequeno
- Ajuste automático de escala
- Modo simplificado para telas muito pequenas

## Testing Strategy

### Unit Tests
- Testes para cada template de topologia
- Validação de geração de SVG
- Testes de utilitários de layout e exportação

### Integration Tests
- Integração com formulários existentes
- Fluxo completo de geração e exportação
- Testes de responsividade

### Visual Regression Tests
- Screenshots automatizados dos diagramas
- Comparação visual entre versões
- Testes em diferentes resoluções

### Performance Tests
- Tempo de renderização para diagramas complexos
- Uso de memória durante exportação
- Performance em dispositivos móveis

## Implementation Phases

### Phase 1: Core Infrastructure
- Implementação do DiagramRenderer base
- Criação dos componentes visuais básicos
- Sistema de templates

### Phase 2: Topology Templates
- Implementação dos 4 templates (fiber, radio, wifi, sdwan)
- Integração com formulários existentes
- Adição da opção SD-WAN

### Phase 3: Export & Polish
- Sistema de exportação (PNG, PDF, SVG)
- Otimizações de responsividade
- Refinamentos visuais e UX

### Phase 4: Advanced Features
- Customização de diagramas
- Animações e interatividade
- Integração com dados do formulário para personalização automática

## Technical Considerations

### SVG vs Canvas
- **Escolha**: SVG para escalabilidade e facilidade de estilização
- **Vantagens**: Responsivo, acessível, fácil exportação
- **Desvantagens**: Performance em diagramas muito complexos

### State Management
- Estado local do componente para configurações de visualização
- Props drilling para dados do survey
- Context API se necessário para configurações globais

### Performance Optimization
- Lazy loading dos templates
- Memoização de componentes pesados
- Debounce para redimensionamento

### Accessibility
- Alt text para elementos SVG
- Navegação por teclado
- Contraste adequado para elementos visuais
- Screen reader compatibility