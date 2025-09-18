"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DoubleFibraRadioCommissionsSection from './DoubleFibraRadioCommissionsSection';
import { Separator } from '@/components/ui/separator';
import { ClientManagerForm, ClientData, AccountManagerData } from './ClientManagerForm';
import { ClientManagerInfo } from './ClientManagerInfo';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore';
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
    price48: number;
    price60: number;
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
    baseId: string;
    version: number;
    client: ClientData;
    accountManager: AccountManagerData;
    products: Product[];
    totalSetup: number;
    totalMonthly: number;
    createdAt: string;
    userId: string;
}

const DoubleFibraRadioCalculator: React.FC = () => {
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
    const [isExistingClient, setIsExistingClient] = useState(false);
    const [previousMonthlyFee, setPreviousMonthlyFee] = useState(0);
    const [createLastMile, setCreateLastMile] = useState(false);
    const [lastMileCost, setLastMileCost] = useState(0);
    const [projectValue, setProjectValue] = useState<number>(0);

    const [directorDiscountPercentage, setDirectorDiscountPercentage] = useState<number>(0);

    const { user } = useAuth();

    const [appliedDirectorDiscountPercentage, setAppliedDirectorDiscountPercentage] = useState<number>(0); // New state for applied director discount

    const [applySalespersonDiscount, setApplySalespersonDiscount] = useState<boolean>(false); // New state

    const [includeReferralPartner, setIncludeReferralPartner] = useState<boolean>(false);

    // Efeitos
    useEffect(() => {
        const initialRadioPlans: RadioPlan[] = [
            { speed: 10, price12: 49.90, price24: 39.90, price36: 34.90, price48: 29.90, price60: 24.90, installationCost: 100.00, description: "10 Mbps", baseCost: 30.00 },
            { speed: 20, price12: 79.90, price24: 69.90, price36: 59.90, price48: 54.90, price60: 49.90, installationCost: 100.00, description: "20 Mbps", baseCost: 50.00 },
            { speed: 25, price12: 720.00, price24: 527.00, price36: 474.00, price48: 450.00, price60: 430.00, installationCost: 998.00, description: "25 Mbps", baseCost: 1580.00 },
            { speed: 30, price12: 740.08, price24: 579.00, price36: 527.00, price48: 500.00, price60: 480.00, installationCost: 998.00, description: "30 Mbps", baseCost: 1580.00 },
            { speed: 40, price12: 915.01, price24: 632.00, price36: 579.00, price48: 550.00, price60: 520.00, installationCost: 998.00, description: "40 Mbps", baseCost: 1580.00 },
            { speed: 50, price12: 139.90, price24: 129.90, price36: 119.90, price48: 114.90, price60: 109.90, installationCost: 100.00, description: "50 Mbps", baseCost: 80.00 },
            { speed: 60, price12: 159.90, price24: 149.90, price36: 139.90, price48: 134.90, price60: 129.90, installationCost: 100.00, description: "60 Mbps", baseCost: 90.00 },
            { speed: 70, price12: 179.90, price24: 169.90, price36: 159.90, price48: 154.90, price60: 149.90, installationCost: 100.00, description: "70 Mbps", baseCost: 100.00 },
            { speed: 80, price12: 199.90, price24: 189.90, price36: 179.90, price48: 174.90, price60: 169.90, installationCost: 100.00, description: "80 Mbps", baseCost: 110.00 },
            { speed: 90, price12: 219.90, price24: 209.90, price36: 199.90, price48: 194.90, price60: 189.90, installationCost: 100.00, description: "90 Mbps", baseCost: 120.00 },
            { speed: 100, price12: 239.90, price24: 229.90, price36: 219.90, price48: 214.90, price60: 209.90, installationCost: 100.00, description: "100 Mbps", baseCost: 130.00 },
            { speed: 200, price12: 339.90, price24: 329.90, price36: 319.90, price48: 309.90, price60: 299.90, installationCost: 200.00, description: "200 Mbps", baseCost: 200.00 },
            { speed: 300, price12: 439.90, price24: 429.90, price36: 419.90, price48: 409.90, price60: 399.90, installationCost: 300.00, description: "300 Mbps", baseCost: 250.00 },
            { speed: 400, price12: 539.90, price24: 529.90, price36: 519.90, price48: 509.90, price60: 499.90, installationCost: 400.00, description: "400 Mbps", baseCost: 300.00 },
            { speed: 500, price12: 639.90, price24: 629.90, price36: 619.90, price48: 609.90, price60: 599.90, installationCost: 500.00, description: "500 Mbps", baseCost: 350.00 },
            { speed: 1000, price12: 999.90, price24: 989.90, price36: 979.90, price48: 969.90, price60: 959.90, installationCost: 1000.00, description: "1 Gbps", baseCost: 500.00 },
            { speed: 900, price12: 0, price24: 0, price36: 0, price48: 0, price60: 0, installationCost: 2500.00, description: "900 Mbps", baseCost: 23300.00 },
            { speed: 1000, price12: 0, price24: 0, price36: 0, price48: 0, price60: 0, installationCost: 2500.00, description: "1000 Mbps (1 Gbps)", baseCost: 23300.00 }
        ];
        const savedPlans = localStorage.getItem('radioLinkPrices');
        if (savedPlans) {
            setRadioPlans(JSON.parse(savedPlans));
        } else {
            setRadioPlans(initialRadioPlans);
        }

        const fetchProposals = async () => {
            if (!user || !user.role || !db) {
                setProposals([]);
                return;
            }

            const proposalsCol = collection(db, 'proposals');
            let q;
            if (user.role === 'admin' || user.role === 'diretor') {
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
        let price = 0;
        switch (term) {
            case 12: price = plan.price12; break;
            case 24: price = plan.price24; break;
            case 36: price = plan.price36; break;
            default: return 0;
        }
        return price * 1.5; // Adiciona 50%
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

    const referralPartnerCommissions = [
        { minRevenue: 0, maxRevenue: 1000, percentage: 5 },
        { minRevenue: 1000.01, maxRevenue: 5000, percentage: 7 },
        { minRevenue: 5000.01, maxRevenue: Infinity, percentage: 10 },
    ];

    const handleAddProduct = () => {
        if (result) {
            const description = `Double-Fibra/Radio ${result.plan.description} - Contrato ${contractTerm} meses`;
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

    const rawTotalSetup = addedProducts.reduce((sum, p) => sum + p.setup, 0);
    const rawTotalMonthly = addedProducts.reduce((sum, p) => sum + p.monthly, 0);

    // Aplicar desconto do vendedor (5% fixo)
    const salespersonDiscountFactor = applySalespersonDiscount ? 0.95 : 1; // Conditional application

    // Aplicar desconto do diretor (personalizável)
    const directorDiscountFactor = 1 - (appliedDirectorDiscountPercentage / 100);

    const referralPartnerCommissionValue = (() => {
        if (!includeReferralPartner) {
            return 0;
        }

        const monthlyRevenue = rawTotalMonthly * salespersonDiscountFactor * directorDiscountFactor; // Use the calculated monthly total

        for (const tier of referralPartnerCommissions) {
            if (monthlyRevenue >= tier.minRevenue && monthlyRevenue <= tier.maxRevenue) {
                return monthlyRevenue * (tier.percentage / 100);
            }
        }
        return 0;
    })();

    const finalTotalSetup = rawTotalSetup * salespersonDiscountFactor * directorDiscountFactor;
    const finalTotalMonthly = (rawTotalMonthly * salespersonDiscountFactor * directorDiscountFactor) - referralPartnerCommissionValue;

    

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

    const saveProposal = async () => {
        if (!user) {
            alert('Erro de autenticação: Usuário não autenticado. Por favor, faça login novamente.');
            return;
        }

        if (!user.uid) {
            alert('Erro de autenticação: ID do usuário não encontrado. Por favor, recarregue a página e tente novamente.');
            return;
        }

        if (addedProducts.length === 0) {
            alert('Adicione pelo menos um produto à proposta antes de salvar.');
            return;
        }
        
        if (!clientData.name) {
            alert('Por favor, preencha os dados do cliente antes de salvar.');
            return;
        }

        const totalSetup = addedProducts.reduce((sum, p) => sum + p.setup, 0);
        const totalMonthly = addedProducts.reduce((sum, p) => sum + p.monthly, 0);

        try {
            if (currentProposal) {
                // Create a new version of the existing proposal
                const baseId = currentProposal.baseId || currentProposal.id.split('_v')[0];
                const proposalsCol = collection(db, 'proposals');
                const q = query(proposalsCol, where('baseId', '==', baseId));
                const querySnapshot = await getDocs(q);

                const newVersion = querySnapshot.size + 1;
                const newId = `${baseId}_v${newVersion}`;

                const proposalToSave: Proposal = {
                    id: newId,
                    baseId,
                    version: newVersion,
                    client: clientData,
                    accountManager: accountManagerData,
                    products: addedProducts,
                    totalSetup: finalTotalSetup,
                    totalMonthly: finalTotalMonthly,
                    createdAt: serverTimestamp(),
                    userId: user.uid, // Assign current user's ID
                };

                const proposalRef = doc(db, 'proposals', newId);
                await setDoc(proposalRef, proposalToSave);
                alert('Nova versão da proposta salva com sucesso!');
                setCurrentProposal({ ...proposalToSave, id: newId, createdAt: new Date().toISOString() });

            } else {
                // Create new proposal
                const year = new Date().getFullYear();
                const prefix = `Prop_Double_`; // Unique prefix for Double-Fibra/Radio proposals

                const proposalsCol = collection(db, 'proposals');
                const q = query(proposalsCol, where('baseId', '>=', prefix), where('baseId', '<', prefix + 'z'));
                const querySnapshot = await getDocs(q);

                let lastNumber = 0;
                querySnapshot.forEach(d => {
                    const baseIdFromDoc = d.data().baseId;
                    if (baseIdFromDoc && baseIdFromDoc.startsWith(prefix)) {
                        const numPart = baseIdFromDoc.replace(prefix, '');
                        const num = parseInt(numPart, 10);
                        if (!isNaN(num) && num > lastNumber) {
                            lastNumber = num;
                        }
                    }
                });

                const newNumber = lastNumber + 1;
                const paddedNumber = newNumber.toString().padStart(4, '0');
                const newBaseId = `${prefix}${paddedNumber}`;

                const proposalToSave: Proposal = {
                    id: `${newBaseId}_v1`,
                    baseId: newBaseId,
                    version: 1,
                    client: clientData,
                    accountManager: accountManagerData,
                    products: addedProducts,
                    totalSetup: finalTotalSetup,
                    totalMonthly: finalTotalMonthly,
                    createdAt: serverTimestamp(),
                    userId: user.uid, // Assign current user's ID
                };

                const proposalRef = doc(db, 'proposals', `${newBaseId}_v1`);
                await setDoc(proposalRef, proposalToSave);

                alert(`Proposta ${proposalToSave.id} salva com sucesso!`);
                setCurrentProposal({ ...proposalToSave, id: `${newBaseId}_v1`, createdAt: new Date().toISOString() });
            }

            // Re-fetch proposals to update the list
            const proposalsCol = collection(db, 'proposals');
            let q = user.role === 'admin' || user.role === 'diretor' ? query(proposalsCol) : query(proposalsCol, where('userId', '==', user.uid));
            const querySnapshot = await getDocs(q);
            const proposalsData = querySnapshot.docs.map(d => ({ ...d.data(), id: d.id } as Proposal));
            setProposals(proposalsData);

            clearForm();
            setViewMode('search');
        } catch (error) {
            console.error('Erro ao salvar proposta:', error);
            alert('Ocorreu um erro ao salvar a proposta.');
        }
    };

    const cancelAction = () => {
        setViewMode('search');
        clearForm();
    };

    const handleDeleteProposal = async (proposalId: string) => {
        if (!db) {
            console.error('Firebase não está disponível');
            return;
        }
        if (window.confirm('Tem certeza que deseja excluir esta proposta?')) {
            try {
                await deleteDoc(doc(db, 'proposals', proposalId));
                // After deletion, re-fetch proposals to update the list
                const proposalsCol = collection(db, 'proposals');
                let q = user.role === 'admin' || user.role === 'diretor' ? query(proposalsCol) : query(proposalsCol, where('userId', '==', user.uid));
                const querySnapshot = await getDocs(q);
                const proposalsData = querySnapshot.docs.map(d => ({ ...d.data(), id: d.id } as Proposal));
                setProposals(proposalsData);
            } catch (error) {
                console.error('Erro ao excluir proposta:', error);
                alert('Falha ao excluir a proposta.');
            }
        }
    };

    const filteredProposals = proposals.filter(p => {
        const clientName = p.client?.name || '';
        const proposalId = p.id || '';
        const searchTermLower = searchTerm.toLowerCase();
        return (
            clientName.toLowerCase().includes(searchTermLower) ||
            proposalId.toLowerCase().includes(searchTermLower)
        );
    });

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
                title="Nova Proposta - Double-Fibra/Radio"
                subtitle="Preencha os dados do cliente e gerente de contas para continuar."
            />
        );
    }

    return (
        <div className="p-4 md:p-8">
            {viewMode === 'search' ? (
                <Card className="bg-slate-900/80 border-slate-800 text-white">
                    <CardHeader>
                        <CardTitle>Buscar Propostas - Double-Fibra/Radio</CardTitle>
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
                                            <TableCell>{p.client.name} (v{p.version})</TableCell>
                                            <TableCell>{new Date(p.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                                            <TableCell>{formatCurrency(p.totalMonthly)}</TableCell>
                                            <TableCell>
                                                <Button variant="outline" size="sm" onClick={() => editProposal(p)}>
                                                    <Edit className="h-4 w-4 mr-2" /> Visualizar Proposta
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    className="ml-2"
                                                    onClick={() => handleDeleteProposal(p.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" /> Excluir Proposta
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                    </div>
                    <CardContent>
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
                                        <TableCell>{p.client.name} (v{p.version})</TableCell>
                                        <TableCell>{new Date(p.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                                        <TableCell>{formatCurrency(p.totalMonthly)}</TableCell>
                                        <TableCell>
                                            <Button variant="outline" size="sm" onClick={() => editProposal(p)}>
                                                <Edit className="h-4 w-4 mr-2" /> Visualizar Proposta
                                            </Button>
                            <TabsTrigger value="calculator">Calculadora</TabsTrigger>
                            {(user?.role === 'admin' || user?.role === 'diretor') && (
                                <TabsTrigger value="prices">Tabela de Preços</TabsTrigger>
                            )}
                            {(user?.role === 'admin' || user?.role === 'diretor') && (
                                <TabsTrigger value="commissions-table">Tabela Comissões</TabsTrigger>
                            )}
                            {(user?.role === 'admin' || user?.role === 'diretor') && (
                                <TabsTrigger value="dre">DRE</TabsTrigger>
                            )}
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
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="isExistingClient"
                                                    checked={isExistingClient}
                                                    onCheckedChange={(checked) => setIsExistingClient(!!checked)}
                                                />
                                                <Label htmlFor="isExistingClient">Já é cliente da Base?</Label>
                                            </div>
                                        </div>
                                        {isExistingClient && (
                                            <div className="space-y-2">
                                                <Label htmlFor="previousMonthlyFee">Mensalidade Anterior</Label>
                                                <Input
                                                    id="previousMonthlyFee"
                                                    type="number"
                                                    value={previousMonthlyFee}
                                                    onChange={(e) => setPreviousMonthlyFee(parseFloat(e.target.value))}
                                                    placeholder="0.00"
                                                    className="bg-slate-800"
                                                />
                                            </div>
                                        )}
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="createLastMile"
                                                    checked={createLastMile}
                                                    onCheckedChange={(checked) => setCreateLastMile(!!checked)}
                                                />
                                                <Label htmlFor="createLastMile">Criar Last Mile?</Label>
                                            </div>
                                        </div>
                                        {createLastMile && (
                                            <div className="space-y-2">
                                                <Label htmlFor="lastMileCost">Custo (Last Mile)</Label>
                                                <Input
                                                    id="lastMileCost"
                                                    type="number"
                                                    value={lastMileCost}                                                    onChange={(e) => setLastMileCost(parseFloat(e.target.value))}
                                                    placeholder="0.00"
                                                    className="bg-slate-800"
                                                />
                                            </div>
                                        )}
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="includeReferralPartner"
                                                    checked={includeReferralPartner}
                                                    onCheckedChange={(checked) => setIncludeReferralPartner(Boolean(checked))}
                                                />
                                                <Label htmlFor="includeReferralPartner">Incluir Parceiro Indicador</Label>
                                            </div>
                                        </div>
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
                                                    {applySalespersonDiscount && (
                                                        <div className="flex justify-between">
                                                            <span>Desconto Vendedor (5%):</span>
                                                            <span>{formatCurrency(rawTotalSetup * 0.05)}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between"><span>Total Instalação:</span><span>{formatCurrency(finalTotalSetup)}</span></div>
                                                    {includeReferralPartner && (
                                                        <div className="flex justify-between text-yellow-400">
                                                            <span>Comissão Parceiro Indicador ({referralPartnerCommissions.find(tier => 
                                                                rawTotalMonthly * salespersonDiscountFactor * directorDiscountFactor >= tier.minRevenue && 
                                                                rawTotalMonthly * salespersonDiscountFactor * directorDiscountFactor <= tier.maxRevenue
                                                            )?.percentage}%):</span> 
                                                            <span>{formatCurrency(referralPartnerCommissionValue)}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between text-green-400"><span>Total Mensal:</span><span>{formatCurrency(finalTotalMonthly)}</span></div>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                            <div className="flex gap-4 mt-6">
                                {user?.role !== 'diretor' && (
                                    <div className="space-y-2 w-1/3">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="salesperson-discount-toggle"
                                                checked={applySalespersonDiscount}
                                                onCheckedChange={(checked) => setApplySalespersonDiscount(!!checked)}
                                            />
                                            <Label htmlFor="salesperson-discount-toggle">Aplicar Desconto Vendedor (5%)</Label>
                                        </div>
                                    </div>
                                )}
                                {user?.role === 'diretor' && (
                                    <div className="space-y-2 w-1/3">
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
                                <Button 
                                    onClick={saveProposal} 
                                    className="bg-green-600 hover:bg-green-700"
                                    disabled={!clientData.name || addedProducts.length === 0}
                                >
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
                                    <CardTitle>Tabela de Preços - Double-Fibra/Radio</CardTitle>
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
                                                    <TableHead className="text-right text-white">48 meses</TableHead>
                                                    <TableHead className="text-right text-white">60 meses</TableHead>
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
                                                            <Input type="text" value={plan.price48.toFixed(2)} onChange={(e) => handlePriceChange(index, 'price48', e.target.value)} className="text-right bg-slate-800 border-slate-700 h-8" />
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Input type="text" value={plan.price60.toFixed(2)} onChange={(e) => handlePriceChange(index, 'price60', e.target.value)} className="text-right bg-slate-800 border-slate-700 h-8" />
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
                        <TabsContent value="commissions-table">
                            <DoubleFibraRadioCommissionsSection />
                        </TabsContent>
                        <TabsContent value="dre">
                            <Card className="bg-slate-900/80 border-slate-800 text-white">
                                <CardHeader>
                                    <CardTitle>Demonstração do Resultado do Exercício (DRE)</CardTitle>
                                    <CardDescription>Análise financeira detalhada da operação</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Card className="bg-slate-800/50 border-slate-700">
                                                <CardHeader className="pb-2">
                                                    <CardTitle className="text-lg">Receita Total</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-2xl font-bold text-green-400">
                                                        {formatCurrency(addedProducts.reduce((sum, p) => sum + p.monthly, 0))}
                                                        <span className="text-sm text-slate-400 block">/mês</span>
                                                    </p>
                                                </CardContent>
                                            </Card>
                                            <Card className="bg-slate-800/50 border-slate-700">
                                                <CardHeader className="pb-2">
                                                    <CardTitle className="text-lg">Custos Diretos</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-2xl font-bold text-red-400">
                                                        {formatCurrency(addedProducts.reduce((sum, p) => sum + (p.details?.baseCost || 0), 0))}
                                                        <span className="text-sm text-slate-400 block">/mês</span>
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        </div>
                                        
                                        <Card className="bg-slate-800/50 border-slate-700">
                                            <CardHeader>
                                                <CardTitle>Margem Bruta</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between">
                                                        <span>Receita Total</span>
                                                        <span>{formatCurrency(addedProducts.reduce((sum, p) => sum + p.monthly, 0))}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>(-) Custos Diretos</span>
                                                        <span className="text-red-400">-{formatCurrency(addedProducts.reduce((sum, p) => sum + (p.details?.baseCost || 0), 0))}</span>
                                                    </div>
                                                    <Separator className="my-2" />
                                                    <div className="flex justify-between font-bold">
                                                        <span>Margem Bruta</span>
                                                        <span className="text-green-400">
                                                            {formatCurrency(addedProducts.reduce((sum, p) => sum + p.monthly, 0) - addedProducts.reduce((sum, p) => sum + (p.details?.baseCost || 0), 0))}
                                                            <span className="text-sm font-normal text-slate-400 ml-2">
                                                                ({(addedProducts.reduce((sum, p) => sum + p.monthly, 0) > 0 ? 
                                                                    ((addedProducts.reduce((sum, p) => sum + p.monthly, 0) - addedProducts.reduce((sum, p) => sum + (p.details?.baseCost || 0), 0)) / addedProducts.reduce((sum, p) => sum + p.monthly, 0) * 100).toFixed(1) 
                                                                    : '0.0'}%)
                                                            </span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="bg-slate-800/50 border-slate-700">
                                            <CardHeader>
                                                <CardTitle>Despesas Operacionais</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between">
                                                        <span>Comissões</span>
                                                        <span className="text-red-400">-{formatCurrency(addedProducts.reduce((sum, p) => sum + (p.monthly * 0.1), 0))}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Taxas e Impostos (15%)</span>
                                                        <span className="text-red-400">-{formatCurrency(addedProducts.reduce((sum, p) => sum + (p.monthly * 0.15), 0))}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Outras Despesas (5%)</span>
                                                        <span className="text-red-400">-{formatCurrency(addedProducts.reduce((sum, p) => sum + (p.monthly * 0.05), 0))}</span>
                                                    </div>
                                                    <Separator className="my-2" />
                                                    <div className="flex justify-between font-bold">
                                                        <span>Total Despesas Operacionais</span>
                                                        <span className="text-red-400">-{formatCurrency(addedProducts.reduce((sum, p) => sum + (p.monthly * 0.3), 0))}</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="bg-slate-800/50 border-slate-700">
                                            <CardHeader>
                                                <CardTitle>Resultado Líquido</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between">
                                                        <span>Margem Bruta</span>
                                                        <span>{formatCurrency(addedProducts.reduce((sum, p) => sum + p.monthly, 0) - addedProducts.reduce((sum, p) => sum + (p.details?.baseCost || 0), 0))}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>(-) Despesas Operacionais</span>
                                                        <span className="text-red-400">-{formatCurrency(addedProducts.reduce((sum, p) => sum + (p.monthly * 0.3), 0))}</span>
                                                    </div>
                                                    <Separator className="my-2" />
                                                    <div className="flex justify-between text-xl font-bold">
                                                        <span>Resultado Líquido</span>
                                                        <span className="text-green-400">
                                                            {formatCurrency((addedProducts.reduce((sum, p) => sum + p.monthly, 0) - addedProducts.reduce((sum, p) => sum + (p.details?.baseCost || 0), 0)) - (addedProducts.reduce((sum, p) => sum + (p.monthly * 0.3), 0)))}
                                                            <span className="text-sm font-normal text-slate-400 ml-2">
                                                                ({(addedProducts.reduce((sum, p) => sum + p.monthly, 0) > 0 ? 
                                                                    (((addedProducts.reduce((sum, p) => sum + p.monthly, 0) - addedProducts.reduce((sum, p) => sum + (p.details?.baseCost || 0), 0)) - (addedProducts.reduce((sum, p) => sum + (p.monthly * 0.3), 0))) / addedProducts.reduce((sum, p) => sum + p.monthly, 0) * 100).toFixed(1) 
                                                                    : '0.0'}%)
                                                            </span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
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

export default DoubleFibraRadioCalculator;