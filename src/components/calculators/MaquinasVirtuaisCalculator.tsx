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
import VMCommissionsSection from './VMCommissionsSection';
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
    FilePenLine,
    ArrowLeft
} from 'lucide-react';

// Import shared components
import { ClientManagerForm, ClientData, AccountManagerData } from '@/components/calculators/ClientManagerForm';
import { ClientManagerInfo } from '@/components/calculators/ClientManagerInfo';

// Brazilian currency formatter
const formatBrazilianNumber = (value: number): string => {
    return value.toFixed(2).replace('.', ',');
};

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
    baseId: string;
    version: number;
    userId: string; // ID do usuário que criou a proposta
    client: ClientData;
    accountManager: AccountManagerData;
    products: Product[];
    totalSetup: number;
    totalMonthly: number;
    createdAt: string;
    status: string;
}

import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { toast } from 'sonner';


interface MaquinasVirtuaisCalculatorProps {
    onBackToDashboard?: () => void;
}

const MaquinasVirtuaisCalculator = ({ onBackToDashboard }: MaquinasVirtuaisCalculatorProps) => {
    // Initialize auth hook
    const auth = useAuth();
    const currentUser = auth?.user;
    console.log("User role:", currentUser?.role);

    // Estados de gerenciamento de propostas
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [currentProposal, setCurrentProposal] = useState<Proposal | null>(null);
    const [viewMode, setViewMode] = useState<'search' | 'client-form' | 'calculator' | 'proposal-summary'>('search');
    const [showClientForm, setShowClientForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState<string>('');

    const filteredProposals = proposals.filter((p) => p.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()))

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
    const [addedProducts, setAddedProducts] = useState<Product[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<string>('Aguardando Aprovação do Cliente');

    // Estados PABX
    const [pabxExtensions, setPabxExtensions] = useState<number>(0);
    const [pabxIncludeDevices, setPabxIncludeDevices] = useState<boolean>(false);
    const [pabxDeviceQuantity, setPabxDeviceQuantity] = useState<number>(0);
    const [pabxIncludeSetup, setPabxIncludeSetup] = useState<boolean>(true);
    const [pabxResult, setPabxResult] = useState<PABXResult | null>(null);

    // Estados Agente IA
    const [includeAIAgent, setIncludeAIAgent] = useState(false);
    const [selectedAIAgentPlan, setSelectedAIAgentPlan] = useState('');

    // Estados para DRE
    const [isEditingTaxes, setIsEditingTaxes] = useState<boolean>(false);
    const [taxRates, setTaxRates] = useState({
        banda: 2.09,
        fundraising: 0,
        rate: 24,
        pis: 1.65,
        cofins: 7.60,
        margem: 15,
        csll: 9.00,
        irpj: 15.00,
        custoDesp: 10
    });

    // Estados SIP
    const [selectedSipPlan, setSelectedSipPlan] = useState<string>('');
    const [sipAdditionalChannels, setSipAdditionalChannels] = useState<number>(0);
    const [sipWithEquipment, setSipWithEquipment] = useState<boolean>(false);
    const [sipIncludeSetup, setSipIncludeSetup] = useState<boolean>(true);
    const [sipResult, setSipResult] = useState<SIPResult | null>(null);

    const fetchProposals = React.useCallback(async () => {
        if (!currentUser || !currentUser.role || !db) {
            setProposals([]);
            return;
        }

        const proposalsCol = collection(db, 'proposals');
        const prefix = 'Prop_MV_';
        let q;
        if (currentUser.role === 'admin' || currentUser.role === 'diretor') {
            q = query(proposalsCol, where('baseId', '>=', prefix), where('baseId', '<', prefix + 'z'));
        } else {
            q = query(proposalsCol, where('userId', '==', currentUser.uid));
        }

        try {
            const querySnapshot = await getDocs(q);
            const proposalsData = querySnapshot.docs
                .map(doc => ({ ...doc.data(), id: doc.id } as Proposal))
                .filter(p => p.baseId && p.baseId.startsWith(prefix));
            setProposals(proposalsData);
        } catch (error) {
            console.error("Erro ao buscar propostas: ", error);
        }
    }, [currentUser, db]);

    useEffect(() => {
        fetchProposals();
    }, [fetchProposals]);

    useEffect(() => {
        const fetchPricingSettings = async () => {
            if (!currentUser) return;

            try {
                // Try to load from localStorage first
                const savedSettings = localStorage.getItem(`vmPricingSettings_${currentUser.uid}`);
                console.log('Loading settings from localStorage:', savedSettings);
                if (savedSettings) {
                    const settingsData = JSON.parse(savedSettings);
                    console.log('Parsed settings data:', settingsData);
                    console.log('setupFee from localStorage:', settingsData.setupFee);
                    console.log('managementAndSupportCost from localStorage:', settingsData.managementAndSupportCost);
                    setMarkup(settingsData.markup || 30);
                    setCommissionPercentage(settingsData.commissionPercentage || 3);
                    setSetupFee(settingsData.setupFee || 500);
                    setManagementAndSupportCost(settingsData.managementAndSupportCost || 250);
                    setVcpuWindowsCost(settingsData.vcpuWindowsCost || 15);
                    setVcpuLinuxCost(settingsData.vcpuLinuxCost || 10);
                    setRamCost(settingsData.ramCost || 8);
                    setHddSasCost(settingsData.hddSasCost || 0.5);
                    setSsdPerformanceCost(settingsData.ssdPerformanceCost || 1.5);
                    setNvmeCost(settingsData.nvmeCost || 2.5);
                    setNetwork1GbpsCost(settingsData.network1GbpsCost || 0);
                    setNetwork10GbpsCost(settingsData.network10GbpsCost || 100);
                    setWindowsServerCost(settingsData.windowsServerCost || 135);
                    setWindows10ProCost(settingsData.windows10ProCost || 120);
                    setUbuntuCost(settingsData.ubuntuCost || 0);
                    setCentosCost(settingsData.centosCost || 0);
                    setDebianCost(settingsData.debianCost || 0);
                    setRockyLinuxCost(settingsData.rockyLinuxCost || 0);
                    setBackupCostPerGb(settingsData.backupCostPerGb || 1.25);
                    setAdditionalIpCost(settingsData.additionalIpCost || 15);
                    setSnapshotCost(settingsData.snapshotCost || 25);
                    setVpnSiteToSiteCost(settingsData.vpnSiteToSiteCost || 50);
                    setPisCofins(String(settingsData.pisCofins || '3,65').replace('.', ','));
                    setIss(String(settingsData.iss || '5,00').replace('.', ','));
                    setCsllIr(String(settingsData.csllIr || '8,88').replace('.', ','));
                    if (settingsData.contractDiscounts) {
                        setContractDiscounts(settingsData.contractDiscounts);
                    }
                    // Não sobrescrever taxRates - eles têm valores padrão próprios
                    return;
                }

                // Try to fetch from API as fallback
                const response = await fetch(`/api/vm-settings?userId=${currentUser.uid}`);
                if (response.ok) {
                    const settingsData = await response.json();
                    setMarkup(settingsData.markup || 30);
                    setCommissionPercentage(settingsData.commissionPercentage || 3);
                    setSetupFee(settingsData.setupFee || 500);
                    setManagementAndSupportCost(settingsData.managementAndSupportCost || 250);
                    setVcpuWindowsCost(settingsData.vcpuWindowsCost || 15);
                    setVcpuLinuxCost(settingsData.vcpuLinuxCost || 10);
                    setRamCost(settingsData.ramCost || 8);
                    setHddSasCost(settingsData.hddSasCost || 0.5);
                    setSsdPerformanceCost(settingsData.ssdPerformanceCost || 1.5);
                    setNvmeCost(settingsData.nvmeCost || 2.5);
                    setNetwork1GbpsCost(settingsData.network1GbpsCost || 0);
                    setNetwork10GbpsCost(settingsData.network10GbpsCost || 100);
                    setWindowsServerCost(settingsData.windowsServerCost || 135);
                    setWindows10ProCost(settingsData.windows10ProCost || 120);
                    setUbuntuCost(settingsData.ubuntuCost || 0);
                    setCentosCost(settingsData.centosCost || 0);
                    setDebianCost(settingsData.debianCost || 0);
                    setRockyLinuxCost(settingsData.rockyLinuxCost || 0);
                    setBackupCostPerGb(settingsData.backupCostPerGb || 1.25);
                    setAdditionalIpCost(settingsData.additionalIpCost || 15);
                    setSnapshotCost(settingsData.snapshotCost || 25);
                    setVpnSiteToSiteCost(settingsData.vpnSiteToSiteCost || 50);
                    setPisCofins(String(settingsData.pisCofins || '3,65').replace('.', ','));
                    setIss(String(settingsData.iss || '5,00').replace('.', ','));
                    setCsllIr(String(settingsData.csllIr || '8,88').replace('.', ','));
                    if (settingsData.contractDiscounts) {
                        setContractDiscounts(settingsData.contractDiscounts);
                    }
                    // Não sobrescrever taxRates - eles têm valores padrão próprios
                }
            } catch (error) {
                console.error("Erro ao buscar configurações de preço:", error);
            }
        };

        fetchPricingSettings();
    }, [currentUser]);

    // Load tax rates from localStorage (only if they exist and are valid)
    useEffect(() => {
        const savedTaxRates = localStorage.getItem('vmTaxRates');
        if (savedTaxRates) {
            try {
                const parsedRates = JSON.parse(savedTaxRates);
                console.log('Loaded tax rates from localStorage:', parsedRates);
                
                // Only update if the saved rates have valid values for the main tax fields
                if (parsedRates.pis && parsedRates.cofins && parsedRates.csll && parsedRates.irpj) {
                    setTaxRates(prevRates => ({ ...prevRates, ...parsedRates }));
                }
            } catch (error) {
                console.error('Error loading tax rates from localStorage:', error);
            }
        }
        console.log('Tax rates initialized with defaults');
    }, []);

    // Estados para regime tributário
    const [selectedTaxRegime, setSelectedTaxRegime] = useState<string>('lucro_real');
    const [pisCofins, setPisCofins] = useState<string>('3,65');
    const [iss, setIss] = useState<string>('5,00');
    const [csllIr, setCsllIr] = useState<string>('8,88');

    // Debug: Log current taxRates state
    console.log('Current taxRates state:', taxRates);

    // Cálculo de impostos baseado nas taxas editáveis
    const revenueTaxes = useMemo(() => {
        // Apenas PIS + COFINS sobre receita
        const total = ((taxRates.pis || 1.65) + (taxRates.cofins || 7.60)) / 100;
        console.log('Revenue taxes calculation:', { pis: taxRates.pis || 1.65, cofins: taxRates.cofins || 7.60, total });
        return total;
    }, [taxRates.pis, taxRates.cofins]);

    const profitTaxes = useMemo(() => {
        // CSLL + IRPJ sobre lucro
        const total = (taxRates.csll + taxRates.irpj) / 100;
        console.log('Profit taxes calculation:', { csll: taxRates.csll, irpj: taxRates.irpj, total });
        return total;
    }, [taxRates.csll, taxRates.irpj]);

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
    const [includeReferralPartner, setIncludeReferralPartner] = useState<boolean>(false);
    const [vmContractPeriod, setVmContractPeriod] = useState<number>(12);

    // Estados para configurações de preço
    const [markup, setMarkup] = useState<number>(30);
    const [commissionPercentage, setCommissionPercentage] = useState<number>(3);
    const [setupFee, setSetupFee] = useState<number>(500);
    const [managementAndSupportCost, setManagementAndSupportCost] = useState<number>(250);
    const [contractDiscounts, setContractDiscounts] = useState<{ [key: number]: number }>({
        12: 0,
        24: 5,
        36: 10,
        48: 15,
        60: 20,
    });

    // Descontos
    const [directorDiscountPercentage, setDirectorDiscountPercentage] = useState<number>(0);
    const [appliedDirectorDiscountPercentage, setAppliedDirectorDiscountPercentage] = useState<number>(0);
    const [applySalespersonDiscount, setApplySalespersonDiscount] = useState<boolean>(false);

    // Cálculo do desconto contratual baseado no período
    const contractDiscount = useMemo(() => {
        return contractDiscounts[vmContractPeriod] || 0;
    }, [vmContractPeriod, contractDiscounts]);

    

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

    const referralPartnerCommissions = [
        { minRevenue: 0, maxRevenue: 1000, percentage: 5 },
        { minRevenue: 1000.01, maxRevenue: 5000, percentage: 7 },
        { minRevenue: 5000.01, maxRevenue: Infinity, percentage: 10 },
    ];

    // Cálculo detalhado de custos e margens
    const {
        vmFinalPrice,
        markupValue,
        commissionValue,
        estimatedNetMargin,
        costBreakdown
    } = useMemo(() => {
        const C = calculateVMCost;
        const M = markup / 100;
        const Comm = commissionPercentage / 100;
        const T_rev = revenueTaxes;
        const T_profit = profitTaxes;

        const denominator = 1 - Comm - T_rev;
        const priceBeforeDiscounts = denominator > 0 ? (C * (1 + M)) / denominator : 0;

        const contractDiscountAmount = priceBeforeDiscounts * (contractDiscount / 100);
        const priceAfterContractDiscount = priceBeforeDiscounts - contractDiscountAmount;

        const directorDiscountAmount = priceAfterContractDiscount * (appliedDirectorDiscountPercentage / 100);
        const finalPrice = priceAfterContractDiscount - directorDiscountAmount;

        const calculatedCommissionValue = finalPrice * Comm;
        const revenueTaxValue = finalPrice * T_rev;
        
        const calculatedReferralPartnerCommission = (() => {
            if (!includeReferralPartner) {
                return 0;
            }
            const monthlyRevenue = finalPrice;
            for (const tier of referralPartnerCommissions) {
                if (monthlyRevenue >= tier.minRevenue && monthlyRevenue <= tier.maxRevenue) {
                    return monthlyRevenue * (tier.percentage / 100);
                }
            }
            return 0;
        })();

        // Correct DRE calculation structure:
        // 1. Gross Revenue
        const grossRevenue = finalPrice;
        
        // 2. Revenue Taxes (PIS + COFINS)
        const revenueOnlyTaxes = finalPrice * (T_rev);
        
        // 3. Net Revenue (after revenue taxes)
        const netRevenue = grossRevenue - revenueOnlyTaxes;
        
        // 4. Direct Costs (VM operational costs)
        const directCosts = C;
        
        // 5. Gross Profit (after direct costs)
        const grossProfit = netRevenue - directCosts;
        
        // 6. Commercial Expenses (commissions)
        const totalCommissions = calculatedCommissionValue + calculatedReferralPartnerCommission;
        
        // 7. Profit after commercial expenses
        const profitAfterCommissions = grossProfit - totalCommissions;
        
        // 8. Profit Taxes (CSLL + IRPJ) - only on positive profit
        const profitTaxValue = profitAfterCommissions > 0 ? profitAfterCommissions * T_profit : 0;
        
        // 9. Net Profit
        const netProfit = profitAfterCommissions - profitTaxValue;
        
        const calculatedNetMargin = finalPrice > 0 ? (netProfit / finalPrice) * 100 : 0;
        const calculatedMarkupValue = C * M; // This represents the actual markup amount added to cost

        return {
            vmFinalPrice: Math.max(0, finalPrice) || 0,
            markupValue: Math.max(0, calculatedMarkupValue) || 0,
            commissionValue: Math.max(0, calculatedCommissionValue) || 0,
            estimatedNetMargin: calculatedNetMargin || 0,
            costBreakdown: {
                baseCost: C,
                taxAmount: revenueOnlyTaxes + profitTaxValue,
                totalCostWithTaxes: C + revenueOnlyTaxes + profitTaxValue,
                markupAmount: calculatedMarkupValue,
                priceBeforeDiscounts,
                contractDiscount: {
                    percentage: contractDiscount,
                    amount: contractDiscountAmount
                },
                directorDiscount: {
                    percentage: appliedDirectorDiscountPercentage,
                    amount: directorDiscountAmount
                },
                finalPrice,
                grossRevenue,
                netRevenue,
                directCosts,
                totalCommissions,
                profitAfterCommissions,
                totalCost: C + calculatedCommissionValue,
                grossProfit,
                netMargin: calculatedNetMargin,
                referralPartnerCommission: calculatedReferralPartnerCommission,
                netProfit,
                revenueTaxValue: revenueOnlyTaxes,
                profitTaxValue,
                commissionValue: calculatedCommissionValue,
                cost: C,
                setupFee: setupFee
            }
        };
    }, [calculateVMCost, revenueTaxes, profitTaxes, markup, contractDiscount, commissionPercentage, appliedDirectorDiscountPercentage, includeReferralPartner, setupFee]);

    



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
        setClientData({ name: '', contact: '', projectName: '', email: '', phone: '' });
        setAccountManagerData({ name: '', email: '', phone: '' });
        setAddedProducts([]);
        setViewMode('client-form');
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
        
        // Handle products - check multiple possible locations and formats
        let products = [];
        if (proposal.products && Array.isArray(proposal.products)) {
            products = proposal.products;
        } else if (proposal.items && Array.isArray(proposal.items)) {
            // Convert items to products format if needed
            products = proposal.items.map((item: any) => ({
                id: item.id || `item-${Date.now()}`,
                type: 'VM',
                description: item.description || 'Máquina Virtual',
                setup: item.setup || 0,
                monthly: item.monthly || 0,
                details: item.details || {}
            }));
        }
        
        setAddedProducts(products);
        setSelectedStatus(proposal.status); // Load the status
        setViewMode('calculator');
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
        
        // Handle products - check multiple possible locations and formats
        let products = [];
        if (proposal.products && Array.isArray(proposal.products)) {
            products = proposal.products;
        } else if (proposal.items && Array.isArray(proposal.items)) {
            // Convert items to products format if needed
            products = proposal.items.map((item: any) => ({
                id: item.id || `item-${Date.now()}`,
                type: 'VM',
                description: item.description || 'Máquina Virtual',
                setup: item.setup || 0,
                monthly: item.monthly || 0,
                details: item.details || {}
            }));
        }
        
        setAddedProducts(products);
        setSelectedStatus(proposal.status);
        setViewMode('proposal-summary');
    };

    const deleteProposal = async (proposalId: string) => {
        if (!db) {
            console.error('Firebase não está disponível');
            return;
        }
        
        if (window.confirm('Tem certeza que deseja excluir esta proposta?')) {
            try {
                await deleteDoc(doc(db, 'proposals', proposalId));
                fetchProposals();
            } catch (error) {
                console.error('Erro ao excluir proposta:', error);
                alert('Falha ao excluir a proposta.');
            }
        }
    };

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
                
                .proposal-view, .proposal-view * {
                    visibility: visible;
                }
                
                .proposal-view {
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
        
        // Add proposal-view class to the proposal summary
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

    const handleTaxRateChange = (taxType: keyof typeof taxRates, value: number) => {
        console.log(`Changing ${taxType} to ${value}`);
        
        // Ensure the value is a valid number and not negative
        const validValue = isNaN(value) || value < 0 ? 0 : value;
        
        const newTaxRates = { ...taxRates, [taxType]: validValue };
        console.log('New tax rates:', newTaxRates);
        setTaxRates(newTaxRates);
        
        // Save to localStorage
        localStorage.setItem('vmTaxRates', JSON.stringify(newTaxRates));
    };

    const handleSaveSettings = async () => {
        console.log('handleSaveSettings called');
        console.log('Current setupFee:', setupFee);
        console.log('Current managementAndSupportCost:', managementAndSupportCost);
        
        if (!currentUser) {
            toast.error('Você precisa estar logado para salvar as configurações.');
            return;
        }

        try {
            const settingsToSave = {
                markup,
                commissionPercentage,
                setupFee,
                managementAndSupportCost,
                vcpuWindowsCost,
                vcpuLinuxCost,
                ramCost,
                hddSasCost,
                ssdPerformanceCost,
                nvmeCost,
                network1GbpsCost,
                network10GbpsCost,
                windowsServerCost,
                windows10ProCost,
                ubuntuCost,
                centosCost,
                debianCost,
                rockyLinuxCost,
                backupCostPerGb,
                additionalIpCost,
                snapshotCost,
                vpnSiteToSiteCost,
                pisCofins: parseFloat(pisCofins.replace(',', '.')),
                iss: parseFloat(iss.replace(',', '.')),
                csllIr: parseFloat(csllIr.replace(',', '.')),
                contractDiscounts,
                taxRates,
                updatedAt: new Date().toISOString(),
                userId: currentUser.uid
            };
            
            console.log('Saving settings:', settingsToSave);
            console.log('setupFee in settingsToSave:', settingsToSave.setupFee);
            console.log('managementAndSupportCost in settingsToSave:', settingsToSave.managementAndSupportCost);
            
            // Save to localStorage as fallback
            localStorage.setItem(`vmPricingSettings_${currentUser.uid}`, JSON.stringify(settingsToSave));
            console.log('Saved to localStorage with key:', `vmPricingSettings_${currentUser.uid}`);
            
            // Try to save via API
            const response = await fetch('/api/vm-settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(settingsToSave),
            });

            if (response.ok) {
                toast.success('Configurações salvas com sucesso!');
            } else {
                // If API fails, at least we have localStorage
                console.warn('API save failed, but localStorage backup successful');
                toast.success('Configurações salvas localmente!');
            }
        } catch (error) {
            console.error("Erro ao salvar configurações:", error);
            // Try localStorage as fallback
            try {
                const settingsToSave = {
                    markup,
                    commissionPercentage,
                    setupFee,
                    managementAndSupportCost,
                    vcpuWindowsCost,
                    vcpuLinuxCost,
                    ramCost,
                    hddSasCost,
                    ssdPerformanceCost,
                    nvmeCost,
                    network1GbpsCost,
                    network10GbpsCost,
                    windowsServerCost,
                    windows10ProCost,
                    ubuntuCost,
                    centosCost,
                    debianCost,
                    rockyLinuxCost,
                    backupCostPerGb,
                    additionalIpCost,
                    snapshotCost,
                    vpnSiteToSiteCost,
                    pisCofins: parseFloat(pisCofins.replace(',', '.')),
                    iss: parseFloat(iss.replace(',', '.')),
                    csllIr: parseFloat(csllIr.replace(',', '.')),
                    contractDiscounts,
                    taxRates,
                    updatedAt: new Date().toISOString(),
                    userId: currentUser.uid
                };
                localStorage.setItem(`vmPricingSettings_${currentUser.uid}`, JSON.stringify(settingsToSave));
                toast.success('Configurações salvas localmente!');
            } catch (localError) {
                console.error("Erro ao salvar no localStorage:", localError);
                toast.error('Falha ao salvar as configurações.');
            }
        }
    };


    

    

    

    // Tela de resumo da proposta (visualização / impressão)
    if (viewMode === 'proposal-summary' && currentProposal) {
        return (
            <div className="p-4 md:p-8">
                <Card className="bg-white border-gray-300 text-black print:shadow-none proposal-view">
                    <CardHeader className="print:pb-2">
                        <div className="flex justify-between items-start mb-4 print:mb-2">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Proposta Comercial</h1>
                                <p className="text-gray-600">Máquinas Virtuais</p>
                            </div>
                            <div className="flex gap-2 no-print">
                                <Button variant="outline" onClick={() => setViewMode('search')}>
                                    <ArrowLeft className="h-4 w-4 mr-2" />Voltar
                                </Button>
                                <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
                                    <Download className="h-4 w-4 mr-2" />Imprimir PDF
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6 print:space-y-4">
                        {/* Dados do Cliente e Gerente */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Dados do Cliente</h3>
                                <div className="space-y-2 text-sm">
                                    <p><strong>Nome:</strong> {currentProposal.client?.name}</p>
                                    <p><strong>Projeto:</strong> {currentProposal.client?.projectName}</p>
                                    <p><strong>Email:</strong> {currentProposal.client?.email}</p>
                                    <p><strong>Telefone:</strong> {currentProposal.client?.phone}</p>
                                    <p><strong>Contato:</strong> {currentProposal.client?.contact}</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Gerente de Contas</h3>
                                <div className="space-y-2 text-sm">
                                    <p><strong>Nome:</strong> {currentProposal.accountManager?.name}</p>
                                    <p><strong>Email:</strong> {currentProposal.accountManager?.email}</p>
                                    <p><strong>Telefone:</strong> {currentProposal.accountManager?.phone}</p>
                                </div>
                            </div>
                        </div>

                        {/* Produtos e Serviços */}
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
                                    {(currentProposal.products ?? []).map((product, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{product.description}</TableCell>
                                            <TableCell>{formatCurrency(product.setup)}</TableCell>
                                            <TableCell>{formatCurrency(product.monthly)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Resumo Financeiro */}
                        <div className="border-t pt-4 print:pt-2">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Resumo Financeiro</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p><strong>Total Setup:</strong> {formatCurrency(currentProposal.totalSetup)}</p>
                                    <p><strong>Total Mensal:</strong> {formatCurrency(currentProposal.totalMonthly)}</p>
                                </div>
                                <div>
                                    <p><strong>Data da Proposta:</strong> {currentProposal.createdAt ? (
                                        (typeof currentProposal.createdAt === 'object' && 'toDate' in currentProposal.createdAt)
                                            ? new Date(currentProposal.createdAt.toDate()).toLocaleDateString('pt-BR')
                                            : (isNaN(new Date(currentProposal.createdAt).getTime()) ? 'N/A' : new Date(currentProposal.createdAt).toLocaleDateString('pt-BR'))
                                    ) : 'N/A'}</p>
                                    <p><strong>ID da Proposta:</strong> {currentProposal.id}</p>
                                    <p><strong>Versão:</strong> {currentProposal.version}</p>
                                    <p><strong>Status:</strong> {currentProposal.status}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <>
            <div className="p-4 md:p-8 print-hide">
                {viewMode === 'search' ? (
                    <Card className="bg-slate-900/80 border-slate-800 text-white">
                        <CardHeader>
                            <Button 
                                variant="outline" 
                                onClick={() => setViewMode('calculator')}
                                className="flex items-center mb-4 border-slate-600 text-slate-300 hover:bg-slate-700"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Voltar
                            </Button>
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
                                        {(filteredProposals ?? []).length === 0 ? (
                                            <TableRow key="no-proposals-found">
                                                <TableCell colSpan={5} className="text-center py-8 text-slate-400">
                                                    No proposal found. Click on "New Proposal" to start.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredProposals.map((p: Proposal) => (
                                                <TableRow key={p.id} className="border-slate-800">
                                                    <TableCell>{p.id}</TableCell>
                                                    <TableCell>{p.client.name} (v{p.version})</TableCell>
                                                    <TableCell>{p.createdAt ? (
                                                        (typeof p.createdAt === 'object' && 'toDate' in p.createdAt)
                                                            ? new Date(p.createdAt.toDate()).toLocaleDateString('pt-BR')
                                                            : (isNaN(new Date(p.createdAt).getTime()) ? 'N/A' : new Date(p.createdAt).toLocaleDateString('pt-BR'))
                                                    ) : 'N/A'}</TableCell>
                                                    <TableCell>{formatCurrency(p.totalMonthly)}</TableCell>
                                                    <TableCell>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                                                onClick={() => viewProposal(p)}
                                                            >
                                                                <FilePenLine className="h-4 w-4 mr-2" /> Visualizar
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="border-blue-600 text-blue-300 hover:bg-blue-700"
                                                                onClick={() => editProposal(p)}
                                                            >
                                                                <Edit className="h-4 w-4 mr-2" /> Editar
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => deleteProposal(p.id)}
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
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setViewMode('search')}
                                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                    >
                                        ← Voltar para Buscar
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

                        {viewMode === 'calculator' && (
                        <>
                        <div>
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className={`grid w-full ${currentUser?.role === 'admin' ? 'grid-cols-4' : 'grid-cols-1'} bg-slate-800`}>
                                    <TabsTrigger value="calculator">Calculadora VM</TabsTrigger>
                                    {currentUser?.role === 'admin' && (
                                        <TabsTrigger value="list-price">Tabela de Preços VM/Configurações</TabsTrigger>
                                    )}
                                    {currentUser?.role === 'admin' && (
                                        <TabsTrigger value="commissions-table">Tabela Comissões</TabsTrigger>
                                    )}
                                    {currentUser?.role === 'admin' && (
                                        <TabsTrigger value="dre">DRE</TabsTrigger>
                                    )}
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

                                        {/* Incluir Parceiro Indicador */}
                                        <Card className="bg-slate-900/80 border-slate-800 text-white">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <User className="h-5 w-5" />
                                                    <span className="text-cyan-400">Parceiro Indicador</span>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="includeReferralPartner"
                                                        checked={includeReferralPartner}
                                                        onCheckedChange={(checked) => setIncludeReferralPartner(Boolean(checked))}
                                                        className="border-cyan-400"
                                                    />
                                                    <Label htmlFor="includeReferralPartner" className="text-white">Incluir Parceiro Indicador</Label>
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
                                                        <div className="flex justify-between"><span>Impostos:</span> <span>{formatCurrency(costBreakdown.taxAmount)}</span></div>
                                                        <div className="flex justify-between"><span>Lucro (Markup de {markup}%):</span> <span>{formatCurrency(costBreakdown.markupAmount)}</span></div>
                                                        {contractDiscount > 0 && (
                                                            <div className="flex justify-between text-orange-400"><span>Desconto Contrato ({contractDiscount}%):</span> <span>-{formatCurrency(costBreakdown.contractDiscount.amount)}</span></div>
                                                        )}
                                                        <div className="flex justify-between"><span>Taxa de Setup:</span> <span>R$ {formatBrazilianNumber(setupFee)}</span></div>
                                                        <div className="flex justify-between text-yellow-400"><span>Comissão ({commissionPercentage}%):</span> <span>{formatCurrency(vmFinalPrice * (commissionPercentage / 100))}</span></div>
                                                        {includeReferralPartner && (
                                                            <div className="flex justify-between text-yellow-400"><span>Comissão Parceiro Indicador:</span> <span>{formatCurrency(costBreakdown.referralPartnerCommission)}</span></div>
                                                        )}
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
                                                    {currentUser?.role === 'diretor' && (
                                                        <div className="space-y-2 mt-4">
                                                            <Label htmlFor="director-discount">Desconto Diretor (%)</Label>
                                                            <div className="flex items-center space-x-2">
                                                                <Input
                                                                    id="director-discount"
                                                                    type="number"
                                                                    value={directorDiscountPercentage}
                                                                    onChange={(e) => setDirectorDiscountPercentage(Number(e.target.value))}
                                                                    placeholder="0-100"
                                                                    min="0"
                                                                    max="100"
                                                                    className="bg-slate-800 border-slate-700 text-white"
                                                                />
                                                                <Button
                                                                    onClick={() => setAppliedDirectorDiscountPercentage(directorDiscountPercentage)}
                                                                    className="bg-blue-600 hover:bg-blue-700"
                                                                >
                                                                    Aplicar
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}
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

                                <TabsContent value="commissions-table">
                                    <div className="space-y-6 mt-6">
                                        <Card className="bg-slate-900/80 border-slate-800 text-white">
                                            <CardHeader>
                                                <CardTitle className="flex items-center">
                                                    <div className="w-4 h-4 bg-yellow-500 mr-2"></div>
                                                    Tabela de Comissões - VM
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <VMCommissionsSection />
                                            </CardContent>
                                        </Card>
                                    </div>
                                </TabsContent>
                                <TabsContent value="dre">
                                    <div className="space-y-6 mt-6">
                                        {/* Análise Financeira */}
                                        <Card className="bg-slate-900/80 border-slate-800 text-white">
                                            <CardHeader>
                                                <CardTitle className="flex items-center">
                                                    <div className="w-4 h-4 bg-green-500 mr-2"></div>
                                                    Análise Financeira
                                                </CardTitle>
                                                <CardDescription>Resumo dos cálculos financeiros</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <span>Receita Bruta Mensal:</span>
                                                            <span className="text-green-400">{formatCurrency(costBreakdown.finalPrice)}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Receita Total do Contrato (12m):</span>
                                                            <span className="text-green-400">{formatCurrency(costBreakdown.finalPrice * 12)}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Taxa de Setup:</span>
                                                            <span className="text-green-400">{formatCurrency(costBreakdown.setupFee)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <span>Receita Líquida Total:</span>
                                                            <span className={costBreakdown.netProfit >= 0 ? "text-green-400" : "text-red-400"}>
                                                                {formatCurrency(costBreakdown.netProfit * 12)}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Receita Líquida Mensal Média:</span>
                                                            <span className={costBreakdown.netProfit >= 0 ? "text-green-400" : "text-red-400"}>
                                                                {formatCurrency(costBreakdown.netProfit)}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Margem Líquida:</span>
                                                            <span className={costBreakdown.netMargin >= 0 ? "text-green-400" : "text-red-400"}>
                                                                {costBreakdown.netMargin.toFixed(2)}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* DRE - Demonstrativo de Resultado do Exercício */}
                                        <Card className="bg-slate-900/80 border-slate-800 text-white">
                                            <CardHeader>
                                                <CardTitle className="flex items-center">
                                                    <div className="w-4 h-4 bg-blue-500 mr-2"></div>
                                                    DRE - Demonstrativo de Resultado do Exercício
                                                </CardTitle>
                                                <CardDescription>DRE - Período: 12 Meses</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow className="border-slate-700">
                                                            <TableHead className="text-white">Descrição</TableHead>
                                                            <TableHead className="text-right text-white">Valor Mensal</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {/* Receita Bruta */}
                                                        <TableRow className="border-slate-800 bg-blue-900/30">
                                                            <TableCell className="text-white font-semibold">Receita Bruta</TableCell>
                                                            <TableCell className="text-right text-white">{formatCurrency(costBreakdown.grossRevenue || costBreakdown.finalPrice)}</TableCell>
                                                        </TableRow>
                                                        
                                                        {/* Impostos sobre Receita */}
                                                        <TableRow className="border-slate-800 bg-red-900/30">
                                                            <TableCell className="text-white font-semibold">(-) Impostos sobre Receita</TableCell>
                                                            <TableCell className="text-right text-white">{formatCurrency(costBreakdown.revenueTaxValue)}</TableCell>
                                                        </TableRow>
                                                        <TableRow className="border-slate-800">
                                                            <TableCell className="text-white pl-8">PIS ({formatBrazilianNumber(taxRates.pis)}%)</TableCell>
                                                            <TableCell className="text-right text-white">{formatCurrency((costBreakdown.grossRevenue || costBreakdown.finalPrice) * (taxRates.pis / 100))}</TableCell>
                                                        </TableRow>
                                                        <TableRow className="border-slate-800">
                                                            <TableCell className="text-white pl-8">Cofins ({formatBrazilianNumber(taxRates.cofins)}%)</TableCell>
                                                            <TableCell className="text-right text-white">{formatCurrency((costBreakdown.grossRevenue || costBreakdown.finalPrice) * (taxRates.cofins / 100))}</TableCell>
                                                        </TableRow>
                                                        
                                                        {/* Receita Líquida */}
                                                        <TableRow className="border-slate-800 bg-green-900/30">
                                                            <TableCell className="text-white font-semibold">(=) Receita Líquida</TableCell>
                                                            <TableCell className="text-right text-white">{formatCurrency(costBreakdown.netRevenue || (costBreakdown.finalPrice - costBreakdown.revenueTaxValue))}</TableCell>
                                                        </TableRow>
                                                        
                                                        {/* Custos Diretos */}
                                                        <TableRow className="border-slate-800 bg-red-900/30">
                                                            <TableCell className="text-white font-semibold">(-) Custos Diretos</TableCell>
                                                            <TableCell className="text-right text-white">{formatCurrency(costBreakdown.directCosts || costBreakdown.cost)}</TableCell>
                                                        </TableRow>
                                                        <TableRow className="border-slate-800">
                                                            <TableCell className="text-white pl-8">Custo Operacional da VM</TableCell>
                                                            <TableCell className="text-right text-white">{formatCurrency(costBreakdown.cost)}</TableCell>
                                                        </TableRow>
                                                        
                                                        {/* Lucro Bruto */}
                                                        <TableRow className="border-slate-800 bg-blue-900/30">
                                                            <TableCell className="text-white font-semibold">(=) Lucro Bruto</TableCell>
                                                            <TableCell className="text-right text-white">{formatCurrency(costBreakdown.grossProfit)}</TableCell>
                                                        </TableRow>
                                                        
                                                        {/* Despesas Comerciais (Comissões) */}
                                                        <TableRow className="border-slate-800 bg-red-900/30">
                                                            <TableCell className="text-white font-semibold">(-) Despesas Comerciais</TableCell>
                                                            <TableCell className="text-right text-white">{formatCurrency(costBreakdown.totalCommissions || (costBreakdown.commissionValue + costBreakdown.referralPartnerCommission))}</TableCell>
                                                        </TableRow>
                                                        <TableRow className="border-slate-800">
                                                            <TableCell className="text-white pl-8">Comissão Vendedor</TableCell>
                                                            <TableCell className="text-right text-white">{formatCurrency(costBreakdown.commissionValue)}</TableCell>
                                                        </TableRow>
                                                        {costBreakdown.referralPartnerCommission > 0 && (
                                                            <TableRow className="border-slate-800">
                                                                <TableCell className="text-white pl-8">Comissão Parceiro</TableCell>
                                                                <TableCell className="text-right text-white">{formatCurrency(costBreakdown.referralPartnerCommission)}</TableCell>
                                                            </TableRow>
                                                        )}
                                                        
                                                        {/* Lucro após Despesas Comerciais */}
                                                        <TableRow className="border-slate-800 bg-blue-900/30">
                                                            <TableCell className="text-white font-semibold">(=) Lucro após Despesas Comerciais</TableCell>
                                                            <TableCell className="text-right text-white">{formatCurrency(costBreakdown.profitAfterCommissions || (costBreakdown.grossProfit - (costBreakdown.commissionValue + costBreakdown.referralPartnerCommission)))}</TableCell>
                                                        </TableRow>
                                                        
                                                        {/* Taxa Setup (se aplicável) */}
                                                        {costBreakdown.setupFee > 0 && (
                                                            <TableRow className="border-slate-800">
                                                                <TableCell className="text-white">Taxa Setup (única)</TableCell>
                                                                <TableCell className="text-right text-white">{formatCurrency(costBreakdown.setupFee)}</TableCell>
                                                            </TableRow>
                                                        )}
                                                        
                                                        {/* Impostos sobre Lucro */}
                                                        {costBreakdown.profitTaxValue > 0 && (
                                                            <>
                                                                <TableRow className="border-slate-800 bg-red-900/30">
                                                                    <TableCell className="text-white font-semibold">(-) Impostos sobre Lucro</TableCell>
                                                                    <TableCell className="text-right text-white">{formatCurrency(costBreakdown.profitTaxValue)}</TableCell>
                                                                </TableRow>
                                                                <TableRow className="border-slate-800">
                                                                    <TableCell className="text-white pl-8">CSLL ({formatBrazilianNumber(taxRates.csll)}%)</TableCell>
                                                                    <TableCell className="text-right text-white">{formatCurrency((costBreakdown.profitAfterCommissions || 0) * (taxRates.csll / 100))}</TableCell>
                                                                </TableRow>
                                                                <TableRow className="border-slate-800">
                                                                    <TableCell className="text-white pl-8">IRPJ ({formatBrazilianNumber(taxRates.irpj)}%)</TableCell>
                                                                    <TableCell className="text-right text-white">{formatCurrency((costBreakdown.profitAfterCommissions || 0) * (taxRates.irpj / 100))}</TableCell>
                                                                </TableRow>
                                                            </>
                                                        )}
                                                        <TableRow className="border-slate-800 bg-green-900/50">
                                                            <TableCell className="text-white font-bold">LUCRO LÍQUIDO</TableCell>
                                                            <TableCell className={`text-right font-bold ${costBreakdown.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                                {formatCurrency(costBreakdown.netProfit)}
                                                            </TableCell>
                                                        </TableRow>
                                                        <TableRow className="border-slate-800">
                                                            <TableCell className="text-white font-semibold">Balance</TableCell>
                                                            <TableCell className={`text-right font-semibold ${costBreakdown.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                                {formatCurrency(costBreakdown.netProfit)}
                                                            </TableCell>
                                                        </TableRow>
                                                        <TableRow className="border-slate-800">
                                                            <TableCell className="text-white font-semibold">Rentabilidade %</TableCell>
                                                            <TableCell className={`text-right font-semibold ${(costBreakdown.netProfit / costBreakdown.finalPrice * 100) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                                {formatBrazilianNumber((costBreakdown.netProfit / costBreakdown.finalPrice) * 100)}%
                                                            </TableCell>
                                                        </TableRow>
                                                        <TableRow className="border-slate-800">
                                                            <TableCell className="text-white font-semibold">Lucratividade</TableCell>
                                                            <TableCell className={`text-right font-semibold ${(costBreakdown.netProfit / costBreakdown.finalPrice * 100) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                                {formatBrazilianNumber((costBreakdown.netProfit / costBreakdown.finalPrice) * 100)}%
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableBody>
                                                </Table>
                                            </CardContent>
                                        </Card>

                                        {/* Tabela de Impostos Editável */}
                                        <Card className="bg-slate-900/80 border-slate-800 text-white">
                                            <CardHeader>
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <CardTitle className="flex items-center">
                                                            <div className="w-4 h-4 bg-yellow-500 mr-2"></div>
                                                            Tabela de Impostos
                                                        </CardTitle>
                                                        <CardDescription>Configure as alíquotas de impostos</CardDescription>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                // Reset to default values
                                                                const defaultTaxRates = {
                                                                    banda: 2.09,
                                                                    fundraising: 0,
                                                                    rate: 24,
                                                                    pis: 1.65,
                                                                    cofins: 7.60,
                                                                    margem: 15,
                                                                    csll: 9.00,
                                                                    irpj: 15.00,
                                                                    custoDesp: 10
                                                                };
                                                                setTaxRates(defaultTaxRates);
                                                                localStorage.setItem('vmTaxRates', JSON.stringify(defaultTaxRates));
                                                            }}
                                                            className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                                        >
                                                            Resetar
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setIsEditingTaxes(!isEditingTaxes)}
                                                            className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                                        >
                                                            {isEditingTaxes ? 'Salvar' : 'Editar'}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="pis-rate">PIS (%)</Label>
                                                        <Input
                                                            id="pis-rate"
                                                            type="number"
                                                            step="0.01"
                                                            value={taxRates.pis?.toFixed(2) || "1.65"}
                                                            onChange={(e) => handleTaxRateChange('pis', parseFloat(e.target.value) || 1.65)}
                                                            disabled={!isEditingTaxes}
                                                            className="bg-slate-800 border-slate-700"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="cofins-rate">Cofins (%)</Label>
                                                        <Input
                                                            id="cofins-rate"
                                                            type="number"
                                                            step="0.01"
                                                            value={taxRates.cofins?.toFixed(2) || "7.60"}
                                                            onChange={(e) => handleTaxRateChange('cofins', parseFloat(e.target.value) || 7.60)}
                                                            disabled={!isEditingTaxes}
                                                            className="bg-slate-800 border-slate-700"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="csll-rate">CSLL (%)</Label>
                                                        <Input
                                                            id="csll-rate"
                                                            type="number"
                                                            step="0.01"
                                                            value={taxRates.csll?.toFixed(2) || "9.00"}
                                                            onChange={(e) => handleTaxRateChange('csll', parseFloat(e.target.value) || 9.00)}
                                                            disabled={!isEditingTaxes}
                                                            className="bg-slate-800 border-slate-700"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="irpj-rate">IRPJ (%)</Label>
                                                        <Input
                                                            id="irpj-rate"
                                                            type="number"
                                                            step="0.01"
                                                            value={taxRates.irpj?.toFixed(2) || "15.00"}
                                                            onChange={(e) => handleTaxRateChange('irpj', parseFloat(e.target.value) || 15.00)}
                                                            disabled={!isEditingTaxes}
                                                            className="bg-slate-800 border-slate-700"
                                                        />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

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
                                                                <span className="text-blue-300 font-semibold">{formatCurrency(costBreakdown.finalPrice)}</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-gray-300">Anual:</span>
                                                                <span className="text-blue-300 font-semibold">{formatCurrency(costBreakdown.finalPrice * 12)}</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-gray-300">Setup:</span>
                                                                <span className="text-blue-300 font-semibold">{formatCurrency(0)}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* CUSTOS */}
                                                    <div className="bg-gradient-to-br from-red-900/50 to-red-800/30 p-4 rounded-lg border border-red-500/30">
                                                        <h3 className="text-sm font-semibold text-red-300 mb-3 uppercase tracking-wide">CUSTOS</h3>
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-gray-300">VM:</span>
                                                                <span className="text-red-300 font-semibold">{formatCurrency(costBreakdown.cost)}</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-gray-300">Comissão:</span>
                                                                <span className="text-red-300 font-semibold">{formatCurrency(costBreakdown.commissionValue)}</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-gray-300">Impostos:</span>
                                                                <span className="text-red-300 font-semibold">{formatCurrency(costBreakdown.taxAmount)}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* LUCRO */}
                                                    <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 p-4 rounded-lg border border-green-500/30">
                                                        <h3 className="text-sm font-semibold text-green-300 mb-3 uppercase tracking-wide">LUCRO</h3>
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-gray-300">Operacional:</span>
                                                                <span className={`font-semibold ${costBreakdown.grossProfit >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                                                                    {formatCurrency(costBreakdown.grossProfit)}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-gray-300">Líquido:</span>
                                                                <span className={`font-semibold ${costBreakdown.netProfit >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                                                                    {formatCurrency(costBreakdown.netProfit)}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-gray-300">Anual:</span>
                                                                <span className={`font-semibold ${costBreakdown.netProfit >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                                                                    {formatCurrency(costBreakdown.netProfit * 12)}
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
                                                                <span className={`font-semibold ${(costBreakdown.netProfit / costBreakdown.finalPrice * 100) >= 0 ? 'text-purple-300' : 'text-red-300'}`}>
                                                                    {formatBrazilianNumber((costBreakdown.netProfit / costBreakdown.finalPrice) * 100)}%
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-gray-300">Payback:</span>
                                                                <span className="text-purple-300 font-semibold">
                                                                    {costBreakdown.netProfit > 0 ? `${Math.ceil(costBreakdown.finalPrice / costBreakdown.netProfit)}m` : 'N/A'}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-gray-300">ROI Anual:</span>
                                                                <span className={`font-semibold ${(costBreakdown.netProfit / costBreakdown.finalPrice * 100) >= 0 ? 'text-purple-300' : 'text-red-300'}`}>
                                                                    {formatBrazilianNumber((costBreakdown.netProfit / costBreakdown.finalPrice) * 100 * 12)}%
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
                                                                {formatCurrency(costBreakdown.finalPrice * 12)}
                                                            </div>
                                                            <div className="text-sm text-slate-400">Receita Total (12m)</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className={`text-2xl font-bold ${costBreakdown.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                                {formatCurrency(costBreakdown.netProfit * 12)}
                                                            </div>
                                                            <div className="text-sm text-slate-400">Lucro Total (12m)</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className={`text-2xl font-bold ${(costBreakdown.netProfit / costBreakdown.finalPrice * 100) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                                {formatBrazilianNumber((costBreakdown.netProfit / costBreakdown.finalPrice) * 100)}%
                                                            </div>
                                                            <div className="text-sm text-slate-400">Margem Líquida</div>
                                                        </div>
                                                    </div>
                                                </div>


                                            </CardContent>
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
                                                    Total de Impostos do Regime Selecionado: {(revenueTaxes + profitTaxes).toFixed(2).replace('.', ',')}%
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
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                                                            <Label htmlFor="estimated-net-margin">Margem Líquida (%)</Label>
                                                            <Input 
                                                                id="estimated-net-margin" 
                                                                type="text" 
                                                                value={estimatedNetMargin.toFixed(2) + '%'} 
                                                                readOnly 
                                                                className="bg-slate-800 border-slate-700 text-white cursor-not-allowed" 
                                                            />
                                                        </div>
                                                    </div>
                                                    <Separator className="my-4 bg-slate-700" />
                                                    <div className="space-y-2 text-sm">
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div className="text-slate-400">Custo Base:</div>
                                                            <div className="text-right">{formatCurrency(costBreakdown.baseCost)}</div>
                                                            
                                                            <div className="text-slate-400">Impostos ({((costBreakdown.taxAmount / costBreakdown.finalPrice) * 100 || 0).toFixed(2)}%):</div>
                                                            <div className="text-right">{formatCurrency(costBreakdown.taxAmount)}</div>
                                                            
                                                            <div className="text-slate-400">Custo Total c/ Impostos:</div>
                                                            <div className="text-right font-medium">{formatCurrency(costBreakdown.totalCostWithTaxes)}</div>
                                                            
                                                            <div className="text-green-400">Markup ({markup}%):</div>
                                                            <div className="text-right text-green-400 font-medium">+{formatCurrency(costBreakdown.markupAmount)}</div>
                                                            
                                                            {costBreakdown.contractDiscount.percentage > 0 && (
                                                                <>
                                                                    <div className="text-orange-400">Desconto Contrato ({costBreakdown.contractDiscount.percentage}%):</div>
                                                                    <div className="text-right text-orange-400">-{formatCurrency(costBreakdown.contractDiscount.amount)}</div>
                                                                </>
                                                            )}
                                                            
                                                            {costBreakdown.directorDiscount.percentage > 0 && (
                                                                <>
                                                                    <div className="text-orange-400">Desconto Diretor ({costBreakdown.directorDiscount.percentage}%):</div>
                                                                    <div className="text-right text-orange-400">-{formatCurrency(costBreakdown.directorDiscount.amount)}</div>
                                                                </>
                                                            )}
                                                            
                                                            <div className="border-t border-slate-700 pt-2 font-semibold">Preço Final:</div>
                                                            <div className="border-t border-slate-700 pt-2 text-right font-bold">{formatCurrency(costBreakdown.finalPrice)}</div>
                                                            
                                                            <div className="text-cyan-400 mt-2">Margem Líquida:</div>
                                                            <div className="text-right mt-2">
                                                                <span className={`font-bold ${costBreakdown.netMargin > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                                    {costBreakdown.netMargin.toFixed(2)}%
                                                                </span>
                                                            </div>
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
                                                        <h4 className="text-cyan-400 mb-2">vCPU Windows (por core)</h4>
                                                        <div>
                                                            <Label>Custo Mensal</Label>
                                                            <Input value={formatBrazilianNumber(vcpuWindowsCost)} onChange={(e) => setVcpuWindowsCost(parseFloat(e.target.value.replace(",", ".")) || 0)} className="bg-slate-800 border-slate-700" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-cyan-400 mb-2">vCPU Linux (por core)</h4>
                                                        <div>
                                                            <Label>Custo Mensal</Label>
                                                            <Input value={formatBrazilianNumber(vcpuLinuxCost)} onChange={(e) => setVcpuLinuxCost(parseFloat(e.target.value.replace(",", ".")) || 0)} className="bg-slate-800 border-slate-700" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-6">
                                                    <h4 className="text-cyan-400 mb-4">RAM (por GB)</h4>
                                                    <div>
                                                        <Label>Custo Mensal</Label>
                                                        <Input value={formatBrazilianNumber(ramCost)} onChange={(e) => setRamCost(parseFloat(e.target.value.replace(",", ".")) || 0)} className="bg-slate-800 border-slate-700" />
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
                                                            <Input value={formatBrazilianNumber(hddSasCost)} onChange={(e) => setHddSasCost(parseFloat(e.target.value.replace(",", ".")) || 0)} className="bg-slate-800 border-slate-700" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-cyan-400 mb-4">SSD Performance</h4>
                                                        <div>
                                                            <Label>Custo Mensal</Label>
                                                            <Input value={formatBrazilianNumber(ssdPerformanceCost)} onChange={(e) => setSsdPerformanceCost(parseFloat(e.target.value.replace(",", ".")) || 0)} className="bg-slate-800 border-slate-700" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-cyan-400 mb-4">NVMe</h4>
                                                        <div>
                                                            <Label>Custo Mensal</Label>
                                                            <Input value={formatBrazilianNumber(nvmeCost)} onChange={(e) => setNvmeCost(parseFloat(e.target.value.replace(",", ".")) || 0)} className="bg-slate-800 border-slate-700" />
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
                                                            <Input value={formatBrazilianNumber(network1GbpsCost)} onChange={(e) => setNetwork1GbpsCost(parseFloat(e.target.value.replace(",", ".")) || 0)} className="bg-slate-800 border-slate-700" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-cyan-400 mb-2">10 Gbps</h4>
                                                        <div>
                                                            <Label>Custo Mensal</Label>
                                                            <Input value={formatBrazilianNumber(network10GbpsCost)} onChange={(e) => setNetwork10GbpsCost(parseFloat(e.target.value.replace(",", ".")) || 0)} className="bg-slate-800 border-slate-700" />
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
                                                                <Input value={formatBrazilianNumber(windowsServerCost)} onChange={(e) => setWindowsServerCost(parseFloat(e.target.value.replace(",", ".")) || 0)} className="bg-slate-800 border-slate-700" />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <h4 className="text-cyan-400 mb-2">Windows 10 Pro</h4>
                                                            <div>
                                                                <Label>Custo Mensal</Label>
                                                                <Input value={formatBrazilianNumber(windows10ProCost)} onChange={(e) => setWindows10ProCost(parseFloat(e.target.value.replace(",", ".")) || 0)} className="bg-slate-800 border-slate-700" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <h4 className="text-cyan-400 mb-2">Ubuntu Server 22.04 LTS</h4>
                                                            <div>
                                                                <Label>Custo Mensal</Label>
                                                                <Input value={formatBrazilianNumber(ubuntuCost)} onChange={(e) => setUbuntuCost(parseFloat(e.target.value.replace(",", ".")) || 0)} className="bg-slate-800 border-slate-700" />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <h4 className="text-cyan-400 mb-2">CentOS Stream 9</h4>
                                                            <div>
                                                                <Label>Custo Mensal</Label>
                                                                <Input value={formatBrazilianNumber(centosCost)} onChange={(e) => setCentosCost(parseFloat(e.target.value.replace(",", ".")) || 0)} className="bg-slate-800 border-slate-700" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <h4 className="text-cyan-400 mb-2">Debian 12</h4>
                                                            <div>
                                                                <Label>Custo Mensal</Label>
                                                                <Input value={formatBrazilianNumber(debianCost)} onChange={(e) => setDebianCost(parseFloat(e.target.value.replace(",", ".")) || 0)} className="bg-slate-800 border-slate-700" />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <h4 className="text-cyan-400 mb-2">Rocky Linux 9</h4>
                                                            <div>
                                                                <Label>Custo Mensal</Label>
                                                                <Input value={formatBrazilianNumber(rockyLinuxCost)} onChange={(e) => setRockyLinuxCost(parseFloat(e.target.value.replace(",", ".")) || 0)} className="bg-slate-800 border-slate-700" />
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
                                                        <Input value={formatBrazilianNumber(backupCostPerGb)} onChange={(e) => setBackupCostPerGb(parseFloat(e.target.value.replace(",", ".")) || 0)} className="bg-slate-800 border-slate-700" />
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
                                                        <Input value={formatBrazilianNumber(additionalIpCost)} onChange={(e) => setAdditionalIpCost(parseFloat(e.target.value.replace(",", ".")) || 0)} className="bg-slate-800 border-slate-700" />
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
                                                        <Input value={formatBrazilianNumber(snapshotCost)} onChange={(e) => setSnapshotCost(parseFloat(e.target.value.replace(",", ".")) || 0)} className="bg-slate-800 border-slate-700" />
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
                                                        <Input value={formatBrazilianNumber(vpnSiteToSiteCost)} onChange={(e) => setVpnSiteToSiteCost(parseFloat(e.target.value.replace(",", ".")) || 0)} className="bg-slate-800 border-slate-700" />
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
                                                            <Input value={contractDiscounts[12]} onChange={(e) => setContractDiscounts(prev => ({...prev, 12: parseFloat(e.target.value.replace(",", ".")) || 0}))} className="bg-slate-800 border-slate-700" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-cyan-400 mb-2">24 Meses</h4>
                                                        <div>
                                                            <Label>Desconto (%)</Label>
                                                            <Input value={contractDiscounts[24]} onChange={(e) => setContractDiscounts(prev => ({...prev, 24: parseFloat(e.target.value.replace(",", ".")) || 0}))} className="bg-slate-800 border-slate-700" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-cyan-400 mb-2">36 Meses</h4>
                                                        <div>
                                                            <Label>Desconto (%)</Label>
                                                            <Input value={contractDiscounts[36]} onChange={(e) => setContractDiscounts(prev => ({...prev, 36: parseFloat(e.target.value.replace(",", ".")) || 0}))} className="bg-slate-800 border-slate-700" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-cyan-400 mb-2">48 Meses</h4>
                                                        <div>
                                                            <Label>Desconto (%)</Label>
                                                            <Input value={contractDiscounts[48]} onChange={(e) => setContractDiscounts(prev => ({...prev, 48: parseFloat(e.target.value.replace(",", ".")) || 0}))} className="bg-slate-800 border-slate-700" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-cyan-400 mb-2">60 Meses</h4>
                                                        <div>
                                                            <Label>Desconto (%)</Label>
                                                            <Input value={contractDiscounts[60]} onChange={(e) => setContractDiscounts(prev => ({...prev, 60: parseFloat(e.target.value.replace(",", ".")) || 0}))} className="bg-slate-800 border-slate-700" />
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
                                                        <Input value={formatBrazilianNumber(setupFee)} onChange={(e) => setSetupFee(parseFloat(e.target.value.replace(",", ".")) || 0)} className="bg-slate-800 border-slate-700" />
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
                                                        <Input value={formatBrazilianNumber(managementAndSupportCost)} onChange={(e) => setManagementAndSupportCost(parseFloat(e.target.value.replace(",", ".")) || 0)} className="bg-slate-800 border-slate-700" />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Botão Salvar */}
                                        <div className="flex justify-end">
                                            <Button
                                                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                                                onClick={handleSaveSettings}
                                            >
                                                <Save className="h-4 w-4" />
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
                                                        <div className="mb-4">
                                                            <Label htmlFor="proposal-status" className="mb-2 block">Status da Proposta</Label>
                                                            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                                                <SelectTrigger id="proposal-status" className="bg-slate-800 border-slate-700 text-white">
                                                                    <SelectValue placeholder="Selecione o status" />
                                                                </SelectTrigger>
                                                                <SelectContent className="bg-slate-800 text-white">
                                                                    <SelectItem value="Aguardando aprovação desconto Diretoria">Aguardando aprovação desconto Diretoria</SelectItem>
                                                                    <SelectItem value="Aguardando Aprovação do Cliente">Aguardando Aprovação do Cliente</SelectItem>
                                                                    <SelectItem value="Fechado Ganho">Fechado Ganho</SelectItem>
                                                                    <SelectItem value="Perdido">Perdido</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
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
                                                        
                                                        <div className="space-y-2 pt-4 border-t border-slate-700">
                                                            {applySalespersonDiscount && (
                                                                <div className="flex justify-between text-orange-400">
                                                                    <span>Desconto Vendedor (5%):</span>
                                                                    <span>-{formatCurrency((addedProducts.reduce((sum, p) => sum + p.setup + p.monthly, 0)) * 0.05)}</span>
                                                                </div>
                                                            )}
                                                            {appliedDirectorDiscountPercentage > 0 && (
                                                                <div className="flex justify-between text-orange-400">
                                                                    <span>Desconto Diretor ({appliedDirectorDiscountPercentage}%):</span>
                                                                    <span>-{formatCurrency((addedProducts.reduce((sum, p) => sum + p.setup + p.monthly, 0)) * (applySalespersonDiscount ? 0.95 : 1) * (appliedDirectorDiscountPercentage / 100))}</span>
                                                                </div>
                                                            )}
                                                            <div className="flex justify-between items-center font-bold text-lg">
                                                                <div>
                                                                    Total Setup: <span className="text-green-400">{formatCurrency(addedProducts.reduce((sum, p) => sum + p.setup, 0) * (applySalespersonDiscount ? 0.95 : 1) * (1 - appliedDirectorDiscountPercentage / 100))}</span>
                                                                </div>
                                                                <div>
                                                                    Total Mensal: <span className="text-green-400">{formatCurrency(addedProducts.reduce((sum, p) => sum + p.monthly, 0) * (applySalespersonDiscount ? 0.95 : 1) * (1 - appliedDirectorDiscountPercentage / 100))}</span>
                                                                </div>
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
                            <Button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700" disabled={addedProducts.length === 0}><Download className="h-4 w-4 mr-2" />Gerar PDF</Button>
                            <Button variant="outline" onClick={() => setViewMode('search')}>Cancelar</Button>
                        </div>
                        </>
                        )}
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