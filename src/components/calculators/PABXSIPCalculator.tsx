"use client";

import React, { useState, useEffect } from 'react';
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
    Trash2
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

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
type ProductType = 'PABX' | 'SIP';

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
    clientName: string;
    accountManager: string;
    products: Product[];
    totalSetup: number;
    totalMonthly: number;
    date: string;
}

const PABXSIPCalculator: React.FC = () => {
    // Estados de gerenciamento de propostas
    const [currentProposal, setCurrentProposal] = useState<Proposal | null>(null);
    const [viewMode, setViewMode] = useState<'search' | 'create' | 'edit'>('search');
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');

    // Estados dos formulários
    const [clientName, setClientName] = useState('');
    const [accountManager, setAccountManager] = useState('');
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

    const handleRemoveProduct = (id: string) => {
        setAddedProducts(prev => prev.filter(p => p.id !== id));
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
        clearForm();
        const newProposalId = generateProposalId();
        const newProposal: Proposal = {
            id: newProposalId,
            clientName: '',
            accountManager: '',
            products: [],
            totalSetup: 0,
            totalMonthly: 0,
            date: new Date().toLocaleDateString('pt-BR')
        };
        setCurrentProposal(newProposal);
        setViewMode('create');
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
                        <Card className="bg-slate-900/80 border-slate-800 text-white mb-6">
                            <CardHeader>
                                <CardTitle>{viewMode === 'create' ? 'Criar Nova Proposta' : 'Editar Proposta'}</CardTitle>
                                <CardDescription>ID da Proposta: {currentProposal?.id}</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="client-name">Nome do Cliente</Label>
                                    <Input id="client-name" value={clientName} onChange={(e) => setClientName(e.target.value)} className="bg-slate-800 border-slate-700" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="account-manager">Gerente de Contas</Label>
                                    <Input id="account-manager" value={accountManager} onChange={(e) => setAccountManager(e.target.value)} className="bg-slate-800 border-slate-700" />
                                </div>
                            </CardContent>
                        </Card>

                        <div>
                            <Tabs defaultValue="calculator" className="w-full">
                                <TabsList className="grid w-full grid-cols-2 bg-slate-800">
                                    <TabsTrigger value="calculator">Calculadora</TabsTrigger>
                                    <TabsTrigger value="list-price">List Price</TabsTrigger>
                                </TabsList>
                                <TabsContent value="calculator">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                                        {/* Calculadora PABX */}
                                        <Card className="bg-slate-900/80 border-slate-800 text-white">
                                            <CardHeader>
                                                <CardTitle className="flex items-center"><Phone className="mr-2" />PABX em Nuvem</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-4">
                                                    <div>
                                                        <Label htmlFor="pabx-extensions">Quantidade de Ramais</Label>
                                                        <Input id="pabx-extensions" type="number" value={pabxExtensions} onChange={e => setPabxExtensions(Number(e.target.value))} className="bg-slate-700" />
                                                    </div>
                                                    <div className="flex items-center space-x-2 pt-2">
                                                        <Checkbox id="pabxIncludeSetup" checked={pabxIncludeSetup} onCheckedChange={(checked) => setPabxIncludeSetup(!!checked)} className="border-white" />
                                                        <label htmlFor="pabxIncludeSetup" className="text-sm font-medium leading-none">Incluir Taxa de Setup</label>
                                                    </div>
                                                    <div className="flex items-center space-x-2 pt-2">
                                                        <Checkbox id="pabxIncludeDevices" checked={pabxIncludeDevices} onCheckedChange={(checked) => setPabxIncludeDevices(Boolean(checked))} />
                                                        <Label htmlFor="pabxIncludeDevices">Incluir Aparelhos (Ramais Físicos)</Label>
                                                    </div>
                                                    {pabxIncludeDevices && (
                                                        <div className="pl-6 mt-2">
                                                            <Label htmlFor="pabx-device-quantity">Quantidade de Aparelhos</Label>
                                                            <Input id="pabx-device-quantity" type="number" value={pabxDeviceQuantity} onChange={(e) => setPabxDeviceQuantity(Number(e.target.value))} min="0" className="bg-slate-700 border-slate-600 mt-1" />
                                                        </div>
                                                    )}
                                                    <div className="flex items-center space-x-2 mt-4">
                                                        <Checkbox id="includeAIAgent" checked={includeAIAgent} onCheckedChange={(checked) => setIncludeAIAgent(Boolean(checked))} />
                                                        <Label htmlFor="includeAIAgent">Incluir Agente IA</Label>
                                                    </div>
                                                    {includeAIAgent && (
                                                        <div className="pl-6 mt-2">
                                                            <Label htmlFor="aiAgentPlan">Plano de Agente IA</Label>
                                                            <Select onValueChange={setSelectedAIAgentPlan} value={selectedAIAgentPlan}>
                                                                <SelectTrigger id="aiAgentPlan" className="bg-slate-700 border-slate-600">
                                                                    <SelectValue placeholder="Selecione um plano de créditos" />
                                                                </SelectTrigger>
                                                                <SelectContent className="bg-slate-800 text-white">
                                                                    {Object.entries(aiAgentPlans).map(([key, plan]) => (
                                                                        <SelectItem key={key} value={key}>{plan.name}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            {selectedAIAgentPlan && aiAgentPlans[selectedAIAgentPlan] && (
                                                                <div className="mt-4 p-3 bg-slate-800/50 rounded-lg text-sm text-slate-300">
                                                                    <p className="font-bold text-white mb-2">Tenha até:</p>
                                                                    <p>{aiAgentPlans[selectedAIAgentPlan].messages}</p>
                                                                    <p>{aiAgentPlans[selectedAIAgentPlan].minutes}</p>
                                                                    <p>{aiAgentPlans[selectedAIAgentPlan].premiumVoice}</p>
                                                                    <p className="text-xs text-slate-400 mt-2">Opções acima combinadas</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                            <CardFooter className="flex-col items-start">
                                                {pabxResult && (
                                                    <div className="w-full">
                                                        <Separator className="bg-slate-700 my-4" />
                                                        <div className="text-lg font-bold mb-2">Resultado PABX:</div>
                                                        <div className="flex justify-between"><span>Taxa de Setup:</span> <span>{formatCurrency(pabxResult.setup)}</span></div>
                                                        <div className="flex justify-between"><span>Mensalidade Base:</span> <span>{formatCurrency(pabxResult.baseMonthly)}</span></div>
                                                        {pabxResult.deviceRentalCost > 0 && (
                                                            <div className="flex justify-between"><span>Aluguel de Aparelhos:</span> <span>{formatCurrency(pabxResult.deviceRentalCost)}</span></div>
                                                        )}
                                                        {pabxResult.aiAgentCost > 0 && (
                                                            <div className="flex justify-between"><span>Agente IA:</span> <span>{formatCurrency(pabxResult.aiAgentCost)}</span></div>
                                                        )}
                                                        <div className="flex justify-between text-green-400 font-bold mt-2"><span>Total Mensal:</span> <span>{formatCurrency(pabxResult.baseMonthly + pabxResult.deviceRentalCost + pabxResult.aiAgentCost)}</span></div>
                                                        <Button onClick={handleAddPabxProduct} className="w-full mt-4 bg-green-600 hover:bg-green-700">Adicionar à Proposta</Button>
                                                    </div>
                                                )}
                                            </CardFooter>
                                        </Card>

                                        {/* Calculadora SIP */}
                                        <Card className="bg-slate-900/80 border-slate-800 text-white">
                                            <CardHeader>
                                                <CardTitle className="flex items-center"><PhoneForwarded className="mr-2" />SIP Trunk</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-4">
                                                    <div>
                                                        <Label htmlFor="sip-plan">Plano SIP</Label>
                                                        <Select onValueChange={setSelectedSipPlan} value={selectedSipPlan}>
                                                            <SelectTrigger className="bg-slate-700">
                                                                <SelectValue placeholder="Selecione um plano" />
                                                            </SelectTrigger>
                                                            <SelectContent className="bg-slate-800 text-white">
                                                                {sipPlans.map((plan) => (
                                                                    <SelectItem key={plan.name} value={plan.name}>{plan.name}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="flex items-center space-x-2 pt-2">
                                                        <Checkbox id="sipIncludeSetup" checked={sipIncludeSetup} onCheckedChange={(checked) => setSipIncludeSetup(!!checked)} className="border-white" />
                                                        <label htmlFor="sipIncludeSetup" className="text-sm font-medium leading-none">Incluir Taxa de Setup</label>
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="sip-additional-channels">Canais Adicionais</Label>
                                                        <Input id="sip-additional-channels" type="number" value={sipAdditionalChannels || ''} onChange={(e) => setSipAdditionalChannels(Number(e.target.value))} min="0" className="bg-slate-700 border-slate-600 mt-1" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className={!selectedSipPlan || !sipPlans.find(p => p.name === selectedSipPlan)?.monthlyWithEquipment ? 'text-gray-500' : ''}>
                                                            Franquia/Assinatura Mensal
                                                        </Label>
                                                        <RadioGroup
                                                            value={sipWithEquipment ? 'with' : 'without'}
                                                            onValueChange={(value) => setSipWithEquipment(value === 'with')}
                                                        >
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem value="without" id="without-equipment" />
                                                                <Label htmlFor="without-equipment">Sem Equipamentos</Label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem 
                                                                    value="with" 
                                                                    id="with-equipment" 
                                                                    disabled={!selectedSipPlan || !sipPlans.find(p => p.name === selectedSipPlan)?.monthlyWithEquipment}
                                                                />
                                                                <Label 
                                                                    htmlFor="with-equipment" 
                                                                    className={!selectedSipPlan || !sipPlans.find(p => p.name === selectedSipPlan)?.monthlyWithEquipment ? 'text-gray-500' : ''}
                                                                >
                                                                    Com Equipamentos
                                                                </Label>
                                                            </div>
                                                        </RadioGroup>
                                                    </div>
                                                </div>
                                            </CardContent>
                                            <CardFooter className="flex-col items-start">
                                                {sipResult && (
                                                    <div className="w-full">
                                                        <Separator className="bg-slate-700 my-4" />
                                                        <div className="text-lg font-bold mb-2">Resultado SIP:</div>
                                                        <div className="flex justify-between"><span>Taxa de Setup:</span> <span>{formatCurrency(sipResult.setup)}</span></div>
                                                        <div className="flex justify-between text-green-400 font-bold mt-2"><span>Total Mensal:</span> <span>{formatCurrency(sipResult.monthly)}</span></div>
                                                        <Button onClick={handleAddSipProduct} className="w-full mt-4 bg-green-600 hover:bg-green-700">Adicionar à Proposta</Button>
                                                    </div>
                                                )}
                                            </CardFooter>
                                        </Card>
                                    </div>
                                </TabsContent>
                                <TabsContent value="list-price">
                                    <Card className="bg-slate-900/80 border-slate-800 text-white mt-6">
                                        <CardHeader>
                                            <CardTitle>Tabela de Preços (List Price)</CardTitle>
                                            <CardDescription>Valores de referência para os serviços.</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-12">
                                                {/* Tabela PABX em Nuvem */}
                                                <div>
                                                    <h3 className="text-xl font-semibold mb-4">PABX em Nuvem</h3>
                                                    <div className="overflow-x-auto">
                                                        <Table className="min-w-full border-collapse">
                                                            <TableHeader>
                                                                <TableRow className="bg-yellow-400">
                                                                    {pabxListPriceData.headers.map(header => <TableHead key={header} className="text-black font-bold border border-slate-500 px-2 py-1">{header}</TableHead>)}
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {pabxListPriceData.rows.map(row => (
                                                                    <TableRow key={row.service} className="border-slate-800">
                                                                        <TableCell className="font-semibold border border-slate-600 px-2 py-1">{row.service}</TableCell>
                                                                        {row.values.map((value, index) => <TableCell key={index} className="border border-slate-700 text-center px-2 py-1">{value}</TableCell>)}
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                </div>

                                                {/* Tabela SIP Trunk */}
                                                <div>
                                                    <h3 className="text-xl font-semibold mb-4">SIP Trunk</h3>
                                                    <div className="overflow-x-auto pb-2">
                                                        <Table className="min-w-full border-collapse">
                                                            <TableHeader>
                                                                <TableRow className="bg-blue-900">
                                                                    <TableHead rowSpan={2} className="text-white font-bold border-r border-b border-slate-500 align-middle text-center p-2">SIP TRUNK</TableHead>
                                                                    {sipListPriceData.headers.top.map(header => (
                                                                        <TableHead key={header.title} colSpan={header.span} className="text-white font-bold border-b border-slate-500 text-center p-2">{header.title}</TableHead>
                                                                    ))}
                                                                </TableRow>
                                                                <TableRow className="bg-blue-800">
                                                                    {sipListPriceData.headers.bottom.map(header => (
                                                                        <TableHead key={header} className="text-white font-semibold border-r border-slate-600 text-center p-2">{header}</TableHead>
                                                                    ))}
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {sipListPriceData.rows.map(row => (
                                                                    <TableRow key={row.service} className="border-slate-800">
                                                                        <TableCell className="font-semibold border border-slate-600 p-2">{row.service}</TableCell>
                                                                        {row.values.map((cell, index) => {
                                                                            if (typeof cell === 'object' && cell !== null) {
                                                                                return <TableCell key={index} colSpan={cell.span} className="border border-slate-700 text-center p-2">{cell.value}</TableCell>;
                                                                            }
                                                                            return <TableCell key={index} className="border border-slate-700 text-center p-2">{cell as React.ReactNode}</TableCell>;
                                                                        })}
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="bg-gradient-to-r from-blue-600 to-cyan-400 rounded-t-lg p-4 mb-6">
                                                        <div className="flex items-center justify-between">
                                                            <div className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                                                                Agente de IA
                                                            </div>
                                                            <div className="text-white">
                                                                <h3 className="text-xl font-bold">Créditos de Interação</h3>
                                                                <p className="text-sm opacity-90">Por mensagem, ligação e voz premium</p>
                                                            </div>
                                                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                                                                <div className="w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center">
                                                                    <div className="w-8 h-8 bg-blue-600 rounded-full"></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                                                        {Object.values(aiAgentPlans).map((plan, index) => (
                                                            <div key={index} className="bg-slate-100 rounded-lg overflow-hidden shadow-lg">
                                                                {/* Círculo com o nome do plano */}
                                                                <div className="flex justify-center pt-6 pb-4">
                                                                    <div className={`w-20 h-20 ${plan.color} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
                                                                        {plan.name}
                                                                    </div>
                                                                </div>

                                                                {/* Créditos */}
                                                                <div className="px-4 pb-2 text-center">
                                                                    <p className="text-xs text-gray-600 font-medium">{plan.credits}</p>
                                                                </div>

                                                                {/* Seção "Tenha até:" */}
                                                                <div className="bg-gray-200 px-4 py-2">
                                                                    <p className="text-sm font-bold text-gray-800 text-center">Tenha até:</p>
                                                                </div>

                                                                {/* Detalhes */}
                                                                <div className="px-4 py-3 space-y-2">
                                                                    <div className="bg-gray-300 px-3 py-2 rounded text-xs text-gray-800 text-center">
                                                                        {plan.messages}
                                                                    </div>
                                                                    <div className="bg-gray-300 px-3 py-2 rounded text-xs text-gray-800 text-center">
                                                                        {plan.minutes}
                                                                    </div>
                                                                    <div className="bg-gray-300 px-3 py-2 rounded text-xs text-gray-800 text-center">
                                                                        {plan.premiumVoice}
                                                                    </div>
                                                                    <div className="bg-gray-300 px-3 py-2 rounded text-xs text-gray-600 text-center">
                                                                        Opções acima combinadas
                                                                    </div>
                                                                </div>

                                                                {/* Preço */}
                                                                <div className="bg-gray-800 px-4 py-3 text-center">
                                                                    <p className="text-lg font-bold text-white">{formatCurrency(plan.monthlyCost)}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Legendas */}
                                                    <div className="text-center mt-6 text-xs text-gray-600 space-y-1">
                                                        <p>✧ *2 créditos por mensagem</p>
                                                        <p>✧ **10 créditos por minuto (voz padrão)</p>
                                                        <p>✧ ***20 créditos por minuto (voz premium)</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>

                        <Card className="bg-slate-900/80 border-slate-800 text-white mt-6">
                            <CardHeader>
                                <CardTitle>Resumo da Proposta</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader><TableRow className="border-slate-700"><TableHead className="text-white">Descrição</TableHead><TableHead className="text-white">Setup</TableHead><TableHead className="text-white">Mensal</TableHead><TableHead></TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {addedProducts.map(p => (
                                            <TableRow key={p.id} className="border-slate-800">
                                                <TableCell>{p.description}</TableCell>
                                                <TableCell>{formatCurrency(p.setup)}</TableCell>
                                                <TableCell>{formatCurrency(p.monthly)}</TableCell>
                                                <TableCell><Button variant="destructive" size="sm" onClick={() => handleRemoveProduct(p.id)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <Separator className="bg-slate-700 my-4" />
                                <div className="flex justify-end text-lg font-bold">
                                    <div className="w-1/3 text-right">
                                        <div className="flex justify-between"><span>Total Setup:</span> <span>{formatCurrency(totalSetup)}</span></div>
                                        <div className="flex justify-between"><span>Total Mensal:</span> <span>{formatCurrency(totalMonthly)}</span></div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

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

export default PABXSIPCalculator;
