"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from "sonner"; // Added toast import
import CommissionTables, { CommissionData } from './CommissionTables';
import { DRETable, DRETableProps } from './DRETable';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Phone, PhoneForwarded, Edit, Plus, Save, Download, Trash2, ArrowLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ClientManagerForm, ClientData, AccountManagerData } from './ClientManagerForm';
import { ClientManagerInfo } from './ClientManagerInfo';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore';

// Interfaces
interface PABXResult {
    setup: number;
    baseMonthly: number;
    deviceRentalCost: number;
    aiAgentCost: number;
    totalMonthly: number;
}

interface SIPResult {
    setup: number;
    monthly: number;
}

interface ProposalItem {
    id: string;
    description: string;
    setup: number;
    monthly: number;
}

interface Proposal {
    id: string;
    baseId: string;
    version: number;
    client: ClientData;
    accountManager: AccountManagerData;
    items: ProposalItem[];
    totalSetup: number;
    totalMonthly: number;
    rawTotalSetup?: number;
    rawTotalMonthly?: number;
    createdAt: string;
    userId: string;
    value?: number;
    contractPeriod?: string;
    discountInfo?: {
        applySalespersonDiscount: boolean;
        appliedDirectorDiscountPercentage: number;
        salespersonDiscountFactor: number;
        directorDiscountFactor: number;
        hasDiscounts: boolean;
    };
}

interface PABXSIPCalculatorProps {
    onBackToDashboard?: () => void;
}

export const PABXSIPCalculator: React.FC<PABXSIPCalculatorProps> = ({ onBackToDashboard }) => {
    // Estado para controlar a tela atual
    const [currentView, setCurrentView] = useState<'search' | 'client-form' | 'calculator' | 'proposal-summary'>('search');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [savedProposals, setSavedProposals] = useState<Proposal[]>([]);
    const [currentProposal, setCurrentProposal] = useState<Proposal | null>(null);

    // Estados dos dados do cliente e gerente
    const [clientData, setClientData] = useState<ClientData>({
        name: '',
        contact: '',
        projectName: '',
        email: '',
        phone: ''
    });
    const [accountManagerData, setAccountManagerData] = useState<AccountManagerData>({
        name: '',
        email: '',
        phone: ''
    });

    // Estados PABX
    const [pabxExtensions, setPabxExtensions] = useState<number>(32);
    const [pabxIncludeSetup, setPabxIncludeSetup] = useState<boolean>(true);
    const [pabxIncludeDevices, setPabxIncludeDevices] = useState<boolean>(true);
    const [pabxDeviceQuantity, setPabxDeviceQuantity] = useState<number>(5);
    const [pabxIncludeAI, setPabxIncludeAI] = useState<boolean>(false);
    const [includeParceiroIndicador, setIncludeParceiroIndicador] = useState<boolean>(false);
    const [aiAgentPlan, setAiAgentPlan] = useState<string>('basic');
    const [pabxAIPlan, setPabxAIPlan] = useState<string>('20K');
    const [pabxResult, setPabxResult] = useState<PABXResult | null>(null);
    const [pabxModality, setPabxModality] = useState<'Standard' | 'Premium'>('Standard');
    const [pabxPremiumPlan, setPabxPremiumPlan] = useState<'Essencial' | 'Profissional'>('Essencial');
    const [pabxPremiumSubPlan, setPabxPremiumSubPlan] = useState<'Ilimitado' | 'Tarifado'>('Ilimitado');
    const [pabxPremiumEquipment, setPabxPremiumEquipment] = useState<'Com' | 'Sem'>('Sem');
    const [contractDuration, setContractDuration] = useState<string>('24');

    // Estados SIP
    const [sipPlan, setSipPlan] = useState<string>('SIP ILIMITADO 10 Canais');
    const [sipIncludeSetup, setSipIncludeSetup] = useState<boolean>(false);
    const [sipAdditionalChannels, setSipAdditionalChannels] = useState<number>(0);
    const [sipWithEquipment, setSipWithEquipment] = useState<boolean>(true);
    const [sipResult, setSipResult] = useState<SIPResult | null>(null);

    // Estados da Proposta
    const [proposalItems, setProposalItems] = useState<ProposalItem[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const { user: currentUser } = useAuth();

    // Commission data state
    const [commissionData, setCommissionData] = useState<CommissionData>({
      vendedor: [
        { meses: '12 meses', comissao: '1,5' },
        { meses: '24 meses', comissao: '2' },
        { meses: '36 meses', comissao: '2,5' },
        { meses: '48 meses', comissao: '3' },
        { meses: '60 meses', comissao: '3,5' },
      ],
      diretor: [
        { meses: '12 meses', comissao: '0,5' },
        { meses: '24 meses', comissao: '0,75' },
        { meses: '36 meses', comissao: '1' },
        { meses: '48 meses', comissao: '1,25' },
        { meses: '60 meses', comissao: '1,5' },
      ],
      parceiro: [
        { range: 'R$ 0,00 a R$ 500,00', ate24: '1,5', mais24: '2,5' },
        { range: 'R$ 500,01 a R$ 1.000,00', ate24: '2,5', mais24: '4' },
        { range: 'R$ 1.000,01 a R$ 1.500,00', ate24: '4,01', mais24: '5,5' },
        { range: 'R$ 1.500,01 a R$ 3.000,00', ate24: '5,51', mais24: '7' },
        { range: 'R$ 3.000,01 a R$ 5.000,00', ate24: '7,01', mais24: '8,5' },
        { range: 'R$ 5.000,01 a R$ 6.500,00', ate24: '8,51', mais24: '10' },
        { range: 'R$ 6.500,01 a R$ 9.000,00', ate24: '10,01', mais24: '11,5' },
        { range: 'Acima de R$ 9.000,01', ate24: '11,51', mais24: '13' },
      ],
    });

    // Save PABX/SIP settings
    const saveSettings = useCallback(async () => {
        if (!currentUser) {
            toast.error('Você precisa estar logado para salvar as configurações');
            return;
        }

        try {
            setIsSaving(true);
            const settingsRef = doc(db, 'pabxSipSettings', currentUser.uid);
            
            await setDoc(settingsRef, {
                // PABX Settings
                pabxExtensions,
                pabxModality,
                pabxPremiumPlan,
                pabxPremiumSubPlan,
                pabxPremiumEquipment,
                contractDuration,
                pabxIncludeSetup,
                pabxIncludeDevices,
                pabxDeviceQuantity,
                pabxIncludeAI,
                aiAgentPlan,
                pabxAIPlan,
                includeParceiroIndicador,
                
                // SIP Settings
                sipPlan,
                sipIncludeSetup,
                sipAdditionalChannels,
                sipWithEquipment,
                
                // Commission Data
                commissionData,
                
                updatedAt: serverTimestamp(),
                userId: currentUser.uid,
                userName: currentUser.email || 'Usuário não identificado'
            }, { merge: true });
            
            toast.success('Configurações salvas com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
            toast.error('Erro ao salvar configurações. Tente novamente.');
        } finally {
            setIsSaving(false);
        }
    }, [
        currentUser, pabxExtensions, pabxModality, pabxPremiumPlan, pabxPremiumSubPlan, 
        pabxPremiumEquipment, contractDuration, pabxIncludeSetup, pabxIncludeDevices, 
        pabxDeviceQuantity, pabxIncludeAI, aiAgentPlan, pabxAIPlan, includeParceiroIndicador,
        sipPlan, sipIncludeSetup, sipAdditionalChannels, sipWithEquipment, commissionData
    ]);

    // Estados para edição das tabelas
    const [isEditingPABX, setIsEditingPABX] = useState(false);
    const [isEditingSIP, setIsEditingSIP] = useState(false);

    // Estados para edição da tabela AI
    const [isEditingAI, setIsEditingAI] = useState(false);
    const [isEditingPABXPremium24, setIsEditingPABXPremium24] = useState(false);
    const [editedValues, setEditedValues] = useState<Record<string, number>>({});
    const [isEditingPABXPremium36, setIsEditingPABXPremium36] = useState(false);
    
    // Função para salvar as alterações da tabela PABX Premium
    const handleSavePABXPrices = () => {
        // Atualiza o estado com os valores editados
        const updatedPrices = { ...pabxPremiumPrices };
        
        // Atualiza os valores editados
        Object.entries(editedValues).forEach(([key, value]) => {
            const [duration, plan, subPlan, index, field] = key.split('-');
            const idx = parseInt(index, 10);
            if (updatedPrices[duration]?.[plan]?.[subPlan]?.[idx]) {
                updatedPrices[duration][plan][subPlan][idx][field] = value;
            }
        });
        
        setPabxPremiumPrices(updatedPrices);
        setEditedValues({});
        setIsEditingPABXPremium24(false);
        
        // TODO: Implementar salvamento no banco de dados
    };
    
    // Função para lidar com mudanças nos inputs de edição
    const handleInputChange = (duration: string, plan: string, subPlan: string, index: number, field: string, value: string) => {
        const numValue = parseFloat(value) || 0;
        setEditedValues(prev => ({
            ...prev,
            [`${duration}-${plan}-${subPlan}-${index}-${field}`]: numValue
        }));
    };

    // Estados para Markup e Margem
    const [markup, setMarkup] = useState<number>(30);
    const [estimatedNetMargin, setEstimatedNetMargin] = useState<number>(0);
    const [commissionPercentage, setCommissionPercentage] = useState<number>(3);

    // Descontos
    const [directorDiscountPercentage, setDirectorDiscountPercentage] = useState<number>(0);
    const [appliedDirectorDiscountPercentage, setAppliedDirectorDiscountPercentage] = useState<number>(0); // New state for applied director discount
    const [applySalespersonDiscount, setApplySalespersonDiscount] = useState<boolean>(false); // New state

    // Dados de preços do List Price - PABX (editáveis)
    const [pabxPrices, setPabxPrices] = useState({
        setup: {
            '10': 1250,
            '20': 2000,
            '30': 2500,
            '50': 3000,
            '100': 3500,
            '500': 0, // Valor a combinar
            '1000': 0 // Valor a combinar
        },
        monthly: {
            '10': 30,
            '20': 29,
            '30': 28,
            '50': 27,
            '100': 26,
            '500': 25,
            '1000': 24.5
        },
        hosting: {
            '10': 200,
            '20': 220,
            '30': 250,
            '50': 300,
            '100': 400,
            '500': 0, // Valor a combinar
            '1000': 0 // Valor a combinar
        },
        device: {
            '10': 35,
            '20': 34,
            '30': 33,
            '50': 32,
            '100': 30,
            '500': 0, // Valor a combinar
            '1000': 0 // Valor a combinar
        }
    });

    // PABX Premium Prices
    const [pabxPremiumPrices, setPabxPremiumPrices] = useState({
        '24': {
            essencial: {
                ilimitado: [
                    { range: '2 a 9 ramais', comEquipamento: 84, semEquipamento: 75 },
                    { range: '10 a 19 ramais', comEquipamento: 65, semEquipamento: 57 },
                    { range: '20 a 49 ramais', comEquipamento: 62, semEquipamento: 54 },
                    { range: '50 a 99 ramais', comEquipamento: 59, semEquipamento: 52 },
                    { range: '100 a 199 ramais', comEquipamento: 55, semEquipamento: 48 },
                    { range: '+ de 200 ramais', comEquipamento: 52, semEquipamento: 45 }
                ],
                tarifado: [
                    { range: '2 a 9 ramais', comEquipamento: 59, semEquipamento: 44 },
                    { range: '10 a 49 ramais', comEquipamento: 49, semEquipamento: 34 },
                    { range: '50 a 99 ramais', comEquipamento: 38, semEquipamento: 30 },
                    { range: '100 a 199 ramais', comEquipamento: 34, semEquipamento: 27 },
                    { range: '+ de 200 ramais', comEquipamento: 32, semEquipamento: 25 }
                ]
            },
            profissional: {
                ilimitado: [
                    { range: '2 a 9 ramais', comEquipamento: 104, semEquipamento: 95 },
                    { range: '10 a 19 ramais', comEquipamento: 77, semEquipamento: 72 },
                    { range: '20 a 49 ramais', comEquipamento: 73, semEquipamento: 68 },
                    { range: '50 a 99 ramais', comEquipamento: 69, semEquipamento: 66 },
                    { range: '100 a 199 ramais', comEquipamento: 65, semEquipamento: 62 },
                    { range: '+ de 200 ramais', comEquipamento: 62, semEquipamento: 55 }
                ],
                tarifado: [
                    { range: '2 a 9 ramais', comEquipamento: 79, semEquipamento: 64 },
                    { range: '10 a 49 ramais', comEquipamento: 59, semEquipamento: 44 },
                    { range: '50 a 99 ramais', comEquipamento: 51, semEquipamento: 36 },
                    { range: '100 a 199 ramais', comEquipamento: 39, semEquipamento: 32 },
                    { range: '+ de 200 ramais', comEquipamento: 35, semEquipamento: 28 }
                ]
            }
        },
        '36': {
            essencial: {
                ilimitado: [
                    { range: '2 a 9 ramais', comEquipamento: 77, semEquipamento: 71 },
                    { range: '10 a 19 ramais', comEquipamento: 59, semEquipamento: 53 },
                    { range: '20 a 49 ramais', comEquipamento: 55, semEquipamento: 48 },
                    { range: '50 a 99 ramais', comEquipamento: 53, semEquipamento: 44 },
                    { range: '100 a 199 ramais', comEquipamento: 48, semEquipamento: 40 },
                    { range: '+ de 200 ramais', comEquipamento: 45, semEquipamento: 38 }
                ],
                tarifado: [
                    { range: '2 a 9 ramais', comEquipamento: 57, semEquipamento: 42 },
                    { range: '10 a 49 ramais', comEquipamento: 47, semEquipamento: 32 },
                    { range: '50 a 99 ramais', comEquipamento: 36, semEquipamento: 28 },
                    { range: '100 a 199 ramais', comEquipamento: 32, semEquipamento: 25 },
                    { range: '+ de 200 ramais', comEquipamento: 30, semEquipamento: 23 }
                ]
            },
            profissional: {
                ilimitado: [
                    { range: '2 a 9 ramais', comEquipamento: 97, semEquipamento: 91 },
                    { range: '10 a 19 ramais', comEquipamento: 73, semEquipamento: 69 },
                    { range: '20 a 49 ramais', comEquipamento: 69, semEquipamento: 66 },
                    { range: '50 a 99 ramais', comEquipamento: 65, semEquipamento: 63 },
                    { range: '100 a 199 ramais', comEquipamento: 60, semEquipamento: 59 },
                    { range: '+ de 200 ramais', comEquipamento: 57, semEquipamento: 52 }
                ],
                tarifado: [
                    { range: '2 a 9 ramais', comEquipamento: 75, semEquipamento: 60 },
                    { range: '10 a 49 ramais', comEquipamento: 57, semEquipamento: 42 },
                    { range: '50 a 99 ramais', comEquipamento: 49, semEquipamento: 34 },
                    { range: '100 a 199 ramais', comEquipamento: 37, semEquipamento: 30 },
                    { range: '+ de 200 ramais', comEquipamento: 33, semEquipamento: 26 }
                ]
            }
        }
    });

    // SIP Prices
    const [sipPrices, setSipPrices] = useState<{ [key: string]: { setup: number, monthly: number, monthlyWithEquipment: number | null, channels: number } }>({
        'SIP TARIFADO Call Center 2 Canais': { setup: 0, monthly: 200, monthlyWithEquipment: null, channels: 2 },
        'SIP TARIFADO 2 Canais': { setup: 0, monthly: 150, monthlyWithEquipment: null, channels: 2 },
        'SIP TARIFADO 4 Canais': { setup: 0, monthly: 250, monthlyWithEquipment: 500, channels: 4 },
        'SIP TARIFADO 10 Canais': { setup: 0, monthly: 350, monthlyWithEquipment: 650, channels: 10 },
        'SIP TARIFADO 30 Canais': { setup: 0, monthly: 550, monthlyWithEquipment: 1200, channels: 30 },
        'SIP TARIFADO 60 Canais': { setup: 0, monthly: 1000, monthlyWithEquipment: 1200, channels: 60 },
        'SIP ILIMITADO 5 Canais': { setup: 0, monthly: 350, monthlyWithEquipment: 500, channels: 5 },
        'SIP ILIMITADO 10 Canais': { setup: 0, monthly: 450, monthlyWithEquipment: 600, channels: 10 },
        'SIP ILIMITADO 20 Canais': { setup: 0, monthly: 650, monthlyWithEquipment: 800, channels: 20 },
        'SIP ILIMITADO 30 Canais': { setup: 0, monthly: 850, monthlyWithEquipment: 950, channels: 30 },
        'SIP ILIMITADO 60 Canais': { setup: 0, monthly: 1600, monthlyWithEquipment: 1700, channels: 60 }
    });

    // Dados de preços do List Price - SIP Config (editáveis)
    const [sipConfig, setSipConfig] = useState({
        additionalChannels: {
            assinatura: {
                '5': { max: 3, price: 30 },
                '10': { max: 5, price: 20 },
                '20': { max: 3, price: 20 },
                '30': { max: 20, price: 5 },
            },
            franquia: {
                '4': { max: 10, price: 25 },
                '10': { max: 20, price: 25 },
                '30': { max: 30, price: 25 },
            },
        },
        includedMinutes: {
            '5': 15000,
            '10': 20000,
            '20': 25000,
            '30': 30000,
            '60': 60000,
        },
        includedNumbers: {
            callCenter: 'Consultar',
            tarifado: {
                '2': 'Máximo 3 Números',
                '4': 'Máximo 4 Números',
                '10': 'Máximo 5 Números',
                '30': 'Máximo 5 Números',
            },
            ilimitado: {
                '5': 'Máximo 10 Números',
                '10': 'Máximo 15 Números',
                '20': 'Máximo 20 Números',
                '30': 'Máximo 30 Números',
                '60': 'Máximo 30 Números',
            }
        },
        additionalNumberPrice: 10,
        tariffs: {
            localFixo: { callCenter: 0.015, tarifado: 0.02 },
            dddFixo: { callCenter: 0.05, tarifado: 0.06 },
            brasilMovel: { callCenter: 0.09, default: 0.10 },
        },
    });

    // Dados de preços do List Price - Agente IA (editáveis)
    const [aiAgentPrices, setAiAgentPrices] = useState({
        '20K': { price: 720, credits: 20000, messages: 10000, minutes: 2000, premium: 1000 },
        '40K': { price: 1370, credits: 40000, messages: 20000, minutes: 4000, premium: 2000 },
        '60K': { price: 1940, credits: 60000, messages: 30000, minutes: 6000, premium: 3000 },
        '100K': { price: 3060, credits: 100000, messages: 50000, minutes: 10000, premium: 5000 },
        '150K': { price: 4320, credits: 150000, messages: 75000, minutes: 15000, premium: 7500 },
        '200K': { price: 5400, credits: 200000, messages: 100000, minutes: 20000, premium: 10000 }
    });

    // Funções Auxiliares
    const formatCurrency = (value: number | undefined | null) => {
        const numValue = Number(value) || 0;
        return `R$ ${numValue.toFixed(2).replace('.', ',')}`;
    };
    const generateUniqueId = () => `item-${Date.now()}`;

    // Função para determinar a faixa de preço baseada no número de ramais
    const getPriceRange = useCallback((extensions: number): string => {
        if (extensions <= 10) return '10';
        if (extensions <= 20) return '20';
        if (extensions <= 30) return '30';
        if (extensions <= 50) return '50';
        if (extensions <= 100) return '100';
        return '100'; // Para valores acima de 100, usar a última faixa
    }, []);

    const getPremiumPriceRange = useCallback((extensions: number): string => {
        if (extensions >= 2 && extensions <= 9) return '2 a 9 ramais';
        if (extensions >= 10 && extensions <= 19) return '10 a 19 ramais';
        if (extensions >= 20 && extensions <= 49) return '20 a 49 ramais';
        if (extensions >= 50 && extensions <= 99) return '50 a 99 ramais';
        if (extensions >= 100 && extensions <= 199) return '100 a 199 ramais';
        if (extensions >= 200) return '+ de 200 ramais';
        return '';
    }, []);

    // Efeito para recalcular automaticamente quando houver mudanças nas dependências do PABX Premium
    useEffect(() => {
        if (pabxModality === 'Premium') {
            calculatePABX();
        }
    }, [pabxModality, pabxPremiumPlan, pabxPremiumSubPlan, pabxPremiumEquipment, contractDuration, pabxExtensions, pabxIncludeAI, pabxAIPlan]);

    // Get commission rate based on contract duration and role
    const getCommissionRate = (role: 'vendedor' | 'diretor' | 'parceiro', amount: number = 0): number => {
      if (role === 'vendedor' || role === 'diretor') {
        const months = parseInt(contractDuration);
        const commissionEntry = commissionData[role].find((entry: { meses: string; comissao: string }) => 
          entry.meses.includes(months.toString())
        );
        
        if (commissionEntry) {
          return parseFloat(commissionEntry.comissao.replace(',', '.')) / 100;
        }
      } else if (role === 'parceiro') {
        const months = parseInt(contractDuration);
        const commissionEntry = commissionData.parceiro.find((entry: { range: string; ate24: string; mais24: string }) => {
          const range = entry.range;
          if (range === 'Acima de R$ 9.000,01') {
            return amount > 9000.01;
          }
          const [minStr, maxStr] = range.replace('R$ ', '').replace(/\./g, '').replace(',', '.').split(' a ');
          const min = parseFloat(minStr);
          const max = parseFloat(maxStr);
          return amount >= min && amount <= max;
        });
        
        if (commissionEntry) {
          const rate = months <= 24 ? commissionEntry.ate24 : commissionEntry.mais24;
          return parseFloat(rate.replace(',', '.')) / 100;
        }
      }
      
      return 0; // Default to 0% if no matching entry found
    };

    // Get partner indicator commission rate based on monthly revenue and contract duration
    const getPartnerIndicatorRate = (monthlyRevenue: number, contractMonths: number) => {
        if (!commissionData.parceiro || commissionData.parceiro.length === 0) {
            return 0;
        }

        // Find the matching range for the monthly revenue
        const matchingRange = commissionData.parceiro.find(range => {
            const [min, max] = range.range.split('-').map(Number);
            return monthlyRevenue >= min && (isNaN(max) || monthlyRevenue <= max);
        });

        if (!matchingRange) {
            return 0;
        }

        // Return the appropriate rate based on contract duration
        return parseFloat(contractMonths <= 24 ? 
            matchingRange.ate24.replace(',', '.') : 
            matchingRange.mais24.replace(',', '.')) / 100; // Convert to decimal
    };

    // Calculate PABX result
    const calculatePABX = useCallback((): PABXResult => {
        if (pabxModality === 'Standard') {
            const range = getPriceRange(pabxExtensions);

            const setup = pabxIncludeSetup ? pabxPrices.setup[range as keyof typeof pabxPrices.setup] : 0;
            const baseMonthly = (pabxPrices.monthly[range as keyof typeof pabxPrices.monthly] * pabxExtensions) +
                pabxPrices.hosting[range as keyof typeof pabxPrices.hosting];
            const deviceRentalCost = pabxIncludeDevices ?
                (pabxPrices.device[range as keyof typeof pabxPrices.device] * pabxDeviceQuantity) : 0;
            const aiAgentCost = pabxIncludeAI ? aiAgentPrices[pabxAIPlan as keyof typeof aiAgentPrices]?.price || 0 : 0;

            return {
                setup,
                baseMonthly,
                deviceRentalCost,
                aiAgentCost,
                totalMonthly: baseMonthly + deviceRentalCost + aiAgentCost
            };
        } else { // Premium
            const premiumRange = getPremiumPriceRange(pabxExtensions);
            if (!premiumRange) {
                return { setup: 0, baseMonthly: 0, deviceRentalCost: 0, aiAgentCost: 0, totalMonthly: 0 };
            }

            const plan = pabxPremiumPrices[contractDuration as keyof typeof pabxPremiumPrices]?.[pabxPremiumPlan.toLowerCase() as keyof typeof pabxPremiumPrices[typeof contractDuration]];
            if (!plan) {
                return { setup: 0, baseMonthly: 0, deviceRentalCost: 0, aiAgentCost: 0, totalMonthly: 0 };
            }

            const subPlan = plan[pabxPremiumSubPlan.toLowerCase() as keyof typeof plan];
            if (!subPlan || !Array.isArray(subPlan)) {
                return { setup: 0, baseMonthly: 0, deviceRentalCost: 0, aiAgentCost: 0, totalMonthly: 0 };
            }

            const priceData = subPlan.find((p: { range: string }) => p.range === premiumRange);
            if (!priceData) {
                return { setup: 0, baseMonthly: 0, deviceRentalCost: 0, aiAgentCost: 0, totalMonthly: 0 };
            }

            const setup = 0; // To be defined by user
            const baseMonthly = pabxPremiumEquipment === 'Com' 
                ? (priceData as any).comEquipamento * pabxExtensions 
                : (priceData as any).semEquipamento * pabxExtensions;
            const deviceRentalCost = 0; // Already included in baseMonthly
            const aiAgentCost = pabxIncludeAI ? aiAgentPrices[pabxAIPlan as keyof typeof aiAgentPrices]?.price || 0 : 0;

            return {
                setup,
                baseMonthly,
                deviceRentalCost,
                aiAgentCost,
                totalMonthly: baseMonthly + deviceRentalCost + aiAgentCost
            };
        }
    }, [
        pabxModality, 
        pabxExtensions, 
        pabxIncludeSetup, 
        pabxPrices, 
        pabxIncludeDevices, 
        pabxDeviceQuantity, 
        pabxIncludeAI, 
        pabxAIPlan, 
        pabxPremiumPlan, 
        pabxPremiumSubPlan, 
        pabxPremiumEquipment, 
        contractDuration, 
        aiAgentPrices, 
        pabxPremiumPrices,
        getPriceRange,
        getPremiumPriceRange
    ]);

    // Update PABX result when calculation changes
    useEffect(() => {
        const result = calculatePABX();
        setPabxResult(result);
    }, [calculatePABX]);

    // Calculate SIP result
    const calculateSIP = useCallback((): SIPResult | null => {
        if (!sipPlan) return null;

        const planData = sipPrices[sipPlan as keyof typeof sipPrices];
        if (!planData) {
            return null;
        }

        const setup = sipIncludeSetup ? (planData.setup || 0) : 0;
        let monthly = sipWithEquipment && planData.monthlyWithEquipment ? planData.monthlyWithEquipment : planData.monthly;

        // Handle additional channels
        if (sipAdditionalChannels > 0) {
            const planChannelsStr = sipPlan.match(/\d+/)?.[0];
            if (planChannelsStr) {
                let additionalCost = 0;
                
                if (sipPlan.includes('ILIMITADO')) { // Assinatura
                    const assinaturaConfig = sipConfig.additionalChannels.assinatura[planChannelsStr as keyof typeof sipConfig.additionalChannels.assinatura];
                    if (assinaturaConfig && sipAdditionalChannels <= assinaturaConfig.max) {
                        additionalCost = sipAdditionalChannels * assinaturaConfig.price;
                    }
                } else if (sipPlan.includes('TARIFADO')) { // Franquia
                     const franquiaConfig = sipConfig.additionalChannels.franquia[planChannelsStr as keyof typeof sipConfig.additionalChannels.franquia];
                    if (franquiaConfig && sipAdditionalChannels <= franquiaConfig.max) {
                        additionalCost = sipAdditionalChannels * franquiaConfig.price;
                    }
                }
                monthly += additionalCost;
            }
        }

        return { setup, monthly };
    }, [sipPlan, sipIncludeSetup, sipAdditionalChannels, sipWithEquipment, sipPrices, sipConfig]);

    // Update SIP result when calculation changes
    useEffect(() => {
        const result = calculateSIP();
        setSipResult(result);
    }, [calculateSIP]);

    

    // Add PABX to proposal
    const addPABXToProposal = () => {
        if (!pabxResult) return;

        const newItem: ProposalItem = {
            id: generateUniqueId(),
            description: `PABX ${pabxExtensions} ramais`,
            setup: pabxResult.setup,
            monthly: pabxResult.totalMonthly
        };

        setProposalItems(prev => [...prev, newItem]);
    };

    // Adicionar SIP à proposta
    const addSIPToProposal = () => {
        if (!sipResult) return;

        const newItem: ProposalItem = {
            id: generateUniqueId(),
            description: sipPlan,
            setup: sipResult.setup,
            monthly: sipResult.monthly
        };

        setProposalItems(prev => [...prev, newItem]);
    };

    const handleRemoveItem = (id: string) => {
        setProposalItems(prev => prev.filter(item => item.id !== id));
    };

    // Calcular totais da proposta
    console.log("Type of proposalItems before reduce:", typeof proposalItems, "Is array:", Array.isArray(proposalItems));
    const rawTotalSetup = proposalItems.reduce((sum, item) => sum + (parseFloat(item.setup as any) || 0), 0);
    const rawTotalMonthly = proposalItems.reduce((sum, item) => sum + (parseFloat(item.monthly as any) || 0), 0);

    // Aplicar desconto do vendedor (5% fixo)
    const salespersonDiscountFactor = applySalespersonDiscount ? 0.95 : 1; // Conditional application

    // Aplicar desconto do diretor (personalizável)
    const directorDiscountFactor = 1 - (appliedDirectorDiscountPercentage / 100);

    const finalTotalSetup = rawTotalSetup * salespersonDiscountFactor * directorDiscountFactor;
    const finalTotalMonthly = rawTotalMonthly * salespersonDiscountFactor * directorDiscountFactor;

    const clearForm = () => {
        setClientData({ name: '', contact: '', projectName: '', email: '', phone: '' });
        setAccountManagerData({ name: '', email: '', phone: '' });
        setProposalItems([]);
        setCurrentProposal(null);
        // Resetar outros estados da calculadora se necessário
    };

    const createNewProposal = () => {
        clearForm();
        setCurrentView('client-form');
    };

    const viewProposal = (proposal: Proposal) => {
        setCurrentProposal(proposal);
        
        // Handle client data - check if it's an object or string
        if (typeof proposal.client === 'object' && proposal.client !== null) {
            setClientData(proposal.client);
        } else if (typeof proposal.client === 'string') {
            setClientData({ 
                name: proposal.client, 
                contact: '', 
                projectName: '', 
                email: '', 
                phone: '' 
            });
        } else if (proposal.clientData) {
            setClientData(proposal.clientData);
        }
        
        // Handle account manager data
        if (proposal.accountManager) {
            setAccountManagerData(proposal.accountManager);
        }
        
        // Handle items/products - check multiple possible locations
        let items = [];
        if (proposal.items && Array.isArray(proposal.items)) {
            items = proposal.items;
        } else if (proposal.products && Array.isArray(proposal.products)) {
            // Convert products to items format if needed
            items = proposal.products.map((product: any) => ({
                id: product.id || `item-${Date.now()}`,
                description: product.description || 'PABX SIP',
                setup: product.setup || 0,
                monthly: product.monthly || 0,
                quantity: product.quantity || 1
            }));
        }
        
        setProposalItems(items);
        setCurrentView('proposal-summary');
    };

    const editProposal = (proposal: Proposal) => {
        setCurrentProposal(proposal);
        
        // Handle client data - check if it's an object or string
        if (typeof proposal.client === 'object' && proposal.client !== null) {
            setClientData(proposal.client);
        } else if (typeof proposal.client === 'string') {
            setClientData({ 
                name: proposal.client, 
                contact: '', 
                projectName: '', 
                email: '', 
                phone: '' 
            });
        } else if (proposal.clientData) {
            setClientData(proposal.clientData);
        }
        
        // Handle account manager data
        if (proposal.accountManager) {
            setAccountManagerData(proposal.accountManager);
        }
        
        console.log("Proposal items from Firebase in editProposal:", proposal.items);
        console.log("Proposal products from Firebase in editProposal:", proposal.products);
        
        // Handle items/products - check multiple possible locations
        let items = [];
        if (proposal.items && Array.isArray(proposal.items)) {
            items = proposal.items;
        } else if (proposal.products && Array.isArray(proposal.products)) {
            // Convert products to items format if needed
            items = proposal.products.map((product: any) => ({
                id: product.id || `item-${Date.now()}`,
                description: product.description || 'PABX SIP',
                setup: product.setup || 0,
                monthly: product.monthly || 0,
                quantity: product.quantity || 1
            }));
        }
        
        setProposalItems(items);
        
        // Restore discount settings if they exist
        if (proposal.discountInfo) {
            setApplySalespersonDiscount(proposal.discountInfo.applySalespersonDiscount || false);
            setAppliedDirectorDiscountPercentage(proposal.discountInfo.appliedDirectorDiscountPercentage || 0);
        } else {
            // Reset discount settings if no discount info exists
            setApplySalespersonDiscount(false);
            setAppliedDirectorDiscountPercentage(0);
        }
        
        // Restore contract duration if it exists
        if (proposal.contractPeriod) {
            setContractDuration(proposal.contractPeriod.toString());
        }
        
        setCurrentView('calculator');
    };

    // Função para salvar proposta
    const saveProposal = async () => {
        if (proposalItems.length === 0) {
            alert('Adicione pelo menos um item à proposta antes de salvar.');
            return;
        }
        if (!currentUser) {
            alert('Você precisa estar logado para salvar uma proposta.');
            return;
        }
        
        // Validar dados obrigatórios
        if (!clientData || !clientData.name) {
            alert('Por favor, preencha os dados do cliente antes de salvar.');
            return;
        }
        
        if (!accountManagerData || !accountManagerData.name) {
            alert('Por favor, preencha os dados do gerente de contas antes de salvar.');
            return;
        }

        // Calculate raw totals
        const rawTotalSetup = proposalItems.reduce((sum, item) => sum + item.setup, 0);
        const rawTotalMonthly = proposalItems.reduce((sum, item) => sum + item.monthly, 0);

        // Apply discounts to get final totals
        const salespersonDiscountFactor = applySalespersonDiscount ? 0.95 : 1;
        const directorDiscountFactor = 1 - (appliedDirectorDiscountPercentage / 100);
        const finalTotalSetup = rawTotalSetup * salespersonDiscountFactor * directorDiscountFactor;
        const finalTotalMonthly = rawTotalMonthly * salespersonDiscountFactor * directorDiscountFactor;

        // Determine if this should be version 2 (when discounts are applied)
        const hasDiscounts = applySalespersonDiscount || appliedDirectorDiscountPercentage > 0;
        const proposalVersion = hasDiscounts ? 2 : 1;

        try {
            const proposalData = {
                title: `Proposta PABX/SIP - ${clientData.name}`,
                client: clientData.name,
                type: 'PABX',
                status: 'Rascunho',
                value: finalTotalMonthly, // Use discounted value
                totalMonthly: finalTotalMonthly, // Use discounted value
                totalSetup: finalTotalSetup, // Use discounted value
                rawTotalMonthly: rawTotalMonthly, // Store raw values for reference
                rawTotalSetup: rawTotalSetup, // Store raw values for reference
                createdBy: currentUser.uid || 'anonymous',
                distributorId: accountManagerData.distributorId || '',
                accountManager: accountManagerData.name || '',
                items: proposalItems,
                clientData: clientData,
                accountManagerData: accountManagerData,
                // Save discount information
                discountInfo: {
                    applySalespersonDiscount: applySalespersonDiscount,
                    appliedDirectorDiscountPercentage: appliedDirectorDiscountPercentage,
                    salespersonDiscountFactor: salespersonDiscountFactor,
                    directorDiscountFactor: directorDiscountFactor,
                    hasDiscounts: hasDiscounts
                },
                contractPeriod: contractDuration,
                version: proposalVersion // Set version based on discount application
            };

            const response = await fetch('/api/proposals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`,
                },
                body: JSON.stringify(proposalData)
            });

            if (response.ok) {
                const savedProposal = await response.json();
                alert(`Proposta ${savedProposal.baseId} salva com sucesso!`);
                fetchProposals();
                clearForm();
                setCurrentView('search');
            } else {
                const errorData = await response.json();
                console.error('Erro ao salvar proposta:', errorData);
                alert('Erro ao salvar proposta: ' + (errorData.error || 'Erro desconhecido'));
            }
        } catch (error) {
            console.error('Erro ao salvar proposta:', error);
            alert('Erro ao salvar proposta: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
        }
    };


    const cancelAction = () => {
        clearForm();
        setCurrentView('search');
    };

    // Carregar propostas e preços do localStorage
    const fetchProposals = useCallback(async () => {
        if (!currentUser || !currentUser.role) {
            setSavedProposals([]);
            return;
        }

        try {
            const response = await fetch('/api/proposals', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`,
                },
            });

            if (response.ok) {
                const proposalsData = await response.json();
                // Filter for PABX proposals
                const pabxProposals = proposalsData.filter((p: any) => 
                    p.type === 'PABX' || p.baseId?.startsWith('Prop_PABX_') || p.baseId?.startsWith('Prop_Pabx/Sip_')
                );
                setSavedProposals(pabxProposals);
            } else {
                console.error('Erro ao buscar propostas:', response.statusText);
                setSavedProposals([]);
            }
        } catch (error) {
            console.error("Erro ao buscar propostas: ", error);
            setSavedProposals([]);
        }
    }, [currentUser]);

    useEffect(() => {
        fetchProposals();
    }, [fetchProposals]);

    // Efeito para calcular a margem líquida estimada a partir do markup
    useEffect(() => {
        if (markup >= 0) {
            const margin = (markup / (100 + markup)) * 100;
            setEstimatedNetMargin(margin);
        }
    }, [markup]);

    // Calcular automaticamente quando os valores mudarem
    useEffect(() => {
        calculatePABX();
    }, [pabxModality, pabxExtensions, pabxIncludeSetup, pabxIncludeDevices, pabxDeviceQuantity, pabxIncludeAI, pabxAIPlan, pabxPremiumPlan, pabxPremiumSubPlan, pabxPremiumEquipment, contractDuration, pabxPrices, aiAgentPrices, getPriceRange]);
    
    // Alias for backward compatibility
    const calculatePABXResult = useCallback(calculatePABX, [pabxModality, pabxExtensions, pabxIncludeSetup, pabxIncludeDevices, pabxDeviceQuantity, pabxIncludeAI, pabxAIPlan, pabxPremiumPlan, pabxPremiumSubPlan, pabxPremiumEquipment, contractDuration, pabxPrices, aiAgentPrices, getPriceRange]);

    

    const handleDeleteProposal = async (proposalId: string) => {
        if (!currentUser) {
            toast.error('Você precisa estar logado para excluir uma proposta.');
            return;
        }

        if (window.confirm('Tem certeza que deseja excluir esta proposta?')) {
            try {
                const response = await fetch(`/api/proposals?id=${proposalId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${currentUser.token}`,
                    },
                });

                if (response.ok) {
                    toast.success('Proposta excluída com sucesso!');
                    fetchProposals();
                } else {
                    const errorData = await response.json();
                    console.error('Erro ao excluir proposta:', errorData);
                    toast.error(`Falha ao excluir a proposta: ${errorData.error || 'Erro desconhecido'}`);
                }
            } catch (error) {
                console.error('Erro ao excluir proposta:', error);
                toast.error('Falha ao excluir a proposta.');
            }
        }
    };

    const filteredProposals = savedProposals.filter(p => {
        const clientName = p.client?.name || '';
        const proposalId = p.id || '';
        const searchTermLower = searchTerm.toLowerCase();
        return (
            clientName.toLowerCase().includes(searchTermLower) ||
            proposalId.toLowerCase().includes(searchTermLower)
        );
    });

    const handlePrint = () => {
        // Add print-specific styles
        const printStyles = `
            @media print {
                @page {
                    size: A4;
                    margin: 1cm;
                }
                
                body * {
                    visibility: hidden;
                }
                
                .print-area, .print-area * {
                    visibility: visible;
                }
                
                .print-area {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    background: white !important;
                }
                
                .no-print {
                    display: none !important;
                }
                
                .print\\:block {
                    display: block !important;
                }
                
                .print\\:hidden {
                    display: none !important;
                }
                
                .print\\:pt-2 {
                    padding-top: 0.5rem !important;
                }
                
                .print\\:gap-4 {
                    gap: 1rem !important;
                }
                
                .print\\:space-y-4 > * + * {
                    margin-top: 1rem !important;
                }
                
                .print\\:text-sm {
                    font-size: 0.875rem !important;
                }
                
                table {
                    page-break-inside: avoid;
                }
                
                .border, .border-t {
                    border-color: #000 !important;
                }
                
                .text-gray-900 {
                    color: #000 !important;
                }
                
                .bg-slate-50 {
                    background-color: #f8fafc !important;
                }
            }
        `;
        
        // Create style element
        const styleElement = document.createElement('style');
        styleElement.textContent = printStyles;
        document.head.appendChild(styleElement);
        
        // Add print-area class to the proposal view
        const proposalElement = document.querySelector('.proposal-view');
        if (proposalElement) {
            proposalElement.classList.add('print-area');
        }
        
        // Trigger print
        window.print();
        
        // Clean up
        setTimeout(() => {
            document.head.removeChild(styleElement);
            if (proposalElement) {
                proposalElement.classList.remove('print-area');
            }
        }, 1000);
    };

    // Se estiver na tela de formulário do cliente, mostrar o formulário
    if (currentView === 'client-form') {
        return (
            <ClientManagerForm
                clientData={clientData}
                accountManagerData={accountManagerData}
                onClientDataChange={setClientData}
                onAccountManagerDataChange={setAccountManagerData}
                onBack={cancelAction}
                onContinue={() => setCurrentView('calculator')}
                title="Nova Proposta - PABX/SIP"
                subtitle="Preencha os dados do cliente e gerente de contas para continuar."
            />
        );
    }

    // Se estiver na tela de busca, mostrar a tela de buscar propostas
    if (currentView === 'search') {
        return (
            <div className="container mx-auto p-6 bg-slate-950 text-white min-h-screen">
                <div className="mb-8">
                    <Button 
                        variant="outline" 
                        onClick={() => setCurrentView('calculator')}
                        className="flex items-center mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Voltar
                    </Button>
                    <h1 className="text-3xl font-bold text-white mb-2">Buscar Propostas</h1>
                    <p className="text-slate-400">Encontre propostas existentes ou crie uma nova.</p>
                </div>

                <Card className="bg-slate-900/80 border-slate-800 text-white mb-6">
                    <CardContent className="p-6">
                        <div className="flex gap-4 items-center">
                            <div className="flex-1">
                                <Input
                                    type="text"
                                    placeholder="Buscar por cliente ou ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-slate-800 border-slate-700 text-white placeholder-slate-400"
                                />
                            </div>
                            <Button
                                onClick={createNewProposal}
                                className="bg-blue-600 hover:bg-blue-700 px-6"
                            >
                                <Plus className="mr-2 h-4 w-4"/> Nova Proposta
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabela de propostas */}
                <Card className="bg-slate-900/80 border-slate-800 text-white">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-slate-700">
                                    <TableHead className="text-slate-300 font-semibold">ID</TableHead>
                                    <TableHead className="text-slate-300 font-semibold">Cliente</TableHead>
                                    <TableHead className="text-slate-300 font-semibold">Data</TableHead>
                                    <TableHead className="text-slate-300 font-semibold">Total Mensal</TableHead>
                                    <TableHead className="text-slate-300 font-semibold">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredProposals.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-slate-400">
                                            Nenhuma proposta encontrada. Clique em "Nova Proposta" para começar.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredProposals.map((proposal) => (
                                        <TableRow key={proposal.id} className="border-slate-800 hover:bg-slate-800/50">
                                            <TableCell className="text-slate-300">{proposal.baseId || proposal.id}</TableCell>
                                            <TableCell className="text-slate-300">{typeof proposal.client === 'string' ? proposal.client : proposal.client?.name || 'Sem nome'} (v{proposal.version})</TableCell>
                                            <TableCell className="text-slate-300">{proposal.createdAt ? (isNaN(new Date(proposal.createdAt).getTime()) ? 'N/A' : new Date(proposal.createdAt).toLocaleDateString('pt-BR')) : 'N/A'}</TableCell>
                                            <TableCell className="text-slate-300">{formatCurrency(Number(proposal.totalMonthly || proposal.value || 0))}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                                        onClick={() => viewProposal(proposal)}
                                                    >
                                                        <Edit className="h-4 w-4 mr-2" /> Visualizar
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="border-blue-600 text-blue-300 hover:bg-blue-700"
                                                        onClick={() => editProposal(proposal)}
                                                    >
                                                        <Edit className="h-4 w-4 mr-2" /> Editar
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleDeleteProposal(proposal.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" /> Excluir
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Se estiver na tela de visualização da proposta, mostrar o resumo
    if (currentView === 'proposal-summary' && currentProposal) {
        return (
            <Card className="bg-white border-gray-300 text-black print:shadow-none proposal-view">
                <CardHeader className="print:pb-2">
                    <div className="flex justify-between items-start mb-4 print:mb-2">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Proposta Comercial</h1>
                            <p className="text-gray-600">PABX/SIP</p>
                        </div>
                        <div className="flex gap-2 no-print">
                            <Button variant="outline" onClick={() => setCurrentView('search')}>
                                <ArrowLeft className="h-4 w-4 mr-2" />Voltar
                            </Button>
                            <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
                                <Download className="h-4 w-4 mr-2" />Imprimir PDF
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6 print:space-y-4">
                    {/* Dados do Cliente */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Dados do Cliente</h3>
                            <div className="space-y-2 text-sm">
                                <p><strong>Nome:</strong> {typeof currentProposal.client === 'string' ? currentProposal.client : currentProposal.client?.name || 'N/A'}</p>
                                <p><strong>Projeto:</strong> {typeof currentProposal.client === 'object' ? currentProposal.client?.projectName || 'N/A' : 'N/A'}</p>
                                <p><strong>Email:</strong> {typeof currentProposal.client === 'object' ? currentProposal.client?.email || 'N/A' : 'N/A'}</p>
                                <p><strong>Telefone:</strong> {typeof currentProposal.client === 'object' ? currentProposal.client?.phone || 'N/A' : 'N/A'}</p>
                                <p><strong>Contato:</strong> {typeof currentProposal.client === 'object' ? currentProposal.client?.contact || 'N/A' : 'N/A'}</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Gerente de Contas</h3>
                            <div className="space-y-2 text-sm">
                                <p><strong>Nome:</strong> {typeof currentProposal.accountManager === 'string' ? currentProposal.accountManager : currentProposal.accountManager?.name || 'N/A'}</p>
                                <p><strong>Email:</strong> {typeof currentProposal.accountManager === 'object' ? currentProposal.accountManager?.email || 'N/A' : 'N/A'}</p>
                                <p><strong>Telefone:</strong> {typeof currentProposal.accountManager === 'object' ? currentProposal.accountManager?.phone || 'N/A' : 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Produtos */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Produtos e Serviços</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-gray-900">Descrição</TableHead>
                                    <TableHead className="text-gray-900">Setup</TableHead>
                                    <TableHead className="text-gray-900">Mensal</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentProposal.items?.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{item.description}</TableCell>
                                        <TableCell>{formatCurrency(item.setup)}</TableCell>
                                        <TableCell>{formatCurrency(item.monthly)}</TableCell>
                                    </TableRow>
                                )) || (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center text-gray-500">
                                            Nenhum item encontrado
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Resumo Financeiro */}
                    <div className="border-t pt-4 print:pt-2">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Resumo Financeiro</h3>
                        
                        {/* Show discount breakdown if discounts were applied */}
                        {currentProposal.discountInfo?.hasDiscounts && (
                            <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded">
                                <h4 className="font-semibold text-orange-800 mb-2">Descontos Aplicados</h4>
                                <div className="text-sm space-y-1">
                                    <p><strong>Valores Originais:</strong></p>
                                    <p className="ml-4">Setup: {formatCurrency(currentProposal.rawTotalSetup || 0)}</p>
                                    <p className="ml-4">Mensal: {formatCurrency(currentProposal.rawTotalMonthly || 0)}</p>
                                    
                                    {currentProposal.discountInfo.applySalespersonDiscount && (
                                        <p className="text-orange-600"><strong>Desconto Vendedor (5%):</strong> -R$ {((currentProposal.rawTotalSetup || 0) * 0.05).toFixed(2).replace('.', ',')} / -R$ {((currentProposal.rawTotalMonthly || 0) * 0.05).toFixed(2).replace('.', ',')}</p>
                                    )}
                                    
                                    {currentProposal.discountInfo.appliedDirectorDiscountPercentage > 0 && (
                                        <p className="text-orange-600"><strong>Desconto Diretor ({currentProposal.discountInfo.appliedDirectorDiscountPercentage}%):</strong> -R$ {(((currentProposal.rawTotalSetup || 0) * (currentProposal.discountInfo.applySalespersonDiscount ? 0.95 : 1)) * (currentProposal.discountInfo.appliedDirectorDiscountPercentage / 100)).toFixed(2).replace('.', ',')} / -R$ {(((currentProposal.rawTotalMonthly || 0) * (currentProposal.discountInfo.applySalespersonDiscount ? 0.95 : 1)) * (currentProposal.discountInfo.appliedDirectorDiscountPercentage / 100)).toFixed(2).replace('.', ',')}</p>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <p><strong>Total Setup {currentProposal.discountInfo?.hasDiscounts ? '(com desconto)' : ''}:</strong> {formatCurrency(currentProposal.totalSetup || 0)}</p>
                                <p><strong>Total Mensal {currentProposal.discountInfo?.hasDiscounts ? '(com desconto)' : ''}:</strong> {formatCurrency(currentProposal.totalMonthly || 0)}</p>
                            </div>
                            <div>
                                <p><strong>Data da Proposta:</strong> {currentProposal.createdAt ? (
                                    (typeof currentProposal.createdAt === 'object' && 'toDate' in currentProposal.createdAt)
                                        ? new Date(currentProposal.createdAt.toDate()).toLocaleDateString('pt-BR')
                                        : (isNaN(new Date(currentProposal.createdAt).getTime()) ? 'N/A' : new Date(currentProposal.createdAt).toLocaleDateString('pt-BR'))
                                ) : 'N/A'}</p>
                                <p><strong>ID da Proposta:</strong> {currentProposal.baseId || currentProposal.id}</p>
                                <p><strong>Versão:</strong> {currentProposal.version || 1}</p>
                                <p><strong>Período do Contrato:</strong> {currentProposal.contractPeriod ? `${currentProposal.contractPeriod} meses` : 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Payback Info se disponível */}
                    {currentProposal.totalSetup > 0 && (
                        <div className="border-t pt-4 print:pt-2">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Análise de Payback</h3>
                            {(() => {
                                const totalSetup = currentProposal.totalSetup;
                                const totalMonthly = currentProposal.totalMonthly;
                                const paybackMonths = totalSetup > 0 ? Math.ceil(totalSetup / totalMonthly) : 0;
                                const maxPayback = 24; // Default max payback
                                const isValid = paybackMonths <= maxPayback;
                                
                                return (
                                    <div className="text-sm">
                                        <p><strong>Payback:</strong> {paybackMonths} meses</p>
                                        <p><strong>Payback Máximo:</strong> {maxPayback} meses</p>
                                        <p className={isValid ? 'text-green-600' : 'text-red-600'}>
                                            <strong>Status:</strong> {isValid ? '✓ Aprovado' : '⚠ Atenção - Payback excedido'}
                                        </p>
                                    </div>
                                );
                            })()}
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    }

    // Tela da calculadora
    return (
        <div className="container mx-auto p-4 bg-slate-950 text-white">
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Calculadora PABX/SIP</h1>
                        <p className="text-slate-400 mt-2">Configure e calcule os custos para PABX em Nuvem e SIP Trunk</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setCurrentView('search')}
                            className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                            ← Voltar para Busca
                        </Button>
                        {onBackToDashboard && (
                            <Button
                                variant="outline"
                                onClick={onBackToDashboard}
                                className="border-slate-600 text-slate-300 hover:bg-slate-700"
                            >
                                ← Dashboard
                            </Button>
                        )}
                    </div>
                </div>

                {/* Informações do Cliente e Gerente */}
                <ClientManagerInfo clientData={clientData} accountManagerData={accountManagerData} />
            </div>

            <Tabs defaultValue="calculator" className="w-full">
                <TabsList className={`grid w-full ${currentUser?.role === 'admin' ? 'grid-cols-4' : 'grid-cols-1'} bg-slate-800 text-slate-400`}>
                    <TabsTrigger value="calculator">Calculadora</TabsTrigger>
                    {currentUser?.role === 'admin' && (
                        <TabsTrigger value="list-price">Tabela de Preços</TabsTrigger>
                    )}
                    {currentUser?.role === 'admin' && (
                        <TabsTrigger value="commissions-table">Tabela Comissões</TabsTrigger>
                    )}
                    {currentUser?.role === 'admin' && (
                        <TabsTrigger value="dre">DRE</TabsTrigger>
                    )}
                </TabsList>

                <TabsContent value="calculator">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                        {/* PABX em Nuvem */}
                        <Card className="bg-slate-900/80 border-slate-800 text-white">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Phone className="h-5 w-5" />
                                    PABX em Nuvem
                                </CardTitle>
                                <Button 
                                    onClick={saveSettings}
                                    disabled={isSaving}
                                    className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                                >
                                    <Save className="h-4 w-4" />
                                    {isSaving ? 'Salvando...' : 'Salvar Configurações'}
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Modalidade</Label>
                                    <RadioGroup value={pabxModality} onValueChange={(value) => setPabxModality(value as 'Standard' | 'Premium')}>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Standard" id="pabx-standard" />
                                            <Label htmlFor="pabx-standard">PABX - Standard</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Premium" id="pabx-premium" />
                                            <Label htmlFor="pabx-premium">PABX - Premium</Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                {/* Contract Duration - Standard */}
                                {pabxModality === 'Standard' && (
                                    <div className="space-y-2">
                                        <Label>Duração do Contrato</Label>
                                        <RadioGroup 
                                            value={contractDuration} 
                                            onValueChange={setContractDuration}
                                            className="grid grid-cols-2 md:grid-cols-5 gap-2"
                                        >
                                            {[12, 24, 36, 48, 60].map((months) => (
                                                <div key={months} className="flex items-center space-x-2">
                                                    <RadioGroupItem 
                                                        value={months.toString()}
                                                        id={`${months}-meses-standard`}
                                                    />
                                                    <Label htmlFor={`${months}-meses-standard`}>{months} Meses</Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </div>
                                )}

                                {/* Contract Duration - Premium */}
                                {pabxModality === 'Premium' && (
                                    <div className="space-y-2">
                                        <Label>Duração do Contrato</Label>
                                        <RadioGroup 
                                            value={contractDuration} 
                                            onValueChange={setContractDuration}
                                            className="grid grid-cols-2 gap-2"
                                        >
                                            {[24, 36].map((months) => (
                                                <div key={months} className="flex items-center space-x-2">
                                                    <RadioGroupItem 
                                                        value={months.toString()}
                                                        id={`${months}-meses-premium`}
                                                    />
                                                    <Label htmlFor={`${months}-meses-premium`}>{months} Meses</Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </div>
                                )}
                                {pabxModality === 'Premium' && (
                                    <div className="space-y-4">
                                        <div>
                                            <Label>Plano</Label>
                                            <Select value={pabxPremiumPlan} onValueChange={(value) => setPabxPremiumPlan(value as 'Essencial' | 'Profissional')}>
                                                <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-white">
                                                    <SelectValue placeholder="Selecione o plano" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-slate-800 border-slate-700">
                                                    <SelectItem value="Essencial">Plano Essencial</SelectItem>
                                                    <SelectItem value="Profissional">Plano Profissional</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {pabxPremiumPlan === 'Essencial' && (
                                            <div className="space-y-4">
                                                <div>
                                                    <Label>Tipo de Plano Essencial</Label>
                                                    <Select value={pabxPremiumSubPlan} onValueChange={(value) => setPabxPremiumSubPlan(value as 'Ilimitado' | 'Tarifado')}>
                                                        <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-slate-800 border-slate-700">
                                                            <SelectItem value="Ilimitado">Essencial Ilimitado</SelectItem>
                                                            <SelectItem value="Tarifado">Essencial Tarifado</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <Label>Valores</Label>
                                                    <RadioGroup value={pabxPremiumEquipment} onValueChange={(value) => setPabxPremiumEquipment(value as 'Com' | 'Sem')}>
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="Com" id="essencial-com-equipamento" />
                                                            <Label htmlFor="essencial-com-equipamento">Valores com Equipamento</Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="Sem" id="essencial-sem-equipamento" />
                                                            <Label htmlFor="essencial-sem-equipamento">Valores sem Equipamento</Label>
                                                        </div>
                                                    </RadioGroup>
                                                </div>
                                            </div>
                                        )}
                                        {pabxPremiumPlan === 'Profissional' && (
                                            <div className="space-y-4">
                                                <div>
                                                    <Label>Tipo de Plano Profissional</Label>
                                                    <Select value={pabxPremiumSubPlan} onValueChange={(value) => setPabxPremiumSubPlan(value as 'Ilimitado' | 'Tarifado')}>
                                                        <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-slate-800 border-slate-700">
                                                            <SelectItem value="Ilimitado">Profissional Ilimitado</SelectItem>
                                                            <SelectItem value="Tarifado">Profissional Tarifado</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <Label>Valores</Label>
                                                    <RadioGroup value={pabxPremiumEquipment} onValueChange={(value) => setPabxPremiumEquipment(value as 'Com' | 'Sem')}>
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="Com" id="profissional-com-equipamento" />
                                                            <Label htmlFor="profissional-com-equipamento">Valores com Equipamento</Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="Sem" id="profissional-sem-equipamento" />
                                                            <Label htmlFor="profissional-sem-equipamento">Valores sem Equipamento</Label>
                                                        </div>
                                                    </RadioGroup>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="pabx-include-setup"
                                        checked={pabxIncludeSetup}
                                        onCheckedChange={(checked) => setPabxIncludeSetup(checked as boolean)}
                                    />
                                    <Label htmlFor="pabx-include-setup">Incluir Taxa de Setup</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="pabx-include-devices"
                                        checked={pabxIncludeDevices}
                                        onCheckedChange={(checked) => setPabxIncludeDevices(checked as boolean)}
                                    />
                                    <Label htmlFor="pabx-include-devices">Incluir Aparelhos (Ramais Físicos)</Label>
                                </div>

                                {pabxIncludeDevices && (
                                    <div>
                                        <Label>Quantidade de Aparelhos</Label>
                                        <Input
                                            id="pabx-device-quantity"
                                            type="number"
                                            value={pabxDeviceQuantity}
                                            onChange={(e) => setPabxDeviceQuantity(parseInt(e.target.value) || 0)}
                                            className="bg-slate-800 border-slate-700 text-white"
                                        />
                                    </div>
                                )}

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="pabx-include-ai"
                                        checked={pabxIncludeAI}
                                        onCheckedChange={(checked) => setPabxIncludeAI(checked as boolean)}
                                    />
                                    <Label htmlFor="pabx-include-ai">Incluir Agente IA</Label>
                                </div>

                                <div className="flex items-center space-x-2 mt-4">
                                    <Checkbox
                                        id="include-parceiro-indicador"
                                        checked={includeParceiroIndicador}
                                        onCheckedChange={(checked) => setIncludeParceiroIndicador(checked as boolean)}
                                    />
                                    <Label htmlFor="include-parceiro-indicador">Incluir Parceiro Indicador</Label>
                                </div>

                                {pabxIncludeAI && (
                                    <div>
                                        <Label>Plano de Agente IA</Label>
                                        <Select value={pabxAIPlan} onValueChange={setPabxAIPlan}>
                                            <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-800 border-slate-700">
                                                <SelectItem value="none">Sem Agente IA</SelectItem>
                                                <SelectItem value="20K">20K</SelectItem>
                                                <SelectItem value="40K">40K</SelectItem>
                                                <SelectItem value="60K">60K</SelectItem>
                                                <SelectItem value="100K">100K</SelectItem>
                                                <SelectItem value="150K">150K</SelectItem>
                                                <SelectItem value="200K">200K</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {pabxIncludeAI && (
                                    <div className="text-sm text-slate-400">
                                        <p>Tenha até:</p>
                                        <p>50.000 mensagens* ou</p>
                                        <p>10.000 minutos** ou</p>
                                        <p>5.000 voz premium*** ou</p>
                                        <p className="text-xs mt-1">*Opções acima combinadas</p>
                                    </div>
                                )}

                                {/* Resultado PABX */}
                                {pabxResult && (
                                    <div className="bg-slate-800 p-4 rounded-lg">
                                        <h3 className="font-semibold mb-2">Resultado PABX:</h3>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span>Taxa de Setup:</span>
                                                <span>{formatCurrency(pabxResult.setup)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Mensalidade Base:</span>
                                                <span>{formatCurrency(pabxResult.baseMonthly)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Aluguel de Aparelhos:</span>
                                                <span>{formatCurrency(pabxResult.deviceRentalCost)}</span>
                                            </div>
                                            {pabxResult.aiAgentCost > 0 && (
                                                <div className="flex justify-between">
                                                    <span>Agente IA:</span>
                                                    <span>{formatCurrency(pabxResult.aiAgentCost)}</span>
                                                </div>
                                            )}
                                            <Separator className="my-2 bg-slate-600" />
                                            <div className="flex justify-between font-semibold text-green-400">
                                                <span>Total Mensal:</span>
                                                <span>{formatCurrency(pabxResult.totalMonthly)}</span>
                                            </div>
                                        </div>
                                        <Button
                                            className="w-full mt-3 bg-green-600 hover:bg-green-700"
                                            onClick={addPABXToProposal}
                                        >
                                            Adicionar à Proposta
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* SIP Trunk */}
                        <Card className="bg-slate-900/80 border-slate-800 text-white">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <PhoneForwarded className="h-5 w-5" />
                                    SIP Trunk
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Plano SIP</Label>
                                    <Select value={sipPlan} onValueChange={setSipPlan}>
                                        <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-slate-700">
                                            <SelectItem value="SIP TARIFADO Call Center 2 Canais">SIP TARIFADO Call Center 2 Canais</SelectItem>
                                            <SelectItem value="SIP TARIFADO 2 Canais">SIP TARIFADO 2 Canais</SelectItem>
                                            <SelectItem value="SIP TARIFADO 4 Canais">SIP TARIFADO 4 Canais</SelectItem>
                                            <SelectItem value="SIP TARIFADO 10 Canais">SIP TARIFADO 10 Canais</SelectItem>
                                            <SelectItem value="SIP TARIFADO 30 Canais">SIP TARIFADO 30 Canais</SelectItem>
                                            <SelectItem value="SIP TARIFADO 60 Canais">SIP TARIFADO 60 Canais</SelectItem>
                                            <SelectItem value="SIP ILIMITADO 5 Canais">SIP ILIMITADO 5 Canais</SelectItem>
                                            <SelectItem value="SIP ILIMITADO 10 Canais">SIP ILIMITADO 10 Canais</SelectItem>
                                            <SelectItem value="SIP ILIMITADO 20 Canais">SIP ILIMITADO 20 Canais</SelectItem>
                                            <SelectItem value="SIP ILIMITADO 30 Canais">SIP ILIMITADO 30 Canais</SelectItem>
                                            <SelectItem value="SIP ILIMITADO 60 Canais">SIP ILIMITADO 60 Canais</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="sip-include-setup"
                                        checked={sipIncludeSetup}
                                        onCheckedChange={(checked) => setSipIncludeSetup(checked as boolean)}
                                    />
                                    <Label htmlFor="sip-include-setup">Incluir Taxa de Setup</Label>
                                </div>

                                <div>
                                    <Label htmlFor="sip-additional-channels">Canais Adicionais</Label>
                                    <Input
                                        id="sip-additional-channels"
                                        type="number"
                                        value={sipAdditionalChannels}
                                        onChange={(e) => setSipAdditionalChannels(parseInt(e.target.value) || 0)}
                                        className="bg-slate-800 border-slate-700 text-white"
                                    />
                                </div>

                                <div>
                                    <Label>Franquia/Assinatura Mensal</Label>
                                    <RadioGroup value={sipWithEquipment ? "com" : "sem"} onValueChange={(value) => setSipWithEquipment(value === "com")}>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="sem" id="sem-equipamentos" />
                                            <Label htmlFor="sem-equipamentos">Sem Equipamentos</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="com" id="com-equipamentos" />
                                            <Label htmlFor="com-equipamentos">Com Equipamentos</Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                {/* Resultado SIP */}
                                {sipResult && (
                                    <div className="bg-slate-800 p-4 rounded-lg">
                                        <h3 className="font-semibold mb-2">Resultado SIP:</h3>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span>Taxa de Setup:</span>
                                                <span>{formatCurrency(sipResult.setup)}</span>
                                            </div>
                                            <Separator className="my-2 bg-slate-600" />
                                            <div className="flex justify-between font-bold text-lg text-green-400">
                                                <span>Total Mensal:</span>
                                                <span>{formatCurrency(sipResult.monthly)}</span>
                                            </div>
                                        </div>
                                        <Button
                                            className="w-full mt-3 bg-green-600 hover:bg-green-700"
                                            onClick={addSIPToProposal}
                                        >
                                            Adicionar à Proposta
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full mt-2 border-slate-600 text-slate-300 hover:bg-slate-700"
                                        >
                                            Ajustes do Sistema
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Resumo da Proposta */}
                    {proposalItems.length > 0 && (
                        <Card className="bg-slate-900/80 border-slate-800 text-white mt-6">
                            <CardHeader>
                                <CardTitle>Resumo da Proposta</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-slate-700">
                                            <TableHead className="text-white">Descrição</TableHead>
                                            <TableHead className="text-white text-right">Setup</TableHead>
                                            <TableHead className="text-white text-right">Mensal</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {proposalItems.map((item, index) => (
                                            <TableRow key={item.id} className="border-slate-800">
                                                <TableCell>{item.description}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(item.setup)}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(item.monthly)}</TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                                        onClick={() => handleRemoveItem(item.id)}
                                                    >
                                                        Excluir
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {applySalespersonDiscount && (
                                            <TableRow key="salesperson-discount-row" className="border-slate-700 font-semibold text-orange-400">
                                                <TableCell>Desconto Vendedor (5%):</TableCell>
                                                <TableCell className="text-right">-{formatCurrency(rawTotalSetup * 0.05)}</TableCell>
                                                <TableCell className="text-right">-{formatCurrency(rawTotalMonthly * 0.05)}</TableCell>
                                            </TableRow>
                                        )}
                                        {appliedDirectorDiscountPercentage > 0 && (
                                            <TableRow key="director-discount-row" className="border-slate-700 font-semibold text-orange-400">
                                                <TableCell>Desconto Diretor ({appliedDirectorDiscountPercentage}%):</TableCell>
                                                <TableCell className="text-right">-{formatCurrency(rawTotalSetup * (applySalespersonDiscount ? 0.95 : 1) * (appliedDirectorDiscountPercentage / 100))}</TableCell>
                                                <TableCell className="text-right">-{formatCurrency(rawTotalMonthly * (applySalespersonDiscount ? 0.95 : 1) * (appliedDirectorDiscountPercentage / 100))}</TableCell>
                                            </TableRow>
                                        )}
                                        <TableRow key="total-setup-row" className="border-slate-700 font-semibold">
                                            <TableCell>Total Setup:</TableCell>
                                            <TableCell className="text-right">{formatCurrency(finalTotalSetup)}</TableCell>
                                            <TableCell></TableCell>
                                        </TableRow>
                                        <TableRow key="total-monthly-row" className="border-slate-700 font-semibold">
                                            <TableCell>Total Mensal:</TableCell>
                                            <TableCell></TableCell>
                                            <TableCell className="text-right">{formatCurrency(finalTotalMonthly)}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>

                                {/* Controles de Desconto */}
                                <div className="space-y-4 p-4 bg-slate-800 rounded-lg mt-4">
                                    {(currentUser?.role !== 'diretor' && currentUser?.role !== 'admin') && (
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="salesperson-discount-toggle"
                                                checked={applySalespersonDiscount}
                                                onCheckedChange={(checked) => setApplySalespersonDiscount(!!checked)}
                                            />
                                            <Label htmlFor="salesperson-discount-toggle">Aplicar Desconto Vendedor (5%)</Label>
                                        </div>
                                    )}
                                    {(currentUser?.role === 'diretor' || currentUser?.role === 'admin') && (
                                        <div className="space-y-2">
                                            <Label htmlFor="director-discount">Desconto Diretor (%)</Label>
                                            <div className="flex items-center space-x-2">
                                                <Input
                                                    id="director-discount"
                                                    type="number"
                                                    value={directorDiscountPercentage}
                                                    onChange={(e) => {
                                                        const value = Number(e.target.value);
                                                        setDirectorDiscountPercentage(value);
                                                        setAppliedDirectorDiscountPercentage(value);
                                                    }}
                                                    placeholder="0-100"
                                                    min="0"
                                                    max="100"
                                                    className="bg-slate-700 border-slate-600 text-white"
                                                />
                                            </div>
                                        </div>
                                    )}
                                    {currentUser?.role === 'admin' && (
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="admin-salesperson-discount-toggle"
                                                checked={applySalespersonDiscount}
                                                onCheckedChange={(checked) => setApplySalespersonDiscount(!!checked)}
                                            />
                                            <Label htmlFor="admin-salesperson-discount-toggle">Aplicar Desconto Vendedor (5%)</Label>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end gap-4 mt-6">
                                    <Button onClick={saveProposal} className="bg-green-600 hover:bg-green-700">
                                        Salvar Proposta
                                    </Button>
                                    <Button className="bg-blue-600 hover:bg-blue-700">
                                        Gerar PDF
                                    </Button>
                                    <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700" onClick={cancelAction}>
                                        Cancelar
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="commissions-table">
                    <CommissionTables
                        commissionData={commissionData}
                        onCommissionDataChange={setCommissionData}
                    />
                </TabsContent>

                <TabsContent value="dre">
                    {(() => {
                        const dreMonthlyRevenue = (pabxResult?.totalMonthly || 0) + (sipResult?.monthly || 0);
                        const months = parseInt(contractDuration);
                        const vendedorRate = getCommissionRate('vendedor');
                        const diretorRate = getCommissionRate('diretor');
                        const parceiroRate = includeParceiroIndicador ? getPartnerIndicatorRate(dreMonthlyRevenue, months) : 0;
                        
                        // Calculate operational costs (estimated at 60% of revenue for PABX/SIP services)
                        const estimatedOperationalCosts = dreMonthlyRevenue * 0.60;
                        
                        const dreCalculations = {
                            receitaBruta: dreMonthlyRevenue,
                            receitaLiquida: dreMonthlyRevenue * 0.9075, // Assuming 9.25% taxes
                            custoServico: estimatedOperationalCosts,
                            comissaoVendedor: dreMonthlyRevenue * (vendedorRate / 100),
                            comissaoDiretor: dreMonthlyRevenue * (diretorRate / 100),
                            comissaoParceiro: dreMonthlyRevenue * (parceiroRate / 100),
                            totalImpostos: dreMonthlyRevenue * 0.0925,
                            lucroOperacional: dreMonthlyRevenue - estimatedOperationalCosts - (dreMonthlyRevenue * ((vendedorRate + diretorRate + parceiroRate) / 100)),
                            lucroLiquido: (dreMonthlyRevenue - estimatedOperationalCosts - (dreMonthlyRevenue * ((vendedorRate + diretorRate + parceiroRate) / 100))) * 0.66, // After profit taxes
                            rentabilidade: ((dreMonthlyRevenue - estimatedOperationalCosts - (dreMonthlyRevenue * ((vendedorRate + diretorRate + parceiroRate) / 100))) * 0.66 / dreMonthlyRevenue) * 100,
                            paybackMeses: 0, // PABX/SIP typically has no setup fee
                            taxaInstalacao: pabxResult?.setupFee || 0
                        };

                        return (
                            <div className="space-y-6">
                                <DRETable
                                    monthlyRevenue={dreMonthlyRevenue}
                                    totalCosts={estimatedOperationalCosts}
                                    commissionVendedor={vendedorRate}
                                    commissionDiretor={diretorRate}
                                    commissionParceiro={parceiroRate}
                                    pabxResult={pabxResult}
                                    sipResult={sipResult}
                                    contractDuration={months}
                                />

                                {/* Resultado Final */}
                                <Card className="border-green-500 bg-gradient-to-r from-slate-900 to-green-900/20">
                                <CardHeader className="bg-gradient-to-r from-green-800 to-green-700 py-4">
                                    <CardTitle className="text-xl font-bold text-white flex items-center">
                                        <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                                        Resultado Final
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                        {/* RECEITA */}
                                        <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 p-4 rounded-lg border border-blue-500/30">
                                            <h3 className="text-sm font-semibold text-blue-300 mb-3 uppercase tracking-wide">RECEITA</h3>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-300">Mensal:</span>
                                                    <span className="text-blue-300 font-semibold">{formatCurrency(dreCalculations.receitaBruta)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-300">Anual:</span>
                                                    <span className="text-blue-300 font-semibold">{formatCurrency(dreCalculations.receitaBruta * 12)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-300">Setup:</span>
                                                    <span className="text-blue-300 font-semibold">{formatCurrency(dreCalculations.taxaInstalacao)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* CUSTOS */}
                                        <div className="bg-gradient-to-br from-red-900/50 to-red-800/30 p-4 rounded-lg border border-red-500/30">
                                            <h3 className="text-sm font-semibold text-red-300 mb-3 uppercase tracking-wide">CUSTOS</h3>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-300">Operacional:</span>
                                                    <span className="text-red-300 font-semibold">{formatCurrency(dreCalculations.custoServico)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-300">Comissões:</span>
                                                    <span className="text-red-300 font-semibold">{formatCurrency(dreCalculations.comissaoVendedor + dreCalculations.comissaoDiretor + dreCalculations.comissaoParceiro)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-300">Impostos:</span>
                                                    <span className="text-red-300 font-semibold">{formatCurrency(dreCalculations.totalImpostos)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* LUCRO */}
                                        <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 p-4 rounded-lg border border-green-500/30">
                                            <h3 className="text-sm font-semibold text-green-300 mb-3 uppercase tracking-wide">LUCRO</h3>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-300">Operacional:</span>
                                                    <span className={`font-semibold ${dreCalculations.lucroOperacional >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                                                        {formatCurrency(dreCalculations.lucroOperacional)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-300">Líquido:</span>
                                                    <span className={`font-semibold ${dreCalculations.lucroLiquido >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                                                        {formatCurrency(dreCalculations.lucroLiquido)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-300">Anual:</span>
                                                    <span className={`font-semibold ${dreCalculations.lucroLiquido >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                                                        {formatCurrency(dreCalculations.lucroLiquido * 12)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* INDICADORES */}
                                        <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 p-4 rounded-lg border border-purple-500/30">
                                            <h3 className="text-sm font-semibold text-purple-300 mb-3 uppercase tracking-wide">INDICADORES</h3>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-300">Margem:</span>
                                                    <span className={`font-semibold ${dreCalculations.rentabilidade >= 0 ? 'text-purple-300' : 'text-red-300'}`}>
                                                        {dreCalculations.rentabilidade.toFixed(1)}%
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-300">Payback:</span>
                                                    <span className="text-purple-300 font-semibold">
                                                        {dreCalculations.paybackMeses > 0 ? `${dreCalculations.paybackMeses}m` : 'N/A'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-300">ROI Anual:</span>
                                                    <span className={`font-semibold ${dreCalculations.rentabilidade >= 0 ? 'text-purple-300' : 'text-red-300'}`}>
                                                        {(dreCalculations.rentabilidade * 12).toFixed(1)}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Resumo Executivo */}
                                    <div className="mt-6 pt-6 border-t border-slate-700">
                                        <div className="flex items-center mb-4">
                                            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                            <h3 className="text-lg font-semibold text-white">Resumo Executivo</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-green-400">
                                                    {formatCurrency(dreCalculations.receitaBruta * 12)}
                                                </div>
                                                <div className="text-sm text-slate-400">Receita Total (12m)</div>
                                            </div>
                                            <div className="text-center">
                                                <div className={`text-2xl font-bold ${dreCalculations.lucroLiquido >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {formatCurrency(dreCalculations.lucroLiquido * 12)}
                                                </div>
                                                <div className="text-sm text-slate-400">Lucro Total (12m)</div>
                                            </div>
                                            <div className="text-center">
                                                <div className={`text-2xl font-bold ${dreCalculations.rentabilidade >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {dreCalculations.rentabilidade.toFixed(1)}%
                                                </div>
                                                <div className="text-sm text-slate-400">Margem Líquida</div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            </div>
                        );
                    })()}
                </TabsContent>

                <TabsContent value="list-price">
                    <div className="mt-6 space-y-6">
                        {/* Tabela de Preços Agente IA */}
                        <Card className="bg-slate-900/80 border-slate-800 text-white">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-blue-400">Agente de IA</CardTitle>
                                </div>
                                <Button
                                    variant={isEditingAI ? "secondary" : "outline"}
                                    size="sm"
                                    onClick={() => setIsEditingAI(!isEditingAI)}
                                    className="border-slate-600"
                                >
                                    {isEditingAI ? "Salvar" : "Editar"}
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                                    {Object.entries(aiAgentPrices).map(([plan, data]) => (
                                        <div key={plan} className="bg-gradient-to-b from-blue-900/30 to-cyan-900/30 rounded-lg p-4 border border-slate-700">
                                            <div className="text-center mb-4">
                                                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg mb-2">
                                                    {plan}
                                                </div>
                                                <p className="text-xs text-slate-400">{data.credits.toLocaleString()} Créditos de Interação</p>
                                            </div>

                                            <div className="space-y-2 text-xs text-slate-300 mb-4">
                                                <p><strong>Tenha até:</strong></p>
                                                <p>{(data.messages / 1000).toFixed(0)}.000 mensagens* ou</p>
                                                <p>{(data.minutes / 1000).toFixed(0)}.000 minutos** ou</p>
                                                <p>{(data.premium / 1000).toFixed(0)}.000 voz premium*** ou</p>
                                                <p className="text-slate-500">Opções acima combinadas</p>
                                            </div>

                                            <div className="text-center">
                                                {isEditingAI ? (
                                                    <Input
                                                        type="number"
                                                        value={data.price}
                                                        onChange={(e) => {
                                                            const newPrice = parseFloat(e.target.value) || 0;
                                                            setAiAgentPrices(prev => ({
                                                                ...prev,
                                                                [plan]: { ...prev[plan], price: newPrice }
                                                            }));
                                                        }}
                                                    />
                                                ) : (
                                                    <p className="text-2xl font-bold">{formatCurrency(data.price)}</p>
                                                )}
                                                <p className="text-xs text-slate-500">por mês</p>
                                            </div>

                                            <div className="text-xs text-slate-400 mt-4 space-y-1">
                                                <p>* 1 crédito por mensagem</p>
                                                <p>** 10 créditos por minuto</p>
                                                <p>*** 20 créditos por minuto (voz premium)</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tabela de Preços SIP TRUNK */}
                        <Card className="bg-slate-900/80 border-slate-800 text-white">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-blue-400">SIP TRUNK | Planos e preços</CardTitle>
                                <Button
                                    variant={isEditingSIP ? "secondary" : "outline"}
                                    size="sm"
                                    onClick={isEditingSIP ? handleSaveSIP : () => setIsEditingSIP(true)}
                                    className="border-slate-600"
                                >
                                    {isEditingSIP ? "Salvar" : "Editar"}
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-slate-700">
                                                <TableHead rowSpan={3} className="text-white bg-blue-900 text-center align-middle">SIP TRUNK</TableHead>
                                                <TableHead colSpan={6} className="text-white bg-blue-800 text-center">SIP TARIFADO</TableHead>
                                                <TableHead colSpan={5} className="text-white bg-blue-700 text-center">SIP ILIMITADO</TableHead>
                                            </TableRow>
                                            <TableRow className="border-slate-700">
                                                <TableHead className="text-white bg-blue-800 text-center">Call Center</TableHead>
                                                <TableHead className="text-white bg-blue-800 text-center">2</TableHead>
                                                <TableHead className="text-white bg-blue-800 text-center">4</TableHead>
                                                <TableHead className="text-white bg-blue-800 text-center">10</TableHead>
                                                <TableHead className="text-white bg-blue-800 text-center">30</TableHead>
                                                <TableHead className="text-white bg-blue-800 text-center">60</TableHead>
                                                <TableHead className="text-white bg-blue-700 text-center">5</TableHead>
                                                <TableHead className="text-white bg-blue-700 text-center">10</TableHead>
                                                <TableHead className="text-white bg-blue-700 text-center">20</TableHead>
                                                <TableHead className="text-white bg-blue-700 text-center">30</TableHead>
                                                <TableHead className="text-white bg-blue-700 text-center">60</TableHead>
                                            </TableRow>
                                            <TableRow className="border-slate-700">
                                                <TableHead className="text-white bg-blue-800 text-center text-xs">2 Canais</TableHead>
                                                <TableHead className="text-white bg-blue-800 text-center text-xs">2 Canais</TableHead>
                                                <TableHead className="text-white bg-blue-800 text-center text-xs">4 Canais</TableHead>
                                                <TableHead className="text-white bg-blue-800 text-center text-xs">10 Canais</TableHead>
                                                <TableHead className="text-white bg-blue-800 text-center text-xs">30 Canais</TableHead>
                                                <TableHead className="text-white bg-blue-800 text-center text-xs">60 Canais</TableHead>
                                                <TableHead className="text-white bg-blue-700 text-center text-xs">5 Canais</TableHead>
                                                <TableHead className="text-white bg-blue-700 text-center text-xs">10 Canais</TableHead>
                                                <TableHead className="text-white bg-blue-700 text-center text-xs">20 Canais</TableHead>
                                                <TableHead className="text-white bg-blue-700 text-center text-xs">30 Canais</TableHead>
                                                <TableHead className="text-white bg-blue-700 text-center text-xs">60 Canais</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {/* Canais Adicionais - Assinatura */}
                                            <TableRow className="border-slate-800">
                                                <TableCell className="font-semibold bg-blue-900/30">Canais Adicionais (Assinatura Mensal)</TableCell>
                                                <TableCell className="text-center bg-blue-800/20">Não Aplicável</TableCell>
                                                <TableCell className="text-center" colSpan={5}>Não Aplicável</TableCell>
                                                {Object.entries(sipConfig.additionalChannels.assinatura).map(([plan, data]) => (
                                                    <TableCell key={`assinatura-${plan}`} className="text-center bg-blue-600/20">
                                                        {isEditingSIP ? (
                                                            <div className="space-y-1">
                                                                <Input type="number" value={data.max} onChange={(e) => setSipConfig(prev => ({ ...prev, additionalChannels: { ...prev.additionalChannels, assinatura: { ...prev.additionalChannels.assinatura, [plan]: { ...prev.additionalChannels.assinatura[plan], max: Number(e.target.value) } } } }))} className="bg-slate-800 text-center text-xs" placeholder="Canais" />
                                                                <Input type="number" value={data.price} onChange={(e) => setSipConfig(prev => ({ ...prev, additionalChannels: { ...prev.additionalChannels, assinatura: { ...prev.additionalChannels.assinatura, [plan]: { ...prev.additionalChannels.assinatura[plan], price: Number(e.target.value) } } } }))} className="bg-slate-800 text-center text-xs" placeholder="Preço" />
                                                            </div>
                                                        ) : (
                                                            `Até ${data.max} canais<br/>${formatCurrency(data.price)} por canal adicional`
                                                        )}
                                                    </TableCell>
                                                ))}
                                                <TableCell className="text-center bg-blue-600/20">Sem possibilidade</TableCell>
                                            </TableRow>

                                            {/* Canais Adicionais - Franquia */}
                                            <TableRow className="border-slate-800">
                                                <TableCell className="font-semibold bg-blue-900/30">Canais Adicionais (Franquia Mensal)</TableCell>
                                                <TableCell className="text-center bg-blue-800/20">Não Aplicável</TableCell>
                                                {Object.entries(sipConfig.additionalChannels.franquia).map(([plan, data]) => (
                                                    <TableCell key={`franquia-${plan}`} className="text-center">
                                                        {isEditingSIP ? (
                                                            <div className="space-y-1">
                                                                <Input type="number" value={data.max} onChange={(e) => setSipConfig(prev => ({ ...prev, additionalChannels: { ...prev.additionalChannels, franquia: { ...prev.additionalChannels.franquia, [plan]: { ...prev.additionalChannels.franquia[plan], max: Number(e.target.value) } } } }))} className="bg-slate-800 text-center text-xs" placeholder="Canais" />
                                                                <Input type="number" value={data.price} onChange={(e) => setSipConfig(prev => ({ ...prev, additionalChannels: { ...prev.additionalChannels, franquia: { ...prev.additionalChannels.franquia, [plan]: { ...prev.additionalChannels.franquia[plan], price: Number(e.target.value) } } } }))} className="bg-slate-800 text-center text-xs" placeholder="Preço" />
                                                            </div>
                                                        ) : (
                                                            `Até ${data.max} canais<br/>${formatCurrency(data.price)} por canal adicional/mês`
                                                        )}
                                                    </TableCell>
                                                ))}
                                                <TableCell className="text-center" colSpan={4}>Sem possibilidade</TableCell>
                                            </TableRow>
                                            <TableRow className="border-slate-800">
                                                <TableCell className="font-semibold bg-blue-900/30">Franquia/Assinatura Mensal (Sem Equipamentos)</TableCell>
                                                {Object.keys(sipPrices).map(planKey => (
                                                    <TableCell key={planKey} className="text-center">
                                                        {isEditingSIP ? (
                                                            <Input
                                                                className="bg-slate-800 text-center"
                                                                value={sipPrices[planKey as keyof typeof sipPrices].monthly}
                                                                onChange={(e) => {
                                                                    const newSipPrices = { ...sipPrices };
                                                                    newSipPrices[planKey as keyof typeof sipPrices].monthly = Number(e.target.value);
                                                                    setSipPrices(newSipPrices);
                                                                }}
                                                            />
                                                        ) : (
                                                            <>{formatCurrency(sipPrices[planKey as keyof typeof sipPrices].monthly)}<br/>({planKey.includes('TARIFADO') ? 'Franquia' : 'Assinatura'})</>
                                                        )}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                            <TableRow className="border-slate-800">
                                                <TableCell className="font-semibold bg-blue-900/30">Franquia/Assinatura Mensal (Com Equipamentos)</TableCell>
                                                {Object.keys(sipPrices).map(planKey => {
                                                    const plan = sipPrices[planKey as keyof typeof sipPrices];
                                                    const value = plan.monthlyWithEquipment;

                                                    if (isEditingSIP) {
                                                        return (
                                                            <TableCell key={planKey} className="text-center">
                                                                <Input
                                                                    className="bg-slate-800 text-center"
                                                                    value={value === null ? 'Não Aplicável' : value}
                                                                    disabled={value === null}
                                                                    onChange={(e) => {
                                                                        const newSipPrices = { ...sipPrices };
                                                                        newSipPrices[planKey as keyof typeof sipPrices].monthlyWithEquipment = Number(e.target.value);
                                                                        setSipPrices(newSipPrices);
                                                                    }}
                                                                />
                                                            </TableCell>
                                                        );
                                                    }

                                                    return (
                                                        <TableCell key={planKey} className="text-center">
                                                            {value === null ? 'Não Aplicável' : <>{formatCurrency(value)}<br/>({planKey.includes('TARIFADO') ? 'Franquia' : 'Assinatura'})</>}
                                                        </TableCell>
                                                    );
                                                })}
                                            </TableRow>
                                            {/* Minutos Inclusos */}
                                            <TableRow className="border-slate-800">
                                                <TableCell className="font-semibold bg-blue-900/30">Minutos Mensais Inclusos para Brasil Móvel</TableCell>
                                                <TableCell className="text-center bg-blue-800/20">Não Aplicável</TableCell>
                                                <TableCell className="text-center" colSpan={4}>Não aplicável</TableCell>
                                                {Object.entries(sipConfig.includedMinutes).map(([plan, minutes]) => (
                                                    <TableCell key={`minutes-${plan}`} className="text-center">
                                                        {isEditingSIP ? (
                                                            <Input type="number" value={minutes} onChange={(e) => setSipConfig(prev => ({ ...prev, includedMinutes: { ...prev.includedMinutes, [plan]: Number(e.target.value) } }))} className="bg-slate-800 text-center" />
                                                        ) : (
                                                            `${minutes.toLocaleString()}<br/>Minutos`
                                                        )}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                            {/* Números Incluídos */}
                                            <TableRow className="border-slate-800">
                                                <TableCell className="font-semibold bg-blue-900/30">Números Incluídos (Novos ou Portados)</TableCell>
                                                <TableCell className="text-center">{isEditingSIP ? <Input value={sipConfig.includedNumbers.callCenter} onChange={(e) => setSipConfig(prev => ({...prev, includedNumbers: {...prev.includedNumbers, callCenter: e.target.value}}))} className="bg-slate-800 text-center" /> : sipConfig.includedNumbers.callCenter}</TableCell>
                                                {Object.entries(sipConfig.includedNumbers.tarifado).map(([plan, text]) => (
                                                    <TableCell key={`tarifado-num-${plan}`} className="text-center">{isEditingSIP ? <Input value={text} onChange={(e) => setSipConfig(prev => ({...prev, includedNumbers: {...prev.includedNumbers, tarifado: {...prev.includedNumbers.tarifado, [plan]: e.target.value}}}))} className="bg-slate-800 text-center" /> : text}</TableCell>
                                                ))}
                                                <TableCell className="text-center">Sem possibilidade</TableCell>{/* Coluna 60 canais tarifado */}
                                                {Object.entries(sipConfig.includedNumbers.ilimitado).map(([plan, text]) => (
                                                    <TableCell key={`ilimitado-num-${plan}`} className="text-center">{isEditingSIP ? <Input value={text} onChange={(e) => setSipConfig(prev => ({...prev, includedNumbers: {...prev.includedNumbers, ilimitado: {...prev.includedNumbers.ilimitado, [plan]: e.target.value}}}))} className="bg-slate-800 text-center" /> : text}</TableCell>
                                                ))}
                                            </TableRow>
                                            {/* Numeração Adicional */}
                                            <TableRow className="border-slate-800">
                                                <TableCell className="font-semibold bg-blue-900/30">Numeração Adicional (Mensalidade)</TableCell>
                                                <TableCell className="text-center">Consultar</TableCell>
                                                <TableCell colSpan={10} className="text-center">
                                                    {isEditingSIP ? (
                                                        <Input type="number" value={sipConfig.additionalNumberPrice} onChange={(e) => setSipConfig(prev => ({ ...prev, additionalNumberPrice: Number(e.target.value) }))} className="bg-slate-800 text-center w-40 mx-auto" />
                                                    ) : (
                                                        `${formatCurrency(sipConfig.additionalNumberPrice)} por Número`
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                            {/* Tarifas */}
                                            <TableRow className="border-slate-800">
                                                <TableCell className="font-semibold bg-blue-900/30">Tarifa Local Fixo (por minuto)</TableCell>
                                                <TableCell className="text-center">{isEditingSIP ? <Input type="number" value={sipConfig.tariffs.localFixo.callCenter} onChange={(e) => setSipConfig(prev => ({...prev, tariffs: {...prev.tariffs, localFixo: {...prev.tariffs.localFixo, callCenter: Number(e.target.value)}}}))} className="bg-slate-800 text-center" /> : `${formatCurrency(sipConfig.tariffs.localFixo.callCenter)}<br/>por minuto`}</TableCell>
                                                <TableCell colSpan={5} className="text-center">{isEditingSIP ? <Input type="number" value={sipConfig.tariffs.localFixo.tarifado} onChange={(e) => setSipConfig(prev => ({...prev, tariffs: {...prev.tariffs, localFixo: {...prev.tariffs.localFixo, tarifado: Number(e.target.value)}}}))} className="bg-slate-800 text-center" /> : `${formatCurrency(sipConfig.tariffs.localFixo.tarifado)} por minuto`}</TableCell>
                                                <TableCell colSpan={5} className="text-center">Ilimitado</TableCell>
                                            </TableRow>
                                            <TableRow className="border-slate-800">
                                                <TableCell className="font-semibold bg-blue-900/30">Tarifa DDD Fixo (por minuto)</TableCell>
                                                <TableCell className="text-center">{isEditingSIP ? <Input type="number" value={sipConfig.tariffs.dddFixo.callCenter} onChange={(e) => setSipConfig(prev => ({...prev, tariffs: {...prev.tariffs, dddFixo: {...prev.tariffs.dddFixo, callCenter: Number(e.target.value)}}}))} className="bg-slate-800 text-center" /> : `${formatCurrency(sipConfig.tariffs.dddFixo.callCenter)}<br/>por minuto`}</TableCell>
                                                <TableCell colSpan={5} className="text-center">{isEditingSIP ? <Input type="number" value={sipConfig.tariffs.dddFixo.tarifado} onChange={(e) => setSipConfig(prev => ({...prev, tariffs: {...prev.tariffs, dddFixo: {...prev.tariffs.dddFixo, tarifado: Number(e.target.value)}}}))} className="bg-slate-800 text-center" /> : `${formatCurrency(sipConfig.tariffs.dddFixo.tarifado)} por minuto`}</TableCell>
                                                <TableCell colSpan={5} className="text-center">Ilimitado</TableCell>
                                            </TableRow>
                                            <TableRow className="border-slate-800">
                                                <TableCell className="font-semibold bg-blue-900/30">Tarifa Brasil Móvel (por minuto)</TableCell>
                                                <TableCell className="text-center">{isEditingSIP ? <Input type="number" value={sipConfig.tariffs.brasilMovel.callCenter} onChange={(e) => setSipConfig(prev => ({...prev, tariffs: {...prev.tariffs, brasilMovel: {...prev.tariffs.brasilMovel, callCenter: Number(e.target.value)}}}))} className="bg-slate-800 text-center" /> : `${formatCurrency(sipConfig.tariffs.brasilMovel.callCenter)}<br/>por minuto`}</TableCell>
                                                <TableCell colSpan={10} className="text-center">{isEditingSIP ? <Input type="number" value={sipConfig.tariffs.brasilMovel.default} onChange={(e) => setSipConfig(prev => ({...prev, tariffs: {...prev.tariffs, brasilMovel: {...prev.tariffs.brasilMovel, default: Number(e.target.value)}}}))} className="bg-slate-800 text-center" /> : `${formatCurrency(sipConfig.tariffs.brasilMovel.default)} por minuto`}</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tabela de Preços PABX */}
                        <Card className="bg-slate-900/80 border-slate-800 text-white">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-green-400">PABX Standard</CardTitle>
                                <Button
                                    variant={isEditingPABX ? "secondary" : "outline"}
                                    size="sm"
                                    onClick={() => setIsEditingPABX(!isEditingPABX)}
                                    className="border-slate-600"
                                >
                                    {isEditingPABX ? "Salvar" : "Editar"}
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-slate-700">
                                                <TableHead className="text-white bg-green-800">Serviço</TableHead>
                                                <TableHead className="text-white bg-yellow-600 text-center">Até 10 ramais</TableHead>
                                                <TableHead className="text-white bg-yellow-600 text-center">De 11 a 20 ramais</TableHead>
                                                <TableHead className="text-white bg-yellow-600 text-center">De 21 a 30 ramais</TableHead>
                                                <TableHead className="text-white bg-yellow-600 text-center">De 31 a 50 ramais</TableHead>
                                                <TableHead className="text-white bg-yellow-600 text-center">De 51 a 100 ramais</TableHead>
                                                <TableHead className="text-white bg-yellow-600 text-center">De 101 a 500 ramais</TableHead>
                                                <TableHead className="text-white bg-yellow-600 text-center">De 501 a 1.000 ramais</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <TableRow className="border-slate-800">
                                                <TableCell className="font-semibold bg-green-900/30">Setup (cobrança única)</TableCell>
                                                {isEditingPABX ? (
                                                    <>
                                                        <TableCell><Input className="bg-slate-800 text-center" value={pabxPrices.setup['10']} onChange={(e) => setPabxPrices(prev => ({ ...prev, setup: { ...prev.setup, '10': parseFloat(e.target.value) || 0 } }))} /></TableCell>
                                                        <TableCell><Input className="bg-slate-800 text-center" value={pabxPrices.setup['20']} onChange={(e) => setPabxPrices(prev => ({ ...prev, setup: { ...prev.setup, '20': parseFloat(e.target.value) || 0 } }))} /></TableCell>
                                                        <TableCell><Input className="bg-slate-800 text-center" value={pabxPrices.setup['30']} onChange={(e) => setPabxPrices(prev => ({ ...prev, setup: { ...prev.setup, '30': parseFloat(e.target.value) || 0 } }))} /></TableCell>
                                                        <TableCell><Input className="bg-slate-800 text-center" value={pabxPrices.setup['50']} onChange={(e) => setPabxPrices(prev => ({ ...prev, setup: { ...prev.setup, '50': parseFloat(e.target.value) || 0 } }))} /></TableCell>
                                                        <TableCell><Input className="bg-slate-800 text-center" value={pabxPrices.setup['100']} onChange={(e) => setPabxPrices(prev => ({ ...prev, setup: { ...prev.setup, '100': parseFloat(e.target.value) || 0 } }))} /></TableCell>
                                                        <TableCell className="text-center text-blue-400">Valor a combinar</TableCell>
                                                        <TableCell className="text-center text-blue-400">Valor a combinar</TableCell>
                                                    </>
                                                ) : (
                                                    <>
                                                        <TableCell className="text-center">{formatCurrency(pabxPrices.setup['10'])}</TableCell>
                                                        <TableCell className="text-center">{formatCurrency(pabxPrices.setup['20'])}</TableCell>
                                                        <TableCell className="text-center">{formatCurrency(pabxPrices.setup['30'])}</TableCell>
                                                        <TableCell className="text-center">{formatCurrency(pabxPrices.setup['50'])}</TableCell>
                                                        <TableCell className="text-center">{formatCurrency(pabxPrices.setup['100'])}</TableCell>
                                                        <TableCell className="text-center text-blue-400">Valor a combinar</TableCell>
                                                        <TableCell className="text-center text-blue-400">Valor a combinar</TableCell>
                                                    </>
                                                )}
                                            </TableRow>
                                            <TableRow className="border-slate-800">
                                                <TableCell className="font-semibold bg-green-900/30">Valor por ramal (mensal unitário)</TableCell>
                                                {isEditingPABX ? (
                                                    <>
                                                        <TableCell><Input className="bg-slate-800 text-center" value={pabxPrices.monthly['10']} onChange={(e) => setPabxPrices(prev => ({ ...prev, monthly: { ...prev.monthly, '10': parseFloat(e.target.value) || 0 } }))} /></TableCell>
                                                        <TableCell><Input className="bg-slate-800 text-center" value={pabxPrices.monthly['20']} onChange={(e) => setPabxPrices(prev => ({ ...prev, monthly: { ...prev.monthly, '20': parseFloat(e.target.value) || 0 } }))} /></TableCell>
                                                        <TableCell><Input className="bg-slate-800 text-center" value={pabxPrices.monthly['30']} onChange={(e) => setPabxPrices(prev => ({ ...prev, monthly: { ...prev.monthly, '30': parseFloat(e.target.value) || 0 } }))} /></TableCell>
                                                        <TableCell><Input className="bg-slate-800 text-center" value={pabxPrices.monthly['50']} onChange={(e) => setPabxPrices(prev => ({ ...prev, monthly: { ...prev.monthly, '50': parseFloat(e.target.value) || 0 } }))} /></TableCell>
                                                        <TableCell><Input className="bg-slate-800 text-center" value={pabxPrices.monthly['100']} onChange={(e) => setPabxPrices(prev => ({ ...prev, monthly: { ...prev.monthly, '100': parseFloat(e.target.value) || 0 } }))} /></TableCell>
                                                        <TableCell><Input className="bg-slate-800 text-center" value={pabxPrices.monthly['500']} onChange={(e) => setPabxPrices(prev => ({ ...prev, monthly: { ...prev.monthly, '500': parseFloat(e.target.value) || 0 } }))} /></TableCell>
                                                        <TableCell><Input className="bg-slate-800 text-center" value={pabxPrices.monthly['1000']} onChange={(e) => setPabxPrices(prev => ({ ...prev, monthly: { ...prev.monthly, '1000': parseFloat(e.target.value) || 0 } }))} /></TableCell>
                                                    </>
                                                ) : (
                                                    <>
                                                        <TableCell className="text-center">{formatCurrency(pabxPrices.monthly['10'])}</TableCell>
                                                        <TableCell className="text-center">{formatCurrency(pabxPrices.monthly['20'])}</TableCell>
                                                        <TableCell className="text-center">{formatCurrency(pabxPrices.monthly['30'])}</TableCell>
                                                        <TableCell className="text-center">{formatCurrency(pabxPrices.monthly['50'])}</TableCell>
                                                        <TableCell className="text-center">{formatCurrency(pabxPrices.monthly['100'])}</TableCell>
                                                        <TableCell className="text-center">{formatCurrency(pabxPrices.monthly['500'])}</TableCell>
                                                        <TableCell className="text-center">{formatCurrency(pabxPrices.monthly['1000'])}</TableCell>
                                                    </>
                                                )}
                                            </TableRow>
                                            <TableRow className="border-slate-800">
                                                <TableCell className="font-semibold bg-green-900/30">Valor hospedagem (mensal)</TableCell>
                                                {isEditingPABX ? (
                                                    <>
                                                        <TableCell><Input className="bg-slate-800 text-center" value={pabxPrices.hosting['10']} onChange={(e) => setPabxPrices(prev => ({ ...prev, hosting: { ...prev.hosting, '10': parseFloat(e.target.value) || 0 } }))} /></TableCell>
                                                        <TableCell><Input className="bg-slate-800 text-center" value={pabxPrices.hosting['20']} onChange={(e) => setPabxPrices(prev => ({ ...prev, hosting: { ...prev.hosting, '20': parseFloat(e.target.value) || 0 } }))} /></TableCell>
                                                        <TableCell><Input className="bg-slate-800 text-center" value={pabxPrices.hosting['30']} onChange={(e) => setPabxPrices(prev => ({ ...prev, hosting: { ...prev.hosting, '30': parseFloat(e.target.value) || 0 } }))} /></TableCell>
                                                        <TableCell><Input className="bg-slate-800 text-center" value={pabxPrices.hosting['50']} onChange={(e) => setPabxPrices(prev => ({ ...prev, hosting: { ...prev.hosting, '50': parseFloat(e.target.value) || 0 } }))} /></TableCell>
                                                        <TableCell><Input className="bg-slate-800 text-center" value={pabxPrices.hosting['100']} onChange={(e) => setPabxPrices(prev => ({ ...prev, hosting: { ...prev.hosting, '100': parseFloat(e.target.value) || 0 } }))} /></TableCell>
                                                        <TableCell className="text-center text-blue-400">Valor a combinar</TableCell>
                                                        <TableCell className="text-center text-blue-400">Valor a combinar</TableCell>
                                                    </>
                                                ) : (
                                                    <>
                                                        <TableCell className="text-center">{formatCurrency(pabxPrices.hosting['10'])}</TableCell>
                                                        <TableCell className="text-center">{formatCurrency(pabxPrices.hosting['20'])}</TableCell>
                                                        <TableCell className="text-center">{formatCurrency(pabxPrices.hosting['30'])}</TableCell>
                                                        <TableCell className="text-center">{formatCurrency(pabxPrices.hosting['50'])}</TableCell>
                                                        <TableCell className="text-center">{formatCurrency(pabxPrices.hosting['100'])}</TableCell>
                                                        <TableCell className="text-center text-blue-400">Valor a combinar</TableCell>
                                                        <TableCell className="text-center text-blue-400">Valor a combinar</TableCell>
                                                    </>
                                                )}
                                            </TableRow>
                                            <TableRow className="border-slate-800">
                                                <TableCell className="font-semibold bg-green-900/30">Aluguel Aparelho Grandstream (mensal)</TableCell>
                                                {isEditingPABX ? (
                                                    <>
                                                        <TableCell><Input className="bg-slate-800 text-center" value={pabxPrices.device['10']} onChange={(e) => setPabxPrices(prev => ({ ...prev, device: { ...prev.device, '10': parseFloat(e.target.value) || 0 } }))} /></TableCell>
                                                        <TableCell><Input className="bg-slate-800 text-center" value={pabxPrices.device['20']} onChange={(e) => setPabxPrices(prev => ({ ...prev, device: { ...prev.device, '20': parseFloat(e.target.value) || 0 } }))} /></TableCell>
                                                        <TableCell><Input className="bg-slate-800 text-center" value={pabxPrices.device['30']} onChange={(e) => setPabxPrices(prev => ({ ...prev, device: { ...prev.device, '30': parseFloat(e.target.value) || 0 } }))} /></TableCell>
                                                        <TableCell><Input className="bg-slate-800 text-center" value={pabxPrices.device['50']} onChange={(e) => setPabxPrices(prev => ({ ...prev, device: { ...prev.device, '50': parseFloat(e.target.value) || 0 } }))} /></TableCell>
                                                        <TableCell><Input className="bg-slate-800 text-center" value={pabxPrices.device['100']} onChange={(e) => setPabxPrices(prev => ({ ...prev, device: { ...prev.device, '100': parseFloat(e.target.value) || 0 } }))} /></TableCell>
                                                        <TableCell className="text-center text-blue-400">Valor a combinar</TableCell>
                                                        <TableCell className="text-center text-blue-400">Valor a combinar</TableCell>
                                                    </>
                                                ) : (
                                                    <>
                                                        <TableCell className="text-center">{formatCurrency(pabxPrices.device['10'])}</TableCell>
                                                        <TableCell className="text-center">{formatCurrency(pabxPrices.device['20'])}</TableCell>
                                                        <TableCell className="text-center">{formatCurrency(pabxPrices.device['30'])}</TableCell>
                                                        <TableCell className="text-center">{formatCurrency(pabxPrices.device['50'])}</TableCell>
                                                        <TableCell className="text-center">{formatCurrency(pabxPrices.device['100'])}</TableCell>
                                                        <TableCell className="text-center text-blue-400">Valor a combinar</TableCell>
                                                        <TableCell className="text-center text-blue-400">Valor a combinar</TableCell>
                                                    </>
                                                )}
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tabela de Preços PABX Premium */}
                        <Card className="bg-slate-900/80 border-slate-800 text-white">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-green-400">PABX Premium</CardTitle>
                                <Button
                                    variant={isEditingPABXPremium24 ? "secondary" : "outline"}
                                    size="sm"
                                    onClick={isEditingPABXPremium24 ? handleSavePABXPrices : () => {
                                        setEditedValues({});
                                        setIsEditingPABXPremium24(true);
                                    }}
                                    className="border-slate-600"
                                >
                                    {isEditingPABXPremium24 ? "Salvar" : "Editar"}
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <Table>
                                        {/* ESSENCIAL 24 MESES - ILIMITADO */}
                                        <TableHeader>
                                            <TableRow className="border-slate-700">
                                                <TableHead className="text-white bg-blue-700 text-center" rowSpan={3}>ESSENCIAL - 24 MESES</TableHead>
                                                <TableHead className="text-white bg-blue-600 text-center" colSpan={2}>Ilimitado</TableHead>
                                            </TableRow>
                                            <TableRow className="border-slate-700">
                                                <TableHead className="text-white bg-blue-600 text-center">Valores com Equipamento (Aluguel + Assinatura)</TableHead>
                                                <TableHead className="text-white bg-blue-500 text-center">Valores sem Equipamento (Assinatura)</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {pabxPremiumPrices['24'].essencial.ilimitado.map((item, index) => (
                                                <TableRow key={`essencial-ilimitado-24-${index}`} className="border-slate-800">
                                                    <TableCell>{item.range}</TableCell>
                                                    <TableCell className="text-center">
                                                        {isEditingPABXPremium24 ? (
                                                            <input
                                                                type="number"
                                                                value={editedValues[`24-essencial-ilimitado-${index}-comEquipamento`] ?? item.comEquipamento}
                                                                onChange={(e) => handleInputChange('24', 'essencial', 'ilimitado', index, 'comEquipamento', e.target.value)}
                                                                className="w-24 p-1 text-center text-black rounded"
                                                            />
                                                        ) : (
                                                            formatCurrency(item.comEquipamento)
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {isEditingPABXPremium24 ? (
                                                            <input
                                                                type="number"
                                                                value={editedValues[`24-essencial-ilimitado-${index}-semEquipamento`] ?? item.semEquipamento}
                                                                onChange={(e) => handleInputChange('24', 'essencial', 'ilimitado', index, 'semEquipamento', e.target.value)}
                                                                className="w-24 p-1 text-center text-black rounded"
                                                            />
                                                        ) : (
                                                            formatCurrency(item.semEquipamento)
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                        
                                        {/* ESSENCIAL 24 MESES - TARIFADO */}
                                        <TableHeader>
                                            <TableRow className="border-slate-700">
                                                <TableHead className="text-white bg-blue-700 text-center" rowSpan={3}>ESSENCIAL - 24 MESES</TableHead>
                                                <TableHead className="text-white bg-blue-600 text-center" colSpan={2}>Tarifado</TableHead>
                                            </TableRow>
                                            <TableRow className="border-slate-700">
                                                <TableHead className="text-white bg-blue-600 text-center">Valores com Equipamento (Aluguel + Franquia)</TableHead>
                                                <TableHead className="text-white bg-blue-500 text-center">Valores sem Equipamento (Assinatura + Franquia)</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {pabxPremiumPrices['24'].essencial.tarifado.map((item, index) => (
                                                <TableRow key={`essencial-tarifado-24-${index}`} className="border-slate-800">
                                                    <TableCell>{item.range}</TableCell>
                                                    <TableCell className="text-center">
                                                        {isEditingPABXPremium24 ? (
                                                            <input
                                                                type="number"
                                                                value={editedValues[`24-essencial-tarifado-${index}-comEquipamento`] ?? item.comEquipamento}
                                                                onChange={(e) => handleInputChange('24', 'essencial', 'tarifado', index, 'comEquipamento', e.target.value)}
                                                                className="w-24 p-1 text-center text-black rounded"
                                                            />
                                                        ) : (
                                                            formatCurrency(item.comEquipamento)
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {isEditingPABXPremium24 ? (
                                                            <input
                                                                type="number"
                                                                value={editedValues[`24-essencial-tarifado-${index}-semEquipamento`] ?? item.semEquipamento}
                                                                onChange={(e) => handleInputChange('24', 'essencial', 'tarifado', index, 'semEquipamento', e.target.value)}
                                                                className="w-24 p-1 text-center text-black rounded"
                                                            />
                                                        ) : (
                                                            formatCurrency(item.semEquipamento)
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                        
                                        {/* PROFISSIONAL 24 MESES - ILIMITADO */}
                                        <TableHeader>
                                            <TableRow className="border-slate-700">
                                                <TableHead className="text-white bg-blue-700 text-center" rowSpan={3}>PROFISSIONAL - 24 MESES</TableHead>
                                                <TableHead className="text-white bg-blue-600 text-center" colSpan={2}>Ilimitado</TableHead>
                                            </TableRow>
                                            <TableRow className="border-slate-700">
                                                <TableHead className="text-white bg-blue-600 text-center">Valores com Equipamento (Aluguel + Assinatura)</TableHead>
                                                <TableHead className="text-white bg-blue-500 text-center">Valores sem Equipamento (Assinatura)</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {pabxPremiumPrices['24'].profissional.ilimitado.map((item, index) => (
                                                <TableRow key={`profissional-ilimitado-24-${index}`} className="border-slate-800">
                                                    <TableCell>{item.range}</TableCell>
                                                    <TableCell className="text-center">
                                                        {isEditingPABXPremium24 ? (
                                                            <input
                                                                type="number"
                                                                value={editedValues[`24-profissional-ilimitado-${index}-comEquipamento`] ?? item.comEquipamento}
                                                                onChange={(e) => handleInputChange('24', 'profissional', 'ilimitado', index, 'comEquipamento', e.target.value)}
                                                                className="w-24 p-1 text-center text-black rounded"
                                                            />
                                                        ) : (
                                                            formatCurrency(item.comEquipamento)
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {isEditingPABXPremium24 ? (
                                                            <input
                                                                type="number"
                                                                value={editedValues[`24-profissional-ilimitado-${index}-semEquipamento`] ?? item.semEquipamento}
                                                                onChange={(e) => handleInputChange('24', 'profissional', 'ilimitado', index, 'semEquipamento', e.target.value)}
                                                                className="w-24 p-1 text-center text-black rounded"
                                                            />
                                                        ) : (
                                                            formatCurrency(item.semEquipamento)
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                        
                                        {/* PROFISSIONAL 24 MESES - TARIFADO */}
                                        <TableHeader>
                                            <TableRow className="border-slate-700">
                                                <TableHead className="text-white bg-blue-700 text-center" rowSpan={3}>PROFISSIONAL - 24 MESES</TableHead>
                                                <TableHead className="text-white bg-blue-600 text-center" colSpan={2}>Tarifado</TableHead>
                                            </TableRow>
                                            <TableRow className="border-slate-700">
                                                <TableHead className="text-white bg-blue-600 text-center">Valores com Equipamento (Aluguel + Franquia)</TableHead>
                                                <TableHead className="text-white bg-blue-500 text-center">Valores sem Equipamento (Assinatura + Franquia)</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {pabxPremiumPrices['24'].profissional.tarifado.map((item, index) => (
                                                <TableRow key={`profissional-tarifado-24-${index}`} className="border-slate-800">
                                                    <TableCell>{item.range}</TableCell>
                                                    <TableCell className="text-center">
                                                        {isEditingPABXPremium24 ? (
                                                            <input
                                                                type="number"
                                                                value={editedValues[`24-profissional-tarifado-${index}-comEquipamento`] ?? item.comEquipamento}
                                                                onChange={(e) => handleInputChange('24', 'profissional', 'tarifado', index, 'comEquipamento', e.target.value)}
                                                                className="w-24 p-1 text-center text-black rounded"
                                                            />
                                                        ) : (
                                                            formatCurrency(item.comEquipamento)
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {isEditingPABXPremium24 ? (
                                                            <input
                                                                type="number"
                                                                value={editedValues[`24-profissional-tarifado-${index}-semEquipamento`] ?? item.semEquipamento}
                                                                onChange={(e) => handleInputChange('24', 'profissional', 'tarifado', index, 'semEquipamento', e.target.value)}
                                                                className="w-24 p-1 text-center text-black rounded"
                                                            />
                                                        ) : (
                                                            formatCurrency(item.semEquipamento)
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                        
                                        {/* PROFISSIONAL 36 MESES - ILIMITADO */}
                                        <TableHeader>
                                            <TableRow className="border-slate-700">
                                                <TableHead className="text-white bg-blue-700 text-center" rowSpan={3}>PROFISSIONAL - 36 MESES</TableHead>
                                                <TableHead className="text-white bg-blue-600 text-center" colSpan={2}>Ilimitado</TableHead>
                                            </TableRow>
                                            <TableRow className="border-slate-700">
                                                <TableHead className="text-white bg-blue-600 text-center">Valores com Equipamento (Aluguel + Assinatura)</TableHead>
                                                <TableHead className="text-white bg-blue-500 text-center">Valores sem Equipamento (Assinatura)</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {pabxPremiumPrices['36'].profissional.ilimitado.map((item, index) => (
                                                <TableRow key={`profissional-ilimitado-36-${index}`} className="border-slate-800">
                                                    <TableCell>{item.range}</TableCell>
                                                    <TableCell className="text-center">
                                                        {isEditingPABXPremium24 ? (
                                                            <input
                                                                type="number"
                                                                value={editedValues[`36-profissional-ilimitado-${index}-comEquipamento`] ?? item.comEquipamento}
                                                                onChange={(e) => handleInputChange('36', 'profissional', 'ilimitado', index, 'comEquipamento', e.target.value)}
                                                                className="w-24 p-1 text-center text-black rounded"
                                                            />
                                                        ) : (
                                                            formatCurrency(item.comEquipamento)
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {isEditingPABXPremium24 ? (
                                                            <input
                                                                type="number"
                                                                value={editedValues[`36-profissional-ilimitado-${index}-semEquipamento`] ?? item.semEquipamento}
                                                                onChange={(e) => handleInputChange('36', 'profissional', 'ilimitado', index, 'semEquipamento', e.target.value)}
                                                                className="w-24 p-1 text-center text-black rounded"
                                                            />
                                                        ) : (
                                                            formatCurrency(item.semEquipamento)
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                        
                                        {/* PROFISSIONAL 36 MESES - TARIFADO */}
                                        <TableHeader>
                                            <TableRow className="border-slate-700">
                                                <TableHead className="text-white bg-blue-700 text-center" rowSpan={3}>PROFISSIONAL - 36 MESES</TableHead>
                                                <TableHead className="text-white bg-blue-600 text-center" colSpan={2}>Tarifado</TableHead>
                                            </TableRow>
                                            <TableRow className="border-slate-700">
                                                <TableHead className="text-white bg-blue-600 text-center">Valores com Equipamento (Aluguel + Franquia)</TableHead>
                                                <TableHead className="text-white bg-blue-500 text-center">Valores sem Equipamento (Assinatura + Franquia)</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {pabxPremiumPrices['36'].profissional.tarifado.map((item, index) => (
                                                <TableRow key={`profissional-tarifado-36-${index}`} className="border-slate-800">
                                                    <TableCell>{item.range}</TableCell>
                                                    <TableCell className="text-center">
                                                        {isEditingPABXPremium24 ? (
                                                            <input
                                                                type="number"
                                                                value={editedValues[`36-profissional-tarifado-${index}-comEquipamento`] ?? item.comEquipamento}
                                                                onChange={(e) => handleInputChange('36', 'profissional', 'tarifado', index, 'comEquipamento', e.target.value)}
                                                                className="w-24 p-1 text-center text-black rounded"
                                                            />
                                                        ) : (
                                                            formatCurrency(item.comEquipamento)
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {isEditingPABXPremium24 ? (
                                                            <input
                                                                type="number"
                                                                value={editedValues[`36-profissional-tarifado-${index}-semEquipamento`] ?? item.semEquipamento}
                                                                onChange={(e) => handleInputChange('36', 'profissional', 'tarifado', index, 'semEquipamento', e.target.value)}
                                                                className="w-24 p-1 text-center text-black rounded"
                                                            />
                                                        ) : (
                                                            formatCurrency(item.semEquipamento)
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>

                    </div>
                </TabsContent>


            </Tabs>
        </div>
    );
};

export default PABXSIPCalculator;