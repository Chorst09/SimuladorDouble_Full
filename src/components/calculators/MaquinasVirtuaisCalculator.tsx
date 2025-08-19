"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import '@/styles/print.css';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from '@/components/ui/checkbox';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Calculator,
    Phone,
    PhoneForwarded,
    Settings,
    FileText,
    Download,
    Save,
    Search,
    Edit,
    Plus,
    User,
    Briefcase,
    Trash2,
    Server,
    Brain,
    Cpu,
    MemoryStick,
    HardDrive,
    Network,
    PlusCircle,
    FilePenLine
} from 'lucide-react';

// Import shared components
import { ClientManagerForm, ClientData, AccountManagerData } from '@/components/calculators/ClientManagerForm';
import { ClientManagerInfo } from '@/components/calculators/ClientManagerInfo';

// Interfaces
interface PABXTier {
    min: number;
    max: number;
    setup: number;
    monthly: number;
}

interface SIPPlan {
    name: string;
    type: 'PLANO' | 'TARIFADO';
    setup: number;
    monthly: number;
    monthlyWithEquipment?: number; // Opcional para planos que não têm essa opção
    channels: number;
}

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
    additionalChannelsCost: number;
}

// Interface para um produto adicionado à proposta
type ProductType = 'VM' | 'PABX' | 'SIP';

interface Product {
    id: string;
    type: ProductType;
    description: string;
    setup: number;
    monthly: number;
    details: any;
}

interface Proposal {
    id: string; // ID do documento no Firestore
    userId: string; // ID do usuário que criou a proposta
    client: ClientData;
    accountManager: AccountManagerData;
    products: Product[];
    totalSetup: number;
    totalMonthly: number;
    createdAt: string;
}

import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';


const MaquinasVirtuaisCalculator = () => {
    const { user } = useAuth();

    // Estados de gerenciamento de propostas
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [currentProposal, setCurrentProposal] = useState<Proposal | null>(null);
    const [viewMode, setViewMode] = useState<'search' | 'client-form' | 'calculator'>('search');
    const [showClientForm, setShowClientForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState<string>('');

    // Estados dos dados do cliente e gerente
    const [clientData, setClientData] = useState<ClientData>({
        name: '',
        email: '',
        phone: ''
    });
    const [accountManagerData, setAccountManagerData] = useState<AccountManagerData>({
        name: '',
        email: '',
        phone: ''
    });
    const [addedProducts, setAddedProducts] = useState<Product[]>([]);

    // Estados PABX
    const [pabxExtensions, setPabxExtensions] = useState<number>(0);
    const [pabxIncludeDevices, setPabxIncludeDevices] = useState<boolean>(false);
    const [pabxDeviceQuantity, setPabxDeviceQuantity] = useState<number>(0);
    const [pabxIncludeSetup, setPabxIncludeSetup] = useState<boolean>(true);
    const [pabxResult, setPabxResult] = useState<PABXResult | null>(null);

    // Estados Agente IA
    const [includeAIAgent, setIncludeAIAgent] = useState(false);
    const [selectedAIAgentPlan, setSelectedAIAgentPlan] = useState('');

    // Estados SIP
    const [selectedSipPlan, setSelectedSipPlan] = useState<string>('');
    const [sipAdditionalChannels, setSipAdditionalChannels] = useState<number>(0);
    const [sipWithEquipment, setSipWithEquipment] = useState<boolean>(false);
    const [sipIncludeSetup, setSipIncludeSetup] = useState<boolean>(true);
    const [sipResult, setSipResult] = useState<SIPResult | null>(null);

    useEffect(() => {
        const fetchProposals = async () => {
            if (!user || !user.role || !db) {
                setProposals([]);
                return;
            }

            const proposalsCol = collection(db, 'proposals');
            let q;
            if (user.role === 'admin') {
                q = query(proposalsCol);
            } else {
                q = query(proposalsCol, where('userId', '==', user.uid));
            }

            try {
                const querySnapshot = await getDocs(q);
                const proposalsData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Proposal));
                setProposals(proposalsData);
            } catch (error) {
                console.error("Erro ao buscar propostas: ", error);
            }
        };

        fetchProposals();
    }, [user]);

    // Estados para regime tributário
    const [selectedTaxRegime, setSelectedTaxRegime] = useState<string>('lucro_real');
    const [pisCofins, setPisCofins] = useState<string>('3,65');
    const [iss, setIss] = useState<string>('5,00');
    const [csllIr, setCsllIr] = useState<string>('8,88');

    // Cálculo do total de impostos
    const totalTaxes = useMemo(() => {
        const pisCofinsParsed = parseFloat(pisCofins.replace(',', '.')) || 0;
        const issParsed = parseFloat(iss.replace(',', '.')) || 0;
        const csllIrParsed = parseFloat(csllIr.replace(',', '.')) || 0;
        return pisCofinsParsed + issParsed + csllIrParsed;
    }, [pisCofins, iss, csllIr]);

    // Estado para controle de abas
    const [activeTab, setActiveTab] = useState<string>('calculator');

    // Estados para configuração de VM
    const [vmName, setVmName] = useState<string>('Servidor Principal');
    const [vmCpuCores, setVmCpuCores] = useState<number>(2);
    const [vmRamGb, setVmRamGb] = useState<number>(4);
    const [vmStorageType, setVmStorageType] = useState<string>('HDD SAS');
    const [vmStorageSize, setVmStorageSize] = useState<number>(50);
    const [vmNetworkSpeed, setVmNetworkSpeed] = useState<string>('1 Gbps');
    const [vmOperatingSystem, setVmOperatingSystem] = useState<string>('Ubuntu Server 22.04 LTS');
    const [vmBackupSize, setVmBackupSize] = useState<number>(0);
    const [vmAdditionalIp, setVmAdditionalIp] = useState<boolean>(false);
    const [vmSnapshot, setVmSnapshot] = useState<boolean>(false);
    const [vmVpnSiteToSite, setVmVpnSiteToSite] = useState<boolean>(false);
    const [vmContractPeriod, setVmContractPeriod] = useState<number>(12);

    // Estados para configurações de preço
    const [markup, setMarkup] = useState<number>(30);
    const [estimatedNetMargin, setEstimatedNetMargin] = useState<number>(0);
    const [commissionPercentage, setCommissionPercentage] = useState<number>(3);
    const [setupFee, setSetupFee] = useState<number>(500);

    // Cálculo do desconto contratual baseado no período
    const contractDiscount = useMemo(() => {
        switch (vmContractPeriod) {
            case 12: return 0;
            case 24: return 5;
            case 36: return 10;
            case 48: return 15;
            case 60: return 20;
            default: return 0;
        }
    }, [vmContractPeriod]);

    // Estados para custos de recursos VM
    const [vcpuWindowsCost, setVcpuWindowsCost] = useState<number>(15);
    const [vcpuLinuxCost, setVcpuLinuxCost] = useState<number>(10);
    const [ramCost, setRamCost] = useState<number>(8);
    const [hddSasCost, setHddSasCost] = useState<number>(0.5);
    const [ssdPerformanceCost, setSsdPerformanceCost] = useState<number>(1.5);
    const [nvmeCost, setNvmeCost] = useState<number>(2.5);
    const [network1GbpsCost, setNetwork1GbpsCost] = useState<number>(0);
    const [network10GbpsCost, setNetwork10GbpsCost] = useState<number>(100);
    const [windowsServerCost, setWindowsServerCost] = useState<number>(135);
    const [windows10ProCost, setWindows10ProCost] = useState<number>(120);
    const [ubuntuCost, setUbuntuCost] = useState<number>(0);
    const [centosCost, setCentosCost] = useState<number>(0);
    const [debianCost, setDebianCost] = useState<number>(0);
    const [rockyLinuxCost, setRockyLinuxCost] = useState<number>(0);
    const [backupCostPerGb, setBackupCostPerGb] = useState<number>(1.25);
    const [additionalIpCost, setAdditionalIpCost] = useState<number>(15);
    const [snapshotCost, setSnapshotCost] = useState<number>(25);
    const [vpnSiteToSiteCost, setVpnSiteToSiteCost] = useState<number>(50);

    // Dados para as tabelas de List Price
    const pabxListPriceData = {
        headers: ['Serviço', 'Até 10 ramais', 'De 11 a 20 ramais', 'De 21 a 30 ramais', 'De 31 a 50 ramais', 'De 51 a 100 ramais', 'De 101 a 500 ramais', 'De 501 a 1.000 ramais'],
        rows: [
            { service: 'Setup (cobrança única)', values: ['1.250,00', '2.000,00', '2.500,00', '3.000,00', '3.500,00', 'Valor a combinar', 'Valor a combinar'] },
            { service: 'Valor por ramal (mensal unitário)', values: ['30,00', '29,00', '28,00', '27,00', '26,00', '25,00', '24,50'] },
            { service: 'Valor hospedagem (mensal)', values: ['200,00', '220,00', '250,00', '300,00', '400,00', 'Valor a combinar', 'Valor a combinar'] },
            { service: 'Aluguel Aparelho Grandstream (mensal)', values: ['35,00', '34,00', '33,00', '32,00', '30,00', 'Valor a combinar', 'Valor a combinar'] },
        ],
    };

    const sipListPriceData = {
        headers: {
            top: [
                { title: 'SIP TARIFADO', span: 2 },
                { title: 'SIP TARIFADO', span: 1 },
                { title: 'SIP TARIFADO', span: 1 },
                { title: 'SIP TARIFADO', span: 1 },
                { title: 'SIP TARIFADO', span: 1 },
                { title: 'SIP ILIMITADO', span: 1 },
                { title: 'SIP ILIMITADO', span: 1 },
                { title: 'SIP ILIMITADO', span: 1 },
                { title: 'SIP ILIMITADO', span: 1 },
                { title: 'SIP ILIMITADO', span: 1 }
            ],
            bottom: [
                'Call Center',
                '2 canais',
                '4 Canais',
                '10 Canais',
                '30 Canais',
                '60 Canais',
                '5 Canais',
                '10 Canais',
                '20 Canais',
                '30 Canais',
                '60 Canais'
            ]
        },
        rows: [
            {
                service: 'Canais Adicionais (Assinatura Mensal)',
                values: [
                    'Não Aplicável',
                    'Sem possibilidade',
                    'Sem possibilidade',
                    'Sem possibilidade',
                    'Sem possibilidade',
                    'Sem possibilidade',
                    'Até 5 canais R$ 30 por canal adicional',
                    'Até 5 canais R$ 30 por canal adicional',
                    'Até 5 canais R$ 30 por canal adicional',
                    'Até 5 canais R$ 30 por canal adicional',
                    ''
                ]
            },
            {
                service: 'Canais Adicionais (Franquia Mensal)',
                values: [
                    'Não Aplicável',
                    'Sem possibilidade',
                    '',
                    'Até 10 canais R$25 por canal adicional/mês',
                    'Até 20 canais R$ 25 por canal adicional/mês',
                    'Até 30 canais R$ 25 por canal adicional/mês',
                    '',
                    '',
                    '',
                    '',
                    'Sem possibilidade'
                ]
            },
            {
                service: 'Franquia/Assinatura Mensal (Sem Equipamentos)',
                values: [
                    'R$ 200 (Franquia)',
                    'R$ 150 (Franquia)',
                    'R$ 250 (Franquia)',
                    'R$ 350 (Franquia)',
                    'R$ 550 (Franquia)',
                    'R$ 1.000 (Franquia)',
                    'R$ 350 (Assinatura)',
                    'R$ 450 (Assinatura)',
                    'R$ 650 (Assinatura)',
                    'R$ 850 (Assinatura)',
                    'R$ 1.600 (Assinatura)'
                ]
            },
            {
                service: 'Franquia/Assinatura Mensal (Com Equipamentos)',
                values: [
                    'Não Aplicável',
                    'Sem possibilidade',
                    'R$ 500 (Franquia)',
                    'R$ 650 (Franquia)',
                    'R$ 1.200 (Franquia)',
                    '',
                    'R$ 500 (Assinatura)',
                    'R$ 600 (Assinatura)',
                    'R$ 800 (Assinatura)',
                    'R$ 950 (Assinatura)',
                    'R$ 1.700 (Assinatura)'
                ]
            },
            {
                service: 'Minutos Mensais Inclusos para Brasil Móvel',
                values: [
                    'Não Aplicável',
                    '',
                    'Não aplicável',
                    '',
                    '',
                    '',
                    '15.000 Minutos',
                    '20.000 Minutos',
                    '25.000 Minutos',
                    '30.000 Minutos',
                    '60.000 Minutos'
                ]
            },
            {
                service: 'Números Incluídos (Novos ou Portados)',
                values: [
                    'Consultar',
                    '',
                    'Máximo 3 Números',
                    '',
                    'Máximo 4 Números',
                    '',
                    'Máximo 5 Números',
                    'Máximo 10 Números',
                    'Máximo 15 Números',
                    'Máximo 20 Números',
                    'Máximo 30 Números'
                ]
            },
            {
                service: 'Numeração Adicional (Mensalidade)',
                values: [
                    'Consultar',
                    '',
                    'R$ 10 por Número',
                    '',
                    '',
                    '',
                    '',
                    '',
                    'R$ 10 por Número',
                    '',
                    ''
                ]
            },
            {
                service: 'Tarifa Local Fixo (por minuto)',
                values: [
                    'R$ 0,015 por minuto',
                    '',
                    'R$ 0,02 por minuto',
                    '',
                    '',
                    '',
                    '',
                    '',
                    'Ilimitado',
                    '',
                    ''
                ]
            },
            {
                service: 'Tarifa DDD Fixo (por minuto)',
                values: [
                    'R$ 0,05 por minuto',
                    '',
                    'R$ 0,06 por minuto',
                    '',
                    '',
                    '',
                    '',
                    '',
                    'Ilimitado',
                    '',
                    ''
                ]
            },
            {
                service: 'Tarifa Brasil Móvel (por minuto)',
                values: [
                    'R$ 0,09 por minuto',
                    '',
                    'R$ 0,10 por minuto',
                    '',
                    '',
                    '',
                    '',
                    '',
                    'R$ 10 por minuto',
                    '',
                    ''
                ]
            }
        ],
    };

    const aiAgentPlans: { [key: string]: { name: string; monthlyCost: number; messages: string; minutes: string; premiumVoice: string; credits: string; color: string } } = {
        plan20k: {
            name: '20K',
            monthlyCost: 720.00,
            credits: '20.000 Créditos de Interação',
            messages: '10.000 mensagens* ou',
            minutes: '2.000 minutos** ou',
            premiumVoice: '1.000 voz premium*** ou',
            color: 'bg-blue-900'
        },
        plan40k: {
            name: '40K',
            monthlyCost: 1370.00,
            credits: '40.000 Créditos de Interação',
            messages: '20.000 mensagens* ou',
            minutes: '4.000 minutos** ou',
            premiumVoice: '2.000 voz premium*** ou',
            color: 'bg-blue-800'
        },
        plan60k: {
            name: '60K',
            monthlyCost: 1940.00,
            credits: '60.000 Créditos de Interação',
            messages: '30.000 mensagens* ou',
            minutes: '6.000 minutos** ou',
            premiumVoice: '3.000 voz premium*** ou',
            color: 'bg-blue-600'
        },
        plan100k: {
            name: '100K',
            monthlyCost: 3060.00,
            credits: '100.000 Créditos de Interação',
            messages: '50.000 mensagens* ou',
            minutes: '10.000 minutos** ou',
            premiumVoice: '5.000 voz premium*** ou',
            color: 'bg-cyan-500'
        },
        plan150k: {
            name: '150K',
            monthlyCost: 4320.00,
            credits: '150.000 Créditos de Interação',
            messages: '75.000 mensagens* ou',
            minutes: '15.000 minutos** ou',
            premiumVoice: '7.500 voz premium*** ou',
            color: 'bg-teal-400'
        },
        plan200k: {
            name: '200K',
            monthlyCost: 5400.00,
            credits: '200.000 Créditos de Interação',
            messages: '100.000 mensagens* ou',
            minutes: '20.000 minutos** ou',
            premiumVoice: '10.000 voz premium*** ou',
            color: 'bg-teal-400'
        },
    };

    const pabxTiers: PABXTier[] = [
        { min: 1, max: 10, setup: 1250, monthly: 35 },
        { min: 11, max: 20, setup: 2000, monthly: 33 },
        { min: 21, max: 30, setup: 2500, monthly: 31 },
        { min: 31, max: 50, setup: 3000, monthly: 29 },
        { min: 51, max: 100, setup: 3500, monthly: 27 },
        { min: 101, max: 500, setup: 0, monthly: 25 }, // Valor a combinar
        { min: 501, max: 1000, setup: 0, monthly: 23 } // Valor a combinar
    ];

    const sipPlans: SIPPlan[] = [
        // Planos TARIFADO
        { name: 'SIP TARIFADO Call Center', type: 'TARIFADO', setup: 500, monthly: 200, channels: 0 },
        { name: 'SIP TARIFADO 2 Canais', type: 'TARIFADO', setup: 500, monthly: 150, channels: 2 },
        { name: 'SIP TARIFADO 4 Canais', type: 'TARIFADO', setup: 500, monthly: 250, monthlyWithEquipment: 500, channels: 4 },
        { name: 'SIP TARIFADO 10 Canais', type: 'TARIFADO', setup: 500, monthly: 350, monthlyWithEquipment: 500, channels: 10 },
        { name: 'SIP TARIFADO 30 Canais', type: 'TARIFADO', setup: 500, monthly: 550, monthlyWithEquipment: 650, channels: 30 },
        { name: 'SIP TARIFADO 60 Canais', type: 'TARIFADO', setup: 500, monthly: 1000, monthlyWithEquipment: 1200, channels: 60 },
        // Planos ILIMITADO
        { name: 'SIP ILIMITADO 5 Canais', type: 'PLANO', setup: 500, monthly: 350, monthlyWithEquipment: 500, channels: 5 },
        { name: 'SIP ILIMITADO 10 Canais', type: 'PLANO', setup: 500, monthly: 450, monthlyWithEquipment: 600, channels: 10 },
        { name: 'SIP ILIMITADO 20 Canais', type: 'PLANO', setup: 500, monthly: 650, monthlyWithEquipment: 800, channels: 20 },
        { name: 'SIP ILIMITADO 30 Canais', type: 'PLANO', setup: 500, monthly: 850, monthlyWithEquipment: 950, channels: 30 },
        { name: 'SIP ILIMITADO 60 Canais', type: 'PLANO', setup: 500, monthly: 1600, monthlyWithEquipment: 1700, channels: 60 },
    ];

    const costPerAdditionalChannel = 50;
    const equipmentRentalCost = 35;

    // Lógica de Cálculo
    const calculatePabxPrice = () => {
        if (pabxExtensions <= 0) {
            setPabxResult(null);
            return;
        }

        const tier = pabxTiers.find(t => pabxExtensions >= t.min && pabxExtensions <= t.max);
        if (!tier) {
            setPabxResult(null);
            return;
        }

        let setup = pabxIncludeSetup ? tier.setup : 0;
        let baseMonthly = tier.monthly * pabxExtensions;
        let deviceRentalCost = 0;
        let aiAgentCost = 0;

        if (pabxIncludeDevices) {
            deviceRentalCost = pabxDeviceQuantity * 35; // R$ 35 por dispositivo
        }

        if (includeAIAgent) {
            const plan = Object.values(aiAgentPlans).find(p => p.name === selectedAIAgentPlan);
            if (plan) {
                aiAgentCost = plan.monthlyCost;
            }
        }

        const totalMonthly = baseMonthly + deviceRentalCost + aiAgentCost;
        setPabxResult({ setup, baseMonthly, deviceRentalCost, aiAgentCost, totalMonthly });
    };

    const calculateSipPrice = () => {
        if (!selectedSipPlan) {
            setSipResult(null);
            return;
        }

        const plan = sipPlans.find(p => p.name === selectedSipPlan);
        if (plan) {
            let monthly = (sipWithEquipment && plan.monthlyWithEquipment) ? plan.monthlyWithEquipment : plan.monthly;
            let additionalChannelsCost = 0;

            if (plan.type === 'TARIFADO' && sipAdditionalChannels > 0) {
                additionalChannelsCost = sipAdditionalChannels * 20; // R$ 20 por canal adicional
                monthly += additionalChannelsCost;
            }

            const setup = sipIncludeSetup ? plan.setup : 0;
            setSipResult({ setup, monthly, additionalChannelsCost });
        } else {
            setSipResult(null);
        }
    };

    // Cálculos VM usando useMemo
    const calculateVMCost = useMemo(() => {
        let cost = 0;
        
        // Custo de CPU baseado no SO
        if (vmOperatingSystem.includes('Windows')) {
            cost += vmCpuCores * vcpuWindowsCost;
        } else {
            cost += vmCpuCores * vcpuLinuxCost;
        }
        
        // Custo de RAM
        cost += vmRamGb * ramCost;
        
        // Custo de Storage
        if (vmStorageType === 'HDD SAS') {
            cost += vmStorageSize * hddSasCost;
        } else if (vmStorageType === 'SSD Performance') {
            cost += vmStorageSize * ssdPerformanceCost;
        } else if (vmStorageType === 'NVMe') {
            cost += vmStorageSize * nvmeCost;
        }
        
        // Custo de Network
        if (vmNetworkSpeed === '10 Gbps') {
            cost += network10GbpsCost;
        }
        
        // Custo do Sistema Operacional
        if (vmOperatingSystem === 'Windows Server 2022') {
            cost += windowsServerCost;
        } else if (vmOperatingSystem === 'Windows 10 Pro') {
            cost += windows10ProCost;
        }
        
        // Serviços adicionais
        if (vmBackupSize > 0) {
            cost += vmBackupSize * backupCostPerGb;
        }
        if (vmAdditionalIp) {
            cost += additionalIpCost;
        }
        if (vmSnapshot) {
            cost += snapshotCost;
        }
        if (vmVpnSiteToSite) {
            cost += vpnSiteToSiteCost;
        }
        
        return cost;
    }, [
        vmCpuCores, vmRamGb, vmStorageType, vmStorageSize, vmNetworkSpeed, vmOperatingSystem,
        vmBackupSize, vmAdditionalIp, vmSnapshot, vmVpnSiteToSite,
        vcpuWindowsCost, vcpuLinuxCost, ramCost, hddSasCost, ssdPerformanceCost, nvmeCost,
        network10GbpsCost, windowsServerCost, windows10ProCost, backupCostPerGb,
        additionalIpCost, snapshotCost, vpnSiteToSiteCost
    ]);

    // Consolida todos os cálculos de preços e valores derivados em um único hook useMemo.
    // Isso garante a ordem de cálculo correta e evita erros de referência circular.
    const { vmFinalPrice, markupValue, commissionValue } = useMemo(() => {
        const baseCostWithTaxes = calculateVMCost + (calculateVMCost * (totalTaxes / 100));
        const priceWithMarkup = baseCostWithTaxes * (1 + markup / 100);
        const finalPrice = priceWithMarkup * (1 - contractDiscount / 100);

        const calculatedMarkupValue = baseCostWithTaxes * (markup / 100);
        const calculatedCommissionValue = finalPrice * (commissionPercentage / 100);

        return {
            vmFinalPrice: finalPrice || 0,
            markupValue: calculatedMarkupValue || 0,
            commissionValue: calculatedCommissionValue || 0,
        };
    }, [calculateVMCost, totalTaxes, markup, contractDiscount, commissionPercentage]);



    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    // Funções de manipulação
    const handleAddVMProduct = () => {
        const newProduct = {
            id: Date.now().toString(),
            type: 'VM',
            description: `${vmName} - ${vmCpuCores} vCPU, ${vmRamGb}GB RAM, ${vmStorageSize}GB ${vmStorageType}, ${vmOperatingSystem}`,
            setup: setupFee,
            monthly: vmFinalPrice,
            details: {
                cpuCores: vmCpuCores,
                ramGb: vmRamGb,
                storageType: vmStorageType,
                storageSize: vmStorageSize,
                operatingSystem: vmOperatingSystem
            }
        };
        setAddedProducts([...addedProducts, newProduct]);
    };

    const handleRemoveProduct = (productId: string) => {
        setAddedProducts(addedProducts.filter(p => p.id !== productId));
    };

    const handleTaxRegimeChange = (regime: string) => {
        setSelectedTaxRegime(regime);
        
        // Definir valores padrão para cada regime
        switch (regime) {
            case 'lucro_real':
                setPisCofins('3,65');
                setIss('5,00');
                setCsllIr('8,88');
                break;
            case 'lucro_presumido':
                setPisCofins('3,65');
                setIss('5,00');
                setCsllIr('4,80');
                break;
            case 'lucro_real_reduzido':
                setPisCofins('1,65');
                setIss('2,00');
                setCsllIr('4,80');
                break;
            case 'simples_nacional':
                setPisCofins('0,00');
                setIss('0,00');
                setCsllIr('6,00');
                break;
            default:
                break;
        }
    };

    const createNewProposal = () => {
        setCurrentProposal(null);
        setClientData({ name: '', email: '', phone: '' });
        setAccountManagerData({ name: '', email: '', phone: '' });
        setAddedProducts([]);
        setViewMode('client-form');
    };

    const editProposal = (proposal: Proposal) => {
        setCurrentProposal(proposal);
        setClientData(proposal.client);
        setAccountManagerData(proposal.accountManager);
        setAddedProducts(proposal.products);
        setViewMode('calculator');
    };

    const deleteProposal = async (proposalId: string) => {
        if (!db) {
            console.error('Firebase não está disponível');
            return;
        }
        
        if (window.confirm('Tem certeza que deseja excluir esta proposta?')) {
            try {
                await deleteDoc(doc(db, 'proposals', proposalId));
                setProposals(proposals.filter(p => p.id !== proposalId));
            } catch (error) {
                console.error('Erro ao excluir proposta:', error);
                alert('Falha ao excluir a proposta.');
            }
        }
    };

    const handleSaveProposal = async () => {
        if (!user) {
            alert('Você precisa estar logado para salvar uma proposta.');
            return;
        }

        const totalSetup = addedProducts.reduce((acc, product) => acc + product.setup, 0);
        const totalMonthly = addedProducts.reduce((acc, product) => acc + product.monthly, 0);

        const proposalData = {
            userId: user.uid,
            client: clientData,
            accountManager: accountManagerData,
            products: addedProducts,
            totalSetup,
            totalMonthly,
            createdAt: serverTimestamp(),
        };

        try {
            if (currentProposal) {
                // Atualizar proposta existente
                const proposalRef = doc(db, 'proposals', currentProposal.id);
                await updateDoc(proposalRef, proposalData);
                alert('Proposta atualizada com sucesso!');
            } else {
                // Criar nova proposta
                const docRef = await addDoc(collection(db, 'proposals'), proposalData);
                alert('Proposta salva com sucesso!');
                setCurrentProposal({ ...proposalData, id: docRef.id, createdAt: new Date().toISOString() });
            }
            // Atualizar a lista de propostas
            const q = user.role === 'admin' ? query(collection(db, 'proposals')) : query(collection(db, 'proposals'), where('userId', '==', user.uid));
            const querySnapshot = await getDocs(q);
            const proposalsData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Proposal));
            setProposals(proposalsData);
            setViewMode('search');
        } catch (error) {
            console.error('Erro ao salvar proposta:', error);
            alert('Ocorreu um erro ao salvar a proposta.');
        }
    };

    return (
        <>
            <div className="p-4 md:p-8 print-hide">
                {viewMode === 'search' ? (
                    <Card className="bg-slate-900/80 border-slate-800 text-white">
                        <CardHeader>
                            <CardTitle>Buscar Propostas</CardTitle>
                            <CardDescription>Encontre propostas existentes ou crie uma nova.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center mb-4">
                                <Input
                                    type="text"
                                    placeholder="Buscar por cliente..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="max-w-sm bg-slate-800 border-slate-700 text-white"
                                />
                                <Button onClick={createNewProposal} className="bg-blue-600 hover:bg-blue-700">
                                    <PlusCircle className="mr-2 h-4 w-4" /> Nova Proposta
                                </Button>
                            </div>
                            <div className="space-y-4">
                                {proposals
                                    .filter(p => p.client.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                    .map((p: Proposal) => (
                                        <div key={p.id} className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                                            <div>
                                                <p className="font-semibold">{p.client.name}</p>
                                                <p className="text-sm text-slate-400">Total: {formatCurrency(p.totalMonthly)}/mês + {formatCurrency(p.totalSetup)} setup</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button variant="outline" size="sm" onClick={() => editProposal(p)}>
                                                    <FilePenLine className="mr-2 h-4 w-4" /> Editar
                                                </Button>
                                                <Button variant="destructive" size="sm" onClick={() => deleteProposal(p.id)}>
                                                    <Trash2 className="mr-2 h-4 w-4" /> Excluir
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-white">Calculadora de Máquinas Virtuais</h1>
                                    <p className="text-slate-400 mt-2">Configure e calcule os custos para VMs na nuvem</p>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => setViewMode('search')}
                                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                >
                                    ← Voltar para Buscar
                                </Button>
                            </div>
                            {viewMode === 'client-form' || showClientForm ? (
                                <ClientManagerForm
                                    clientData={clientData}
                                    accountManagerData={accountManagerData}
                                    onClientDataChange={setClientData}
                                    onAccountManagerDataChange={setAccountManagerData}
                                    onBack={() => {
                                        setShowClientForm(false);
                                        if (viewMode === 'client-form') {
                                            setViewMode('search');
                                        }
                                    }}
                                    onContinue={() => {
                                        setShowClientForm(false);
                                        if (viewMode === 'client-form') {
                                            setViewMode('calculator');
                                        }
                                    }}
                                />
                            ) : (
                                <ClientManagerInfo
                                    clientData={clientData}
                                    accountManagerData={accountManagerData}
                                />
                            )}
                        </div>

                        <div>
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="grid w-full grid-cols-3 bg-slate-800">
                                    <TabsTrigger value="calculator">Calculadora VM</TabsTrigger>
                                    <TabsTrigger value="list-price">Tabela de Preços VM/Configurações</TabsTrigger>
                                    <TabsTrigger value="proposal">Resumo da Proposta</TabsTrigger>
                                </TabsList>
                                <TabsContent value="calculator">
                                    <div className="mt-6">
                                        {/* Configurar Máquina Virtual */}
                                        <Card className="bg-slate-900/80 border-slate-800 text-white">
                                            <CardHeader>
                                                <div className="flex justify-between items-center">
                                                    <CardTitle className="text-cyan-400 flex items-center gap-2">
                                                        <Server className="h-5 w-5" />
                                                        Configurar Máquina Virtual
                                                    </CardTitle>
                                                    <div className="flex gap-2">
                                                        <Button variant="outline" className="bg-blue-600 text-white border-blue-600">
                                                            <Brain className="h-4 w-4 mr-2" />
                                                            Sugestão IA
                                                        </Button>
                                                        <Button variant="outline" className="bg-blue-600 text-white border-blue-600">
                                                            <Plus className="h-4 w-4 mr-2" />
                                                            Adicionar à Proposta
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-6">
                                                {/* Nome da VM */}
                                                <div>
                                                    <Label className="flex items-center gap-2 mb-2">
                                                        <Edit className="h-4 w-4" />
                                                        Nome da VM
                                                    </Label>
                                                    <Input 
                                                        value={vmName} 
                                                        onChange={(e) => setVmName(e.target.value)}
                                                        className="bg-slate-800 border-slate-700 text-white" 
                                                    />
                                                </div>

                                                {/* vCPU Cores e Memória RAM */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <Label className="flex items-center gap-2 mb-2">
                                                            <Cpu className="h-4 w-4" />
                                                            vCPU Cores
                                                        </Label>
                                                        <Input 
                                                            type="number" 
                                                            value={vmCpuCores} 
                                                            onChange={(e) => setVmCpuCores(Number(e.target.value))}
                                                            className="bg-slate-800 border-slate-700 text-white" 
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="flex items-center gap-2 mb-2">
                                                            <MemoryStick className="h-4 w-4" />
                                                            Memória RAM (GB)
                                                        </Label>
                                                        <Input 
                                                            type="number" 
                                                            value={vmRamGb} 
                                                            onChange={(e) => setVmRamGb(Number(e.target.value))}
                                                            className="bg-slate-800 border-slate-700 text-white" 
                                                        />
                                                    </div>
                                                </div>

                                                {/* Tipo de Armazenamento */}
                                                <div>
                                                    <Label className="flex items-center gap-2 mb-2">
                                                        <HardDrive className="h-4 w-4" />
                                                        Tipo de Armazenamento
                                                    </Label>
                                                    <Select value={vmStorageType} onValueChange={setVmStorageType}>
                                                        <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-slate-800 text-white">
                                                            <SelectItem value="HDD SAS">HDD SAS</SelectItem>
                                                            <SelectItem value="SSD Performance">SSD Performance</SelectItem>
                                                            <SelectItem value="NVMe">NVMe</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                {/* Armazenamento */}
                                                <div>
                                                    <Label className="flex items-center gap-2 mb-2">
                                                        <HardDrive className="h-4 w-4" />
                                                        Armazenamento {vmStorageType} (GB)
                                                    </Label>
                                                    <Input 
                                                        type="number" 
                                                        value={vmStorageSize} 
                                                        onChange={(e) => setVmStorageSize(Number(e.target.value))}
                                                        className="bg-slate-800 border-slate-700 text-white" 
                                                    />
                                                </div>

                                                {/* Placa de Rede */}
                                                <div>
                                                    <Label className="flex items-center gap-2 mb-2">
                                                        <Network className="h-4 w-4" />
                                                        Placa de Rede
                                                    </Label>
                                                    <Select value={vmNetworkSpeed} onValueChange={setVmNetworkSpeed}>
                                                        <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-slate-800 text-white">
                                                            <SelectItem value="1 Gbps">1 Gbps</SelectItem>
                                                            <SelectItem value="10 Gbps">10 Gbps</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                {/* Sistema Operacional */}
                                                <div>
                                                    <Label className="flex items-center gap-2 mb-2">
                                                        <Settings className="h-4 w-4" />
                                                        Sistema Operacional
                                                    </Label>
                                                    <Select value={vmOperatingSystem} onValueChange={setVmOperatingSystem}>
                                                        <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-slate-800 text-white">
                                                            <SelectItem value="Ubuntu Server 22.04 LTS">Ubuntu Server 22.04 LTS</SelectItem>
                                                            <SelectItem value="Windows Server 2022 Standard">Windows Server 2022 Standard</SelectItem>
                                                            <SelectItem value="Windows 10 Pro">Windows 10 Pro</SelectItem>
                                                            <SelectItem value="CentOS Stream 9">CentOS Stream 9</SelectItem>
                                                            <SelectItem value="Debian 12">Debian 12</SelectItem>
                                                            <SelectItem value="Rocky Linux 9">Rocky Linux 9</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                {/* Serviços Adicionais */}
                                                <div>
                                                    <h3 className="text-cyan-400 text-lg font-semibold mb-4">Serviços Adicionais</h3>
                                                    
                                                    {/* Backup em Bloco */}
                                                    <div className="mb-4">
                                                        <Label className="mb-2 block">
                                                            Backup em Bloco: <span className="text-cyan-400">{vmBackupSize} GB</span>
                                                        </Label>
                                                        <Input 
                                                            type="number" 
                                                            value={vmBackupSize} 
                                                            onChange={(e) => setVmBackupSize(Number(e.target.value))}
                                                            className="bg-slate-800 border-slate-700 text-white" 
                                                            placeholder="0"
                                                        />
                                                    </div>

                                                    {/* Checkboxes para serviços adicionais */}
                                                    <div className="space-y-3">
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox 
                                                                id="vmAdditionalIp" 
                                                                checked={vmAdditionalIp} 
                                                                onCheckedChange={(checked) => setVmAdditionalIp(Boolean(checked))}
                                                                className="border-cyan-400"
                                                            />
                                                            <Label htmlFor="vmAdditionalIp" className="text-white">IP Adicional</Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox 
                                                                id="vmSnapshot" 
                                                                checked={vmSnapshot} 
                                                                onCheckedChange={(checked) => setVmSnapshot(Boolean(checked))}
                                                                className="border-cyan-400"
                                                            />
                                                            <Label htmlFor="vmSnapshot" className="text-white">Snapshot Adicional</Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox 
                                                                id="vmVpnSiteToSite" 
                                                                checked={vmVpnSiteToSite} 
                                                                onCheckedChange={(checked) => setVmVpnSiteToSite(Boolean(checked))}
                                                                className="border-cyan-400"
                                                            />
                                                            <Label htmlFor="vmVpnSiteToSite" className="text-white">VPN Site-to-Site</Label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Período Contratual */}
                                        <Card className="bg-slate-900/80 border-slate-800 text-white">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <Settings className="h-5 w-5" />
                                                    <span className="text-cyan-400">Período Contratual</span>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-4">
                                                    <div>
                                                        <Label className="text-white mb-3 block">Selecione o período de contrato:</Label>
                                                        <div className="grid grid-cols-5 gap-3">
                                                            {[12, 24, 36, 48, 60].map((months) => (
                                                                <Button
                                                                    key={months}
                                                                    variant={vmContractPeriod === months ? "default" : "outline"}
                                                                    className={`${
                                                                        vmContractPeriod === months 
                                                                            ? "bg-cyan-600 text-white border-cyan-600" 
                                                                            : "bg-slate-800 text-white border-slate-600 hover:bg-slate-700"
                                                                    }`}
                                                                    onClick={() => setVmContractPeriod(months)}
                                                                >
                                                                    {months} meses
                                                                </Button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="text-sm text-slate-400">
                                                        Período selecionado: <span className="text-cyan-400 font-semibold">{vmContractPeriod} meses</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Resultado do Cálculo da VM */}
                                        <Card className="bg-slate-900/80 border-slate-800 text-white">
                                            <CardHeader>
                                                <CardTitle className="flex items-center">
                                                    <Calculator className="mr-2" />
                                                    Resultado da Configuração
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <Label className="text-cyan-400">Resumo da VM:</Label>
                                                            <div className="text-sm space-y-1 mt-2">
                                                                <div>Nome: {vmName}</div>
                                                                <div>vCPU: {vmCpuCores} cores</div>
                                                                <div>RAM: {vmRamGb} GB</div>
                                                                <div>Armazenamento: {vmStorageSize} GB {vmStorageType}</div>
                                                                <div>Rede: {vmNetworkSpeed}</div>
                                                                <div>OS: {vmOperatingSystem}</div>
                                                                <div>Contrato: {vmContractPeriod} meses</div>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <Label className="text-cyan-400">Serviços Adicionais:</Label>
                                                            <div className="text-sm space-y-1 mt-2">
                                                                {vmBackupSize > 0 && <div>Backup: {vmBackupSize} GB</div>}
                                                                {vmAdditionalIp && <div>IP Adicional</div>}
                                                                {vmSnapshot && <div>Snapshot Adicional</div>}
                                                                {vmVpnSiteToSite && <div>VPN Site-to-Site</div>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                            <CardFooter className="flex-col items-start">
                                                <div className="w-full">
                                                    <Separator className="bg-slate-700 my-4" />
                                                    <div className="text-lg font-bold mb-2">Cálculo de Preços:</div>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between"><span>Custo Base:</span> <span>{formatCurrency(calculateVMCost)}</span></div>
                                                        <div className="flex justify-between"><span>Impostos ({totalTaxes.toFixed(2)}%):</span> <span>{formatCurrency(calculateVMCost * (totalTaxes / 100))}</span></div>
                                                        <div className="flex justify-between"><span>Lucro (Margem de {estimatedNetMargin.toFixed(2)}%):</span> <span>{formatCurrency((calculateVMCost + calculateVMCost * (totalTaxes / 100)) * (markup / 100))}</span></div>
                                                        {contractDiscount > 0 && (
                                                            <div className="flex justify-between text-orange-400"><span>Desconto Contrato ({contractDiscount}%):</span> <span>-{formatCurrency(((calculateVMCost + calculateVMCost * (totalTaxes / 100)) * (1 + markup / 100)) * (contractDiscount / 100))}</span></div>
                                                        )}
                                                        <div className="flex justify-between"><span>Taxa de Setup:</span> <span>R$ {setupFee.toFixed(2)}</span></div>
                                                        <div className="flex justify-between text-yellow-400"><span>Comissão ({commissionPercentage}%):</span> <span>{formatCurrency(vmFinalPrice * (commissionPercentage / 100))}</span></div>
                                                        <Separator className="bg-slate-700 my-2" />
                                                        <div className="flex justify-between text-green-400 font-bold text-lg">
                                                            <span>Total Mensal:</span> 
                                                            <span>{formatCurrency(vmFinalPrice)}</span>
                                                        </div>
                                                        {contractDiscount > 0 && (
                                                            <div className="text-sm text-orange-400 mt-2">
                                                                💰 Desconto de {contractDiscount}% aplicado por contrato de {vmContractPeriod} meses
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="space-y-2 mt-4">
                                                        <Button 
                                                            className="w-full bg-green-600 hover:bg-green-700"
                                                            onClick={handleAddVMProduct}
                                                        >
                                                            Adicionar à Proposta
                                                        </Button>
                                                        {addedProducts.length > 0 && (
                                                            <Button 
                                                                variant="outline"
                                                                className="w-full bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                                                                onClick={() => setActiveTab('proposal')}
                                                            >
                                                                Ver Resumo da Proposta ({addedProducts.length} {addedProducts.length === 1 ? 'item' : 'itens'})
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardFooter>
                                        </Card>
                                    </div>
                                </TabsContent>
                                <TabsContent value="list-price">
                                    <div className="space-y-6 mt-6">
                                        {/* Tributos */}
                                        <Card className="bg-slate-900/80 border-slate-800 text-white">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <Calculator className="h-5 w-5" />
                                                    Tributos
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex gap-4 mb-6">
                                                    <Button 
                                                        variant="outline" 
                                                        className={selectedTaxRegime === 'lucro_real' ? "bg-blue-600 text-white border-blue-600" : "bg-slate-700 text-white border-slate-600"}
                                                        onClick={() => handleTaxRegimeChange('lucro_real')}
                                                    >
                                                        Lucro Real
                                                    </Button>
                                                    <Button 
                                                        variant="outline" 
                                                        className={selectedTaxRegime === 'lucro_presumido' ? "bg-blue-600 text-white border-blue-600" : "bg-slate-700 text-white border-slate-600"}
                                                        onClick={() => handleTaxRegimeChange('lucro_presumido')}
                                                    >
                                                        Lucro Presumido
                                                    </Button>
                                                    <Button 
                                                        variant="outline" 
                                                        className={selectedTaxRegime === 'lucro_real_reduzido' ? "bg-blue-600 text-white border-blue-600" : "bg-slate-700 text-white border-slate-600"}
                                                        onClick={() => handleTaxRegimeChange('lucro_real_reduzido')}
                                                    >
                                                        Lucro Real Reduzido
                                                    </Button>
                                                    <Button 
                                                        variant="outline" 
                                                        className={selectedTaxRegime === 'simples_nacional' ? "bg-blue-600 text-white border-blue-600" : "bg-slate-700 text-white border-slate-600"}
                                                        onClick={() => handleTaxRegimeChange('simples_nacional')}
                                                    >
                                                        Simples Nacional
                                                    </Button>
                                                </div>
                                                <div className="grid grid-cols-3 gap-6">
                                                    <div>
                                                        <Label>PIS/COFINS (%)</Label>
                                                        <Input 
                                                            value={pisCofins} 
                                                            onChange={(e) => setPisCofins(e.target.value)}
                                                            className="bg-slate-800 border-slate-700" 
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>ISS (%)</Label>
                                                        <Input 
                                                            value={iss} 
                                                            onChange={(e) => setIss(e.target.value)}
                                                            className="bg-slate-800 border-slate-700" 
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>CSLL/IR (%)</Label>
                                                        <Input 
                                                            value={csllIr} 
                                                            onChange={(e) => setCsllIr(e.target.value)}
                                                            className="bg-slate-800 border-slate-700" 
                                                        />
                                                    </div>
                                                </div>
                                                <div className="mt-4 text-center text-cyan-400 text-lg font-semibold">
                                                    Total de Impostos do Regime Selecionado: {totalTaxes.toFixed(2).replace('.', ',')}%
                                                </div>
                                                <p className="text-sm text-slate-400 mt-2">
                                                    Edite os impostos de cada regime tributário. Os valores são percentuais e aceitam até 2 casas decimais.
                                                </p>
                                            </CardContent>
                                        </Card>

                                        {/* Markup e Margem Líquida */}
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <Card className="bg-slate-900/80 border-slate-800 text-white">
                                                <CardHeader>
                                                    <CardTitle className="text-cyan-400">Markup e Margem Líquida</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                        <div>
                                                            <Label htmlFor="markup-cost">Markup (%)</Label>
                                                            <Input 
                                                                id="markup-cost"
                                                                type="number" 
                                                                value={markup}
                                                                onChange={(e) => setMarkup(parseFloat(e.target.value) || 0)}
                                                                className="bg-slate-800 border-slate-700" 
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label htmlFor="commission-percentage">Comissão (%)</Label>
                                                            <Input 
                                                                id="commission-percentage"
                                                                type="number" 
                                                                value={commissionPercentage}
                                                                onChange={(e) => setCommissionPercentage(parseFloat(e.target.value) || 0)}
                                                                className="bg-slate-800 border-slate-700" 
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label htmlFor="estimated-net-margin">Margem Líquida (%)</Label>
                                                            <Input 
                                                                id="estimated-net-margin" 
                                                                type="number" 
                                                                value={estimatedNetMargin.toFixed(2)} 
                                                                readOnly 
                                                                className="bg-slate-800 border-slate-700 text-white cursor-not-allowed" 
                                                            />
                                                        </div>
                                                    </div>
                                                    <Separator className="my-4 bg-slate-700" />
                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex justify-between font-semibold text-green-500">
                                                            <span>Valor do Markup</span>
                                                            <span>{formatCurrency(markupValue)}</span>
                                                        </div>
                                                        <div className="flex justify-between font-semibold text-orange-500">
                                                            <span>Valor da Comissão</span>
                                                            <span>{formatCurrency(commissionValue)}</span>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                        </div>

                                        {/* Recursos Base (Custos) */}
                                        <Card className="bg-slate-900/80 border-slate-800 text-white">
                                            <CardHeader>
                                                <CardTitle className="text-cyan-400">Recursos Base (Custos)</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                    <div>
                                                        <h4 className="text-cyan-400 mb-4">vCPU Windows (por core)</h4>
                                                        <div>
                                                            <Label>Custo Mensal</Label>
                                                            <Input defaultValue="45,5" className="bg-slate-800 border-slate-700" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-cyan-400 mb-4">vCPU Linux (por core)</h4>
                                                        <div>
                                                            <Label>Custo Mensal</Label>
                                                            <Input defaultValue="26,44" className="bg-slate-800 border-slate-700" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-6">
                                                    <h4 className="text-cyan-400 mb-4">RAM (por GB)</h4>
                                                    <div>
                                                        <Label>Custo Mensal</Label>
                                                        <Input defaultValue="11,13" className="bg-slate-800 border-slate-700" />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Armazenamento (Custos) */}
                                        <Card className="bg-slate-900/80 border-slate-800 text-white">
                                            <CardHeader>
                                                <CardTitle className="text-cyan-400">Armazenamento (Custos)</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                                    <div>
                                                        <h4 className="text-cyan-400 mb-4">HDD SAS</h4>
                                                        <div>
                                                            <Label>Custo Mensal</Label>
                                                            <Input defaultValue="0,2" className="bg-slate-800 border-slate-700" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-cyan-400 mb-4">SSD Performance</h4>
                                                        <div>
                                                            <Label>Custo Mensal</Label>
                                                            <Input defaultValue="0,35" className="bg-slate-800 border-slate-700" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-cyan-400 mb-4">NVMe</h4>
                                                        <div>
                                                            <Label>Custo Mensal</Label>
                                                            <Input defaultValue="0,45" className="bg-slate-800 border-slate-700" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Placa de Rede e Sistema Operacional */}
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <Card className="bg-slate-900/80 border-slate-800 text-white">
                                                <CardHeader>
                                                    <CardTitle className="text-cyan-400">Placa de Rede (Custos)</CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    <div>
                                                        <h4 className="text-cyan-400 mb-2">1 Gbps</h4>
                                                        <div>
                                                            <Label>Custo Mensal</Label>
                                                            <Input defaultValue="0" className="bg-slate-800 border-slate-700" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-cyan-400 mb-2">10 Gbps</h4>
                                                        <div>
                                                            <Label>Custo Mensal</Label>
                                                            <Input defaultValue="100" className="bg-slate-800 border-slate-700" />
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            <Card className="bg-slate-900/80 border-slate-800 text-white">
                                                <CardHeader>
                                                    <CardTitle className="text-cyan-400">Sistema Operacional e Serviços (Custos)</CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <h4 className="text-cyan-400 mb-2">Windows Server 2022 Standard</h4>
                                                            <div>
                                                                <Label>Custo Mensal</Label>
                                                                <Input defaultValue="135" className="bg-slate-800 border-slate-700" />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <h4 className="text-cyan-400 mb-2">Windows 10 Pro</h4>
                                                            <div>
                                                                <Label>Custo Mensal</Label>
                                                                <Input defaultValue="120" className="bg-slate-800 border-slate-700" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <h4 className="text-cyan-400 mb-2">Ubuntu Server 22.04 LTS</h4>
                                                            <div>
                                                                <Label>Custo Mensal</Label>
                                                                <Input defaultValue="0" className="bg-slate-800 border-slate-700" />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <h4 className="text-cyan-400 mb-2">CentOS Stream 9</h4>
                                                            <div>
                                                                <Label>Custo Mensal</Label>
                                                                <Input defaultValue="0" className="bg-slate-800 border-slate-700" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <h4 className="text-cyan-400 mb-2">Debian 12</h4>
                                                            <div>
                                                                <Label>Custo Mensal</Label>
                                                                <Input defaultValue="0" className="bg-slate-800 border-slate-700" />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <h4 className="text-cyan-400 mb-2">Rocky Linux 9</h4>
                                                            <div>
                                                                <Label>Custo Mensal</Label>
                                                                <Input defaultValue="0" className="bg-slate-800 border-slate-700" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* Serviços Adicionais */}
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <Card className="bg-slate-900/80 border-slate-800 text-white">
                                                <CardHeader>
                                                    <CardTitle className="text-cyan-400">Backup (por GB)</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div>
                                                        <Label>Custo Mensal</Label>
                                                        <Input defaultValue="1,25" className="bg-slate-800 border-slate-700" />
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            <Card className="bg-slate-900/80 border-slate-800 text-white">
                                                <CardHeader>
                                                    <CardTitle className="text-cyan-400">IP Adicional</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div>
                                                        <Label>Custo Mensal</Label>
                                                        <Input defaultValue="35" className="bg-slate-800 border-slate-700" />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* Snapshot e VPN */}
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <Card className="bg-slate-900/80 border-slate-800 text-white">
                                                <CardHeader>
                                                    <CardTitle className="text-cyan-400">Snapshot Adicional</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div>
                                                        <Label>Custo Mensal</Label>
                                                        <Input defaultValue="15" className="bg-slate-800 border-slate-700" />
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            <Card className="bg-slate-900/80 border-slate-800 text-white">
                                                <CardHeader>
                                                    <CardTitle className="text-cyan-400">VPN Site-to-Site</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div>
                                                        <Label>Custo Mensal</Label>
                                                        <Input defaultValue="250" className="bg-slate-800 border-slate-700" />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* Prazos Contratuais e Descontos */}
                                        <Card className="bg-slate-900/80 border-slate-800 text-white">
                                            <CardHeader>
                                                <CardTitle className="text-cyan-400">Prazos Contratuais e Descontos</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                                                    <div>
                                                        <h4 className="text-cyan-400 mb-2">12 Meses</h4>
                                                        <div>
                                                            <Label>Desconto (%)</Label>
                                                            <Input defaultValue="0" className="bg-slate-800 border-slate-700" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-cyan-400 mb-2">24 Meses</h4>
                                                        <div>
                                                            <Label>Desconto (%)</Label>
                                                            <Input defaultValue="5" className="bg-slate-800 border-slate-700" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-cyan-400 mb-2">36 Meses</h4>
                                                        <div>
                                                            <Label>Desconto (%)</Label>
                                                            <Input defaultValue="10" className="bg-slate-800 border-slate-700" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-cyan-400 mb-2">48 Meses</h4>
                                                        <div>
                                                            <Label>Desconto (%)</Label>
                                                            <Input defaultValue="15" className="bg-slate-800 border-slate-700" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-cyan-400 mb-2">60 Meses</h4>
                                                        <div>
                                                            <Label>Desconto (%)</Label>
                                                            <Input defaultValue="20" className="bg-slate-800 border-slate-700" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Taxa de Setup */}
                                        <Card className="bg-slate-900/80 border-slate-800 text-white">
                                            <CardHeader>
                                                <CardTitle className="text-cyan-400">Taxa de Setup</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div>
                                                    <h4 className="text-cyan-400 mb-4">Taxa de Setup Geral</h4>
                                                    <div>
                                                        <Label>Valor Base</Label>
                                                        <Input defaultValue="0" className="bg-slate-800 border-slate-700" />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Gestão e Suporte */}
                                        <Card className="bg-slate-900/80 border-slate-800 text-white">
                                            <CardHeader>
                                                <CardTitle className="text-cyan-400">Gestão e Suporte</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div>
                                                    <h4 className="text-cyan-400 mb-4">Serviço Mensal de Gestão e Suporte</h4>
                                                    <div>
                                                        <Label>Valor Mensal</Label>
                                                        <Input defaultValue="250" className="bg-slate-800 border-slate-700" />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Botão Salvar */}
                                        <div className="flex justify-end">
                                            <Button className="bg-blue-600 hover:bg-blue-700">
                                                <Save className="h-4 w-4 mr-2" />
                                                Salvar Configurações
                                            </Button>
                                        </div>
                                    </div>
                                </TabsContent>
                                <TabsContent value="proposal">
                                    <div className="space-y-6 mt-6">
                                        <Card className="bg-slate-900/80 border-slate-800 text-white">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <FileText className="h-5 w-5" />
                                                    Resumo da Proposta
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                {addedProducts.length === 0 ? (
                                                    <div className="text-center py-8 text-slate-400">
                                                        <Server className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                                        <p>Nenhuma VM adicionada à proposta ainda.</p>
                                                        <p className="text-sm">Configure uma VM na aba "Calculadora VM" e clique em "Adicionar à Proposta".</p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Table>
                                                            <TableHeader>
                                                                <TableRow className="border-slate-700">
                                                                    <TableHead className="text-white">Descrição</TableHead>
                                                                    <TableHead className="text-white">Setup</TableHead>
                                                                    <TableHead className="text-white">Mensal</TableHead>
                                                                    <TableHead className="text-white w-20">Ações</TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {addedProducts.map(p => (
                                                                    <TableRow key={p.id} className="border-slate-800">
                                                                        <TableCell className="text-white">{p.description}</TableCell>
                                                                        <TableCell className="text-white">{formatCurrency(p.setup)}</TableCell>
                                                                        <TableCell className="text-white">{formatCurrency(p.monthly)}</TableCell>
                                                                        <TableCell>
                                                                            <Button 
                                                                                variant="destructive" 
                                                                                size="sm" 
                                                                                onClick={() => handleRemoveProduct(p.id)}
                                                                            >
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </Button>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                        
                                                        <div className="flex justify-between items-center pt-4 border-t border-slate-700">
                                                            <div className="text-lg font-semibold">
                                                                Total Setup: <span className="text-green-400">{formatCurrency(addedProducts.reduce((sum, p) => sum + p.setup, 0))}</span>
                                                            </div>
                                                            <div className="text-lg font-semibold">
                                                                Total Mensal: <span className="text-green-400">{formatCurrency(addedProducts.reduce((sum, p) => sum + p.monthly, 0))}</span>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex gap-4 pt-4">
                                                            <Button 
                                                                className="bg-green-600 hover:bg-green-700"
                                                                onClick={() => setActiveTab('calculator')}
                                                            >
                                                                <Plus className="h-4 w-4 mr-2" />
                                                                Adicionar Mais VMs
                                                            </Button>
                                                            <Button 
                                                                variant="outline"
                                                                className="bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                                                            >
                                                                <Download className="h-4 w-4 mr-2" />
                                                                Gerar Proposta
                                                            </Button>
                                                        </div>
                                                    </>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>



                        <div className="flex justify-end gap-4 mt-8">
                            <Button onClick={handleSaveProposal} className="bg-green-600 hover:bg-green-700"><Save className="h-4 w-4 mr-2" />Salvar Proposta</Button>
                            <Button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700" disabled={addedProducts.length === 0}><Download className="h-4 w-4 mr-2" />Gerar PDF</Button>
                            <Button variant="outline" onClick={() => setViewMode('search')}>Cancelar</Button>
                        </div>
                    </>
                )}
            </div >

            <div id="print-area" className="print-only">
                {currentProposal && (
                    <>
                        <div className="print-header">
                            <h1>Proposta Comercial</h1>
                            <p><strong>Proposta ID:</strong> {currentProposal.id}</p>
                            <p><strong>Cliente:</strong> {clientData.name}</p>
                            <p><strong>Gerente:</strong> {accountManagerData.name}</p>
                            <p><strong>Data:</strong> {new Date(currentProposal.createdAt).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <h2>Itens da Proposta</h2>
                        <table className="print-table">
                            <thead><tr><th>Descrição</th><th>Setup</th><th>Mensal</th></tr></thead>
                            <tbody>
                                {addedProducts.map(p => (
                                    <tr key={p.id}><td>{p.description}</td><td>{formatCurrency(p.setup)}</td><td>{formatCurrency(p.monthly)}</td></tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="print-totals">
                            <h3>Total Geral</h3>
                            <p><strong>Total Instalação:</strong> {formatCurrency(addedProducts.reduce((sum, p) => sum + p.setup, 0))}</p>
                            <p><strong>Total Mensal:</strong> {formatCurrency(addedProducts.reduce((sum, p) => sum + p.monthly, 0))}</p>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

export default MaquinasVirtuaisCalculator;
