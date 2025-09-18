export interface Proposal {
  id: string; // Unique ID for each version, e.g., Prop_MV_0001/2025_v1
  baseId: string; // Base ID, e.g., Prop_MV_0001/2025
  version: number;
  title: string;
  client: string;
  type: string; // Proposal type: RADIO, FIBER, VM, etc.
  value: number;
  status: 'Rascunho' | 'Enviada' | 'Em Análise' | 'Aprovada' | 'Rejeitada' | 'Aguardando aprovação desconto Diretoria' | 'Aguardando Aprovação do Cliente' | 'Fechado Ganho' | 'Perdido';
  createdBy: string; // User ID
  accountManager: string; // User name
  createdAt: any; // Firestore Timestamp
  distributorId: string;
  date: string;
  expiryDate: string;
}

export type UserRole = 'admin' | 'diretor' | 'usuario';

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
}

export interface Partner {
  id: number;
  name: string;
  type: 'Cliente';
  // Adicionado o campo mainContact aqui
  mainContact?: string;
  contact: string;
  phone: string;
  status: 'Ativo' | 'Inativo';
  site?: string;
  products?: string;
  sitePartner?: string;
  siteRO?: string;
  templateRO?: string;
  procedimentoRO?: string;
  login?: string;
  password?: string;
}

// Removed Quote and Proposal interfaces as these features have been removed

export interface RO {
    id: number;
    partnerId: number | string; // Can be string from form
    roNumber: string;
    openDate: string;
    expiryDate: string;
    clientName: string;
    product: string;
    value: number;
}

export interface Training {
    id: number;
    partnerId: number | string; // Can be string from form
    trainingName: string;
    type: 'Comercial' | 'Técnico';
    participantName: string;
    expiryDate: string;
}

// Removed RFP, PriceRecord, PriceRecordItem, BidFile, and BidDocs interfaces as these features have been removed

// Removed all Edital-related interfaces (EditalFile, EditalAIAnalysis, Edital, EditalDocument, EditalProduct, EditalAnalysis) as these features have been removed

export interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    href?: string;
    subItems?: NavSubItem[];
}

export interface NavSubItem {
    id: string;
    label: string;
    icon: React.ReactNode;
}

// Tipos para o Analisador de Editais
export interface AnalysisType {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export interface AnalysisResult {
  id: string;
  fileName: string;
  analysisType: string;
  analysisDate: string;
  summary: string;
  keyPoints: string[];
  requirements: string[];
  deadlines: string[];
  values: string[];
  risks: string[];
  opportunities: string[];
  recommendations: string[];
  confidence: number;
  processingTime: number;
  products?: ProductItem[];
}

export interface ProductItem {
  item: string;
  description: string;
  quantity: number;
  unit: string;
  estimatedValue: number;
  specifications: string[];
  category?: string;
  priority?: 'Crítico' | 'Importante' | 'Desejável';
  complianceLevel?: 'Total' | 'Parcial' | 'Não Atende';
  riskLevel?: 'Baixo' | 'Médio' | 'Alto';
  technicalJustification?: string;
  marketAnalysis?: string;
  alternativeOptions?: string[];
  suggestedModels?: SuggestedModel[];
}

export interface SuggestedModel {
  brand: string;
  model: string;
  partNumber?: string;
  estimatedPrice: number;
  availability: 'Disponível' | 'Sob Consulta' | 'Descontinuado';
  complianceScore: number;
  advantages: string[];
  disadvantages?: string[];
  distributors?: string[];
}

export interface DocumentRequirement {
  type: string;
  description: string;
  mandatory: boolean;
  deadline?: string;
  notes?: string;
}

// Enhanced Error Response Interfaces for Proposals API
export type ProposalApiErrorCode = 
  | 'INDEX_MISSING' 
  | 'PERMISSION_DENIED' 
  | 'QUOTA_EXCEEDED' 
  | 'VALIDATION_ERROR'
  | 'DATABASE_CONNECTION_ERROR'
  | 'AUTHENTICATION_REQUIRED'
  | 'UNKNOWN_ERROR';

export interface ProposalApiErrorDetails {
  indexUrl?: string;
  requiredFields?: string[];
  fallbackAvailable?: boolean;
  validationErrors?: string[];
  retryAfter?: number;
  supportContact?: string;
  documentationUrl?: string;
  requiredIndexDefinition?: string;
}

export interface ProposalApiError {
  error: string;
  message: string;
  code: ProposalApiErrorCode;
  timestamp: string;
  requestId?: string;
  details?: ProposalApiErrorDetails;
}

export interface IndexErrorInfo {
  isIndexError: boolean;
  missingFields?: string[];
  collection?: string;
  indexUrl?: string;
  fallbackStrategy: 'UNORDERED_QUERY' | 'CLIENT_SORT' | 'SIMPLIFIED_QUERY' | 'NONE';
  requiredIndexDefinition?: string;
}

export interface QueryFallbackResult {
  snapshot: any;
  usedFallback: boolean;
  fallbackType?: string;
  performanceImpact?: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendedAction?: string;
}
