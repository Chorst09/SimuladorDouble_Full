"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { 
    Radio, 
    Calculator, 
    FileText, 
    Plus,
    Edit,
    Search,
    Save,
    Download,
    Trash2
} from 'lucide-react';

// Interfaces
interface RadioPlan {
    speed: number;
    price12: number;
    price24: number;
    price36: number;
    installationCost: number;
    description: string;
    baseCost: number; // Custo base para cálculo de comissão
}

interface InstallationTier {
    minValue: number;
    maxValue: number;
    cost: number;
}

interface ContractTerm {
    months: number;
    paybackMonths: number;
}

interface Product {
    id: string;
    type: 'RADIO';
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

const RadioInternetCalculator: React.FC = () => {
    // Estados de gerenciamento de propostas
    const [currentProposal, setCurrentProposal] = useState<Proposal | null>(null);
    const [viewMode, setViewMode] = useState<'search' | 'create' | 'edit'>('search');
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');

    // Estados dos formulários
    const [clientName, setClientName] = useState('');
    const [accountManager, setAccountManager] = useState('');
    const [addedProducts, setAddedProducts] = useState<Product[]>([]);

    // Estados da calculadora
    const [selectedSpeed, setSelectedSpeed] = useState<number>(0);
    const [contractTerm, setContractTerm] = useState<number>(12);
    const [includeInstallation, setIncludeInstallation] = useState<boolean>(true);
    const [projectValue, setProjectValue] = useState<number>(0);

    // Dados das tabelas baseados nas imagens - RÁDIO
    const radioPlans: RadioPlan[] = [
        { speed: 25, price12: 720.00, price24: 500.00, price36: 450.00, installationCost: 998.00, description: "25 Mbps", baseCost: 1580.00 },
        { speed: 30, price12: 740.08, price24: 550.00, price36: 500.00, installationCost: 998.00, description: "30 Mbps", baseCost: 1580.00 },
        { speed: 40, price12: 915.01, price24: 600.00, price36: 550.00, installationCost: 998.00, description: "40 Mbps", baseCost: 1580.00 },
        { speed: 50, price12: 1103.39, price24: 650.00, price36: 600.00, installationCost: 998.00, description: "50 Mbps", baseCost: 1580.00 },
        { speed: 60, price12: 1547.44, price24: 750.00, price36: 700.00, installationCost: 998.00, description: "60 Mbps", baseCost: 1580.00 },
        { speed: 80, price12: 1825.98, price24: 950.00, price36: 900.00, installationCost: 998.00, description: "80 Mbps", baseCost: 5700.00 },
        { speed: 100, price12: 2017.05, price24: 1499.00, price36: 1250.00, installationCost: 1996.00, description: "100 Mbps", baseCost: 5700.00 },
        { speed: 150, price12: 2543.18, price24: 1699.00, price36: 1450.00, installationCost: 1996.00, description: "150 Mbps", baseCost: 5700.00 },
        { speed: 200, price12: 3215.98, price24: 1950.00, price36: 1650.00, installationCost: 1996.00, description: "200 Mbps", baseCost: 5700.00 },
        { speed: 300, price12: 7522.00, price24: 4100.00, price36: 3600.00, installationCost: 2500.00, description: "300 Mbps", baseCost: 23300.00 },
        { speed: 400, price12: 9469.00, price24: 4950.00, price36: 4499.00, installationCost: 2500.00, description: "400 Mbps", baseCost: 23300.00 },
        { speed: 500, price12: 11174.00, price24: 5499.00, price36: 4990.00, installationCost: 2500.00, description: "500 Mbps", baseCost: 23300.00 },
        { speed: 600, price12: 0, price24: 5999.00, price36: 5500.00, installationCost: 2500.00, description: "600 Mbps", baseCost: 23300.00 },
        { speed: 700, price12: 0, price24: 0, price36: 0, installationCost: 2500.00, description: "700 Mbps", baseCost: 23300.00 },
        { speed: 800, price12: 0, price24: 0, price36: 0, installationCost: 2500.00, description: "800 Mbps", baseCost: 23300.00 },
        { speed: 900, price12: 0, price24: 0, price36: 0, installationCost: 2500.00, description: "900 Mbps", baseCost: 23300.00 },
        { speed: 1000, price12: 0, price24: 0, price36: 0, installationCost: 2500.00, description: "1000 Mbps (1 Gbps)", baseCost: 23300.00 }
    ];

    const installationTiers: InstallationTier[] = [
        { minValue: 0, maxValue: 4500, cost: 998.00 },
        { minValue: 4500.01, maxValue: 8000, cost: 1996.00 },
        { minValue: 8000.01, maxValue: 27000, cost: 2500.00 }
    ];

    const contractTerms: ContractTerm[] = [
        { months: 12, paybackMonths: 8 },
        { months: 24, paybackMonths: 10 },
        { months: 36, paybackMonths: 11 },
        { months: 48, paybackMonths: 13 },
        { months: 60, paybackMonths: 14 }
    ];

    // Funções de cálculo
    const getMonthlyPrice = (plan: RadioPlan, term: number): number => {
        switch (term) {
            case 12: return plan.price12;
            case 24: return plan.price24;
            case 36: return plan.price36;
            default: return plan.price36;
        }
    };

    const getInstallationCost = (value: number): number => {
        const tier = installationTiers.find(t => value >= t.minValue && value <= t.maxValue);
        return tier ? tier.cost : 2500.00; // Valor padrão para acima de R$ 27.000
    };

    const calculateResult = () => {
        const plan = radioPlans.find(p => p.speed === selectedSpeed);
        if (!plan) return null;

        const monthlyPrice = getMonthlyPrice(plan, contractTerm);
        if (monthlyPrice === 0) return null; // Plano não disponível para este prazo

        const installationCost = includeInstallation ? getInstallationCost(projectValue || monthlyPrice * 12) : 0;
        const contractInfo = contractTerms.find(c => c.months === contractTerm);

        return {
            plan,
            monthlyPrice,
            installationCost,
            contractInfo,
            totalFirstMonth: monthlyPrice + installationCost,
            baseCost: plan.baseCost
        };
    };

    const result = calculateResult();

    // Funções auxiliares
    const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;
    const generateUniqueId = () => `_${Math.random().toString(36).substr(2, 9)}`;

    // Gerenciamento de produtos
    const handleAddProduct = () => {
        if (result) {
            const description = `Internet via Rádio ${result.plan.description} - Contrato ${contractTerm} meses${includeInstallation ? ' (com instalação)' : ''}`;
            
            setAddedProducts(prev => [...prev, {
                id: generateUniqueId(),
                type: 'RADIO',
                description,
                setup: result.installationCost,
                monthly: result.monthlyPrice,
                details: { 
                    speed: selectedSpeed, 
                    contractTerm, 
                    includeInstallation,
                    paybackMonths: result.contractInfo?.paybackMonths || 0,
                    baseCost: result.baseCost
                }
            }]);
        }
    };

    const handleRemoveProduct = (id: string) => {
        setAddedProducts(prev => prev.filter(p => p.id !== id));
    };

    // Gerenciamento de propostas
    useEffect(() => {
        const savedProposals = localStorage.getItem('radioProposals');
        if (savedProposals) {
            setProposals(JSON.parse(savedProposals));
        }
    }, []);

    useEffect(() => {
        if (proposals.length > 0) {
            localStorage.setItem('radioProposals', JSON.stringify(proposals));
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
        return `RADIO-${year}${month}${day}-${random}`;
    };

    const clearForm = () => {
        setClientName('');
        setAccountManager('');
        setAddedProducts([]);
        setSelectedSpeed(0);
        setContractTerm(12);
        setIncludeInstallation(true);
        setProjectValue(0);
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
                            <CardTitle>Buscar Propostas - Internet via Rádio</CardTitle>
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
                                <Button onClick={createNewProposal} className="bg-blue-600 hover:bg-blue-700">
                                    <Plus className="h-4 w-4 mr-2" />Nova Proposta
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
                                        {filteredProposals.map(p => (
                                            <TableRow key={p.id} className="border-slate-800">
                                                <TableCell>{p.id}</TableCell>
                                                <TableCell>{p.clientName}</TableCell>
                                                <TableCell>{p.date}</TableCell>
                                                <TableCell>{formatCurrency(p.totalMonthly)}</TableCell>
                                                <TableCell>
                                                    <Button variant="outline" size="sm" onClick={() => editProposal(p)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
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
                                <CardTitle>{viewMode === 'create' ? 'Criar Nova Proposta' : 'Editar Proposta'} - Internet via Rádio</CardTitle>
                                <CardDescription>ID da Proposta: {currentProposal?.id}</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="client-name">Nome do Cliente</Label>
                                    <Input 
                                        id="client-name" 
                                        value={clientName} 
                                        onChange={(e) => setClientName(e.target.value)} 
                                        className="bg-slate-800 border-slate-700" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="account-manager">Gerente de Contas</Label>
                                    <Input 
                                        id="account-manager" 
                                        value={accountManager} 
                                        onChange={(e) => setAccountManager(e.target.value)} 
                                        className="bg-slate-800 border-slate-700" 
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Tabs defaultValue="calculator" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 bg-slate-800">
                                <TabsTrigger value="calculator">Calculadora</TabsTrigger>
                                <TabsTrigger value="list-price">List Price</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="calculator">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                                    {/* Calculadora */}
                                    <Card className="bg-slate-900/80 border-slate-800 text-white">
                                        <CardHeader>
                                            <CardTitle className="flex items-center">
                                                <Radio className="mr-2" />Internet via Rádio
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                <div>
                                                    <Label htmlFor="speed">Velocidade</Label>
                                                    <Select onValueChange={(value) => setSelectedSpeed(Number(value))} value={selectedSpeed.toString()}>
                                                        <SelectTrigger className="bg-slate-700">
                                                            <SelectValue placeholder="Selecione a velocidade" />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-slate-800 text-white">
                                                            {radioPlans.map((plan) => (
                                                                <SelectItem key={plan.speed} value={plan.speed.toString()}>
                                                                    {plan.description}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div>
                                                    <Label htmlFor="contract-term">Prazo do Contrato</Label>
                                                    <Select onValueChange={(value) => setContractTerm(Number(value))} value={contractTerm.toString()}>
                                                        <SelectTrigger className="bg-slate-700">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-slate-800 text-white">
                                                            <SelectItem value="12">12 meses</SelectItem>
                                                            <SelectItem value="24">24 meses</SelectItem>
                                                            <SelectItem value="36">36 meses</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="flex items-center space-x-2 pt-2">
                                                    <Checkbox 
                                                        id="includeInstallation" 
                                                        checked={includeInstallation} 
                                                        onCheckedChange={(checked) => setIncludeInstallation(!!checked)} 
                                                        className="border-white" 
                                                    />
                                                    <label htmlFor="includeInstallation" className="text-sm font-medium leading-none">
                                                        Incluir Taxa de Instalação
                                                    </label>
                                                </div>

                                                <div>
                                                    <Label htmlFor="project-value">Valor do Projeto (opcional)</Label>
                                                    <Input 
                                                        id="project-value" 
                                                        type="number" 
                                                        value={projectValue || ''} 
                                                        onChange={(e) => setProjectValue(Number(e.target.value))} 
                                                        className="bg-slate-700" 
                                                        placeholder="Para cálculo da taxa de instalação"
                                                    />
                                                </div>
                                            </div>

                                            {result && (
                                                <div className="mt-6">
                                                    <Separator className="bg-slate-700 my-4" />
                                                    <div className="text-lg font-bold mb-2">Resultado:</div>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <span>Velocidade:</span> 
                                                            <span>{result.plan.description}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Prazo:</span> 
                                                            <span>{contractTerm} meses (Payback: {result.contractInfo?.paybackMonths} meses)</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Taxa de Instalação:</span> 
                                                            <span>{formatCurrency(result.installationCost)}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Custo Base:</span> 
                                                            <span>{formatCurrency(result.baseCost)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-green-400 font-bold">
                                                            <span>Valor Mensal:</span> 
                                                            <span>{formatCurrency(result.monthlyPrice)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-blue-400 font-bold">
                                                            <span>Total 1º Mês:</span> 
                                                            <span>{formatCurrency(result.totalFirstMonth)}</span>
                                                        </div>
                                                    </div>
                                                    <Button 
                                                        onClick={handleAddProduct} 
                                                        className="w-full mt-4 bg-green-600 hover:bg-green-700"
                                                    >
                                                        Adicionar à Proposta
                                                    </Button>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Lista de Produtos */}
                                    <Card className="bg-slate-900/80 border-slate-800 text-white">
                                        <CardHeader>
                                            <CardTitle>Produtos Adicionados</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {addedProducts.length === 0 ? (
                                                <p className="text-slate-400">Nenhum produto adicionado ainda.</p>
                                            ) : (
                                                <div className="space-y-4">
                                                    {addedProducts.map((product) => (
                                                        <div key={product.id} className="border border-slate-700 rounded p-4">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <h4 className="font-semibold">{product.description}</h4>
                                                                <Button 
                                                                    variant="outline" 
                                                                    size="sm" 
                                                                    onClick={() => handleRemoveProduct(product.id)}
                                                                    className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                            <div className="text-sm space-y-1">
                                                                <div className="flex justify-between">
                                                                    <span>Setup:</span>
                                                                    <span>{formatCurrency(product.setup)}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span>Mensal:</span>
                                                                    <span>{formatCurrency(product.monthly)}</span>
                                                                </div>
                                                                {product.details.baseCost && (
                                                                    <div className="flex justify-between text-slate-400">
                                                                        <span>Custo Base:</span>
                                                                        <span>{formatCurrency(product.details.baseCost)}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                    
                                                    <Separator className="bg-slate-700" />
                                                    <div className="space-y-2 font-bold">
                                                        <div className="flex justify-between">
                                                            <span>Total Setup:</span>
                                                            <span>{formatCurrency(totalSetup)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-green-400">
                                                            <span>Total Mensal:</span>
                                                            <span>{formatCurrency(totalMonthly)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            <TabsContent value="list-price">
                                <Card className="bg-slate-900/80 border-slate-800 text-white mt-6">
                                    <CardHeader>
                                        <CardTitle>Tabela de Preços - Internet via Rádio</CardTitle>
                                        <CardDescription>Valores de referência baseados na velocidade e prazo do contrato.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-8">
                                            {/* Tabela Principal */}
                                            <div>
                                                <h3 className="text-xl font-semibold mb-4 text-center">
                                                    <span className="bg-yellow-400 text-black px-2 py-1 rounded">RÁDIO</span>
                                                    <span className="text-red-500 ml-2">SEM PARCEIRO INDICADOR</span>
                                                </h3>
                                                <div className="overflow-x-auto">
                                                    <Table className="min-w-full border-collapse">
                                                        <TableHeader>
                                                            <TableRow className="bg-blue-900">
                                                                <TableHead rowSpan={2} className="text-white font-bold border border-slate-500 text-center p-2">Velocidade Mbps</TableHead>
                                                                <TableHead colSpan={3} className="text-white font-bold border border-slate-500 text-center p-2">Prazos</TableHead>
                                                                <TableHead rowSpan={2} className="text-white font-bold border border-slate-500 text-center p-2">Taxa Instalação</TableHead>
                                                            </TableRow>
                                                            <TableRow className="bg-blue-800">
                                                                <TableHead className="text-white font-bold border border-slate-500 text-center p-2">12</TableHead>
                                                                <TableHead className="text-white font-bold border border-slate-500 text-center p-2">24</TableHead>
                                                                <TableHead className="text-white font-bold border border-slate-500 text-center p-2">36</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {radioPlans.map((plan) => (
                                                                <TableRow key={plan.speed} className="border-slate-800">
                                                                    <TableCell className="font-semibold border border-slate-600 text-center p-2">
                                                                        {plan.speed}
                                                                    </TableCell>
                                                                    <TableCell className="border border-slate-600 text-center p-2">
                                                                        {plan.price12 > 0 ? formatCurrency(plan.price12) : '-'}
                                                                    </TableCell>
                                                                    <TableCell className="border border-slate-600 text-center p-2">
                                                                        {plan.price24 > 0 ? formatCurrency(plan.price24) : '-'}
                                                                    </TableCell>
                                                                    <TableCell className="border border-slate-600 text-center p-2">
                                                                        {plan.price36 > 0 ? formatCurrency(plan.price36) : '-'}
                                                                    </TableCell>
                                                                    <TableCell className="border border-slate-600 text-center p-2">
                                                                        {formatCurrency(plan.installationCost)}
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                                <div className="mt-4 space-y-2">
                                                    <div className="text-sm text-blue-400">
                                                        <p>*** Produto Double - Adicionar 50% ao valor da mensalidade de RÁDIO.</p>
                                                        <p>*** Se oriundo de Parceiro Indicador - Adicionar 20% ao preço.</p>
                                                    </div>
                                                    <div className="text-xs text-slate-400 space-y-1">
                                                        <p>*** baseado em um custo médio de R$ 1.580,00 ref. ao par de rádios e equipos acessórios (25-60 Mbps)</p>
                                                        <p>*** baseado em um custo médio de R$ 5.700,00 ref. ao par de rádios e equipos acessórios (80-200 Mbps)</p>
                                                        <p>*** baseado em um custo médio de R$ 23.300,00 ref. ao par de rádios e equipos acessórios (300-600 Mbps)</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Tabela de Taxa de Instalação */}
                                            <div>
                                                <h3 className="text-lg font-semibold mb-4">Valores Taxa de Instalação</h3>
                                                <div className="max-w-md">
                                                    <Table className="border-collapse">
                                                        <TableHeader>
                                                            <TableRow className="bg-slate-800">
                                                                <TableHead className="text-white font-bold border border-slate-500 p-2">Orçamentos</TableHead>
                                                                <TableHead className="text-white font-bold border border-slate-500 p-2">Valor</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            <TableRow>
                                                                <TableCell className="border border-slate-600 p-2">Até R$ 4.500,00</TableCell>
                                                                <TableCell className="border border-slate-600 p-2 text-center">998,00</TableCell>
                                                            </TableRow>
                                                            <TableRow>
                                                                <TableCell className="border border-slate-600 p-2">De 4.500,01 a 8.000,00</TableCell>
                                                                <TableCell className="border border-slate-600 p-2 text-center">1.996,00</TableCell>
                                                            </TableRow>
                                                            <TableRow>
                                                                <TableCell className="border border-slate-600 p-2">De 8.000,01 a 27.000,00</TableCell>
                                                                <TableCell className="border border-slate-600 p-2 text-center">2.500,00</TableCell>
                                                            </TableRow>
                                                            <TableRow>
                                                                <TableCell className="border border-slate-600 p-2">Acima R$ 27 mil</TableCell>
                                                                <TableCell className="border border-slate-600 p-2 text-center">Verificar com a controladoria</TableCell>
                                                            </TableRow>
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </div>

                                            {/* Informações de Contrato */}
                                            <div>
                                                <h3 className="text-lg font-semibold mb-4">Informações de Contrato</h3>
                                                <div className="space-y-1 text-sm">
                                                    <p>Contratos de 12 meses - Payback 08 meses</p>
                                                    <p>Contratos de 24 meses - Payback 10 meses</p>
                                                    <p>Contratos de 36 meses - Payback 11 meses</p>
                                                    <p>Contratos de 48 meses - Payback 13 meses</p>
                                                    <p>Contratos de 60 meses - Payback 14 meses</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>

                        {/* Botões de Ação */}
                        <div className="flex gap-4 mt-6">
                            <Button onClick={saveProposal} className="bg-green-600 hover:bg-green-700">
                                <Save className="h-4 w-4 mr-2" />
                                Salvar Proposta
                            </Button>
                            <Button onClick={handlePrint} variant="outline">
                                <Download className="h-4 w-4 mr-2" />
                                Imprimir
                            </Button>
                            <Button onClick={cancelAction} variant="outline">
                                Cancelar
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default RadioInternetCalculator;