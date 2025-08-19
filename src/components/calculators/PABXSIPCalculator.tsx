"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Phone, PhoneForwarded, Edit, Plus, Save, Download, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ClientManagerForm, ClientData, AccountManagerData } from './ClientManagerForm';
import { ClientManagerInfo } from './ClientManagerInfo';

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
    client: ClientData;
    accountManager: AccountManagerData;
    items: ProposalItem[];
    totalSetup: number;
    totalMonthly: number;
    createdAt: string;
}

const PABXSIPCalculator: React.FC = () => {
    // Estado para controlar a tela atual
    const [currentView, setCurrentView] = useState<'search' | 'client-form' | 'calculator'>('search');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [savedProposals, setSavedProposals] = useState<Proposal[]>([]);
    const [currentProposal, setCurrentProposal] = useState<Proposal | null>(null);

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

    // Estados PABX
    const [pabxExtensions, setPabxExtensions] = useState<number>(32);
    const [pabxIncludeSetup, setPabxIncludeSetup] = useState<boolean>(true);
    const [pabxIncludeDevices, setPabxIncludeDevices] = useState<boolean>(true);
    const [pabxDeviceQuantity, setPabxDeviceQuantity] = useState<number>(5);
    const [pabxIncludeAI, setPabxIncludeAI] = useState<boolean>(true);
    const [pabxAIPlan, setPabxAIPlan] = useState<string>('100K');
    const [pabxResult, setPabxResult] = useState<PABXResult | null>(null);

    // Estados SIP
    const [sipPlan, setSipPlan] = useState<string>('SIP ILIMITADO 10 Canais');
    const [sipIncludeSetup, setSipIncludeSetup] = useState<boolean>(false);
    const [sipAdditionalChannels, setSipAdditionalChannels] = useState<number>(0);
    const [sipWithEquipment, setSipWithEquipment] = useState<boolean>(true);
    const [sipResult, setSipResult] = useState<SIPResult | null>(null);

    // Estados da Proposta
    const [proposalItems, setProposalItems] = useState<ProposalItem[]>([]);

    // Estados para edição das tabelas
    const [isEditingPABX, setIsEditingPABX] = useState(false);
    const [isEditingSIP, setIsEditingSIP] = useState(false);

    // Estados para edição da tabela AI
    const [isEditingAI, setIsEditingAI] = useState(false);

    // Estados para Markup e Margem
    const [markup, setMarkup] = useState<number>(30);
    const [estimatedNetMargin, setEstimatedNetMargin] = useState<number>(0);
    const [commissionPercentage, setCommissionPercentage] = useState<number>(3);

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

    // Dados de preços do List Price - SIP (editáveis)
    const [sipPrices, setSipPrices] = useState({
        'SIP TARIFADO Call Center 2 Canais': { setup: 0, monthly: 200, monthlyWithEquipment: null, channels: 2 },
        'SIP TARIFADO 2 Canais': { setup: 0, monthly: 150, monthlyWithEquipment: null, channels: 2 },
        'SIP TARIFADO 4 Canais': { setup: 0, monthly: 250, monthlyWithEquipment: 500, channels: 4 },
        'SIP TARIFADO 10 Canais': { setup: 0, monthly: 350, monthlyWithEquipment: 500, channels: 10 },
        'SIP TARIFADO 30 Canais': { setup: 0, monthly: 550, monthlyWithEquipment: 1200, channels: 30 },
        'SIP TARIFADO 60 Canais': { setup: 0, monthly: 1000, monthlyWithEquipment: null, channels: 60 },
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
    const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;
    const generateUniqueId = () => `item-${Date.now()}`;

    // Função para determinar a faixa de preço baseada no número de ramais
    const getPriceRange = (extensions: number): string => {
        if (extensions <= 10) return '10';
        if (extensions <= 20) return '20';
        if (extensions <= 30) return '30';
        if (extensions <= 50) return '50';
        if (extensions <= 100) return '100';
        return '100'; // Para valores acima de 100, usar a última faixa
    };

    // Calcular PABX
    const calculatePABX = () => {
        const range = getPriceRange(pabxExtensions);

        const setup = pabxIncludeSetup ? pabxPrices.setup[range as keyof typeof pabxPrices.setup] : 0;
        const baseMonthly = (pabxPrices.monthly[range as keyof typeof pabxPrices.monthly] * pabxExtensions) +
            pabxPrices.hosting[range as keyof typeof pabxPrices.hosting];
        const deviceRentalCost = pabxIncludeDevices ?
            (pabxPrices.device[range as keyof typeof pabxPrices.device] * pabxDeviceQuantity) : 0;
        const aiAgentCost = pabxIncludeAI ? aiAgentPrices[pabxAIPlan as keyof typeof aiAgentPrices]?.price || 0 : 0;

        const result: PABXResult = {
            setup,
            baseMonthly,
            deviceRentalCost,
            aiAgentCost,
            totalMonthly: baseMonthly + deviceRentalCost + aiAgentCost
        };

        setPabxResult(result);
    };

    // Calcular SIP
    const calculateSIP = () => {
        const planPrice = sipPrices[sipPlan as keyof typeof sipPrices];
        
        if (!planPrice) {
            setSipResult({ setup: 0, monthly: 0 });
            return;
        }
        
        const setup = sipIncludeSetup ? 50 : 0; // Taxa padrão de setup SIP
        const monthly = sipWithEquipment && planPrice.monthlyWithEquipment !== null 
            ? planPrice.monthlyWithEquipment 
            : planPrice.monthly;

        const result: SIPResult = {
            setup,
            monthly
        };

        setSipResult(result);
    };

    // Salvar preços SIP editados
    const handleSaveSIP = () => {
        localStorage.setItem('sipPrices', JSON.stringify(sipPrices));
        localStorage.setItem('sipConfig', JSON.stringify(sipConfig));
        setIsEditingSIP(false);
        alert('Preços SIP salvos com sucesso!');
    };

    // Adicionar PABX à proposta
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
    const totalSetup = proposalItems.reduce((sum, item) => sum + item.setup, 0);
    const totalMonthly = proposalItems.reduce((sum, item) => sum + item.monthly, 0);

    const clearForm = () => {
        setClientData({ name: '', email: '', phone: '' });
        setAccountManagerData({ name: '', email: '', phone: '' });
        setProposalItems([]);
        setCurrentProposal(null);
        // Resetar outros estados da calculadora se necessário
    };

    const createNewProposal = () => {
        clearForm();
        setCurrentView('client-form');
    };

    const editProposal = (proposal: Proposal) => {
        setCurrentProposal(proposal);
        setClientData(proposal.client);
        setAccountManagerData(proposal.accountManager);
        setProposalItems(proposal.items);
        setCurrentView('calculator');
    };

    // Função para salvar proposta
    const saveProposal = () => {
        if (proposalItems.length === 0) {
            alert('Adicione pelo menos um item à proposta antes de salvar.');
            return;
        }

        const proposalToSave: Proposal = {
            id: currentProposal?.id || `PROP-${Date.now()}`,
            client: clientData,
            accountManager: accountManagerData,
            items: proposalItems,
            totalSetup,
            totalMonthly,
            createdAt: currentProposal?.createdAt || new Date().toISOString()
        };

        const updatedProposals = currentProposal
            ? savedProposals.map(p => p.id === proposalToSave.id ? proposalToSave : p)
            : [...savedProposals, proposalToSave];

        setSavedProposals(updatedProposals);

        // Salvar preços PABX e SIP no localStorage
        localStorage.setItem('pabxPrices', JSON.stringify(pabxPrices));
        localStorage.setItem('sipPrices', JSON.stringify(sipPrices));
        localStorage.setItem('sipConfig', JSON.stringify(sipConfig));

        alert(`Proposta ${proposalToSave.id} salva com sucesso!`);
        
        clearForm();
        setCurrentView('search');
    };

    const cancelAction = () => {
        clearForm();
        setCurrentView('search');
    };

    // Salvar propostas no localStorage sempre que forem alteradas
    useEffect(() => {
        if (savedProposals.length > 0) {
            localStorage.setItem('pabx-sip-proposals', JSON.stringify(savedProposals));
        }
    }, [savedProposals]);

    // Carregar propostas e preços do localStorage
    useEffect(() => {
        const savedProposals = JSON.parse(localStorage.getItem('pabx-sip-proposals') || '[]');
        setSavedProposals(savedProposals);

        const savedPabxPrices = localStorage.getItem('pabxPrices');
        if (savedPabxPrices) {
            setPabxPrices(JSON.parse(savedPabxPrices));
        }

        const savedAiAgentPrices = localStorage.getItem('aiAgentPrices');
        if (savedAiAgentPrices) {
            setAiAgentPrices(JSON.parse(savedAiAgentPrices));
        }

        const savedSipPrices = localStorage.getItem('sipPrices');
        if (savedSipPrices) {
            setSipPrices(JSON.parse(savedSipPrices));
        }

        const savedSipConfig = localStorage.getItem('sipConfig');
        if (savedSipConfig) {
            setSipConfig(JSON.parse(savedSipConfig));
        }
    }, []);

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
    }, [pabxExtensions, pabxIncludeSetup, pabxIncludeDevices, pabxDeviceQuantity, pabxIncludeAI, pabxAIPlan]);

    useEffect(() => {
        calculateSIP();
    }, [sipPlan, sipIncludeSetup, sipAdditionalChannels, sipWithEquipment]);

    const filteredProposals = savedProposals.filter(p =>
        p.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handlePrint = () => window.print();

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
                                            <TableCell className="text-slate-300">{proposal.id}</TableCell>
                                            <TableCell className="text-slate-300">{proposal.client.name}</TableCell>
                                            <TableCell className="text-slate-300">{new Date(proposal.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                                            <TableCell className="text-slate-300">{formatCurrency(proposal.totalMonthly)}</TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                                    onClick={() => editProposal(proposal)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
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

    // Tela da calculadora
    return (
        <div className="container mx-auto p-4 bg-slate-950 text-white">
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Calculadora PABX/SIP</h1>
                        <p className="text-slate-400 mt-2">Configure e calcule os custos para PABX em Nuvem e SIP Trunk</p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => setCurrentView('search')}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                        ← Voltar para Busca
                    </Button>
                </div>

                {/* Informações do Cliente e Gerente */}
                <ClientManagerInfo clientData={clientData} accountManagerData={accountManagerData} />
            </div>

            <Tabs defaultValue="calculator" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-slate-800 text-slate-400">
                    <TabsTrigger value="calculator">Calculadora</TabsTrigger>
                    <TabsTrigger value="list-price">List Price</TabsTrigger>
                </TabsList>

                <TabsContent value="calculator">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                        {/* PABX em Nuvem */}
                        <Card className="bg-slate-900/80 border-slate-800 text-white">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Phone className="h-5 w-5" />
                                    PABX em Nuvem
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="pabx-extensions">Quantidade de Ramais</Label>
                                    <Input
                                        id="pabx-extensions"
                                        type="number"
                                        value={pabxExtensions}
                                        onChange={(e) => setPabxExtensions(parseInt(e.target.value) || 0)}
                                        className="bg-slate-800 border-slate-700 text-white"
                                    />
                                </div>

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
                                        <Label htmlFor="pabx-device-quantity">Quantidade de Aparelhos</Label>
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
                                        <TableRow className="border-slate-700 font-semibold">
                                            <TableCell>Total Setup:</TableCell>
                                            <TableCell className="text-right">{formatCurrency(totalSetup)}</TableCell>
                                            <TableCell></TableCell>
                                        </TableRow>
                                        <TableRow className="border-slate-700 font-semibold">
                                            <TableCell>Total Mensal:</TableCell>
                                            <TableCell></TableCell>
                                            <TableCell className="text-right">{formatCurrency(totalMonthly)}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>

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

                <TabsContent value="list-price">
                    <div className="mt-6 space-y-6">
                        {/* Tabela de Preços Agente IA */}
                        <Card className="bg-slate-900/80 border-slate-800 text-white">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-blue-400">Agente de IA</CardTitle>
                                    <p className="text-slate-400 text-sm mt-1">Créditos de Interação</p>
                                    <p className="text-slate-500 text-xs">Por mensagem, ligação e voz premium</p>
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
                                <CardTitle className="text-green-400">PABX</CardTitle>
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
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default PABXSIPCalculator;