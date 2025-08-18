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
import { ClientManagerForm, ClientData, AccountManagerData } from './ClientManagerForm';
import { ClientManagerInfo } from './ClientManagerInfo';
import { Checkbox } from '@/components/ui/checkbox';
import { 
    Radio, 
    Calculator, 
    FileText, 
    Plus,
    Edit,
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
    baseCost: number;
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
    client: ClientData;
    accountManager: AccountManagerData;
    products: Product[];
    totalSetup: number;
    totalMonthly: number;
    createdAt: string;
}

const RadioInternetCalculator: React.FC = () => {
    // Estados
    const [viewMode, setViewMode] = useState<'search' | 'client-form' | 'calculator'>('search');
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [currentProposal, setCurrentProposal] = useState<Proposal | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    
    const [clientData, setClientData] = useState<ClientData>({ name: '', email: '', phone: '' });
    const [accountManagerData, setAccountManagerData] = useState<AccountManagerData>({ name: '', email: '', phone: '' });
    
    const [addedProducts, setAddedProducts] = useState<Product[]>([]);
    const [radioPlans, setRadioPlans] = useState<RadioPlan[]>([]);

    const [selectedSpeed, setSelectedSpeed] = useState<number>(0);
    const [contractTerm, setContractTerm] = useState<number>(12);
    const [includeInstallation, setIncludeInstallation] = useState<boolean>(true);
    const [projectValue, setProjectValue] = useState<number>(0);

    // Efeitos
    useEffect(() => {
        const initialRadioPlans: RadioPlan[] = [
            { speed: 25, price12: 720.00, price24: 527.00, price36: 474.00, installationCost: 998.00, description: "25 Mbps", baseCost: 1580.00 },
            { speed: 30, price12: 740.08, price24: 579.00, price36: 527.00, installationCost: 998.00, description: "30 Mbps", baseCost: 1580.00 },
            { speed: 40, price12: 915.01, price24: 632.00, price36: 579.00, installationCost: 998.00, description: "40 Mbps", baseCost: 1580.00 },
            { speed: 50, price12: 1103.39, price24: 685.00, price36: 632.00, installationCost: 998.00, description: "50 Mbps", baseCost: 1580.00 },
            { speed: 60, price12: 1547.44, price24: 790.00, price36: 737.00, installationCost: 998.00, description: "60 Mbps", baseCost: 1580.00 },
            { speed: 80, price12: 1825.98, price24: 1000.00, price36: 948.00, installationCost: 998.00, description: "80 Mbps", baseCost: 5700.00 },
            { speed: 100, price12: 2017.05, price24: 1578.00, price36: 1316.00, installationCost: 1996.00, description: "100 Mbps", baseCost: 5700.00 },
            { speed: 150, price12: 2543.18, price24: 1789.00, price36: 1527.00, installationCost: 1996.00, description: "150 Mbps", baseCost: 5700.00 },
            { speed: 200, price12: 3215.98, price24: 2053.00, price36: 1737.00, installationCost: 1996.00, description: "200 Mbps", baseCost: 5700.00 },
            { speed: 300, price12: 7522.00, price24: 4316.00, price36: 4000.00, installationCost: 2500.00, description: "300 Mbps", baseCost: 23300.00 },
            { speed: 400, price12: 9469.00, price24: 5211.00, price36: 4736.00, installationCost: 2500.00, description: "400 Mbps", baseCost: 23300.00 },
            { speed: 500, price12: 11174.00, price24: 5789.00, price36: 5253.00, installationCost: 2500.00, description: "500 Mbps", baseCost: 23300.00 },
            { speed: 600, price12: 0, price24: 6315.00, price36: 5790.00, installationCost: 2500.00, description: "600 Mbps", baseCost: 23300.00 },
            { speed: 700, price12: 0, price24: 0, price36: 0, installationCost: 2500.00, description: "700 Mbps", baseCost: 23300.00 },
            { speed: 800, price12: 0, price24: 0, price36: 0, installationCost: 2500.00, description: "800 Mbps", baseCost: 23300.00 },
            { speed: 900, price12: 0, price24: 0, price36: 0, installationCost: 2500.00, description: "900 Mbps", baseCost: 23300.00 },
            { speed: 1000, price12: 0, price24: 0, price36: 0, installationCost: 2500.00, description: "1000 Mbps (1 Gbps)", baseCost: 23300.00 }
        ];
        const savedPlans = localStorage.getItem('radioLinkPrices');
        if (savedPlans) {
            setRadioPlans(JSON.parse(savedPlans));
        } else {
            setRadioPlans(initialRadioPlans);
        }

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

    // Funções
    const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;
    const generateUniqueId = () => `PROP-${Date.now()}`;

    const handlePriceChange = (index: number, field: keyof Omit<RadioPlan, 'description' | 'baseCost' | 'speed'>, value: string) => {
        const newPlans = [...radioPlans];
        const numericValue = parseFloat(value.replace(/[^0-9,.]+/g, "").replace(",", "."));
        if (!isNaN(numericValue)) {
            (newPlans[index] as any)[field] = numericValue;
            setRadioPlans(newPlans);
        }
    };

    const handleSavePrices = () => {
        localStorage.setItem('radioLinkPrices', JSON.stringify(radioPlans));
        alert('Preços da tabela Rádio salvos com sucesso!');
    };

    const getMonthlyPrice = (plan: RadioPlan, term: number): number => {
        if (!plan) return 0;
        switch (term) {
            case 12: return plan.price12;
            case 24: return plan.price24;
            case 36: return plan.price36;
            default: return 0;
        }
    };

    const getInstallationCost = (value: number): number => {
        if (value <= 4500) return 998.00;
        if (value <= 8000) return 1996.00;
        return 2500.00;
    };

    const result = (() => {
        const plan = radioPlans.find(p => p.speed === selectedSpeed);
        if (!plan) return null;
        const monthlyPrice = getMonthlyPrice(plan, contractTerm);
        if (monthlyPrice === 0) return null;
        const installationCost = includeInstallation ? getInstallationCost(projectValue || monthlyPrice * 12) : 0;
        return { plan, monthlyPrice, installationCost, baseCost: plan.baseCost };
    })();

    const handleAddProduct = () => {
        if (result) {
            const description = `Internet via Rádio ${result.plan.description} - Contrato ${contractTerm} meses`;
            setAddedProducts(prev => [...prev, {
                id: generateUniqueId(),
                type: 'RADIO',
                description,
                setup: result.installationCost,
                monthly: result.monthlyPrice,
                details: { ...result }
            }]);
        }
    };

    const handleRemoveProduct = (id: string) => {
        setAddedProducts(prev => prev.filter(p => p.id !== id));
    };

    const totalSetup = addedProducts.reduce((sum, p) => sum + p.setup, 0);
    const totalMonthly = addedProducts.reduce((sum, p) => sum + p.monthly, 0);

    const clearForm = () => {
        setClientData({ name: '', email: '', phone: '' });
        setAccountManagerData({ name: '', email: '', phone: '' });
        setAddedProducts([]);
        setSelectedSpeed(0);
        setContractTerm(12);
        setIncludeInstallation(true);
        setProjectValue(0);
        setCurrentProposal(null);
    };

    const createNewProposal = () => {
        clearForm();
        setViewMode('client-form');
    };

    const editProposal = (proposal: Proposal) => {
        setCurrentProposal(proposal);
        setClientData(proposal.client);
        setAccountManagerData(proposal.accountManager);
        setAddedProducts(proposal.products);
        setViewMode('calculator');
    };

    const saveProposal = () => {
        const proposalToSave: Proposal = {
            id: currentProposal?.id || generateUniqueId(),
            client: clientData,
            accountManager: accountManagerData,
            products: addedProducts,
            totalSetup,
            totalMonthly,
            createdAt: currentProposal?.createdAt || new Date().toISOString()
        };

        if (currentProposal) {
            setProposals(prev => prev.map(p => p.id === proposalToSave.id ? proposalToSave : p));
        } else {
            setProposals(prev => [...prev, proposalToSave]);
        }
        setViewMode('search');
        clearForm();
    };

    const cancelAction = () => {
        setViewMode('search');
        clearForm();
    };

    const filteredProposals = proposals.filter(p =>
        p.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handlePrint = () => window.print();

    if (viewMode === 'client-form') {
        return (
            <ClientManagerForm
                clientData={clientData}
                accountManagerData={accountManagerData}
                onClientDataChange={setClientData}
                onAccountManagerDataChange={setAccountManagerData}
                onBack={cancelAction}
                onContinue={() => setViewMode('calculator')}
                title="Nova Proposta - Internet via Rádio"
                subtitle="Preencha os dados do cliente e gerente de contas para continuar."
            />
        );
    }

    return (
        <div className="p-4 md:p-8">
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
                                            <TableCell>{p.client.name}</TableCell>
                                            <TableCell>{new Date(p.createdAt).toLocaleDateString('pt-BR')}</TableCell>
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
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h1 className="text-3xl font-bold text-white">{currentProposal ? 'Editar Proposta' : 'Nova Proposta'}</h1>
                                <p className="text-slate-400 mt-2">Configure e calcule os custos para internet via rádio.</p>
                            </div>
                            <Button variant="outline" onClick={cancelAction} className="border-slate-600 text-slate-300 hover:bg-slate-700">
                                ← Voltar para Busca
                            </Button>
                        </div>
                        <ClientManagerInfo clientData={clientData} accountManagerData={accountManagerData} />
                    </div>

                    <Tabs defaultValue="calculator" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 bg-slate-800">
                            <TabsTrigger value="calculator">Calculadora</TabsTrigger>
                            <TabsTrigger value="prices">Tabela de Preços</TabsTrigger>
                        </TabsList>
                        <TabsContent value="calculator">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                                <Card className="bg-slate-900/80 border-slate-800 text-white">
                                    <CardHeader><CardTitle className="flex items-center"><Calculator className="mr-2" />Calculadora</CardTitle></CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="contract-term">Prazo Contratual</Label>
                                                <Select onValueChange={(v) => setContractTerm(Number(v))} value={contractTerm.toString()}>
                                                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="12">12 meses</SelectItem>
                                                        <SelectItem value="24">24 meses</SelectItem>
                                                        <SelectItem value="36">36 meses</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="speed">Velocidade</Label>
                                                <Select onValueChange={(v) => setSelectedSpeed(Number(v))} value={selectedSpeed.toString()}>
                                                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                                    <SelectContent>
                                                        {radioPlans.filter(p => getMonthlyPrice(p, contractTerm) > 0).map(plan => (
                                                            <SelectItem key={plan.speed} value={plan.speed.toString()}>{plan.description}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox id="include-installation" checked={includeInstallation} onCheckedChange={(c) => setIncludeInstallation(c as boolean)} />
                                                <Label htmlFor="include-installation">Incluir taxa de instalação no cálculo</Label>
                                            </div>
                                        </div>
                                        {includeInstallation && (
                                            <div className="space-y-2">
                                                <Label htmlFor="project-value">Valor do Projeto (p/ cálculo da instalação)</Label>
                                                <Input type="number" id="project-value" value={projectValue} onChange={(e) => setProjectValue(Number(e.target.value))} placeholder="Ex: 15000" className="bg-slate-800" />
                                            </div>
                                        )}
                                        <Button onClick={handleAddProduct} disabled={!result} className="w-full bg-blue-600 hover:bg-blue-700">Adicionar Produto</Button>
                                    </CardContent>
                                </Card>

                                <Card className="bg-slate-900/80 border-slate-800 text-white">
                                    <CardHeader><CardTitle className="flex items-center"><FileText className="mr-2" />Resumo da Proposta</CardTitle></CardHeader>
                                    <CardContent>
                                        {addedProducts.length === 0 ? (
                                            <p className="text-slate-400">Nenhum produto adicionado.</p>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="max-h-60 overflow-y-auto pr-2 space-y-4">
                                                    {addedProducts.map((product) => (
                                                        <div key={product.id} className="p-3 bg-slate-800 rounded-lg">
                                                            <div className="flex justify-between items-start">
                                                                <p className="font-semibold flex-1 pr-2">{product.description}</p>
                                                                <Button variant="ghost" size="icon" onClick={() => handleRemoveProduct(product.id)} className="text-red-400 hover:bg-red-900/50 h-7 w-7">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                            <div className="text-sm space-y-1 mt-2">
                                                                <div className="flex justify-between"><span>Instalação:</span><span>{formatCurrency(product.setup)}</span></div>
                                                                <div className="flex justify-between"><span>Mensal:</span><span>{formatCurrency(product.monthly)}</span></div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <Separator className="bg-slate-700" />
                                                <div className="space-y-2 font-bold">
                                                    <div className="flex justify-between"><span>Total Instalação:</span><span>{formatCurrency(totalSetup)}</span></div>
                                                    <div className="flex justify-between text-green-400"><span>Total Mensal:</span><span>{formatCurrency(totalMonthly)}</span></div>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                            <div className="flex gap-4 mt-6">
                                <Button onClick={saveProposal} className="bg-green-600 hover:bg-green-700">
                                    <Save className="h-4 w-4 mr-2" />
                                    Salvar Proposta
                                </Button>
                                <Button onClick={handlePrint} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                                    <Download className="h-4 w-4 mr-2" />
                                    Imprimir
                                </Button>
                                <Button onClick={cancelAction} variant="destructive">
                                    Cancelar
                                </Button>
                            </div>
                        </TabsContent>
                        <TabsContent value="prices">
                            <Card className="bg-slate-900/80 border-slate-800 text-white">
                                <CardHeader>
                                    <CardTitle>Tabela de Preços - Internet via Rádio</CardTitle>
                                    <CardDescription>Valores mensais para diferentes velocidades e prazos. Clique nos valores para editar.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="border-slate-700">
                                                    <TableHead className="text-white">Velocidade</TableHead>
                                                    <TableHead className="text-right text-white">12 meses</TableHead>
                                                    <TableHead className="text-right text-white">24 meses</TableHead>
                                                    <TableHead className="text-right text-white">36 meses</TableHead>
                                                    <TableHead className="text-right text-white">Custo de Instalação</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {radioPlans.map((plan, index) => (
                                                    <TableRow key={plan.speed} className="border-slate-800">
                                                        <TableCell>{plan.description}</TableCell>
                                                        <TableCell className="text-right">
                                                            <Input type="text" value={plan.price12.toFixed(2)} onChange={(e) => handlePriceChange(index, 'price12', e.target.value)} className="text-right bg-slate-800 border-slate-700 h-8" />
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Input type="text" value={plan.price24.toFixed(2)} onChange={(e) => handlePriceChange(index, 'price24', e.target.value)} className="text-right bg-slate-800 border-slate-700 h-8" />
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Input type="text" value={plan.price36.toFixed(2)} onChange={(e) => handlePriceChange(index, 'price36', e.target.value)} className="text-right bg-slate-800 border-slate-700 h-8" />
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Input type="text" value={plan.installationCost.toFixed(2)} onChange={(e) => handlePriceChange(index, 'installationCost', e.target.value)} className="text-right bg-slate-800 border-slate-700 h-8" />
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                    <div className="flex justify-end mt-4">
                                        <Button onClick={handleSavePrices}>
                                            <Save className="h-4 w-4 mr-2" />
                                            Salvar Preços
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </>
            )}
        </div>
    );
};

export default RadioInternetCalculator;