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
