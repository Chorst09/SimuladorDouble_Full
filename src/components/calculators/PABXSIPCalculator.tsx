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
import { Phone, PhoneForwarded } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

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
    description: string;
    setup: number;
    monthly: number;
}

interface ClientData {
    name: string;
    email: string;
    phone: string;
}

interface AccountManagerData {
    name: string;
    email: string;
    phone: string;
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
    const [isEditingAI, setIsEditingAI] = useState(false);

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
        'SIP TARIFADO Call Center': { setup: 0, monthly: 200, channels: 2 },
        'SIP TARIFADO 4 Canais': { setup: 0, monthly: 150, channels: 4 },
        'SIP TARIFADO 10 Canais': { setup: 0, monthly: 250, channels: 10 },
        'SIP TARIFADO 30 Canais': { setup: 0, monthly: 350, channels: 30 },
        'SIP TARIFADO 60 Canais': { setup: 0, monthly: 550, channels: 60 },
        'SIP ILIMITADO 5 Canais': { setup: 0, monthly: 350, channels: 5 },
        'SIP ILIMITADO 10 Canais': { setup: 0, monthly: 450, channels: 10 },
        'SIP ILIMITADO 20 Canais': { setup: 0, monthly: 650, channels: 20 },
        'SIP ILIMITADO 30 Canais': { setup: 0, monthly: 850, channels: 30 },
        'SIP ILIMITADO 60 Canais': { setup: 0, monthly: 1600, channels: 60 }
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
        const setup = sipIncludeSetup ? 50 : 0; // Taxa padrão de setup SIP
        const monthly = planPrice.monthly;

        const result: SIPResult = {
            setup,
            monthly
        };

        setSipResult(result);
    };

    // Adicionar PABX à proposta
    const addPABXToProposal = () => {
        if (!pabxResult) return;

        const newItem: ProposalItem = {
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
            description: sipPlan,
            setup: sipResult.setup,
            monthly: sipResult.monthly
        };

        setProposalItems(prev => [...prev, newItem]);
    };

    // Calcular totais da proposta
    const totalSetup = proposalItems.reduce((sum, item) => sum + item.setup, 0);
    const totalMonthly = proposalItems.reduce((sum, item) => sum + item.monthly, 0);

    // Formatação de moeda
    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    // Função para salvar proposta
    const saveProposal = () => {
        if (proposalItems.length === 0) {
            alert('Adicione pelo menos um item à proposta antes de salvar.');
            return;
        }

        if (!clientData.name || !clientData.email || !accountManagerData.name) {
            alert('Preencha os dados obrigatórios do cliente e gerente de contas.');
            return;
        }

        const newProposal: Proposal = {
            id: `PROP-${Date.now()}`,
            client: clientData,
            accountManager: accountManagerData,
            items: proposalItems,
            totalSetup,
            totalMonthly,
            createdAt: new Date().toISOString()
        };

        setSavedProposals(prev => [newProposal, ...prev]);

        // Salvar no localStorage
        const existingProposals = JSON.parse(localStorage.getItem('pabx-sip-proposals') || '[]');
        existingProposals.unshift(newProposal);
        localStorage.setItem('pabx-sip-proposals', JSON.stringify(existingProposals));

        alert(`Proposta ${newProposal.id} salva com sucesso!`);

        // Resetar formulário
        setProposalItems([]);
        setClientData({ name: '', email: '', phone: '' });
        setAccountManagerData({ name: '', email: '', phone: '' });
        setCurrentView('search');
    };

    // Carregar propostas do localStorage
    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('pabx-sip-proposals') || '[]');
        setSavedProposals(saved);
    }, []);

    // Calcular automaticamente quando os valores mudarem
    useEffect(() => {
        calculatePABX();
    }, [pabxExtensions, pabxIncludeSetup, pabxIncludeDevices, pabxDeviceQuantity, pabxIncludeAI, pabxAIPlan]);

    useEffect(() => {
        calculateSIP();
    }, [sipPlan, sipIncludeSetup, sipAdditionalChannels, sipWithEquipment]);

    // Se estiver na tela de formulário do cliente, mostrar o formulário
    if (currentView === 'client-form') {
        return (
            <div className="container mx-auto p-6 bg-slate-950 text-white min-h-screen">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Nova Proposta</h1>
                    <p className="text-slate-400">Preencha os dados do cliente e gerente de contas.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Dados do Cliente */}
                    <Card className="bg-slate-900/80 border-slate-800 text-white">
                        <CardHeader>
                            <CardTitle>Dados do Cliente</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="client-name">Nome do Cliente *</Label>
                                <Input
                                    id="client-name"
                                    value={clientData.name}
                                    onChange={(e) => setClientData(prev => ({ ...prev, name: e.target.value }))}
                                    className="bg-slate-800 border-slate-700 text-white"
                                    placeholder="Nome completo do cliente"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="client-email">Email do Cliente *</Label>
                                <Input
                                    id="client-email"
                                    type="email"
                                    value={clientData.email}
                                    onChange={(e) => setClientData(prev => ({ ...prev, email: e.target.value }))}
                                    className="bg-slate-800 border-slate-700 text-white"
                                    placeholder="email@cliente.com"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="client-phone">Telefone do Cliente</Label>
                                <Input
                                    id="client-phone"
                                    value={clientData.phone}
                                    onChange={(e) => setClientData(prev => ({ ...prev, phone: e.target.value }))}
                                    className="bg-slate-800 border-slate-700 text-white"
                                    placeholder="(11) 99999-9999"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Dados do Gerente de Contas */}
                    <Card className="bg-slate-900/80 border-slate-800 text-white">
                        <CardHeader>
                            <CardTitle>Dados do Gerente de Contas</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="manager-name">Nome do Gerente *</Label>
                                <Input
                                    id="manager-name"
                                    value={accountManagerData.name}
                                    onChange={(e) => setAccountManagerData(prev => ({ ...prev, name: e.target.value }))}
                                    className="bg-slate-800 border-slate-700 text-white"
                                    placeholder="Nome completo do gerente"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="manager-email">Email do Gerente *</Label>
                                <Input
                                    id="manager-email"
                                    type="email"
                                    value={accountManagerData.email}
                                    onChange={(e) => setAccountManagerData(prev => ({ ...prev, email: e.target.value }))}
                                    className="bg-slate-800 border-slate-700 text-white"
                                    placeholder="gerente@empresa.com"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="manager-phone">Telefone do Gerente</Label>
                                <Input
                                    id="manager-phone"
                                    value={accountManagerData.phone}
                                    onChange={(e) => setAccountManagerData(prev => ({ ...prev, phone: e.target.value }))}
                                    className="bg-slate-800 border-slate-700 text-white"
                                    placeholder="(11) 99999-9999"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-between mt-8">
                    <Button
                        variant="outline"
                        onClick={() => setCurrentView('search')}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                        ← Voltar
                    </Button>
                    <Button
                        onClick={() => {
                            if (!clientData.name || !clientData.email || !accountManagerData.name || !accountManagerData.email) {
                                alert('Preencha os campos obrigatórios marcados com *');
                                return;
                            }
                            setCurrentView('calculator');
                        }}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        Continuar para Calculadora →
                    </Button>
                </div>
            </div>
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
                                onClick={() => setCurrentView('client-form')}
                                className="bg-blue-600 hover:bg-blue-700 px-6"
                            >
                                + Nova Proposta
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
                                {savedProposals.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-slate-400">
                                            Nenhuma proposta encontrada. Clique em "Nova Proposta" para começar.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    savedProposals.map((proposal) => (
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
                                                    onClick={() => {
                                                        // Carregar dados da proposta para edição
                                                        setClientData(proposal.client);
                                                        setAccountManagerData(proposal.accountManager);
                                                        setProposalItems(proposal.items);
                                                        setCurrentView('calculator');
                                                    }}
                                                >
                                                    Editar
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
                        ← Voltar para Buscar
                    </Button>
                </div>

                {/* Informações do Cliente e Gerente */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <Card className="bg-slate-900/50 border-slate-800">
                        <CardContent className="p-4">
                            <h3 className="font-semibold text-white mb-2">Cliente</h3>
                            <p className="text-slate-300 text-sm">{clientData.name}</p>
                            <p className="text-slate-400 text-xs">{clientData.email}</p>
                            {clientData.phone && <p className="text-slate-400 text-xs">{clientData.phone}</p>}
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-900/50 border-slate-800">
                        <CardContent className="p-4">
                            <h3 className="font-semibold text-white mb-2">Gerente de Contas</h3>
                            <p className="text-slate-300 text-sm">{accountManagerData.name}</p>
                            <p className="text-slate-400 text-xs">{accountManagerData.email}</p>
                            {accountManagerData.phone && <p className="text-slate-400 text-xs">{accountManagerData.phone}</p>}
                        </CardContent>
                    </Card>
                </div>
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
                                            <SelectItem value="SIP ILIMITADO 10 Canais">SIP ILIMITADO 10 Canais</SelectItem>
                                            <SelectItem value="SIP ILIMITADO 20 Canais">SIP ILIMITADO 20 Canais</SelectItem>
                                            <SelectItem value="SIP ILIMITADO 30 Canais">SIP ILIMITADO 30 Canais</SelectItem>
                                            <SelectItem value="SIP TARIFADO 4 Canais">SIP TARIFADO 4 Canais</SelectItem>
                                            <SelectItem value="SIP TARIFADO 10 Canais">SIP TARIFADO 10 Canais</SelectItem>
                                            <SelectItem value="SIP TARIFADO 30 Canais">SIP TARIFADO 30 Canais</SelectItem>
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
                                            <div className="flex justify-between font-semibold text-green-400">
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
                                            <TableRow key={index} className="border-slate-800">
                                                <TableCell>{item.description}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(item.setup)}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(item.monthly)}</TableCell>
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

                                <div className="flex gap-2 mt-4">
                                    <Button
                                        className="bg-green-600 hover:bg-green-700"
                                        onClick={saveProposal}
                                    >
                                        Salvar Proposta
                                    </Button>
                                    <Button className="bg-blue-600 hover:bg-blue-700">
                                        Gerar PDF
                                    </Button>
                                    <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
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
                                                        className="bg-slate-800 border-slate-600 text-center text-lg font-bold"
                                                    />
                                                ) : (
                                                    <p className="text-lg font-bold text-white">{formatCurrency(data.price)}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 text-xs text-slate-500 space-y-1">
                                    <p>* 1 crédito por mensagem</p>
                                    <p>** 2 créditos por minuto (voz padrão)</p>
                                    <p>*** 20 créditos por minuto (voz premium)</p>
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
                                    onClick={() => setIsEditingSIP(!isEditingSIP)}
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
                                                <TableHead colSpan={2} className="text-white bg-blue-800 text-center">SIP TARIFADO</TableHead>
                                                <TableHead colSpan={3} className="text-white bg-blue-700 text-center">SIP TARIFADO</TableHead>
                                                <TableHead colSpan={5} className="text-white bg-blue-600 text-center">SIP ILIMITADO</TableHead>
                                            </TableRow>
                                            <TableRow className="border-slate-700">
                                                <TableHead className="text-white bg-blue-800 text-center">Call Center</TableHead>
                                                <TableHead className="text-white bg-blue-800 text-center">Até 4 Canais</TableHead>
                                                <TableHead className="text-white bg-blue-700 text-center">De 5 a 10 Canais</TableHead>
                                                <TableHead className="text-white bg-blue-700 text-center">De 11 a 20 Canais</TableHead>
                                                <TableHead className="text-white bg-blue-700 text-center">Acima de 20 Canais</TableHead>
                                                <TableHead className="text-white bg-blue-600 text-center">Até 4 Canais</TableHead>
                                                <TableHead className="text-white bg-blue-600 text-center">De 5 a 10 Canais</TableHead>
                                                <TableHead className="text-white bg-blue-600 text-center">De 11 a 20 Canais</TableHead>
                                                <TableHead className="text-white bg-blue-600 text-center">De 21 a 30 Canais</TableHead>
                                                <TableHead className="text-white bg-blue-600 text-center">Acima de 30 Canais</TableHead>
                                            </TableRow>
                                            <TableRow className="border-slate-700">
                                                <TableHead className="text-white bg-blue-800 text-center text-xs">2 canais</TableHead>
                                                <TableHead className="text-white bg-blue-800 text-center text-xs">4 canais</TableHead>
                                                <TableHead className="text-white bg-blue-700 text-center text-xs">10 canais</TableHead>
                                                <TableHead className="text-white bg-blue-700 text-center text-xs">30 canais</TableHead>
                                                <TableHead className="text-white bg-blue-700 text-center text-xs">60 canais</TableHead>
                                                <TableHead className="text-white bg-blue-600 text-center text-xs">5 canais</TableHead>
                                                <TableHead className="text-white bg-blue-600 text-center text-xs">10 canais</TableHead>
                                                <TableHead className="text-white bg-blue-600 text-center text-xs">20 canais</TableHead>
                                                <TableHead className="text-white bg-blue-600 text-center text-xs">30 canais</TableHead>
                                                <TableHead className="text-white bg-blue-600 text-center text-xs">60 canais</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <TableRow className="border-slate-800">
                                                <TableCell className="font-semibold bg-blue-900/30">Franquia/Assinatura Mensal (Sem Equipamentos)</TableCell>
                                                {isEditingSIP ? (
                                                    <>
                                                        <TableCell><Input className="bg-slate-800 text-center" defaultValue="R$ 200" /></TableCell>
                                                        <TableCell><Input className="bg-slate-800 text-center" defaultValue="R$ 150" /></TableCell>
                                                        <TableCell><Input className="bg-slate-800 text-center" defaultValue="R$ 250" /></TableCell>
                                                        <TableCell><Input className="bg-slate-800 text-center" defaultValue="R$ 350" /></TableCell>
                                                        <TableCell><Input className="bg-slate-800 text-center" defaultValue="R$ 550" /></TableCell>
                                                        <TableCell><Input className="bg-slate-800 text-center" defaultValue="R$ 350" /></TableCell>
                                                        <TableCell><Input className="bg-slate-800 text-center" defaultValue="R$ 450" /></TableCell>
                                                        <TableCell><Input className="bg-slate-800 text-center" defaultValue="R$ 650" /></TableCell>
                                                        <TableCell><Input className="bg-slate-800 text-center" defaultValue="R$ 850" /></TableCell>
                                                        <TableCell><Input className="bg-slate-800 text-center" defaultValue="R$ 1.600" /></TableCell>
                                                    </>
                                                ) : (
                                                    <>
                                                        <TableCell className="text-center">R$ 200</TableCell>
                                                        <TableCell className="text-center">R$ 150</TableCell>
                                                        <TableCell className="text-center">R$ 250</TableCell>
                                                        <TableCell className="text-center">R$ 350</TableCell>
                                                        <TableCell className="text-center">R$ 550</TableCell>
                                                        <TableCell className="text-center">R$ 350</TableCell>
                                                        <TableCell className="text-center">R$ 450</TableCell>
                                                        <TableCell className="text-center">R$ 650</TableCell>
                                                        <TableCell className="text-center">R$ 850</TableCell>
                                                        <TableCell className="text-center">R$ 1.600</TableCell>
                                                    </>
                                                )}
                                            </TableRow>
                                            <TableRow className="border-slate-800">
                                                <TableCell className="font-semibold bg-blue-900/30">Franquia/Assinatura Mensal (Com Equipamentos)</TableCell>
                                                <TableCell className="text-center" colSpan={10}>
                                                    {isEditingSIP ? (
                                                        <Input className="bg-slate-800 text-center" defaultValue="R$ 500 (Franquia)" />
                                                    ) : (
                                                        "R$ 500 (Franquia)"
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow className="border-slate-800">
                                                <TableCell className="font-semibold bg-blue-900/30">Tarifa Local Fixo (por minuto)</TableCell>
                                                <TableCell className="text-center" colSpan={5}>R$ 0,02 por minuto</TableCell>
                                                <TableCell className="text-center" colSpan={5}>Ilimitado</TableCell>
                                            </TableRow>
                                            <TableRow className="border-slate-800">
                                                <TableCell className="font-semibold bg-blue-900/30">Tarifa DDD Fixo (por minuto)</TableCell>
                                                <TableCell className="text-center" colSpan={5}>R$ 0,06 por minuto</TableCell>
                                                <TableCell className="text-center" colSpan={5}>Ilimitado</TableCell>
                                            </TableRow>
                                            <TableRow className="border-slate-800">
                                                <TableCell className="font-semibold bg-blue-900/30">Tarifa Brasil Móvel (por minuto)</TableCell>
                                                <TableCell className="text-center" colSpan={5}>R$ 0,10 por minuto</TableCell>
                                                <TableCell className="text-center" colSpan={5}>R$ 0,10 por minuto</TableCell>
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