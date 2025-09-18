"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, FileText, Calculator, Save, Download, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ManCommissionsSection from './ManCommissionsSection';
import { ClientManagerForm, ClientData, AccountManagerData } from './ClientManagerForm';
import { ClientManagerInfo } from './ClientManagerInfo';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore';


// Interfaces
interface RadioPlan {
    speed: number;
    price12: number;
    price24: number;
    price36: number;
    price48: number;
    price60: number;
    installationCost: number;
    manCost: number;
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

interface InternetManCalculatorProps {
    onBackToDashboard?: () => void;
}

const InternetManCalculator: React.FC<InternetManCalculatorProps> = ({ onBackToDashboard }) => {
    // Estados
    const [viewMode, setViewMode] = useState<'search' | 'client-form' | 'calculator' | 'proposal-summary'>('search');
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [currentProposal, setCurrentProposal] = useState<Proposal | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    
    const [clientData, setClientData] = useState<ClientData>({ name: '', contact: '', projectName: '', email: '', phone: '' });
    const [accountManagerData, setAccountManagerData] = useState<AccountManagerData>({ name: '', email: '', phone: '' });
    
    const [addedProducts, setAddedProducts] = useState<Product[]>([]);
    const [radioPlans, setRadioPlans] = useState<RadioPlan[]>([]);

    const [selectedSpeed, setSelectedSpeed] = useState<number>(0);
    const [contractTerm, setContractTerm] = useState<number>(12);
    const [includeInstallation, setIncludeInstallation] = useState<boolean>(true);
    
    const [isExistingCustomer, setIsExistingCustomer] = useState<boolean>(false);
    const [previousMonthly, setPreviousMonthly] = useState<number>(0);
    const [includeLastMile, setIncludeLastMile] = useState<boolean>(false);
    const [lastMileCost, setLastMileCost] = useState<number>(0);
    const [projectValue, setProjectValue] = useState<number>(0);

    const [directorDiscountPercentage, setDirectorDiscountPercentage] = useState<number>(0);
    const [appliedDirectorDiscountPercentage, setAppliedDirectorDiscountPercentage] = useState<number>(0); // New state for applied director discount
    const [applySalespersonDiscount, setApplySalespersonDiscount] = useState<boolean>(false); // New state
    const [includeReferralPartner, setIncludeReferralPartner] = useState<boolean>(false);
    const [taxRates, setTaxRates] = useState({ pis: 0.65, cofins: 3.00, csll: 9.00, irpj: 15.00, banda: 2.09, fundraising: 0, rate: 24, margem: 0, custoDesp: 10 });
    const [isEditingTaxes, setIsEditingTaxes] = useState(false);
    const [markup, setMarkup] = useState(100);
    const [estimatedNetMargin, setEstimatedNetMargin] = useState(0);

    // Função para atualizar as taxas de impostos
    const handleTaxRateChange = (taxType: string, value: string) => {
        const newValue = parseFloat(value) || 0;
        setTaxRates(prev => ({
            ...prev,
            [taxType]: newValue
        }));
    };

    const { user } = useAuth();

    // Efeitos


    const fetchProposals = React.useCallback(async () => {
        if (!user || !user.role || !db) {
            setProposals([]);
            return;
        }

        const proposalsCol = collection(db, 'proposals');
        const prefix = 'Prop_Man_';
        let q;
        if (user.role === 'admin' || user.role === 'diretor') {
            q = query(proposalsCol, where('baseId', '>=', prefix), where('baseId', '<', prefix + 'z'));
        } else {
            q = query(proposalsCol, where('userId', '==', user.uid), where('baseId', '>=', prefix), where('baseId', '<', prefix + 'z'));
        }

        try {
            const querySnapshot = await getDocs(q);
            const proposalsData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Proposal));
            setProposals(proposalsData);
        } catch (error) {
            console.error("Erro ao buscar propostas: ", error);
        }
    }, [user, db]);

    useEffect(() => {
        const initialRadioPlans: RadioPlan[] = [
            { speed: 25, price12: 720.00, price24: 527.00, price36: 474.00, price48: 474.00, price60: 474.00, installationCost: 998.00, manCost: 3500.00, description: "25 Mbps", baseCost: 0 },
            { speed: 30, price12: 740.08, price24: 579.00, price36: 527.00, price48: 500.65, price60: 474.30, installationCost: 998.00, manCost: 3500.00, description: "30 Mbps", baseCost: 0 },
            { speed: 40, price12: 915.01, price24: 632.00, price36: 579.00, price48: 550.05, price60: 521.10, installationCost: 998.00, manCost: 3500.00, description: "40 Mbps", baseCost: 0 },
            { speed: 50, price12: 1103.39, price24: 685.00, price36: 632.00, price48: 600.40, price60: 568.80, installationCost: 998.00, manCost: 3500.00, description: "50 Mbps", baseCost: 0 },
            { speed: 60, price12: 1547.44, price24: 790.00, price36: 737.00, price48: 700.15, price60: 663.30, installationCost: 998.00, manCost: 3500.00, description: "60 Mbps", baseCost: 0 },
            { speed: 80, price12: 1825.98, price24: 1000.00, price36: 948.00, price48: 900.60, price60: 853.20, installationCost: 998.00, manCost: 7000.00, description: "80 Mbps", baseCost: 0 },
            { speed: 100, price12: 2017.05, price24: 1578.00, price36: 1316.00, price48: 1250.20, price60: 1184.40, installationCost: 1996.00, manCost: 7000.00, description: "100 Mbps", baseCost: 0 },
            { speed: 150, price12: 2543.18, price24: 1789.00, price36: 1527.00, price48: 1450.65, price60: 1374.30, installationCost: 1996.00, manCost: 7000.00, description: "150 Mbps", baseCost: 0 },
            { speed: 200, price12: 3215.98, price24: 2053.00, price36: 1737.00, price48: 1650.15, price60: 1563.30, installationCost: 1996.00, manCost: 7000.00, description: "200 Mbps", baseCost: 0 },
            { speed: 300, price12: 7522.00, price24: 4316.00, price36: 4000.00, price48: 3800.00, price60: 3600.00, installationCost: 2500.00, manCost: 7000.00, description: "300 Mbps", baseCost: 0 },
            { speed: 400, price12: 9469.00, price24: 5211.00, price36: 4736.00, price48: 4499.20, price60: 4262.40, installationCost: 2500.00, manCost: 7000.00, description: "400 Mbps", baseCost: 0 },
            { speed: 500, price12: 11174.00, price24: 5789.00, price36: 5253.00, price48: 4990.35, price60: 4727.70, installationCost: 2500.00, manCost: 7000.00, description: "500 Mbps", baseCost: 0 },
            { speed: 600, price12: 12500.00, price24: 6315.00, price36: 5790.00, price48: 5500.50, price60: 5211.00, installationCost: 2500.00, manCost: 7000.00, description: "600 Mbps", baseCost: 0 },
            { speed: 700, price12: 13800.00, price24: 6900.00, price36: 6300.00, price48: 5985.00, price60: 5670.00, installationCost: 2500.00, manCost: 7000.00, description: "700 Mbps", baseCost: 0 },
            { speed: 800, price12: 15000.00, price24: 7500.00, price36: 6800.00, price48: 6460.00, price60: 6120.00, installationCost: 2500.00, manCost: 7000.00, description: "800 Mbps", baseCost: 0 },
            { speed: 900, price12: 16200.00, price24: 8100.00, price36: 7300.00, price48: 6935.00, price60: 6570.00, installationCost: 2500.00, manCost: 7000.00, description: "900 Mbps", baseCost: 0 },
            { speed: 1000, price12: 17500.00, price24: 8750.00, price36: 7900.00, price48: 7505.00, price60: 7110.00, installationCost: 2500.00, manCost: 7000.00, description: "1000 Mbps (1 Gbps)", baseCost: 0 }
        ];
        const savedPlans = localStorage.getItem('radioLinkPrices');
        if (savedPlans) {
            const plans = JSON.parse(savedPlans);
            // Adicionar manCost aos planos antigos que não têm essa propriedade
            const updatedPlans = plans.map((plan: RadioPlan) => ({
                ...plan,
                manCost: plan.manCost || 0
            }));
            setRadioPlans(updatedPlans);
        } else {
            setRadioPlans(initialRadioPlans);
        }

        fetchProposals();
    }, [fetchProposals]);

    useEffect(() => {
        if (proposals.length > 0) {
            localStorage.setItem('radioProposals', JSON.stringify(proposals));
        }
    }, [proposals]);

    // Tabela de Comissão do Parceiro Indicador (Valores - Receita Mensal) com ate24/mais24
    const PARTNER_INDICATOR_RANGES = [
        { min: 0,      max: 500,    ate24: 1.5,  mais24: 2.5 },
        { min: 500.01, max: 1000,   ate24: 2.5,  mais24: 4.0 },
        { min: 1000.01,max: 1500,   ate24: 4.01, mais24: 5.5 },
        { min: 1500.01,max: 3000,   ate24: 5.51, mais24: 7.0 },
        { min: 3000.01,max: 5000,   ate24: 7.01, mais24: 8.5 },
        { min: 5000.01,max: 6500,   ate24: 8.51, mais24: 10.0 },
        { min: 6500.01,max: 9000,   ate24: 10.01,mais24: 11.5 },
        { min: 9000.01,max: Infinity,ate24: 11.51,mais24: 13.0 }
    ];

    const getPartnerIndicatorRate = (monthlyRevenue: number, contractMonths: number): number => {
        const range = PARTNER_INDICATOR_RANGES.find(r => monthlyRevenue >= r.min && monthlyRevenue <= r.max);
        if (!range) return 0;
        const pct = contractMonths <= 24 ? range.ate24 : range.mais24;
        return (pct || 0) / 100;
    };

    // Funções
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

    const totalSetup = addedProducts.reduce((sum, p) => sum + p.setup, 0);
    const totalMonthly = addedProducts.reduce((sum, p) => sum + p.monthly, 0);

    const salespersonDiscountFactor = applySalespersonDiscount ? 0.95 : 1;
    
    const directorDiscountFactor = 1 - (appliedDirectorDiscountPercentage / 100);

    const referralPartnerCommission = (() => {
        if (!includeReferralPartner) return 0;
        const monthlyRevenue = totalMonthly * salespersonDiscountFactor * directorDiscountFactor;
        const rate = getPartnerIndicatorRate(monthlyRevenue, contractTerm);
        return monthlyRevenue * rate;
    })();

    const finalTotalSetup = totalSetup * salespersonDiscountFactor * directorDiscountFactor;
    const finalTotalMonthly = (totalMonthly * salespersonDiscountFactor * directorDiscountFactor) - referralPartnerCommission;

    const handleClientFormSubmit = () => {
        console.log('Client data already set:', clientData);
        console.log('Account manager data already set:', accountManagerData);
        setViewMode('calculator');
    };

    const cancelAction = () => {
        setViewMode('search');
    };

    const getMonthlyPrice = (plan: RadioPlan, term: number) => {
        switch (term) {
            case 12: return plan.price12;
            case 24: return plan.price24;
            case 36: return plan.price36;
            case 48: return plan.price48;
            case 60: return plan.price60;
            default: return plan.price12;
        }
    };

    const getMaxPaybackMonths = (contractTerm: number): number => {
        // Returns the maximum allowed payback period for each contract term
        switch (contractTerm) {
            case 12: return 8;
            case 24: return 10;
            case 36: return 11;
            case 48: return 13;
            case 60: return 14;
            default: return 8;
        }
    };

    const calculatePayback = (installationCost: number, monthlyRevenue: number): number => {
        // Calculate payback in months
        if (monthlyRevenue <= 0) return 0;
        return Math.ceil(installationCost / monthlyRevenue);
    };

    const validatePayback = (installationCost: number, monthlyRevenue: number, contractTerm: number): { isValid: boolean, actualPayback: number, maxPayback: number } => {
        const actualPayback = calculatePayback(installationCost, monthlyRevenue);
        const maxPayback = getMaxPaybackMonths(contractTerm);
        
        return {
            isValid: actualPayback <= maxPayback,
            actualPayback,
            maxPayback
        };
    };

    const handleAddProduct = () => {
        if (!selectedSpeed) return;
        
        const plan = radioPlans.find(p => p.speed === selectedSpeed);
        if (!plan) return;

        const monthlyPrice = getMonthlyPrice(plan, contractTerm);
        const setupCost = includeInstallation ? plan.installationCost : 0;

        const newProduct: Product = {
            id: Date.now().toString(),
            type: 'RADIO',
            description: `${plan.speed} Mbps - ${contractTerm} meses`,
            setup: setupCost,
            monthly: monthlyPrice,
            details: {
                speed: plan.speed,
                term: contractTerm,
                includeInstallation
            }
        };

        setAddedProducts([...addedProducts, newProduct]);
    };

    const handleRemoveProduct = (id: string) => {
        setAddedProducts(addedProducts.filter(p => p.id !== id));
    };

    const saveProposal = async () => {
        if (!user) return;
        
        // Validar dados obrigatórios
        if (!clientData || !clientData.name) {
            alert('Por favor, preencha os dados do cliente antes de salvar.');
            return;
        }
        
        if (!accountManagerData || !accountManagerData.name) {
            alert('Por favor, preencha os dados do gerente de contas antes de salvar.');
            return;
        }
        
        if (addedProducts.length === 0) {
            alert('Por favor, adicione pelo menos um produto antes de salvar.');
            return;
        }

        try {
            if (currentProposal) {
                const baseId = currentProposal.baseId;
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
                    userId: user.uid,
                };

                const proposalRef = doc(db, 'proposals', newId);
                await setDoc(proposalRef, proposalToSave);
                alert('Nova versão da proposta salva com sucesso!');
                setCurrentProposal({ ...proposalToSave, id: newId, createdAt: new Date().toISOString() });

            } else {
                const prefix = `Prop_Man_`;
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
                    userId: user.uid,
                };

                const proposalRef = doc(db, 'proposals', `${newBaseId}_v1`);
                await setDoc(proposalRef, proposalToSave);

                alert(`Proposta ${proposalToSave.id} salva com sucesso!`);
                setCurrentProposal({ ...proposalToSave, id: `${newBaseId}_v1`, createdAt: new Date().toISOString() });
            }

            fetchProposals();
            setViewMode('search');
            setAddedProducts([]);
        } catch (error) {
            console.error('Erro ao salvar proposta:', error);
            alert('Erro ao salvar proposta. Tente novamente.');
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

    const rawTotalMonthly = addedProducts.reduce((sum, p) => sum + p.monthly, 0);

    const filteredProposals = proposals.filter(proposal => 
        proposal.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposal.id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const viewProposal = (proposal: Proposal) => {
        setCurrentProposal(proposal);
        setClientData(proposal.client);
        setAccountManagerData(proposal.accountManager);
        setAddedProducts(proposal.products);
        setViewMode('proposal-summary');
    };

    const createNewProposal = () => {
        setCurrentProposal(null);
        setClientData({ name: '', contact: '', projectName: '', email: '', phone: '' });
        setAccountManagerData({ name: '', email: '', phone: '' });
        setAddedProducts([]);
        setViewMode('client-form');
    };

    const handleDeleteProposal = async (proposalId: string) => {
        if (!confirm(`Tem certeza que deseja excluir a proposta ${proposalId}?`)) return;

        try {
            // First, delete all versions of the proposal
            const proposalsCol = collection(db, 'proposals');
            const q = query(proposalsCol, where('baseId', '==', proposalId.split('_v')[0]));
            const querySnapshot = await getDocs(q);
            
            const deletePromises = querySnapshot.docs.map(d => deleteDoc(doc(db, 'proposals', d.id)));
            await Promise.all(deletePromises);

            alert('Proposta e todas as suas versões foram excluídas com sucesso!');
            fetchProposals(); // Refresh the list
        } catch (error) {
            console.error("Erro ao excluir proposta: ", error);
            alert('Erro ao excluir proposta. Tente novamente.');
        }
    };

    const editProposal = (proposal: Proposal) => {
        setCurrentProposal(proposal);
        setClientData(proposal.client);
        setAccountManagerData(proposal.accountManager);
        setAddedProducts(proposal.products);
        
        // Load all calculation parameters from the first product if available
        if (proposal.products && proposal.products.length > 0) {
            const firstProduct = proposal.products[0];
            if (firstProduct.details) {
                // Set calculator parameters based on saved product details
                if (firstProduct.details.speed) setSelectedSpeed(firstProduct.details.speed);
                if (firstProduct.details.contractTerm) setContractTerm(firstProduct.details.contractTerm);
                if (firstProduct.details.includeInstallation !== undefined) setIncludeInstallation(firstProduct.details.includeInstallation);
                if (firstProduct.details.applySalespersonDiscount !== undefined) setApplySalespersonDiscount(firstProduct.details.applySalespersonDiscount);
                if (firstProduct.details.appliedDirectorDiscountPercentage !== undefined) setAppliedDirectorDiscountPercentage(firstProduct.details.appliedDirectorDiscountPercentage);
                if (firstProduct.details.includeReferralPartner !== undefined) setIncludeReferralPartner(firstProduct.details.includeReferralPartner);
            }
        }
        
        setViewMode('calculator');
    };

    const selectedPlan = radioPlans.find(p => p.speed === selectedSpeed);
    const monthly = selectedPlan ? getMonthlyPrice(selectedPlan, contractTerm) : 0;
    const setup = selectedPlan ? (includeInstallation ? selectedPlan.installationCost : 0) : 0;

    // Calculate result with payback validation
    const result = selectedPlan ? {
        selectedPlan,
        monthlyPrice: monthly,
        installationCost: setup,
        paybackValidation: validatePayback(
            setup,
            monthly,
            contractTerm
        )
    } : null;

    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const costBreakdown = useMemo(() => {
        if (!selectedPlan) return {
            finalPrice: 0,
            setupFee: 0,
            cost: 0,
            commissionValue: 0,
            referralPartnerCommission: 0,
            revenueTaxValue: 0,
            profitTaxValue: 0,
            grossProfit: 0,
            netProfit: 0,
            netMargin: 0,
            fiberCost: 0,
            markupAmount: 0,
            priceBeforeDiscounts: 0
        };

        const cost = selectedPlan.manCost || 0;
        const M = markup / 100;
        
        // Calcular preço base usando markup sobre o custo
        const markupAmount = cost * M;
        const priceWithMarkup = cost + markupAmount;
        
        // Usar o preço com markup como base (sem descontos por enquanto)
        const finalPrice = priceWithMarkup;
        const setupFee = setup;
        const commissionValue = finalPrice * 0.1; // 10% commission as example
        const referralPartnerCommission = 0; // No referral partner by default
        
        // Calculate taxes on revenue
        const pisTax = finalPrice * (taxRates.pis / 100);
        const cofinsTax = finalPrice * (taxRates.cofins / 100);
        const revenueTaxValue = pisTax + cofinsTax;
        
        // Calculate gross profit
        const grossProfit = finalPrice - cost - commissionValue - referralPartnerCommission - revenueTaxValue;
        
        // Calculate profit taxes
        const csllTax = grossProfit > 0 ? grossProfit * (taxRates.csll / 100) : 0;
        const irpjTax = grossProfit > 0 ? grossProfit * (taxRates.irpj / 100) : 0;
        const profitTaxValue = csllTax + irpjTax;
        
        // Calculate final net profit
        const netProfit = grossProfit - profitTaxValue;
        const netMargin = (netProfit / finalPrice) * 100;

        return {
            finalPrice,
            setupFee,
            cost,
            commissionValue,
            referralPartnerCommission,
            revenueTaxValue,
            profitTaxValue,
            grossProfit,
            netProfit,
            netMargin,
            fiberCost: 0, // MAN doesn't have fiber cost
            markupAmount,
            priceBeforeDiscounts: priceWithMarkup
        };
    }, [selectedPlan, monthly, setup, taxRates, markup]);

    // Calculate estimated net margin based on current values
    useEffect(() => {
        if (costBreakdown && costBreakdown.finalPrice > 0) {
            const margin = (costBreakdown.netProfit / costBreakdown.finalPrice) * 100;
            setEstimatedNetMargin(isNaN(margin) ? 0 : margin);
        }
    }, [costBreakdown]);

    // DRE calculations
    const dreCalculations = {
        receitaBruta: costBreakdown.finalPrice,
        receitaLiquida: costBreakdown.finalPrice - costBreakdown.revenueTaxValue,
        custoServico: costBreakdown.cost,
        lucroOperacional: costBreakdown.grossProfit,
        lucroLiquido: costBreakdown.netProfit,
        rentabilidade: costBreakdown.netMargin,
        lucratividade: costBreakdown.netMargin,
        paybackMeses: costBreakdown.setupFee > 0 && costBreakdown.netProfit > 0 ? Math.ceil(costBreakdown.setupFee / costBreakdown.netProfit) : 0,
    };

    if (viewMode === 'search') {
        return (
            <div className="container mx-auto p-4">
                <div className="mb-4">
                    <Button 
                        variant="outline" 
                        onClick={() => setViewMode('calculator')}
                        className="flex items-center mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Voltar
                    </Button>
                </div>
                <Card className="bg-slate-900/80 border-slate-800 text-white">
                    <CardHeader>
                        <CardTitle>Propostas de Internet MAN</CardTitle>
                        <CardDescription>Encontre propostas existentes ou crie uma nova.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4 mb-4">
                            <Input
                                type="text"
                                placeholder="Buscar por cliente ou ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-slate-800 border-slate-700 text-white flex-1"
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
                                            <TableCell>{typeof p.client === 'string' ? p.client : p.client?.name || 'Sem nome'} (v{p.version})</TableCell>
                                            <TableCell>{p.createdAt ? (
                                                (typeof p.createdAt === 'object' && 'toDate' in p.createdAt)
                                                    ? new Date(p.createdAt.toDate()).toLocaleDateString('pt-BR')
                                                    : (isNaN(new Date(p.createdAt).getTime()) ? 'N/A' : new Date(p.createdAt).toLocaleDateString('pt-BR'))
                                            ) : 'N/A'}</TableCell>
                                            <TableCell>{formatCurrency(p.totalMonthly || p.value || 0)}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => viewProposal(p)}>
                                                        <FileText className="h-4 w-4 mr-2" /> Visualizar Proposta
                                                    </Button>
                                                    <Button variant="outline" size="sm" onClick={() => editProposal(p)}>
                                                        <Edit className="h-4 w-4 mr-2" /> Editar Proposta
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleDeleteProposal(p.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" /> Excluir
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredProposals.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-4 text-slate-400">
                                                Nenhuma proposta encontrada
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8">
            {viewMode === 'client-form' ? (
                <ClientManagerForm 
                    clientData={clientData}
                    accountManagerData={accountManagerData}
                    onClientDataChange={setClientData}
                    onAccountManagerDataChange={setAccountManagerData}
                    onBack={() => setViewMode('search')}
                    onContinue={handleClientFormSubmit}
                />
            ) : viewMode === 'proposal-summary' && currentProposal ? (
                <Card className="bg-white border-gray-300 text-black print:shadow-none proposal-view">
                    <CardHeader className="print:pb-2">
                        <div className="flex justify-between items-start mb-4 print:mb-2">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Proposta Comercial</h1>
                                <p className="text-gray-600">Internet via Rádio - MAN</p>
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
                        {/* Dados do Cliente */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Dados do Cliente</h3>
                                <div className="space-y-2 text-sm">
                                    <p><strong>Nome:</strong> {currentProposal.client.name}</p>
                                    <p><strong>Projeto:</strong> {currentProposal.client.projectName}</p>
                                    <p><strong>Email:</strong> {currentProposal.client.email}</p>
                                    <p><strong>Telefone:</strong> {currentProposal.client.phone}</p>
                                    <p><strong>Contato:</strong> {currentProposal.client.contact}</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Gerente de Contas</h3>
                                <div className="space-y-2 text-sm">
                                    <p><strong>Nome:</strong> {currentProposal.accountManager.name}</p>
                                    <p><strong>Email:</strong> {currentProposal.accountManager.email}</p>
                                    <p><strong>Telefone:</strong> {currentProposal.accountManager.phone}</p>
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
                                    {currentProposal.products.map((product, index) => (
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
                                    <p><strong>Data da Proposta:</strong> {currentProposal.createdAt ? (isNaN(new Date(currentProposal.createdAt).getTime()) ? 'N/A' : new Date(currentProposal.createdAt).toLocaleDateString('pt-BR')) : 'N/A'}</p>
                                    <p><strong>ID da Proposta:</strong> {currentProposal.id}</p>
                                    <p><strong>Versão:</strong> {currentProposal.version}</p>
                                </div>
                            </div>
                        </div>

                        {/* Payback Info se disponível */}
                        {currentProposal.products.some(p => p.setup > 0) && (
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
            ) : (
                <>
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h1 className="text-3xl font-bold text-white">{currentProposal ? 'Editar Proposta' : 'Nova Proposta'}</h1>
                                <p className="text-slate-400 mt-2">Configure e calcule os custos para internet via rádio.</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setViewMode('search')} className="border-slate-600 text-slate-300 hover:bg-slate-700">
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
                        <ClientManagerInfo clientData={clientData} accountManagerData={accountManagerData} />
                    </div>

                    <Tabs defaultValue="calculator" className="w-full">
                        <TabsList className={`grid w-full ${user?.role === 'admin' ? 'grid-cols-4' : 'grid-cols-1'} bg-slate-800`}>
                            <TabsTrigger value="calculator">Calculadora</TabsTrigger>
                            {user?.role === 'admin' && (
                                <TabsTrigger value="prices">Tabela de Preços</TabsTrigger>
                            )}
                            {user?.role === 'admin' && (
                                <TabsTrigger value="commissions-table">Tabela Comissões</TabsTrigger>
                            )}
                            {user?.role === 'admin' && (
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
                                                        <SelectItem value="48">48 meses</SelectItem>
                                                        <SelectItem value="60">60 meses</SelectItem>
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
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox 
                                                            id="include-installation" 
                                                            checked={includeInstallation} 
                                                            onCheckedChange={(c) => setIncludeInstallation(c as boolean)} 
                                                        />
                                                        <Label htmlFor="include-installation" className="text-sm">Incluir taxa de instalação no cálculo</Label>
                                                    </div>
                                                    
                                                    
                                                    
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox 
                                                            id="existing-customer" 
                                                            checked={isExistingCustomer} 
                                                            onCheckedChange={(c) => {
                                                                setIsExistingCustomer(c as boolean);
                                                                if (!c) setPreviousMonthly(0);
                                                            }} 
                                                        />
                                                        <Label htmlFor="existing-customer" className="text-sm">Já é cliente da Base?</Label>
                                                    </div>
                                                </div>
                                                
                                                <div className="space-y-2">
                                                    {isExistingCustomer && (
                                                        <div className="space-y-1">
                                                            <Label htmlFor="previous-monthly" className="text-sm">Mensalidade Anterior</Label>
                                                            <Input 
                                                                type="number" 
                                                                id="previous-monthly" 
                                                                value={previousMonthly} 
                                                                onChange={(e) => setPreviousMonthly(Number(e.target.value))} 
                                                                placeholder="R$" 
                                                                className="bg-slate-800 h-8 text-sm" 
                                                            />
                                                        </div>
                                                    )}
                                                    
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox 
                                                            id="include-last-mile" 
                                                            checked={includeLastMile} 
                                                            onCheckedChange={(c) => {
                                                                setIncludeLastMile(c as boolean);
                                                                if (!c) setLastMileCost(0);
                                                            }} 
                                                        />
                                                        <Label htmlFor="include-last-mile" className="text-sm">Last Mile?</Label>
                                                    </div>
                                                    
                                                    {includeLastMile && (
                                                        <div className="space-y-1">
                                                            <Label htmlFor="last-mile-cost" className="text-sm">Custo (Last Mile)</Label>
                                                            <Input 
                                                                type="number" 
                                                                id="last-mile-cost" 
                                                                value={lastMileCost} 
                                                                onChange={(e) => setLastMileCost(Number(e.target.value))} 
                                                                placeholder="R$" 
                                                                className="bg-slate-800 h-8 text-sm" 
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center space-x-2">
                                                <Checkbox 
                                                    id="include-referral-partner" 
                                                    checked={includeReferralPartner} 
                                                    onCheckedChange={(c) => setIncludeReferralPartner(c as boolean)} 
                                                />
                                                <Label htmlFor="include-referral-partner" className="text-sm">Incluir Parceiro Indicador</Label>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <Label htmlFor="man-cost">Custo MAN</Label>
                                            <Input 
                                                type="number" 
                                                id="man-cost"
                                                value={selectedSpeed && contractTerm ? 
                                                    (radioPlans.find(p => p.speed === selectedSpeed)?.manCost || 0) 
                                                    : 0
                                                } 
                                                onChange={(e) => {
                                                    const newManCost = Number(e.target.value);
                                                    const updatedPlans = radioPlans.map(plan => 
                                                        plan.speed === selectedSpeed 
                                                            ? { ...plan, manCost: newManCost }
                                                            : plan
                                                    );
                                                    setRadioPlans(updatedPlans);
                                                }}
                                                placeholder="Ex: 3500"
                                                className="bg-slate-800"
                                                disabled={!selectedSpeed || !contractTerm}
                                            />
                                            <div className="text-xs text-slate-400">
                                                {selectedSpeed && contractTerm ? 
                                                    `${radioPlans.find(p => p.speed === selectedSpeed)?.description} - ${contractTerm} meses` 
                                                    : "Selecione prazo e velocidade para editar"
                                                }
                                            </div>
                                        </div>
                                        
                                        {includeInstallation && (
                                            <div className="space-y-2">
                                                <Label htmlFor="project-value">Custo do Projeto</Label>
                                                <Input type="number" id="project-value" value={projectValue} onChange={(e) => setProjectValue(Number(e.target.value))} placeholder="Ex: 15000" className="bg-slate-800" />
                                            </div>
                                        )}
                                        
                                        {/* Seção de Resultado e Validação de Payback */}
                                        {result && (
                                            <div className="space-y-3 p-4 bg-slate-800 rounded-lg border border-slate-700">
                                                <h4 className="text-lg font-semibold text-white">Resultado do Cálculo</h4>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between">
                                                        <span>Valor Mensal:</span>
                                                        <span className="font-semibold">{formatCurrency(result.monthlyPrice)}</span>
                                                    </div>
                                                    {includeInstallation && (
                                                        <div className="flex justify-between">
                                                            <span>Taxa de Instalação:</span>
                                                            <span className="font-semibold">{formatCurrency(result.installationCost)}</span>
                                                        </div>
                                                    )}
                                                    {includeInstallation && (
                                                        <div className="flex justify-between">
                                                            <span>Payback Calculado:</span>
                                                            <span className="font-semibold">{result.paybackValidation.actualPayback} meses</span>
                                                        </div>
                                                    )}
                                                    {includeInstallation && (
                                                        <div className="flex justify-between">
                                                            <span>Payback Máximo Permitido:</span>
                                                            <span className="font-semibold">{result.paybackValidation.maxPayback} meses</span>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {/* Alerta de Payback */}
                                                {includeInstallation && !result.paybackValidation.isValid && (
                                                    <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg">
                                                        <div className="flex items-center space-x-2">
                                                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                                            <span className="font-semibold text-red-400">⚠️ Payback acima do permitido!</span>
                                                        </div>
                                                        <p className="text-sm text-red-300 mt-1">
                                                            O payback de {result.paybackValidation.actualPayback} meses excede o limite de {result.paybackValidation.maxPayback} meses para contratos de {contractTerm} meses.
                                                        </p>
                                                    </div>
                                                )}
                                                
                                                {/* Alerta de Sucesso */}
                                                {includeInstallation && result.paybackValidation.isValid && (
                                                    <div className="p-3 bg-green-900/50 border border-green-700 rounded-lg">
                                                        <div className="flex items-center space-x-2">
                                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                            <span className="font-semibold text-green-400">✅ Payback dentro do limite!</span>
                                                        </div>
                                                        <p className="text-sm text-green-300 mt-1">
                                                            O payback de {result.paybackValidation.actualPayback} meses está dentro do limite de {result.paybackValidation.maxPayback} meses.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        
                                        <Button onClick={handleAddProduct} disabled={!selectedSpeed} className="w-full bg-blue-600 hover:bg-blue-700">Adicionar Produto</Button>
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
                                                
                                                {/* Controles de Desconto */}
                                                <div className="space-y-4 p-4 bg-slate-800 rounded-lg">
                                                    {(user?.role !== 'diretor' && user?.role !== 'admin') && (
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id="salesperson-discount-toggle"
                                                                checked={applySalespersonDiscount}
                                                                onCheckedChange={(checked) => setApplySalespersonDiscount(!!checked)}
                                                            />
                                                            <Label htmlFor="salesperson-discount-toggle">Aplicar Desconto Vendedor (5%)</Label>
                                                        </div>
                                                    )}
                                                    {(user?.role === 'diretor' || user?.role === 'admin') && (
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
                                                    {user?.role === 'admin' && (
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
                                                
                                                <Separator className="bg-slate-700" />
                                                <div className="space-y-2 font-bold">
                                                    {applySalespersonDiscount && (
                                                        <div className="flex justify-between text-orange-400">
                                                            <span>Desconto Vendedor (5%):</span>
                                                            <span>-{formatCurrency(totalSetup * 0.05)}</span>
                                                        </div>
                                                    )}
                                                    {appliedDirectorDiscountPercentage > 0 && (
                                                        <div className="flex justify-between text-orange-400">
                                                            <span>Desconto Diretor ({appliedDirectorDiscountPercentage}%):</span>
                                                            <span>-{formatCurrency(totalSetup * salespersonDiscountFactor * (appliedDirectorDiscountPercentage / 100))}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between"><span>Total Instalação:</span><span>{formatCurrency(finalTotalSetup)}</span></div>
                                                    {includeReferralPartner && (
                                                        <div className="flex justify-between text-yellow-400">
                                                            <span>
                                                                Comissão Parceiro Indicador ({(getPartnerIndicatorRate(rawTotalMonthly * salespersonDiscountFactor * directorDiscountFactor, contractTerm) * 100).toFixed(2)}%):
                                                            </span>
                                                            <span>{formatCurrency(referralPartnerCommission)}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between text-green-400"><span>Total Mensal:</span><span>{formatCurrency(finalTotalMonthly)}</span></div>
                                                    
                                                    {/* Payback Information */}
                                                    {result && includeInstallation && (
                                                        <div className="mt-4 pt-4 border-t border-slate-700">
                                                            <h4 className="text-sm font-semibold text-slate-300 mb-2">Informações de Payback</h4>
                                                            <div className="space-y-2 text-sm">
                                                                <div className="flex justify-between">
                                                                    <span>Payback Calculado:</span>
                                                                    <span className="font-semibold">{result.paybackValidation.actualPayback} meses</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span>Payback Máximo:</span>
                                                                    <span className="font-semibold">{result.paybackValidation.maxPayback} meses</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span>Status:</span>
                                                                    <span className={`font-semibold ${result.paybackValidation.isValid ? 'text-green-400' : 'text-red-400'}`}>
                                                                        {result.paybackValidation.isValid ? '✅ Dentro do limite' : '⚠️ Acima do limite'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
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
                        <TabsContent value="commissions-table">
                            <div className="space-y-6">
                                {/* Tabela de Comissão Vendedor */}
                                <Card className="bg-slate-900/80 border-slate-800 text-white">
                                    <CardHeader>
                                        <CardTitle>Comissão Vendedor</CardTitle>
                                        <CardDescription>Valores de comissão baseados no prazo contratual</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Prazo (meses)</TableHead>
                                                    <TableHead className="text-right">Comissão</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell>12 meses</TableCell>
                                                    <TableCell className="text-right">1,5%</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell>24 meses</TableCell>
                                                    <TableCell className="text-right">2%</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell>36 meses</TableCell>
                                                    <TableCell className="text-right">2,5%</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell>48 meses</TableCell>
                                                    <TableCell className="text-right">3%</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell>60 meses</TableCell>
                                                    <TableCell className="text-right">3,5%</TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>

                                {/* Tabela de Comissão Diretor */}
                                <Card className="bg-slate-900/80 border-slate-800 text-white">
                                    <CardHeader>
                                        <CardTitle>Comissão Diretor</CardTitle>
                                        <CardDescription>Valores de comissão baseados no prazo contratual</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Prazo (meses)</TableHead>
                                                    <TableHead className="text-right">Comissão</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell>12 meses</TableCell>
                                                    <TableCell className="text-right">0,5%</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell>24 meses</TableCell>
                                                    <TableCell className="text-right">0,75%</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell>36 meses</TableCell>
                                                    <TableCell className="text-right">1%</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell>48 meses</TableCell>
                                                    <TableCell className="text-right">1,25%</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell>60 meses</TableCell>
                                                    <TableCell className="text-right">1,5%</TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>

                                {/* Tabela de Comissão Parceiro Indicador */}
                                <Card className="bg-slate-900/80 border-slate-800 text-white">
                                    <CardHeader>
                                        <CardTitle>Comissão Parceiro Indicador</CardTitle>
                                        <CardDescription>Valores de comissão baseados na receita mensal</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Valores - Receita Mensal</TableHead>
                                                        <TableHead className="text-right">Até 24 Meses</TableHead>
                                                        <TableHead className="text-right">24 Meses ou Mais</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    <TableRow>
                                                        <TableCell>R$ 0,00 a R$ 500,00</TableCell>
                                                        <TableCell className="text-right">1,5%</TableCell>
                                                        <TableCell className="text-right">2,5%</TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell>R$ 500,01 a R$ 1.000,00</TableCell>
                                                        <TableCell className="text-right">2,5%</TableCell>
                                                        <TableCell className="text-right">4%</TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell>R$ 1.000,01 a R$ 1.500,00</TableCell>
                                                        <TableCell className="text-right">4,01%</TableCell>
                                                        <TableCell className="text-right">5,5%</TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell>R$ 1.500,01 a R$ 3.000,00</TableCell>
                                                        <TableCell className="text-right">5,51%</TableCell>
                                                        <TableCell className="text-right">7%</TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell>R$ 3.000,01 a R$ 5.000,00</TableCell>
                                                        <TableCell className="text-right">7,01%</TableCell>
                                                        <TableCell className="text-right">8,5%</TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell>R$ 5.000,01 a R$ 6.500,00</TableCell>
                                                        <TableCell className="text-right">8,51%</TableCell>
                                                        <TableCell className="text-right">10%</TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell>R$ 6.500,01 a R$ 9.000,00</TableCell>
                                                        <TableCell className="text-right">10,01%</TableCell>
                                                        <TableCell className="text-right">11,5%</TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell>Acima de R$ 9.000,01</TableCell>
                                                        <TableCell className="text-right">11,51%</TableCell>
                                                        <TableCell className="text-right">13%</TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                        
                        {/* DRE - Demonstrativo de Resultado do Exercício */}
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
                                                <div className="flex justify-between">
                                                    <span>Custo do Serviço:</span>
                                                    <span className="text-red-400">{formatCurrency(costBreakdown.cost)}</span>
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
                                                <TableRow className="border-slate-800 bg-green-900/30">
                                                    <TableCell className="text-white font-semibold">Receita Mensal</TableCell>
                                                    <TableCell className="text-right text-white">{formatCurrency(costBreakdown.finalPrice)}</TableCell>
                                                </TableRow>
                                                <TableRow className="border-slate-800">
                                                    <TableCell className="text-white">Taxa Setup</TableCell>
                                                    <TableCell className="text-right text-white">{formatCurrency(costBreakdown.setupFee)}</TableCell>
                                                </TableRow>
                                                <TableRow className="border-slate-800 bg-red-900/30">
                                                    <TableCell className="text-white font-semibold">(-) Custos Diretos</TableCell>
                                                    <TableCell className="text-right text-white"></TableCell>
                                                </TableRow>
                                                <TableRow className="border-slate-800">
                                                    <TableCell className="text-white">Custo da VM</TableCell>
                                                    <TableCell className="text-right text-white">{formatCurrency(costBreakdown.cost)}</TableCell>
                                                </TableRow>
                                                <TableRow className="border-slate-800">
                                                    <TableCell className="text-white">Comissão Vendedor</TableCell>
                                                    <TableCell className="text-right text-white">{formatCurrency(costBreakdown.commissionValue)}</TableCell>
                                                </TableRow>
                                                {costBreakdown.referralPartnerCommission > 0 && (
                                                    <TableRow className="border-slate-800">
                                                        <TableCell className="text-white">Comissão Parceiro</TableCell>
                                                        <TableCell className="text-right text-white">{formatCurrency(costBreakdown.referralPartnerCommission)}</TableCell>
                                                    </TableRow>
                                                )}
                                                <TableRow className="border-slate-800 bg-red-900/30">
                                                    <TableCell className="text-white font-semibold">(-) Impostos sobre Receita</TableCell>
                                                    <TableCell className="text-right text-white">{formatCurrency(costBreakdown.revenueTaxValue)}</TableCell>
                                                </TableRow>
                                                <TableRow className="border-slate-800">
                                                    <TableCell className="text-white">PIS ({taxRates.pis.toFixed(2)}%)</TableCell>
                                                    <TableCell className="text-right text-white">{formatCurrency(costBreakdown.finalPrice * (taxRates.pis / 100))}</TableCell>
                                                </TableRow>
                                                <TableRow className="border-slate-800">
                                                    <TableCell className="text-white">Cofins ({taxRates.cofins.toFixed(2)}%)</TableCell>
                                                    <TableCell className="text-right text-white">{formatCurrency(costBreakdown.finalPrice * (taxRates.cofins / 100))}</TableCell>
                                                </TableRow>
                                                <TableRow className="border-slate-800">
                                                    <TableCell className="text-white">CSLL ({taxRates.csll.toFixed(2)}%)</TableCell>
                                                    <TableCell className="text-right text-white">{formatCurrency(costBreakdown.finalPrice * (taxRates.csll / 100))}</TableCell>
                                                </TableRow>
                                                <TableRow className="border-slate-800">
                                                    <TableCell className="text-white">IRPJ ({taxRates.irpj.toFixed(2)}%)</TableCell>
                                                    <TableCell className="text-right text-white">{formatCurrency(costBreakdown.finalPrice * (taxRates.irpj / 100))}</TableCell>
                                                </TableRow>
                                                <TableRow className="border-slate-800 bg-blue-900/30">
                                                    <TableCell className="text-white font-semibold">Lucro Bruto</TableCell>
                                                    <TableCell className="text-right text-white">{formatCurrency(costBreakdown.grossProfit)}</TableCell>
                                                </TableRow>
                                                <TableRow className="border-slate-800 bg-red-900/30">
                                                    <TableCell className="text-white font-semibold">(-) Impostos sobre Lucro</TableCell>
                                                    <TableCell className="text-right text-white">{formatCurrency(costBreakdown.profitTaxValue)}</TableCell>
                                                </TableRow>
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
                                                        {((costBreakdown.netProfit / costBreakdown.finalPrice) * 100).toFixed(2)}%
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow className="border-slate-800">
                                                    <TableCell className="text-white font-semibold">Lucratividade</TableCell>
                                                    <TableCell className={`text-right font-semibold ${(costBreakdown.netProfit / costBreakdown.finalPrice * 100) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                        {((costBreakdown.netProfit / costBreakdown.finalPrice) * 100).toFixed(2)}%
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                        
                                        {/* Payback */}
                                        <div className="mt-6 pt-4 border-t border-slate-700">
                                            <h3 className="text-lg font-semibold mb-2">Payback</h3>
                                            <div className="text-2xl font-bold text-green-400">
                                                {dreCalculations.paybackMeses > 0 ? `${dreCalculations.paybackMeses} meses` : '0 meses'}
                                            </div>
                                        </div>
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
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setIsEditingTaxes(!isEditingTaxes)}
                                                className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                            >
                                                {isEditingTaxes ? 'Salvar' : 'Editar'}
                                            </Button>
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
                                                    value={taxRates.pis.toFixed(2)}
                                                    onChange={(e) => handleTaxRateChange('pis', e.target.value)}
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
                                                    value={taxRates.cofins.toFixed(2)}
                                                    onChange={(e) => handleTaxRateChange('cofins', e.target.value)}
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
                                                    value={taxRates.csll.toFixed(2)}
                                                    onChange={(e) => handleTaxRateChange('csll', e.target.value)}
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
                                                    value={taxRates.irpj.toFixed(2)}
                                                    onChange={(e) => handleTaxRateChange('irpj', e.target.value)}
                                                    disabled={!isEditingTaxes}
                                                    className="bg-slate-800 border-slate-700"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="banda-rate">Banda (%)</Label>
                                                <Input
                                                    id="banda-rate"
                                                    type="number"
                                                    step="0.01"
                                                    value={taxRates.banda.toFixed(2)}
                                                    onChange={(e) => handleTaxRateChange('banda', e.target.value)}
                                                    disabled={!isEditingTaxes}
                                                    className="bg-slate-800 border-slate-700"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="fundraising-rate">Fundraising (%)</Label>
                                                <Input
                                                    id="fundraising-rate"
                                                    type="number"
                                                    step="0.01"
                                                    value={taxRates.fundraising.toFixed(2)}
                                                    onChange={(e) => handleTaxRateChange('fundraising', e.target.value)}
                                                    disabled={!isEditingTaxes}
                                                    className="bg-slate-800 border-slate-700"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="rate-rate">Rate (%)</Label>
                                                <Input
                                                    id="rate-rate"
                                                    type="number"
                                                    step="0.01"
                                                    value={taxRates.rate.toFixed(2)}
                                                    onChange={(e) => handleTaxRateChange('rate', e.target.value)}
                                                    disabled={!isEditingTaxes}
                                                    className="bg-slate-800 border-slate-700"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="margem-rate">Margem (%)</Label>
                                                <Input
                                                    id="margem-rate"
                                                    type="number"
                                                    step="0.01"
                                                    value={taxRates.margem.toFixed(2)}
                                                    onChange={(e) => handleTaxRateChange('margem', e.target.value)}
                                                    disabled={!isEditingTaxes}
                                                    className="bg-slate-800 border-slate-700"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="custo-desp-rate">Custo/Desp (%)</Label>
                                                <Input
                                                    id="custo-desp-rate"
                                                    type="number"
                                                    step="0.01"
                                                    value={taxRates.custoDesp.toFixed(2)}
                                                    onChange={(e) => handleTaxRateChange('custoDesp', e.target.value)}
                                                    disabled={!isEditingTaxes}
                                                    className="bg-slate-800 border-slate-700"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Markup e Margem Líquida */}
                                <Card className="bg-slate-900/80 border-slate-800 text-white">
                                    <CardHeader>
                                        <CardTitle className="text-cyan-400">Markup e Margem Líquida</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="markup">Markup (%)</Label>
                                                <Input
                                                    id="markup"
                                                    type="number"
                                                    value={markup}
                                                    onChange={(e) => setMarkup(parseFloat(e.target.value) || 0)}
                                                    className="bg-slate-800 border-slate-700 text-white"
                                                    step="0.01"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="margem-liquida">Margem Líquida (%)</Label>
                                                <Input
                                                    id="margem-liquida"
                                                    type="text"
                                                    value={`${estimatedNetMargin.toFixed(2)}%`}
                                                    readOnly
                                                    className="bg-slate-800 border-slate-700 text-white"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="mt-6 space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-300">Custo Base:</span>
                                                <span className="text-white">{formatCurrency(costBreakdown.cost)}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-300">Impostos (0.00%):</span>
                                                <span className="text-white">{formatCurrency(costBreakdown.revenueTaxValue)}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-300">Custo Total c/ Impostos:</span>
                                                <span className="text-white">{formatCurrency(costBreakdown.cost + costBreakdown.revenueTaxValue)}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-green-400">Markup (100%):</span>
                                                <span className="text-green-400">+{formatCurrency(costBreakdown.cost * (markup / 100))}</span>
                                            </div>
                                            <div className="flex justify-between items-center font-semibold">
                                                <span className="text-white">Preço Final:</span>
                                                <span className="text-white">{formatCurrency(costBreakdown.finalPrice)}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-cyan-400">Margem Líquida:</span>
                                                <span className={`${costBreakdown.netMargin >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {costBreakdown.netMargin.toFixed(2)}%
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Recursos Base (Custos) */}
                                <Card className="bg-slate-900/80 border-slate-800 text-white">
                                    <CardHeader>
                                        <CardTitle className="text-cyan-400">Recursos Base (Custos)</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div>
                                                    <Label className="text-cyan-400">Custo de Instalação</Label>
                                                    <div className="mt-2">
                                                        <Label htmlFor="custo-mensal">Custo Único</Label>
                                                        <Input
                                                            id="custo-mensal"
                                                            type="number"
                                                            value={selectedPlan ? selectedPlan.installationCost : 0}
                                                            readOnly
                                                            className="bg-slate-800 border-slate-700 text-white mt-1 cursor-not-allowed"
                                                            step="0.01"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div>
                                                    <Label className="text-cyan-400">Custo MAN</Label>
                                                    <div className="mt-2">
                                                        <Label htmlFor="custo-unico">Custo Único</Label>
                                                        <Input
                                                            id="custo-unico"
                                                            type="number"
                                                            value={selectedPlan ? (selectedPlan.manCost || 0) : 0}
                                                            readOnly
                                                            className="bg-slate-800 border-slate-700 text-white mt-1 cursor-not-allowed"
                                                            step="0.01"
                                                        />
                                                    </div>
                                                </div>
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
                                                        <span className="text-gray-300">Banda:</span>
                                                        <span className="text-red-300 font-semibold">{formatCurrency(dreCalculations.custoBanda)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-300">Comissão:</span>
                                                        <span className="text-red-300 font-semibold">{formatCurrency(dreCalculations.comissaoVendedor)}</span>
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
                                                            {dreCalculations.paybackMeses}m
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
                        </TabsContent>
                        
                        {user?.role === 'admin' && (
                            <TabsContent value="prices">
                                <Card className="bg-slate-900/80 border-slate-800 text-white">
                                    <CardHeader>
                                        <CardTitle>Tabela de Preços - Internet MAN</CardTitle>
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
                                                    <TableHead className="text-right text-white">Custo MAN</TableHead>
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
                                                            <TableCell className="text-right">
                                                                <Input type="text" value={(plan.manCost || 0).toFixed(2)} onChange={(e) => handlePriceChange(index, 'manCost', e.target.value)} className="text-right bg-slate-800 border-slate-700 h-8" />
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
                                        
                                        {/* Informações de Contrato */}
                                        <div className="mt-8">
                                            <h3 className="text-xl font-semibold mb-4 text-white">Informações de Contrato</h3>
                                            <div className="space-y-2 text-white">
                                                <p>Contratos de 12 meses - Payback 08 meses</p>
                                                <p>Contratos de 24 meses - Payback 10 meses</p>
                                                <p>Contratos de 36 meses - Payback 11 meses</p>
                                                <p>Contratos de 48 meses - Payback 13 meses</p>
                                                <p>Contratos de 60 meses - Payback 14 meses</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            )}
                        </Tabs>
                    </>
                )}
            </div>
        );
    };

export default InternetManCalculator;