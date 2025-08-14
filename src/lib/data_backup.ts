import type { Partner, RO, Training } from './types';

export const initialPartners: Partner[] = [
    // All distributor and supplier partners have been removed
];

export const initialRos: RO[] = [
    // All ROs referencing distributors and suppliers have been removed
];

export const initialTrainings: Training[] = [
    // All trainings referencing suppliers have been removed
];

// Removed initialBidDocs export as this feature has been removed

export const salesData = [
  { name: 'Jan', 'Projetos': 30, 'Vendas': 20 },
  { name: 'Fev', 'Projetos': 45, 'Vendas': 25 },
  { name: 'Mar', 'Projetos': 60, 'Vendas': 40 },
  { name: 'Abr', 'Projetos': 50, 'Vendas': 35 },
  { name: 'Mai', 'Projetos': 70, 'Vendas': 55 },
  { name: 'Jun', 'Projetos': 85, 'Vendas': 65 },
];

export const quoteStatusData = [
  { name: 'Pendente', value: 15, color: '#FFC107' },
  { name: 'Enviado', value: 25, color: '#2196F3' },
  { name: 'Aprovado', value: 35, color: '#4CAF50' },
  { name: 'Rejeitado', value: 10, color: '#F44336' },
  // Removed 'Aguardando Distribuidor' status
];

// Removed initialRFPs export as this feature has been removed
export const initialRFPs: any[] = [];

// Removed initialPriceRecords export as this feature has been removed
export const initialPriceRecords: any[] = [];

// Removed initialEditais export as this feature has been removed
export const initialEditais: any[] = [];

export const PIE_COLORS = ['#4CAF50', '#FFC107', '#2196F3', '#F44336', '#9C27B0'];
    type: 'Ata de Registro de Preços',
    description: 'Ata para aquisição de equipamentos de informática, incluindo computadores, impressoras e periféricos.',
    status: 'Ativo',
    publishDate: '2024-06-15',
    validityDate: '2025-06-15',
    totalValue: 2500000,
    accountManager: 'João da Silva',
    category: 'Tecnologia',
    items: [
      {
        id: '1',
        description: 'Notebook Dell Latitude 5520',
        unit: 'unidade',
        quantity: 100,
        unitPrice: 3500,
        totalPrice: 350000,
        supplier: 'Dell Brasil',
        brand: 'Dell',
        model: 'Latitude 5520'
      },
      {
        id: '2',
        description: 'Impressora HP LaserJet Pro M404n',
        unit: 'unidade',
        quantity: 50,
        unitPrice: 1200,
        totalPrice: 60000,
        supplier: 'HP Brasil',
        brand: 'HP',
        model: 'LaserJet Pro M404n'
      },
      {
        id: '3',
        description: 'Switch Cisco Catalyst 2960',
        unit: 'unidade',
        quantity: 20,
        unitPrice: 2500,
        totalPrice: 50000,
        supplier: 'Cisco Brasil',
        brand: 'Cisco',
        model: 'Catalyst 2960'
      }
    ],
    participants: ['Dell Brasil', 'HP Brasil', 'Cisco Brasil', 'Lenovo Brasil'],
    attachments: ['ata_001.pdf', 'edital_001.pdf', 'anexos_tecnicos.pdf'],
    notes: 'Ata válida por 12 meses com possibilidade de renovação por igual período.'
  },
  {
    id: 'ATA-002',
    title: 'Pregão Eletrônico - Serviços de Manutenção',
    client: 'Secretaria de Educação',
    type: 'Pregão Eletrônico',
    description: 'Pregão para contratação de serviços de manutenção preventiva e corretiva de equipamentos de informática.',
    status: 'Ativo',
    publishDate: '2024-05-20',
    validityDate: '2025-05-20',
    totalValue: 800000,
    accountManager: 'Maria Oliveira',
    category: 'Serviços',
    items: [
      {
        id: '1',
        description: 'Manutenção Preventiva - Computadores',
        unit: 'hora',
        quantity: 2000,
        unitPrice: 80,
        totalPrice: 160000,
        supplier: 'TechService Ltda',
        brand: '',
        model: ''
      },
      {
        id: '2',
        description: 'Manutenção Corretiva - Impressoras',
        unit: 'hora',
        quantity: 1000,
        unitPrice: 120,
        totalPrice: 120000,
        supplier: 'PrintFix Ltda',
        brand: '',
        model: ''
      }
    ],
    participants: ['TechService Ltda', 'PrintFix Ltda', 'Manutec Ltda'],
    attachments: ['pregao_002.pdf', 'especificacoes_servicos.pdf'],
    notes: 'Serviços devem ser prestados em até 24h para manutenção corretiva.'
  },
  {
    id: 'ATA-003',
    title: 'Concorrência - Sistema de Gestão Escolar',
    client: 'Secretaria de Educação Estadual',
    type: 'Concorrência',
    description: 'Concorrência para aquisição de sistema de gestão escolar com módulos de matrícula, notas e frequência.',
    status: 'Vencido',
    publishDate: '2023-12-01',
    validityDate: '2024-12-01',
    totalValue: 1500000,
    accountManager: 'Carlos Pereira',
    category: 'Educação',
    items: [
      {
        id: '1',
        description: 'Sistema de Gestão Escolar - Licença',
        unit: 'licença',
        quantity: 500,
        unitPrice: 2000,
        totalPrice: 1000000,
        supplier: 'EduTech Sistemas',
        brand: 'EduTech',
        model: 'Gestão Escolar v3.0'
      },
      {
        id: '2',
        description: 'Treinamento de Usuários',
        unit: 'hora',
        quantity: 200,
        unitPrice: 150,
        totalPrice: 30000,
        supplier: 'EduTech Sistemas',
        brand: '',
        model: ''
      }
    ],
    participants: ['EduTech Sistemas', 'SchoolSoft Ltda', 'EduManager'],
    attachments: ['concorrencia_003.pdf', 'especificacoes_sistema.pdf'],
    notes: 'Sistema deve ser compatível com padrões do MEC.'
  },
  {
    id: 'ATA-004',
    title: 'Ata de Registro de Preços - Material de Escritório',
    client: 'Tribunal de Justiça',
    type: 'Ata de Registro de Preços',
    description: 'Ata para aquisição de material de escritório e papelaria para uso administrativo.',
    status: 'Suspenso',
    publishDate: '2024-07-01',
    validityDate: '2025-07-01',
    totalValue: 300000,
    accountManager: 'Ana Costa',
    category: 'Administrativo',
    items: [
      {
        id: '1',
        description: 'Papel A4 75g - Resma',
        unit: 'resma',
        quantity: 1000,
        unitPrice: 15,
        totalPrice: 15000,
        supplier: 'Papelaria Central',
        brand: 'Chamex',
        model: ''
      },
      {
        id: '2',
        description: 'Caneta Esferográfica Azul',
        unit: 'unidade',
        quantity: 5000,
        unitPrice: 2.5,
        totalPrice: 12500,
        supplier: 'Papelaria Central',
        brand: 'Bic',
        model: 'Cristal'
      }
    ],
    participants: ['Papelaria Central', 'OfficeMax', 'Staples'],
    attachments: ['ata_004.pdf'],
    notes: 'Ata suspensa temporariamente para reavaliação de preços.'
  },
  {
    id: 'ATA-005',
    title: 'Pregão Eletrônico - Segurança Eletrônica',
    client: 'Secretaria de Segurança Pública',
    type: 'Pregão Eletrônico',
    description: 'Pregão para aquisição de sistemas de segurança eletrônica, câmeras e equipamentos de monitoramento.',
    status: 'Renovado',
    publishDate: '2023-08-15',
    validityDate: '2024-08-15',
    renewalDate: '2025-08-15',
    totalValue: 3500000,
    accountManager: 'Pedro Santos',
    category: 'Segurança',
    items: [
      {
        id: '1',
        description: 'Câmera IP Dome 4MP',
        unit: 'unidade',
        quantity: 200,
        unitPrice: 800,
        totalPrice: 160000,
        supplier: 'SecurityTech',
        brand: 'Hikvision',
        model: 'DS-2CD2142FWD-I'
      },
      {
        id: '2',
        description: 'NVR 32 Canais',
        unit: 'unidade',
        quantity: 10,
        unitPrice: 5000,
        totalPrice: 50000,
        supplier: 'SecurityTech',
        brand: 'Hikvision',
        model: 'DS-7732NI-K4'
      }
    ],
    participants: ['SecurityTech', 'SurveillancePro', 'SafeGuard'],
    attachments: ['pregao_005.pdf', 'especificacoes_seguranca.pdf'],
    notes: 'Ata renovada por mais 12 meses com ajuste de preços de 5%.'
  }
];

export const PIE_COLORS = ['#4CAF50', '#FFC107', '#2196F3', '#F44336', '#9C27B0'];

export const initialEditais: Edital[] = [
  {
    id: 'EDT-001',
    title: 'Aquisição de Equipamentos de Informática',
    publicationNumber: '001/2024',
    publishingBody: 'Prefeitura Municipal de São Paulo',
    publishDate: '2024-07-15',
    openingDate: '2024-08-15',
    submissionDeadline: '2024-08-10',
    estimatedValue: 2500000,
    category: 'Tecnologia',
    status: 'Em Análise',
    description: 'Pregão eletrônico para aquisição de equipamentos de informática para escolas municipais.',
    requirements: 'Empresa com experiência mínima de 3 anos no setor de TI.',
    documents: [
      {
        id: '1',
        name: 'Proposta Comercial',
        type: 'Obrigatório',
        description: 'Proposta comercial detalhada com preços e condições',
        deadline: '2024-08-10',
        status: 'Em Preparação',
        notes: 'Aguardando cotação dos fornecedores'
      },
      {
        id: '2',
        name: 'Certificado de Registro Cadastral',
        type: 'Obrigatório',
        description: 'CRC válido junto ao órgão',
        deadline: '2024-08-10',
        status: 'Pronto',
        notes: 'Documento já disponível'
      },
      {
        id: '3',
        name: 'Certificado de Capacidade Técnica',
        type: 'Obrigatório',
        description: 'Comprovante de experiência em projetos similares',
        deadline: '2024-08-10',
        status: 'Pendente',
        notes: 'Precisa coletar referências de clientes'
      }
    ],
    products: [
      {
        id: '1',
        description: 'Notebook Dell Latitude 5520',
        quantity: 500,
        unit: 'unidade',
        estimatedUnitPrice: 3500,
        totalEstimatedPrice: 1750000,
        specifications: 'Intel i5, 8GB RAM, 256GB SSD, Windows 11 Pro',
        brand: 'Dell',
        model: 'Latitude 5520',
        supplier: 'Dell Brasil',
        status: 'Disponível'
      },
      {
        id: '2',
        description: 'Impressora HP LaserJet Pro M404n',
        quantity: 100,
        unit: 'unidade',
        estimatedUnitPrice: 1200,
        totalEstimatedPrice: 120000,
        specifications: 'Impressão laser monocromática, rede Ethernet',
        brand: 'HP',
        model: 'LaserJet Pro M404n',
        supplier: 'HP Brasil',
        status: 'Em Cotação'
      }
    ],
    analysis: {
      id: 'ANL-001',
      editalId: 'EDT-001',
      analysisDate: '2024-07-20',
      analyst: 'João da Silva',
      documentAnalysis: {
        totalDocuments: 3,
        readyDocuments: 1,
        pendingDocuments: 2,
        criticalDocuments: ['Certificado de Capacidade Técnica'],
        notes: 'Dois documentos críticos ainda pendentes'
      },
      productAnalysis: {
        totalProducts: 2,
        availableProducts: 1,
        unavailableProducts: 0,
        totalEstimatedValue: 1870000,
        competitiveAdvantage: 'Boa relação com fornecedores Dell e HP',
        notes: 'Produtos bem definidos e disponíveis'
      },
      timelineAnalysis: {
        daysUntilOpening: 25,
        daysUntilDeadline: 20,
        isUrgent: false,
        timelineRisk: 'Baixo',
        notes: 'Prazo adequado para preparação'
      },
      publishingBodyAnalysis: {
        bodyType: 'Municipal',
        previousExperience: 'Já participamos de 3 licitações com este órgão',
        paymentHistory: 'Bom',
        notes: 'Órgão confiável com histórico positivo'
      },
      overallAssessment: {
        score: 75,
        recommendation: 'Participar',
        strengths: ['Boa relação com fornecedores', 'Experiência prévia com o órgão'],
        weaknesses: ['Documentação ainda incompleta'],
        opportunities: ['Possibilidade de parcerias futuras'],
        threats: ['Concorrência forte no setor'],
        finalNotes: 'Edital viável com boa probabilidade de sucesso'
      }
    },
                    files: [
                  {
                    id: 'FILE-001',
                    name: 'edital_001.pdf',
                    type: 'pdf',
                    size: 2048576, // 2MB
                    uploadDate: '2024-07-20',
                    aiAnalysis: {
                      id: 'AI-001',
                      fileId: 'FILE-001',
                      analysisDate: '2024-07-20',
                      summary: "Análise automática do edital realizada com sucesso. Foram identificados pontos-chave importantes para a participação na licitação.",
                      keyPoints: [
                        "Prazo de submissão: 30 dias",
                        "Valor estimado: R$ 2.500.000,00",
                        "Documentação obrigatória: 15 itens",
                        "Experiência mínima: 3 anos"
                      ],
                      requirements: [
                        "Certificado de Registro Cadastral",
                        "Certificado de Capacidade Técnica",
                        "Proposta comercial detalhada",
                        "Documentação fiscal"
                      ],
                      deadlines: [
                        "Abertura: 15/08/2024",
                        "Submissão: 10/08/2024",
                        "Validade: 60 dias"
                      ],
                      values: [
                        "Valor total: R$ 2.500.000,00",
                        "Garantia: R$ 50.000,00",
                        "Prazo de pagamento: 30 dias"
                      ],
                      risks: [
                        "Prazo apertado para documentação",
                        "Concorrência forte no setor",
                        "Especificações técnicas complexas"
                      ],
                      opportunities: [
                        "Possibilidade de parcerias",
                        "Mercado em crescimento",
                        "Órgão com histórico positivo"
                      ],
                      recommendations: [
                        "Participar da licitação",
                        "Acelerar preparação de documentos",
                        "Buscar parcerias estratégicas"
                      ],
                      confidence: 85,
                      processingTime: 3.2
                    }
                  }
                ],
                attachments: ['anexos_tecnicos.pdf'],
                notes: 'Edital prioritário para a empresa'
  },
  {
    id: 'EDT-002',
    title: 'Sistema de Gestão Escolar',
    publicationNumber: '002/2024',
    publishingBody: 'Secretaria de Educação do Estado',
    publishDate: '2024-07-10',
    openingDate: '2024-08-20',
    submissionDeadline: '2024-08-15',
    estimatedValue: 1800000,
    category: 'Educação',
    status: 'Aberto',
    description: 'Licitação para aquisição de sistema de gestão escolar com módulos de matrícula, notas e frequência.',
    requirements: 'Empresa com certificação ISO 27001 e experiência em projetos educacionais.',
    documents: [
      {
        id: '1',
        name: 'Proposta Técnica',
        type: 'Obrigatório',
        description: 'Proposta técnica detalhada do sistema',
        deadline: '2024-08-15',
        status: 'Pendente',
        notes: 'Aguardando desenvolvimento da proposta'
      },
      {
        id: '2',
        name: 'Certificado ISO 27001',
        type: 'Obrigatório',
        description: 'Certificação de segurança da informação',
        deadline: '2024-08-15',
        status: 'Pronto',
        notes: 'Certificação válida até 2025'
      }
    ],
    products: [
      {
        id: '1',
        description: 'Sistema de Gestão Escolar - Licença',
        quantity: 1000,
        unit: 'licença',
        estimatedUnitPrice: 1500,
        totalEstimatedPrice: 1500000,
        specifications: 'Sistema web com módulos de gestão escolar',
        brand: 'EduTech',
        model: 'Gestão Escolar v3.0',
        supplier: 'EduTech Sistemas',
        status: 'Disponível'
      },
      {
        id: '2',
        description: 'Treinamento de Usuários',
        quantity: 200,
        unit: 'hora',
        estimatedUnitPrice: 150,
        totalEstimatedPrice: 30000,
        specifications: 'Treinamento presencial e online',
        supplier: 'EduTech Sistemas',
        status: 'Disponível'
      }
    ],
    attachments: ['edital_002.pdf', 'especificacoes_sistema.pdf'],
    notes: 'Projeto estratégico para expansão no setor educacional'
  },
  {
    id: 'EDT-003',
    title: 'Segurança Eletrônica e CFTV',
    publicationNumber: '003/2024',
    publishingBody: 'Tribunal de Justiça',
    publishDate: '2024-07-05',
    openingDate: '2024-08-10',
    submissionDeadline: '2024-08-05',
    estimatedValue: 3200000,
    category: 'Segurança',
    status: 'Fechado',
    description: 'Pregão para aquisição de sistemas de segurança eletrônica e câmeras de monitoramento.',
    requirements: 'Empresa com experiência mínima de 5 anos em segurança eletrônica.',
    documents: [
      {
        id: '1',
        name: 'Proposta Comercial',
        type: 'Obrigatório',
        description: 'Proposta comercial com preços e condições',
        deadline: '2024-08-05',
        status: 'Enviado',
        notes: 'Proposta enviada com sucesso'
      },
      {
        id: '2',
        name: 'Certificado de Registro Cadastral',
        type: 'Obrigatório',
        description: 'CRC válido junto ao órgão',
        deadline: '2024-08-05',
        status: 'Enviado',
        notes: 'Documento enviado'
      }
    ],
    products: [
      {
        id: '1',
        description: 'Câmera IP Dome 4MP',
        quantity: 300,
        unit: 'unidade',
        estimatedUnitPrice: 800,
        totalEstimatedPrice: 240000,
        specifications: 'Câmera IP com resolução 4MP, visão noturna',
        brand: 'Hikvision',
        model: 'DS-2CD2142FWD-I',
        supplier: 'SecurityTech',
        status: 'Disponível'
      },
      {
        id: '2',
        description: 'NVR 64 Canais',
        quantity: 8,
        unit: 'unidade',
        estimatedUnitPrice: 8000,
        totalEstimatedPrice: 64000,
        specifications: 'Gravador de vídeo em rede com 64 canais',
        brand: 'Hikvision',
        model: 'DS-9664NI-I8',
        supplier: 'SecurityTech',
        status: 'Disponível'
      }
    ],
    analysis: {
      id: 'ANL-002',
      editalId: 'EDT-003',
      analysisDate: '2024-07-12',
      analyst: 'Maria Oliveira',
      documentAnalysis: {
        totalDocuments: 2,
        readyDocuments: 2,
        pendingDocuments: 0,
        criticalDocuments: [],
        notes: 'Toda documentação pronta e enviada'
      },
      productAnalysis: {
        totalProducts: 2,
        availableProducts: 2,
        unavailableProducts: 0,
        totalEstimatedValue: 304000,
        competitiveAdvantage: 'Parceria exclusiva com SecurityTech',
        notes: 'Produtos disponíveis com boa margem'
      },
      timelineAnalysis: {
        daysUntilOpening: 5,
        daysUntilDeadline: 0,
        isUrgent: true,
        timelineRisk: 'Alto',
        notes: 'Prazo muito apertado'
      },
      publishingBodyAnalysis: {
        bodyType: 'Federal',
        previousExperience: 'Primeira participação com este órgão',
        paymentHistory: 'Excelente',
        notes: 'Órgão federal com excelente histórico de pagamento'
      },
      overallAssessment: {
        score: 85,
        recommendation: 'Participar',
        strengths: ['Produtos disponíveis', 'Documentação completa'],
        weaknesses: ['Prazo apertado'],
        opportunities: ['Abertura de mercado federal'],
        threats: ['Concorrência forte'],
        finalNotes: 'Excelente oportunidade apesar do prazo apertado'
      }
    },
    attachments: ['edital_003.pdf', 'proposta_enviada.pdf'],
    notes: 'Proposta enviada com sucesso'
  }
];
