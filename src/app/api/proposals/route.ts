import { NextRequest, NextResponse } from 'next/server';
import { Proposal } from '@/lib/types';

// Mock storage for proposals (in production, this would be Firebase/database)
let mockProposals: Proposal[] = [
  {
    id: 'mock_1',
    baseId: 'Prop_InterRadio_0001_v1',
    title: 'Proposta Internet Radio Teste',
    client: {
      name: 'CARLOS HORST',
      projectName: 'Expansão Rede Corporativa',
      email: 'carlos.horst@empresa.com.br',
      phone: '(11) 98765-1234',
      contact: 'Carlos Horst - Diretor TI'
    },
    type: 'RADIO',
    status: 'Rascunho',
    value: 150.00,
    totalSetup: 800.00,
    totalMonthly: 450.00,
    contractPeriod: 24,
    date: '2024-01-15',
    expiryDate: '2024-02-15',
    createdBy: 'admin',
    createdAt: new Date('2024-01-15T10:30:00Z'),
    version: 1,
    distributorId: 'dist001',
    accountManager: {
      name: 'João Silva',
      email: 'joao.silva@empresa.com.br',
      phone: '(11) 99876-5432'
    },
    items: [
      {
        id: 'item-1',
        description: 'Internet Radio 100 Mbps',
        setup: 500.00,
        monthly: 280.00,
        quantity: 1
      },
      {
        id: 'item-2',
        description: 'Equipamento CPE',
        setup: 300.00,
        monthly: 170.00,
        quantity: 1
      }
    ]
  },
  {
    id: 'mock_2',
    baseId: 'Prop_InterFibra_0001_v1',
    title: 'Proposta Internet Fibra Teste',
    client: {
      name: 'MARIA SANTOS',
      projectName: 'Conectividade Fibra Óptica',
      email: 'maria.santos@empresa.com.br',
      phone: '(11) 97654-3210',
      contact: 'Maria Santos - Gerente Operacional'
    },
    type: 'FIBER',
    status: 'Enviada',
    value: 200.00,
    totalSetup: 1200.00,
    totalMonthly: 650.00,
    contractPeriod: 36,
    date: '2024-01-16',
    expiryDate: '2024-02-16',
    createdBy: 'admin',
    createdAt: new Date('2024-01-16T14:20:00Z'),
    version: 1,
    distributorId: 'dist002',
    accountManager: {
      name: 'Ana Costa',
      email: 'ana.costa@empresa.com.br',
      phone: '(11) 98765-4321'
    },
    items: [
      {
        id: 'item-1',
        description: 'Internet Fibra 500 Mbps',
        setup: 800.00,
        monthly: 400.00,
        quantity: 1
      },
      {
        id: 'item-2',
        description: 'Instalação e Configuração',
        setup: 400.00,
        monthly: 250.00,
        quantity: 1
      }
    ]
  },
  {
    id: 'mock_3',
    baseId: 'Prop_VM_0001_v1',
    title: 'Proposta VM Teste',
    client: 'EMPRESA XYZ',
    type: 'VM',
    status: 'Aprovada',
    value: 500.00,
    date: '2024-01-17',
    expiryDate: '2024-02-17',
    createdBy: 'admin',
    createdAt: new Date('2024-01-17T09:15:00Z'),
    version: 1,
    distributorId: 'dist003',
    accountManager: 'Pedro Lima'
  },
  {
    id: 'mock_4',
    baseId: 'Prop_Pabx/Sip_0001_v1',
    title: 'Proposta PABX SIP Teste',
    client: {
      name: 'TECH SOLUTIONS',
      projectName: 'Sistema PABX Corporativo',
      email: 'contato@techsolutions.com.br',
      phone: '(11) 99999-8888',
      contact: 'João Silva - Gerente TI'
    },
    type: 'PABX',
    status: 'Em Análise',
    value: 300.00,
    totalSetup: 1500.00,
    totalMonthly: 850.00,
    contractPeriod: 36,
    date: '2024-01-18',
    expiryDate: '2024-02-18',
    createdBy: 'admin',
    createdAt: new Date('2024-01-18T16:45:00Z'),
    version: 1,
    distributorId: 'dist004',
    accountManager: {
      name: 'Lucas Oliveira',
      email: 'lucas.oliveira@empresa.com.br',
      phone: '(11) 98765-4321'
    },
    items: [
      {
        id: 'item-1',
        description: 'PABX SIP Essencial - 20 Ramais',
        setup: 800.00,
        monthly: 450.00,
        quantity: 1
      },
      {
        id: 'item-2', 
        description: 'Números Adicionais',
        setup: 200.00,
        monthly: 150.00,
        quantity: 2
      },
      {
        id: 'item-3',
        description: 'Suporte Técnico Premium',
        setup: 500.00,
        monthly: 250.00,
        quantity: 1
      }
    ]
  },
  {
    id: 'mock_5',
    baseId: 'Prop_MAN_0001_v1',
    title: 'Proposta Internet MAN Teste',
    client: 'CORPORAÇÃO ABC',
    type: 'MAN',
    status: 'Rascunho',
    value: 800.00,
    date: '2024-01-19',
    expiryDate: '2024-02-19',
    createdBy: 'admin',
    createdAt: new Date('2024-01-19T11:30:00Z'),
    version: 1,
    distributorId: 'dist005',
    accountManager: 'Fernanda Silva'
  }
];

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const baseId = searchParams.get('baseId');

    let filteredProposals = mockProposals;

    // Apply filters if provided
    if (type) {
      filteredProposals = filteredProposals.filter(p => p.type === type);
    }
    if (baseId) {
      filteredProposals = filteredProposals.filter(p => p.baseId === baseId);
    }

    // Sort by creation date (newest first)
    filteredProposals.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json(filteredProposals, { status: 200 });
  } catch (error) {
    console.error('Error fetching proposals:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Helper function to generate unique proposal ID
function generateProposalId(type: string = 'PROP'): string {
  // Get current proposal count for sequential numbering
  const typeProposals = mockProposals.filter(p => p.type === type);
  const nextNumber = (typeProposals.length + 1).toString().padStart(4, '0');
  
  // Generate proposal ID based on type
  switch (type) {
    case 'RADIO':
      return `Prop_InterRadio_${nextNumber}_v1`;
    case 'FIBER':
      return `Prop_InterFibra_${nextNumber}_v1`;
    case 'VM':
      return `Prop_VM_${nextNumber}_v1`;
    case 'PABX':
      return `Prop_Pabx/Sip_${nextNumber}_v1`;
    case 'MAN':
      return `Prop_MAN_${nextNumber}_v1`;
    default:
      return `Prop_General_${nextNumber}_v1`;
  }
}

// Supported proposal types
const SUPPORTED_PROPOSAL_TYPES = [
  'FIBER',      // Fiber Internet proposals
  'VM',         // Virtual Machines proposals  
  'RADIO',      // Radio Internet proposals
  'PABX',       // PABX SIP proposals
  'MAN',        // Metropolitan Area Network proposals
  'GENERAL'     // General/Other proposals
] as const;

// Validation function for proposal data
function validateProposalData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required fields validation
  const requiredFields = ['title', 'client'];
  requiredFields.forEach(field => {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      errors.push(`${field} is required and cannot be empty`);
    }
  });

  // Type validation
  if (data.title && typeof data.title !== 'string') {
    errors.push('title must be a string');
  }
  if (data.client && typeof data.client !== 'string') {
    errors.push('client must be a string');
  }
  if (data.value !== undefined && (typeof data.value !== 'number' || data.value < 0)) {
    errors.push('value must be a non-negative number');
  }
  if (data.version !== undefined && (typeof data.version !== 'number' || data.version < 1)) {
    errors.push('version must be a positive number');
  }

  // Proposal type validation
  if (data.type && !SUPPORTED_PROPOSAL_TYPES.includes(data.type)) {
    errors.push(`type must be one of: ${SUPPORTED_PROPOSAL_TYPES.join(', ')}`);
  }

  // Status validation
  const validStatuses = [
    'Rascunho', 'Enviada', 'Em Análise', 'Aprovada', 'Rejeitada',
    'Aguardando aprovação desconto Diretoria', 'Aguardando Aprovação do Cliente',
    'Fechado Ganho', 'Perdido'
  ];
  if (data.status && !validStatuses.includes(data.status)) {
    errors.push(`status must be one of: ${validStatuses.join(', ')}`);
  }

  // Date validation
  if (data.date && !/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
    errors.push('date must be in YYYY-MM-DD format');
  }
  if (data.expiryDate && !/^\d{4}-\d{2}-\d{2}$/.test(data.expiryDate)) {
    errors.push('expiryDate must be in YYYY-MM-DD format');
  }

  // String length validation
  if (data.title && data.title.length > 200) {
    errors.push('title cannot exceed 200 characters');
  }
  if (data.client && data.client.length > 100) {
    errors.push('client cannot exceed 100 characters');
  }
  if (data.type && data.type.length > 20) {
    errors.push('type cannot exceed 20 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    // Validate proposal data
    const validation = validateProposalData(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    // Generate unique IDs and set defaults
    const proposalType = body.type || 'GENERAL';
    const baseId = generateProposalId(proposalType);
    const currentDate = new Date();
    
    // Create new proposal and store in mock storage
    const createdProposal: Proposal = {
      id: `mock_${Date.now()}`,
      baseId,
      title: body.title,
      client: body.client,
      type: proposalType,
      status: body.status || 'Rascunho',
      value: body.value || 0,
      date: body.date || currentDate.toISOString().split('T')[0],
      expiryDate: body.expiryDate || new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdBy: body.createdBy || 'anonymous',
      createdAt: currentDate,
      version: body.version || 1,
      distributorId: body.distributorId || '',
      accountManager: body.accountManager || '',
      // Preserve all additional fields from the request body
      ...body,
      // Override with the generated/computed fields above
      id: `mock_${Date.now()}`,
      baseId,
      createdAt: currentDate
    };

    // Add to mock storage
    mockProposals.push(createdProposal);

    return NextResponse.json(createdProposal, { status: 201 });
  } catch (error) {
    console.error('Error creating proposal:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const proposalId = searchParams.get('id');
    const body = await request.json();

    if (!proposalId) {
      return NextResponse.json(
        { error: 'Proposal ID is required' },
        { status: 400 }
      );
    }

    // Find proposal index
    const proposalIndex = mockProposals.findIndex(p => p.id === proposalId);
    
    if (proposalIndex === -1) {
      return NextResponse.json(
        { error: 'Proposal not found' },
        { status: 404 }
      );
    }

    // Update proposal with new data, preserving existing fields
    const existingProposal = mockProposals[proposalIndex];
    const updatedProposal = {
      ...existingProposal,
      ...body,
      id: proposalId, // Keep original ID
      updatedAt: new Date()
    };

    mockProposals[proposalIndex] = updatedProposal;

    return NextResponse.json(updatedProposal, { status: 200 });
  } catch (error) {
    console.error('Error updating proposal:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const proposalId = searchParams.get('id');

    if (!proposalId) {
      return NextResponse.json(
        { error: 'Proposal ID is required' },
        { status: 400 }
      );
    }

    // Find proposal index
    const proposalIndex = mockProposals.findIndex(p => p.id === proposalId);
    
    if (proposalIndex === -1) {
      return NextResponse.json(
        { error: 'Proposal not found' },
        { status: 404 }
      );
    }

    // Remove proposal from mock storage
    const deletedProposal = mockProposals.splice(proposalIndex, 1)[0];

    return NextResponse.json(
      { message: 'Proposal deleted successfully', proposal: deletedProposal },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting proposal:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Export supported types for use in other parts of the application
export { SUPPORTED_PROPOSAL_TYPES };