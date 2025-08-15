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
    Network
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ClientManagerForm, ClientData, AccountManagerData } from './ClientManagerForm';
import { ClientManagerInfo } from './ClientManagerInfo';

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
type ProductType = 'VM_BASICA' | 'VM_AVANCADA' | 'VM_PREMIUM';

interface Product {
    id: string;
    type: ProductType;
    description: string;
    setup: number;
    monthly: number;
    details: any;
}

interface Proposal {
    id: string;
    client: ClientData;
    accountManager: AccountManagerData;
    products: Product[];
    totalSetup: number;
    totalMonthly: number;
    createdAt: string;
}

const MaquinasVirtuaisCalculator: React.FC = () => {
    // Estados de gerenciamento de propostas
    const [currentProposal, setCurrentProposal] = useState<Proposal | null>(null);
    const [viewMode, setViewMode] = useState<'search' | 'client-form' | 'calculator'>('search');
    const [proposals, setProposals] = useState<Proposal[]>([]);
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

    // Estados para regime tributário
    const [selectedTaxRegime, setSelectedTaxRegime] = useState<string>('lucro_real');
    const [pisCofins, setPisCofins] = useState<string>('3,65');
    const [iss, setIss] = useState<string>('5,00');
    const [csllIr, setCsllIr] = useState<string>('8,88');

    // Estados para configurações de preço
    const [markup, setMarkup] = useState<number>(30);
    const [setupFee, setSetupFee] = useState<number>(500);

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

    // Efeitos para cálculos e salvar propostas
    useEffect(() => {
        const savedProposals = localStorage.getItem('proposals');
        if (savedProposals) {
            setProposals(JSON.parse(savedProposals));
        }
    }, []);

    useEffect(() => {
        calculatePabxPrice();
    }, [pabxExtensions, pabxIncludeDevices, pabxDeviceQuantity, pabxIncludeSetup, includeAIAgent, selectedAIAgentPlan]);

    useEffect(() => {
        const plan = sipPlans.find(p => p.name === selectedSipPlan);
        if (plan && !plan.monthlyWithEquipment && sipWithEquipment) {
            setSipWithEquipment(false);
        } else {
            calculateSipPrice();
        }
    }, [selectedSipPlan, sipAdditionalChannels, sipWithEquipment, sipIncludeSetup]);

    // Função para alterar regime tributário
    const handleTaxRegimeChange = (regime: string) => {
        setSelectedTaxRegime(regime);
        
        // Definir valores dos impostos conforme o regime
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
                setPisCofins('0,00');
                setIss('5,00');
                setCsllIr('2,40');
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

    // Cálculo dos impostos totais
    const totalTaxes = useMemo(() => {
        return parseFloat(pisCofins.replace(',', '.')) + 
               parseFloat(iss.replace(',', '.')) + 
               parseFloat(csllIr.replace(',', '.'));
    }, [pisCofins, iss, csllIr]);

    // Função para calcular o custo da VM
    const calculateVMCost = useMemo(() => {
        let totalCost = 0;

        // Custo vCPU baseado no OS
        const isWindows = vmOperatingSystem.includes('Windows');
        const vcpuCost = isWindows ? vcpuWindowsCost : vcpuLinuxCost;
        totalCost += vmCpuCores * vcpuCost;

        // Custo RAM
        totalCost += vmRamGb * ramCost;

        // Custo Armazenamento
        let storageCost = 0;
        switch (vmStorageType) {
            case 'HDD SAS':
                storageCost = hddSasCost;
                break;
            case 'SSD Performance':
                storageCost = ssdPerformanceCost;
                break;
            case 'NVMe':
                storageCost = nvmeCost;
                break;
        }
        totalCost += vmStorageSize * storageCost;

        // Custo Rede
        if (vmNetworkSpeed === '10 Gbps') {
            totalCost += network10GbpsCost;
        }

        // Custo Sistema Operacional
        switch (vmOperatingSystem) {
            case 'Windows Server 2022 Standard':
                totalCost += windowsServerCost;
                break;
            case 'Windows 10 Pro':
                totalCost += windows10ProCost;
                break;
            case 'Ubuntu Server 22.04 LTS':
                totalCost += ubuntuCost;
                break;
            case 'CentOS Stream 9':
                totalCost += centosCost;
                break;
            case 'Debian 12':
                totalCost += debianCost;
                break;
            case 'Rocky Linux 9':
                totalCost += rockyLinuxCost;
                break;
        }

        // Serviços Adicionais
        if (vmBackupSize > 0) {
            totalCost += vmBackupSize * backupCostPerGb;
        }
        if (vmAdditionalIp) {
            totalCost += additionalIpCost;
        }
        if (vmSnapshot) {
            totalCost += snapshotCost;
        }
        if (vmVpnSiteToSite) {
            totalCost += vpnSiteToSiteCost;
        }

        return totalCost;
    }, [
        vmCpuCores, vmRamGb, vmStorageType, vmStorageSize, vmNetworkSpeed, vmOperatingSystem,
        vmBackupSize, vmAdditionalIp, vmSnapshot, vmVpnSiteToSite,
        vcpuWindowsCost, vcpuLinuxCost, ramCost, hddSasCost, ssdPerformanceCost, nvmeCost,
        network1GbpsCost, network10GbpsCost, windowsServerCost, windows10ProCost, ubuntuCost,
        centosCost, debianCost, rockyLinuxCost, backupCostPerGb, additionalIpCost, snapshotCost, vpnSiteToSiteCost
    ]);

    // Cálculo do desconto por período contratual
    const contractDiscount = useMemo(() => {
        switch (vmContractPeriod) {
            case 12: return 0; // 0% desconto para 12 meses
            case 24: return 5; // 5% desconto para 24 meses
            case 36: return 10; // 10% desconto para 36 meses
            case 48: return 15; // 15% desconto para 48 meses
            case 60: return 20; // 20% desconto para 60 meses
            default: return 0;
        }
    }, [vmContractPeriod]);

    // Cálculo do preço final com impostos, markup e desconto por período
    const vmFinalPrice = useMemo(() => {
        const baseCost = calculateVMCost;
        const taxAmount = baseCost * (totalTaxes / 100);
        const costWithTaxes = baseCost + taxAmount;
        const priceWithMarkup = costWithTaxes * (1 + markup / 100);
        const finalPrice = priceWithMarkup * (1 - contractDiscount / 100);
        return finalPrice;
    }, [calculateVMCost, totalTaxes, markup, contractDiscount]);

    // Função para adicionar VM à proposta
    const handleAddVMProduct = () => {
        if (vmName && vmCpuCores && vmRamGb && vmStorageSize) {
            let description = `${vmName} - ${vmCpuCores} vCPU, ${vmRamGb}GB RAM, ${vmStorageSize}GB ${vmStorageType}, ${vmNetworkSpeed}, ${vmOperatingSystem}`;
            
            // Adicionar serviços adicionais à descrição
            const additionalServices = [];
            if (vmBackupSize > 0) additionalServices.push(`Backup ${vmBackupSize}GB`);
            if (vmAdditionalIp) additionalServices.push('IP Adicional');
            if (vmSnapshot) additionalServices.push('Snapshot');
            if (vmVpnSiteToSite) additionalServices.push('VPN Site-to-Site');
            
            if (additionalServices.length > 0) {
                description += ` + ${additionalServices.join(', ')}`;
            }
            
            description += ` (${vmContractPeriod} meses)`;

            const vmProduct = {
                id: generateUniqueId(),
                type: 'VM',
                description,
                setup: setupFee,
                monthly: vmFinalPrice,
                details: { 
                    name: vmName,
                    cpuCores: vmCpuCores,
                    ramGb: vmRamGb,
                    storageType: vmStorageType,
                    storageSize: vmStorageSize,
                    networkSpeed: vmNetworkSpeed,
                    operatingSystem: vmOperatingSystem,
                    backupSize: vmBackupSize,
                    additionalIp: vmAdditionalIp,
                    snapshot: vmSnapshot,
                    vpnSiteToSite: vmVpnSiteToSite,
                    contractPeriod: vmContractPeriod
                }
            };

            setAddedProducts(prev => [...prev, vmProduct]);
            
            // Mostrar mensagem de sucesso
            alert(`VM "${vmName}" adicionada à proposta com sucesso! Você pode configurar e adicionar mais VMs ou ir para o resumo.`);
            
            // Limpar campos para permitir configurar nova VM (opcional)
            // Mantém os valores para facilitar configuração de VMs similares
            setVmName(`VM ${addedProducts.length + 2}`); // Incrementa o nome automaticamente
        } else {
            alert('Por favor, configure todos os campos obrigatórios da VM antes de adicionar à proposta.');
        }
    };

    // Função para remover produto da proposta
    const handleRemoveProduct = (productId: string) => {
        setAddedProducts(prev => prev.filter(p => p.id !== productId));
    };

    // Funções auxiliares
    const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;
    const generateUniqueId = () => `_${Math.random().toString(36).substr(2, 9)}`;

    // Lógica de Produtos
    const handleAddPabxProduct = () => {
        if (pabxResult) {
            let products = [];

            // Produto PABX Principal
            products.push({
                id: generateUniqueId(),
                type: 'PABX',
                description: `PABX em Nuvem para ${pabxExtensions} ramais`,
                setup: pabxResult.setup,
                monthly: pabxResult.baseMonthly,
                details: { extensions: pabxExtensions }
            });

            // Produto Aluguel de Aparelhos
            if (pabxIncludeDevices && pabxDeviceQuantity > 0 && pabxResult.deviceRentalCost > 0) {
                products.push({
                    id: generateUniqueId(),
                    type: 'PABX',
                    description: `Aluguel de ${pabxDeviceQuantity} aparelho(s) IP`,
                    setup: 0,
                    monthly: pabxResult.deviceRentalCost,
                    details: { quantity: pabxDeviceQuantity }
                });
            }

            // Produto Agente IA
            if (pabxResult && pabxResult.aiAgentCost > 0 && selectedAIAgentPlan) {
                const plan = aiAgentPlans[selectedAIAgentPlan];
                const description = `${plan.name} (Até: ${plan.messages.split(' ')[0]} msg, ${plan.minutes.split(' ')[0]} min, ${plan.premiumVoice.split(' ')[0]} voz premium)`;
                products.push({
                    id: generateUniqueId(),
                    type: 'PABX',
                    description: description,
                    setup: 0,
                    monthly: pabxResult.aiAgentCost,
                    details: { plan: selectedAIAgentPlan }
                });
            }

            setAddedProducts(prev => [...prev, ...products]);
        }
    };

    const handleAddSipProduct = () => {
        if (sipResult && selectedSipPlan) {
            const plan = sipPlans.find(p => p.name === selectedSipPlan);
            if (plan) {
                const description = `${plan.name}${sipWithEquipment && plan.channels > 0 ? ' com equipamento' : ''}${sipAdditionalChannels > 0 ? ` + ${sipAdditionalChannels} canais adicionais` : ''}`;
                setAddedProducts(prev => [...prev, {
                    id: generateUniqueId(),
                    type: 'SIP',
                    description,
                    setup: sipResult.setup,
                    monthly: sipResult.monthly,
                    details: { plan: selectedSipPlan, additionalChannels: sipAdditionalChannels, withEquipment: sipWithEquipment }
                }]);
            }
        }
    };



    // Lógica de Gerenciamento de Propostas
    useEffect(() => {
        const savedProposals = localStorage.getItem('proposals');
        if (savedProposals) {
            setProposals(JSON.parse(savedProposals));
        }
    }, []);

    useEffect(() => {
        if (proposals.length > 0) {
            localStorage.setItem('proposals', JSON.stringify(proposals));
        }
    }, [proposals]);

    const totalSetup = addedProducts.reduce((sum, p) => sum + p.setup, 0);
    const totalMonthly = addedProducts.reduce((sum, p) => sum + p.monthly, 0);

    const generateProposalId = (): string => {
        const now = new Date();
        const year = now.getFullYear().toString().slice(-2);
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `PROP-${year}${month}${day}-${random}`;
    };

    const clearForm = () => {
        setClientName('');
        setAccountManager('');
        setAddedProducts([]);
        setPabxExtensions(0);
        setPabxIncludeDevices(false);
        setPabxDeviceQuantity(0);
        setIncludeAIAgent(false);
        setSelectedAIAgentPlan('');
        setSelectedSipPlan('');
        setSipAdditionalChannels(0);
        setSipWithEquipment(false);
    };

    const createNewProposal = () => {
        // Limpar dados do formulário
        setClientData({ name: '', email: '', phone: '' });
        setAccountManagerData({ name: '', email: '', phone: '' });
        setViewMode('client-form');
    };

    const editProposal = (proposal: Proposal) => {
        setCurrentProposal(proposal);
        setClientName(proposal.clientName);
        setAccountManager(proposal.accountManager);
        setAddedProducts(proposal.products);
        setViewMode('edit');
    };

    const saveProposal = () => {
        if (viewMode === 'create' || viewMode === 'edit') {
            const proposalToSave: Proposal = {
                ...(currentProposal as Proposal),
                clientName,
                accountManager,
                products: addedProducts,
                totalSetup,
                totalMonthly,
                date: currentProposal?.date || new Date().toLocaleDateString('pt-BR')
            };

            if (viewMode === 'create') {
                setProposals(prev => [...prev, proposalToSave]);
            } else {
                setProposals(prev => prev.map(p => p.id === proposalToSave.id ? proposalToSave : p));
            }

            setViewMode('search');
            setCurrentProposal(null);
            clearForm();
        }
    };

    const cancelAction = () => {
        setViewMode('search');
        setCurrentProposal(null);
        clearForm();
    };

    const filteredProposals = (proposals || []).filter(p =>
        p.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handlePrint = () => window.print();

    // Se estiver na tela de formulário do cliente, mostrar o formulário
    if (viewMode === 'client-form') {
        return (
            <ClientManagerForm
                clientData={clientData}
                accountManagerData={accountManagerData}
                onClientDataChange={setClientData}
                onAccountManagerDataChange={setAccountManagerData}
                onBack={() => setViewMode('search')}
                onContinue={() => setViewMode('calculator')}
                title="Nova Proposta - Máquinas Virtuais"
                subtitle="Preencha os dados do cliente e gerente de contas para continuar."
            />
        );
    }

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
                            <div className="flex gap-4 mb-4">
                                <Input
                                    type="text"
                                    placeholder="Buscar por cliente ou ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-slate-800 border-slate-700 text-white"
                                />
                                <Button onClick={createNewProposal} className="bg-blue-600 hover:bg-blue-700"><Plus className="h-4 w-4 mr-2" />Nova Proposta</Button>
                            </div>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-slate-700">
                                            <TableHead className="text-white">ID</TableHead>
                                            <TableHead className="text-white">Cliente</TableHead>
                                            <TableHead className="text-white">Data</TableHead>
                                            <TableHead className="text-white">Total Mensal</TableHead>
                                            <TableHead className="text-white">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredProposals.map(p => (
                                            <TableRow key={p.id} className="border-slate-800">
                                                <TableCell>{p.id}</TableCell>
                                                <TableCell>{p.clientName}</TableCell>
                                                <TableCell>{p.date}</TableCell>
                                                <TableCell>{formatCurrency(p.totalMonthly)}</TableCell>
                                                <TableCell><Button variant="outline" size="sm" onClick={() => editProposal(p)}><Edit className="h-4 w-4" /></Button></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
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
                            
                            {/* Informações do Cliente e Gerente */}
                            <ClientManagerInfo 
                                clientData={clientData}
                                accountManagerData={accountManagerData}
                            />
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
                                                        <div className="flex justify-between"><span>Markup ({markup}%):</span> <span>{formatCurrency((calculateVMCost + calculateVMCost * (totalTaxes / 100)) * (markup / 100))}</span></div>
                                                        {contractDiscount > 0 && (
                                                            <div className="flex justify-between text-orange-400"><span>Desconto Contrato ({contractDiscount}%):</span> <span>-{formatCurrency(((calculateVMCost + calculateVMCost * (totalTaxes / 100)) * (1 + markup / 100)) * (contractDiscount / 100))}</span></div>
                                                        )}
                                                        <div className="flex justify-between"><span>Taxa de Setup:</span> <span>R$ {setupFee.toFixed(2)}</span></div>
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
                                                <CardContent className="space-y-4">
                                                    <div>
                                                        <Label>% Markup sobre o Custo (%)</Label>
                                                        <Input defaultValue="40" className="bg-slate-800 border-slate-700" />
                                                    </div>
                                                    <div>
                                                        <Label>% Margem Líquida Estimada (%)</Label>
                                                        <Input defaultValue="N/A" className="bg-slate-800 border-slate-700" />
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            <Card className="bg-slate-900/80 border-slate-800 text-white">
                                                <CardHeader>
                                                    <CardTitle className="text-cyan-400">Comissões</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="flex items-center gap-2">
                                                        <Label>% Percentual sobre a Receita Bruta</Label>
                                                        <Input defaultValue="3,00" className="bg-slate-800 border-slate-700 w-20" />
                                                        <span>%</span>
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
                            <Button onClick={saveProposal} className="bg-green-600 hover:bg-green-700"><Save className="h-4 w-4 mr-2" />Salvar Proposta</Button>
                            <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700" disabled={addedProducts.length === 0}><Download className="h-4 w-4 mr-2" />Gerar PDF</Button>
                            <Button variant="outline" onClick={cancelAction}>Cancelar</Button>
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
                            <p><strong>Cliente:</strong> {clientName}</p>
                            <p><strong>Gerente:</strong> {accountManager}</p>
                            <p><strong>Data:</strong> {currentProposal.date}</p>
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
                            <p><strong>Total Instalação:</strong> {formatCurrency(totalSetup)}</p>
                            <p><strong>Total Mensal:</strong> {formatCurrency(totalMonthly)}</p>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

export default MaquinasVirtuaisCalculator;
