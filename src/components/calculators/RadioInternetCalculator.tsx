"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RadioCommissionsSection from './RadioCommissionsSection';
import { Separator } from '@/components/ui/separator';
import { ClientManagerForm, ClientData, AccountManagerData } from './ClientManagerForm';
import { ClientManagerInfo } from './ClientManagerInfo';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/use-auth';
import { 
    Radio, 
    Calculator, 
    FileText, 
    Plus,
    Edit,
    Save,
    Download,
    Trash2,
    ArrowLeft
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
    radioCost: number;
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

const initialRadioPlans: RadioPlan[] = [
    {
        speed: 25,
        description: '25 Mbps',
        price12: 720.00,
        price24: 527.00,
        price36: 474.00,
        price48: 474.00,
        price60: 474.00,
        installationCost: 998.00,
        radioCost: 3580.00,
        baseCost: 0
    },
    {
        speed: 30,
        description: '30 Mbps',
        price12: 740.08,
        price24: 579.00,
        price36: 527.00,
        price48: 527.00,
        price60: 527.00,
        installationCost: 998.00,
        radioCost: 3580.00,
        baseCost: 0
    },
    {
        speed: 40,
        description: '40 Mbps',
        price12: 915.01,
        price24: 632.00,
        price36: 579.00,
        price48: 579.00,
        price60: 579.00,
        installationCost: 998.00,
        radioCost: 3580.00,
        baseCost: 0
    },
    {
        speed: 50,
        description: '50 Mbps',
        price12: 1103.39,
        price24: 685.00,
        price36: 632.00,
        price48: 632.00,
        price60: 632.00,
        installationCost: 998.00,
        radioCost: 3580.00,
        baseCost: 250.00
    },
    {
        speed: 60,
        description: '60 Mbps',
        price12: 1547.44,
        price24: 790.00,
        price36: 737.00,
        price48: 737.00,
        price60: 737.00,
        installationCost: 998.00,
        radioCost: 3580.00,
        baseCost: 300.00
    },
    {
        speed: 80,
        description: '80 Mbps',
        price12: 1825.98,
        price24: 1000.00,
        price36: 948.00,
        price48: 948.00,
        price60: 948.00,
        installationCost: 1996.00,
        radioCost: 6700.00,
        baseCost: 400.00
    },
    {
        speed: 100,
        description: '100 Mbps',
        price12: 2017.05,
        price24: 1578.00,
        price36: 1316.00,
        price48: 1316.00,
        price60: 1316.00,
        installationCost: 1996.00,
        radioCost: 6700.00,
        baseCost: 500.00
    },
    {
        speed: 150,
        description: '150 Mbps',
        price12: 2543.18,
        price24: 1789.00,
        price36: 1527.00,
        price48: 1527.00,
        price60: 1527.00,
        installationCost: 1996.00,
        radioCost: 6700.00,
        baseCost: 600.00 // Custo base para 150 Mbps
    },
    {
        speed: 200,
        description: '200 Mbps',
        price12: 3215.98,
        price24: 2053.00,
        price36: 1737.00,
        price48: 1737.00,
        price60: 1737.00,
        installationCost: 2500.00,
        radioCost: 23200.00,
        baseCost: 800.00 // Custo base para 200 Mbps
    },
    {
        speed: 300,
        description: '300 Mbps',
        price12: 7522.00,
        price24: 4316.00,
        price36: 4000.00,
        price48: 4000.00,
        price60: 4000.00,
        installationCost: 2500.00,
        radioCost: 25360.00,
        baseCost: 1200.00 // Custo base para 300 Mbps
    },
    {
        speed: 400,
        description: '400 Mbps',
        price12: 9469.00,
        price24: 5211.00,
        price36: 4736.00,
        price48: 4736.00,
        price60: 4736.00,
        installationCost: 2500.00,
        radioCost: 25360.00,
        baseCost: 1500.00 // Custo base para 400 Mbps
    },
    {
        speed: 500,
        description: '500 Mbps',
        price12: 11174.00,
        price24: 5789.00,
        price36: 5253.00,
        price48: 5253.00,
        price60: 5253.00,
        installationCost: 2500.00,
        radioCost: 25360.00,
        baseCost: 1800.00 // Custo base para 500 Mbps
    },
    {
        speed: 600,
        description: '600 Mbps',
        price12: 1999.00,
        price24: 6315.00,
        price36: 5790.00,
        price48: 5790.00,
        price60: 5790.00,
        installationCost: 2500.00,
        radioCost: 25360.00,
        baseCost: 2000.00 // Custo base para 600 Mbps
    },
    {
        speed: 700,
        description: '700 Mbps',
        price12: 2499.00,
        price24: 0,
        price36: 0,
        price48: 0,
        price60: 0,
        installationCost: 2500.00,
        radioCost: 25360.00,
        baseCost: 2200.00 // Custo base para 700 Mbps
    },
    {
        speed: 800,
        description: '800 Mbps',
        price12: 0,
        price24: 0,
        price36: 0,
        price48: 0,
        price60: 0,
        installationCost: 2500.00,
        radioCost: 25360.00,
        baseCost: 2500.00 // Custo base para 800 Mbps
    },
    {
        speed: 900,
        description: '900 Mbps',
        price12: 0,
        price24: 0,
        price36: 0,
        price48: 0,
        price60: 0,
        installationCost: 2500.00,
        radioCost: 25360.00,
        baseCost: 2800.00 // Custo base para 900 Mbps
    },
    {
        speed: 1000,
        description: '1000 Mbps',
        price12: 0,
        price24: 0,
        price36: 0,
        price48: 0,
        price60: 0,
        installationCost: 2500.00,
        radioCost: 25360.00,
        baseCost: 3000.00 // Custo base para 1000 Mbps
    }
];

interface RadioInternetCalculatorProps {
    onBackToDashboard?: () => void;
}

const RadioInternetCalculator: React.FC<RadioInternetCalculatorProps> = ({ onBackToDashboard }) => {
    // Estados
    const [viewMode, setViewMode] = useState<'search' | 'client-form' | 'calculator' | 'proposal-summary'>('search');
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [currentProposal, setCurrentProposal] = useState<Proposal | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    
    const [clientData, setClientData] = useState<ClientData>({ name: '', contact: '', projectName: '', email: '', phone: '' });
    const [accountManagerData, setAccountManagerData] = useState<AccountManagerData>({ name: '', email: '', phone: '' });
    
    const [addedProducts, setAddedProducts] = useState<Product[]>([]);
    const [radioPlans, setRadioPlans] = useState<RadioPlan[]>(initialRadioPlans);

    const [selectedSpeed, setSelectedSpeed] = useState<number>(0);
    const [contractTerm, setContractTerm] = useState<number>(12);
    const [includeInstallation, setIncludeInstallation] = useState(true);
    const [isExistingClient, setIsExistingClient] = useState(false);
    const [previousMonthlyFee, setPreviousMonthlyFee] = useState(0);
    const [createLastMile, setCreateLastMile] = useState(false);
    const [lastMileCost, setLastMileCost] = useState(0);
    const [projectValue, setProjectValue] = useState<number>(0);
    const [directorDiscountPercentage, setDirectorDiscountPercentage] = useState<number>(0);
    const [appliedDirectorDiscountPercentage, setAppliedDirectorDiscountPercentage] = useState<number>(0);
    const [applySalespersonDiscount, setApplySalespersonDiscount] = useState<boolean>(false);
    const [includeReferralPartner, setIncludeReferralPartner] = useState<boolean>(false);
    const [isEditingTaxes, setIsEditingTaxes] = useState<boolean>(false);
    const [markup, setMarkup] = useState(100);
    const [estimatedNetMargin, setEstimatedNetMargin] = useState(0);
    const [commissionPercentage, setCommissionPercentage] = useState<number>(0);

    // Tabela de comissão do Parceiro Indicador (por Receita Mensal) com ate24/mais24
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

    const getMonthlyPrice = (plan: RadioPlan | undefined, term: number): number => {
        if (!plan) return 0;
        const price = {
            12: plan.price12,
            24: plan.price24,
            36: plan.price36,
            48: plan.price48,
            60: plan.price60
        }[term];
        return price || 0;
    };

    const getMaxPaybackMonths = (contractTerm: number): number => {
        // Returns the maximum allowed payback period for each contract term
        switch (contractTerm) {
            case 12: return 8;
            case 24: return 10;
            case 36: return 12;
            case 48: return 14;
            case 60: return 16;
            default: return 0;
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

    const selectedPlan = radioPlans.find(p => p.speed === selectedSpeed);
    
    // Calculate result based on selected plan and contract term
    const result = selectedPlan ? {
        selectedPlan,
        monthlyPrice: getMonthlyPrice(selectedPlan, contractTerm),
        installationCost: includeInstallation ? (selectedPlan.installationCost || 0) : 0,
        paybackValidation: validatePayback(
            includeInstallation ? (selectedPlan.installationCost || 0) : 0,
            getMonthlyPrice(selectedPlan, contractTerm),
            contractTerm
        )
    } : null;

    // Update project value when plan or contract term changes
    useEffect(() => {
        if (selectedPlan) {
            const monthlyPrice = getMonthlyPrice(selectedPlan, contractTerm);
            const newProjectValue = monthlyPrice * contractTerm;
            setProjectValue(Math.round(newProjectValue * 100) / 100);
        } else {
            setProjectValue(0);
        }
    }, [selectedPlan, contractTerm, selectedSpeed]);

    const { user } = useAuth();

    // States for tax editing
    const [taxRates, setTaxRates] = useState({
        banda: 2.09,
        fundraising: 0,
        rate: 24,
        pis: 1.65,
        cofins: 7.6,
        margem: 15,
        csll: 9,
        irpj: 15,
        custoDesp: 10
    });

    // Efeitos
    const fetchProposals = React.useCallback(async () => {
        if (!user || !user.role) {
            setProposals([]);
            return;
        }

        try {
            const response = await fetch('/api/proposals', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                },
            });

            if (response.ok) {
                const proposalsData = await response.json();
                // Filter for Radio Internet proposals
                const radioProposals = proposalsData.filter((p: any) => 
                    p.type === 'RADIO' || p.baseId?.startsWith('Prop_InterRadio_')
                );
                setProposals(radioProposals);
            } else {
                console.error('Erro ao buscar propostas:', response.statusText);
                setProposals([]);
            }
        } catch (error) {
            console.error("Erro ao buscar propostas: ", error);
            setProposals([]);
        }
    }, [user]);

    useEffect(() => {
        // Carregar impostos salvos
        const savedTaxes = localStorage.getItem('radioTaxRates');
        if (savedTaxes) {
            setTaxRates(JSON.parse(savedTaxes));
        }

        fetchProposals();
    }, [fetchProposals]);

    // Funções
    const formatCurrency = (value: number | undefined | null) => {
        // Handle undefined or null values
        if (value === undefined || value === null) {
            return 'R$ 0,00';
        }
        // Format the number with 2 decimal places and replace dots with commas
        return `R$ ${value.toFixed(2).replace(/\./g, '|').replace(/,/g, '.').replace(/\|/g, ',')}`;
    };
    
    const generateUniqueId = () => `PROP-${Date.now()}`;

    const parseCurrency = (value: string): number => {
        // Remove todos os caracteres que não são dígitos, vírgula ou ponto
        const cleanValue = value.replace(/[^0-9,.]/g, '');
        // Se houver vírgula, assume que é o separador decimal
        if (cleanValue.includes(',')) {
            // Remove pontos de milhar e substitui vírgula por ponto
            return parseFloat(cleanValue.replace(/\./g, '').replace(',', '.'));
        }
        // Se não houver vírgula, assume que o número já está no formato americano
        return parseFloat(cleanValue);
    };

    const handlePriceChange = (index: number, field: keyof Omit<RadioPlan, 'description' | 'baseCost' | 'speed'>, value: string) => {
        const newPlans = [...radioPlans];
        const numericValue = parseCurrency(value);
        if (!isNaN(numericValue)) {
            (newPlans[index] as any)[field] = numericValue;
            setRadioPlans(newPlans);
        }
    };

    const handleSavePrices = () => {
        localStorage.setItem('radioLinkPrices', JSON.stringify(radioPlans));
        alert('Preços da tabela Rádio salvos com sucesso!');
    };

    const handleSaveTaxes = () => {
        localStorage.setItem('radioTaxRates', JSON.stringify(taxRates));
        setIsEditingTaxes(false);
        alert('Impostos salvos com sucesso!');
    };

    const handleEditTaxes = () => {
        setIsEditingTaxes(true);
    };

    const handleCancelEditTaxes = () => {
        // Recarregar valores salvos ou valores padrão
        const savedTaxes = localStorage.getItem('radioTaxRates');
        if (savedTaxes) {
            setTaxRates(JSON.parse(savedTaxes));
        } else {
            setTaxRates({
                banda: 2.09,
                fundraising: 0,
                rate: 24,
                pis: 1.65,
                cofins: 7.6,
                margem: 15,
                csll: 9,
                irpj: 15,
                custoDesp: 10
            });
        }
        setIsEditingTaxes(false);
    };

    const handleTaxRateChange = (field: keyof typeof taxRates, value: string) => {
        const numericValue = parseFloat(value);
        if (!isNaN(numericValue)) {
            setTaxRates(prev => ({
                ...prev,
                [field]: numericValue
            }));
        }
    };

    const handleAddProduct = () => {
        if (!result || !selectedPlan) return;

        const newProduct: Product = {
            id: `radio-${Date.now()}`,
            type: 'RADIO',
            description: `Internet Rádio - ${selectedPlan.description}`,
            setup: includeInstallation ? selectedPlan.installationCost : 0,
            monthly: getMonthlyPrice(selectedPlan, contractTerm),
            details: {
                speed: selectedSpeed,
                contractTerm: contractTerm,
                selectedPlan,
                monthlyPrice: getMonthlyPrice(selectedPlan, contractTerm),
                installationCost: includeInstallation ? selectedPlan.installationCost : 0,
                paybackValidation: validatePayback(
                    includeInstallation ? selectedPlan.installationCost : 0,
                    getMonthlyPrice(selectedPlan, contractTerm),
                    contractTerm
                )
            }
        };
        setAddedProducts(prev => [...prev, newProduct]);
    };


    const handleRemoveProduct = (id: string) => {
        setAddedProducts(prev => prev.filter(p => p.id !== id));
    };

    // Calculate financial metrics
    const rawTotalSetup = addedProducts.reduce((sum: number, p: any) => sum + p.setup, 0);
    const rawTotalMonthly = addedProducts.reduce((sum: number, p: any) => sum + p.monthly, 0);

    // Apply discounts
    const salespersonDiscountFactor = 1; // Add your discount logic here
    const directorDiscountFactor = 1; // Add your discount logic here

    // Calculate final totals
    const finalTotalSetup = rawTotalSetup * salespersonDiscountFactor * directorDiscountFactor;
    const finalTotalMonthly = rawTotalMonthly * salespersonDiscountFactor * directorDiscountFactor;

    const costBreakdown = useMemo(() => {
        if (!result) return {
            cost: 0,
            revenueTaxValue: 0,
            finalPrice: 0,
            netMargin: 0,
            netProfit: 0,
            grossProfit: 0,
            profitTaxValue: 0,
            commissionValue: 0,
            referralPartnerCommission: 0,
            setupFee: 0,
            baseCost: 0,
            taxAmount: 0,
            totalCostWithTaxes: 0,
            markupAmount: 0,
            priceBeforeDiscounts: 0,
            contractDiscount: { percentage: 0, amount: 0 },
            directorDiscount: { percentage: 0, amount: 0 },
            totalCost: 0,
        };

        const C = result.selectedPlan.baseCost;
        const M = markup / 100;
        const Comm = commissionPercentage / 100;
        const T_rev = (taxRates.pis + taxRates.cofins) / 100;
        const T_profit = (taxRates.csll + taxRates.irpj) / 100;

        // Calcular preço base usando markup sobre o custo
        const markupAmount = C * M;
        const priceWithMarkup = C + markupAmount;

        const priceAfterSalespersonDiscount = priceWithMarkup * (applySalespersonDiscount ? 0.95 : 1);
        const priceAfterDirectorDiscount = priceAfterSalespersonDiscount * (1 - (appliedDirectorDiscountPercentage / 100));

        const finalPrice = priceAfterDirectorDiscount;

        const calculatedCommissionValue = finalPrice * Comm;
        const revenueTaxValue = finalPrice * T_rev;
        
        const calculatedReferralPartnerCommission = includeReferralPartner
            ? finalPrice * getPartnerIndicatorRate(finalPrice, contractTerm)
            : 0;

        const grossProfit = finalPrice - C - calculatedCommissionValue - revenueTaxValue - calculatedReferralPartnerCommission;
        const profitTaxValue = grossProfit > 0 ? grossProfit * T_profit : 0;
        const netProfit = grossProfit - profitTaxValue;
        
        const calculatedNetMargin = finalPrice > 0 ? (netProfit / finalPrice) * 100 : 0;

        return {
            cost: C,
            revenueTaxValue,
            finalPrice,
            netMargin: calculatedNetMargin,
            netProfit,
            grossProfit,
            profitTaxValue,
            commissionValue: calculatedCommissionValue,
            referralPartnerCommission: calculatedReferralPartnerCommission,
            setupFee: result.installationCost,
            baseCost: C,
            taxAmount: revenueTaxValue + profitTaxValue,
            totalCostWithTaxes: C + revenueTaxValue + profitTaxValue,
            markupAmount: markupAmount,
            priceBeforeDiscounts: priceWithMarkup,
            contractDiscount: {
                percentage: (1 - (finalPrice / priceWithMarkup)) * 100,
                amount: priceWithMarkup - finalPrice
            },
            directorDiscount: {
                percentage: appliedDirectorDiscountPercentage,
                amount: priceWithMarkup * (appliedDirectorDiscountPercentage / 100)
            },
            totalCost: C + calculatedCommissionValue,
        };
    }, [result, markup, commissionPercentage, taxRates, applySalespersonDiscount, appliedDirectorDiscountPercentage, includeReferralPartner, contractTerm]);

    // Update estimated net margin when costBreakdown changes
    useEffect(() => {
        setEstimatedNetMargin(costBreakdown.netMargin);
    }, [costBreakdown.netMargin]);

    // Debug useEffect to monitor addedProducts changes
    useEffect(() => {
        console.log('=== RADIO ADDED PRODUCTS CHANGED ===');
        console.log('Length:', addedProducts.length);
        console.log('Products:', addedProducts);
    }, [addedProducts]);

    // Calculate DRE metrics
    const dreCalculations = useMemo(() => {
        if (!costBreakdown || costBreakdown.finalPrice === 0) {
            return {
                receitaMensal: 0,
                receitaAnual: 0,
                taxaInstalacao: 0,
                custoBanda: 0,
                fundraising: 0,
                taxaMensal: 0,
                pis: 0,
                cofins: 0,
                csll: 0,
                irpj: 0,
                comissaoVendedor: 0,
                custosDespesas: 0,
                balance: 0,
                rentabilidade: 0,
                lucratividade: 0,
                paybackMeses: 0,
                receitaBruta: 0,
                receitaLiquida: 0,
                lucroOperacional: 0,
                lucroLiquido: 0,
                totalImpostos: 0,
                totalCustos: 0
            };
        }

        const receitaMensal = costBreakdown.finalPrice;
        const receitaAnual = receitaMensal * 12;
        const taxaInstalacao = costBreakdown.setupFee;
        const custoBanda = costBreakdown.baseCost;
        
        // Impostos sobre receita
        const pis = receitaMensal * (taxRates.pis / 100);
        const cofins = receitaMensal * (taxRates.cofins / 100);
        const impostoReceita = pis + cofins;
        
        // Impostos sobre lucro
        const csll = costBreakdown.grossProfit > 0 ? costBreakdown.grossProfit * (taxRates.csll / 100) : 0;
        const irpj = costBreakdown.grossProfit > 0 ? costBreakdown.grossProfit * (taxRates.irpj / 100) : 0;
        const impostoLucro = csll + irpj;
        
        const totalImpostos = impostoReceita + impostoLucro;
        const comissaoVendedor = costBreakdown.commissionValue || 0;
        const referralPartnerCommission = costBreakdown.referralPartnerCommission || 0;
        
        // Cálculos DRE
        const receitaBruta = receitaMensal;
        const receitaLiquida = receitaBruta - impostoReceita;
        const totalCustos = custoBanda + comissaoVendedor + referralPartnerCommission;
        const lucroOperacional = receitaLiquida - totalCustos;
        const lucroLiquido = lucroOperacional - impostoLucro;
        
        const rentabilidade = receitaBruta > 0 ? (lucroLiquido / receitaBruta) * 100 : 0;
        const lucratividade = rentabilidade; // Same as rentabilidade for this context
        
        const paybackMeses = taxaInstalacao > 0 && lucroLiquido > 0 ? Math.ceil(taxaInstalacao / lucroLiquido) : 0;

        return {
            receitaMensal,
            receitaAnual,
            taxaInstalacao,
            custoBanda,
            fundraising: 0,
            taxaMensal: 0,
            pis,
            cofins,
            csll,
            irpj,
            comissaoVendedor,
            custosDespesas: totalCustos,
            balance: lucroLiquido,
            rentabilidade,
            lucratividade,
            paybackMeses,
            receitaBruta,
            receitaLiquida,
            lucroOperacional,
            lucroLiquido,
            totalImpostos,
            totalCustos
        };
    }, [costBreakdown, taxRates]);

    

    const clearForm = () => {
        setClientData({ name: '', contact: '', projectName: '', email: '', phone: '' });
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
                type: 'RADIO',
                description: item.description || 'Internet Rádio',
                setup: item.setup || 0,
                monthly: item.monthly || 0,
                details: item.details || {}
            }));
        }
        
        setAddedProducts(products);
        setViewMode('proposal-summary');
    };

    const editProposal = (proposal: any) => {
        console.log('=== RADIO EDIT PROPOSAL DEBUG ===');
        console.log('Proposal:', proposal);
        console.log('Products:', proposal.products);
        
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
                type: 'RADIO',
                description: item.description || 'Internet Rádio',
                setup: item.setup || 0,
                monthly: item.monthly || 0,
                details: item.details || {}
            }));
        }
        
        console.log('RADIO Processed products:', products);
        setAddedProducts(products);
        
        // Load all calculation parameters from the first product if available
        if (products && products.length > 0) {
            const firstProduct = products[0];
            console.log('First product:', firstProduct);
            console.log('First product details:', firstProduct.details);
            
            if (firstProduct.details) {
                // Set calculator parameters based on saved product details
                if (firstProduct.details.speed) {
                    console.log('Setting speed:', firstProduct.details.speed);
                    setSelectedSpeed(firstProduct.details.speed);
                }
                if (firstProduct.details.contractTerm) setContractTerm(firstProduct.details.contractTerm);
                if (firstProduct.details.includeInstallation !== undefined) setIncludeInstallation(firstProduct.details.includeInstallation);
                if (firstProduct.details.applySalespersonDiscount !== undefined) setApplySalespersonDiscount(firstProduct.details.applySalespersonDiscount);
                if (firstProduct.details.appliedDirectorDiscountPercentage !== undefined) setAppliedDirectorDiscountPercentage(firstProduct.details.appliedDirectorDiscountPercentage);
                if (firstProduct.details.includeReferralPartner !== undefined) setIncludeReferralPartner(firstProduct.details.includeReferralPartner);
            }
        }
        
        setViewMode('calculator');
    };

    const saveProposal = async () => {
        if (addedProducts.length === 0) {
            alert('Adicione pelo menos um produto à proposta.');
            return;
        }
        if (!user) {
            alert('Você precisa estar logado para salvar uma proposta.');
            return;
        }
        
        // Validar dados obrigatórios
        if (!clientData || !clientData.name) {
            alert('Por favor, preencha os dados do cliente antes de salvar.');
            return;
        }
        
        if (!accountManagerData || !accountManagerData.name) {
            alert('Por favor, preencha os dados do gerente de contas antes de salvar.');
            return;
        }

        const totalSetup = addedProducts.reduce((sum, p) => sum + p.setup, 0);
        const totalMonthly = addedProducts.reduce((sum, p) => sum + p.monthly, 0);

        try {
            const proposalToSave = {
                title: `Proposta Internet Rádio - ${clientData.companyName || clientData.name || 'Cliente'}`,
                client: clientData.companyName || clientData.name || 'Cliente não informado',
                value: finalTotalMonthly,
                type: 'RADIO',
                status: 'Rascunho',
                createdBy: user.email || user.id,
                // Store additional data as metadata
                clientData: clientData,
                accountManager: accountManagerData,
                products: addedProducts,
                totalSetup: finalTotalSetup,
                totalMonthly: finalTotalMonthly,
                userId: user.id
            };

            const response = await fetch('/api/proposals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                },
                body: JSON.stringify(proposalToSave),
            });

            if (response.ok) {
                const savedProposal = await response.json();
                alert(`Proposta ${savedProposal.id} salva com sucesso!`);
                setCurrentProposal(savedProposal);
            } else {
                throw new Error('Erro ao salvar proposta');
            }

            fetchProposals();

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
        if (window.confirm('Tem certeza que deseja excluir esta proposta?')) {
            try {
                const response = await fetch(`/api/proposals?id=${proposalId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                    },
                });

                if (response.ok) {
                    fetchProposals();
                } else {
                    throw new Error('Erro ao excluir proposta');
                }
            } catch (error) {
                console.error('Erro ao excluir proposta:', error);
                alert('Erro ao excluir proposta');
            }
        }
    };

    const filteredProposals = proposals.filter(p =>
        p.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.baseId || p.id).toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                        <Button 
                            variant="outline" 
                            onClick={() => setViewMode('calculator')}
                            className="flex items-center mb-4"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Voltar
                        </Button>
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
                                            <TableCell>{p.baseId || p.id}</TableCell>
                                            <TableCell>{typeof p.client === 'string' ? p.client : p.client?.name || 'Cliente não informado'} (v{p.version})</TableCell>
                                            <TableCell>{p.createdAt ? (isNaN(new Date(p.createdAt).getTime()) ? 'N/A' : new Date(p.createdAt).toLocaleDateString('pt-BR')) : 'N/A'}</TableCell>
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
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            ) : viewMode === 'proposal-summary' && currentProposal ? (
                <Card className="bg-white border-gray-300 text-black print:shadow-none proposal-view">
                    <CardHeader className="print:pb-2">
                        <div className="flex justify-between items-start mb-4 print:mb-2">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Proposta Comercial</h1>
                                <p className="text-gray-600">Internet via Rádio</p>
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
                                    <p><strong>Nome:</strong> {typeof currentProposal.client === 'string' ? currentProposal.client : currentProposal.client?.name || 'N/A'}</p>
                                    <p><strong>Projeto:</strong> {typeof currentProposal.client === 'object' ? currentProposal.client?.projectName || 'N/A' : 'N/A'}</p>
                                    <p><strong>Email:</strong> {typeof currentProposal.client === 'object' ? currentProposal.client?.email || 'N/A' : 'N/A'}</p>
                                    <p><strong>Telefone:</strong> {typeof currentProposal.client === 'object' ? currentProposal.client?.phone || 'N/A' : 'N/A'}</p>
                                    <p><strong>Contato:</strong> {typeof currentProposal.client === 'object' ? currentProposal.client?.contact || 'N/A' : 'N/A'}</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Gerente de Contas</h3>
                                <div className="space-y-2 text-sm">
                                    <p><strong>Nome:</strong> {typeof currentProposal.accountManager === 'string' ? currentProposal.accountManager : currentProposal.accountManager?.name || 'N/A'}</p>
                                    <p><strong>Email:</strong> {typeof currentProposal.accountManager === 'object' ? currentProposal.accountManager?.email || 'N/A' : 'N/A'}</p>
                                    <p><strong>Telefone:</strong> {typeof currentProposal.accountManager === 'object' ? currentProposal.accountManager?.phone || 'N/A' : 'N/A'}</p>
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
                                    {(currentProposal.items || currentProposal.products) && (currentProposal.items || currentProposal.products).length > 0 ? (
                                        (currentProposal.items || currentProposal.products).map((product, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{product.description}</TableCell>
                                                <TableCell>{formatCurrency(product.setup)}</TableCell>
                                                <TableCell>{formatCurrency(product.monthly)}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center text-gray-500">
                                                Nenhum produto encontrado
                                            </TableCell>
                                        </TableRow>
                                    )}
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
                                    <p><strong>ID da Proposta:</strong> {currentProposal.baseId || currentProposal.id}</p>
                                    <p><strong>Versão:</strong> {currentProposal.version}</p>
                                    <p><strong>Período do Contrato:</strong> {currentProposal.contractPeriod ? `${currentProposal.contractPeriod} meses` : 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Payback Info se disponível */}
                        {(currentProposal.items || currentProposal.products) && (currentProposal.items || currentProposal.products).some(p => p.setup > 0) && (
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
                                <Button variant="outline" onClick={cancelAction} className="border-slate-600 text-slate-300 hover:bg-slate-700">
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
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox id="include-installation" checked={includeInstallation} onCheckedChange={(c) => setIncludeInstallation(c as boolean)} />
                                                <Label htmlFor="include-installation">Incluir taxa de instalação no cálculo</Label>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="radio-cost">Custo Rádio</Label>
                                            <div className="p-2 bg-slate-800 rounded-md">
                                                R$ {selectedPlan ? selectedPlan.radioCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'}
                                            </div>
                                            <p className="text-sm text-gray-400">Valor do equipamento de rádio</p>
                                        </div>
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
                                                    value={lastMileCost}
                                                    onChange={(e) => setLastMileCost(parseFloat(e.target.value))}
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
                                        {/* Seção de Resultado e Validação de Payback */}
                                        {result && (
                                            <div className="space-y-3 p-4 bg-slate-800 rounded-lg border border-slate-700">
                                                <h4 className="font-semibold text-white">Resultado do Cálculo</h4>
                                                <div className="space-y-2 text-sm">
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
                                        
                                        <Button onClick={handleAddProduct} disabled={!result} className="w-full bg-blue-600 hover:bg-blue-700">Adicionar Produto</Button>
                                    </CardContent>
                                </Card>

                                <Card className="bg-slate-900/80 border-slate-800 text-white">
                                    <CardHeader><CardTitle className="flex items-center"><FileText className="mr-2" />Resumo da Proposta</CardTitle></CardHeader>
                                    <CardContent>
                                        {console.log('=== RADIO RESUMO DEBUG ===', 'addedProducts.length:', addedProducts.length, 'addedProducts:', addedProducts)}
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
                                                            <span>-{formatCurrency(rawTotalSetup * 0.05)}</span>
                                                        </div>
                                                    )}
                                                    {appliedDirectorDiscountPercentage > 0 && (
                                                        <div className="flex justify-between text-orange-400">
                                                            <span>Desconto Diretor ({appliedDirectorDiscountPercentage}%):</span>
                                                            <span>-{formatCurrency(rawTotalSetup * (applySalespersonDiscount ? 0.95 : 1) * (appliedDirectorDiscountPercentage / 100))}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between"><span>Total Instalação:</span><span>{formatCurrency(finalTotalSetup)}</span></div>
                                                    {includeReferralPartner && (
                                                        <div className="flex justify-between text-yellow-400"><span>Comissão Parceiro Indicador:</span> <span>{formatCurrency(costBreakdown.referralPartnerCommission)}</span></div>
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
                    <RadioCommissionsSection />
                </TabsContent>

                <TabsContent value="dre">
                            <div className="space-y-6">
                                {/* Análise Financeira */}
                                <Card className="bg-slate-900/80 border-slate-800 text-white">
                                    <CardHeader>
                                        <CardTitle>Análise Financeira</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <div className="flex justify-between">
                                                    <span>Receita Bruta Mensal:</span>
                                                    <span className="text-green-400">{formatCurrency(dreCalculations.receitaMensal)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Receita Total do Contrato (12m):</span>
                                                    <span className="text-green-400">{formatCurrency(dreCalculations.receitaAnual)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Taxa de Setup:</span>
                                                    <span className="text-green-400">{formatCurrency(dreCalculations.taxaInstalacao)}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex justify-between">
                                                    <span>Receita Líquida Total:</span>
                                                    <span className={dreCalculations.balance >= 0 ? "text-green-400" : "text-red-400"}>
                                                        {formatCurrency(dreCalculations.balance * 12)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Receita Líquida Mensal Média:</span>
                                                    <span className={dreCalculations.balance >= 0 ? "text-green-400" : "text-red-400"}>
                                                        {formatCurrency(dreCalculations.balance)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Margem Líquida:</span>
                                                    <span className={dreCalculations.rentabilidade >= 0 ? "text-green-400" : "text-red-400"}>
                                                        {dreCalculations.rentabilidade.toFixed(2)}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Payback */}
                                        <div className="mt-6 pt-4 border-t border-slate-700">
                                            <h3 className="text-lg font-semibold mb-2">Payback</h3>
                                            <div className="text-2xl font-bold text-green-400">
                                                {dreCalculations.paybackMeses > 0 ? `${dreCalculations.paybackMeses} meses` : '0 meses'}
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
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="border-slate-700">
                                                        <TableHead className="text-white">Descrição</TableHead>
                                                        <TableHead className="text-right text-white">Valor</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    <TableRow className="border-slate-800 bg-green-900/30">
                                                        <TableCell className="text-white font-semibold">Receita Mensal</TableCell>
                                                        <TableCell className="text-right text-white">{formatCurrency(dreCalculations.receitaMensal)}</TableCell>
                                                    </TableRow>
                                                    <TableRow className="border-slate-800">
                                                        <TableCell className="text-white">Taxa Instalação</TableCell>
                                                        <TableCell className="text-right text-white">{formatCurrency(dreCalculations.taxaInstalacao)}</TableCell>
                                                    </TableRow>
                                                    <TableRow className="border-slate-800 bg-green-900/30">
                                                        <TableCell className="text-white font-semibold">Custo do Projeto</TableCell>
                                                        <TableCell className="text-right text-white">R$ 0,00</TableCell>
                                                    </TableRow>
                                                    <TableRow className="border-slate-800 bg-green-900/30">
                                                        <TableCell className="text-white font-semibold">Custo da Banda</TableCell>
                                                        <TableCell className="text-right text-white">{formatCurrency(dreCalculations.custoBanda)}</TableCell>
                                                    </TableRow>
                                                    <TableRow className="border-slate-800">
                                                        <TableCell className="text-white">Fundraising</TableCell>
                                                        <TableCell className="text-right text-white">{formatCurrency(dreCalculations.fundraising)}</TableCell>
                                                    </TableRow>
                                                    <TableRow className="border-slate-800">
                                                        <TableCell className="text-white">Taxa Mensal</TableCell>
                                                        <TableCell className="text-right text-white">{formatCurrency(dreCalculations.taxaMensal)}</TableCell>
                                                    </TableRow>
                                                    <TableRow className="border-slate-800">
                                                        <TableCell className="text-white">PIS</TableCell>
                                                        <TableCell className="text-right text-white">{formatCurrency(dreCalculations.pis)}</TableCell>
                                                    </TableRow>
                                                    <TableRow className="border-slate-800">
                                                        <TableCell className="text-white">Cofins</TableCell>
                                                        <TableCell className="text-right text-white">{formatCurrency(dreCalculations.cofins)}</TableCell>
                                                    </TableRow>
                                                    <TableRow className="border-slate-800">
                                                        <TableCell className="text-white">CSLL</TableCell>
                                                        <TableCell className="text-right text-white">{formatCurrency(dreCalculations.csll)}</TableCell>
                                                    </TableRow>
                                                    <TableRow className="border-slate-800">
                                                        <TableCell className="text-white">IRPJ</TableCell>
                                                        <TableCell className="text-right text-white">{formatCurrency(dreCalculations.irpj)}</TableCell>
                                                    </TableRow>
                                                    <TableRow className="border-slate-800">
                                                        <TableCell className="text-white">Comissão Vendedor (1,2%)</TableCell>
                                                        <TableCell className="text-right text-white">{formatCurrency(dreCalculations.comissaoVendedor)}</TableCell>
                                                    </TableRow>
                                                    <TableRow className="border-slate-800">
                                                        <TableCell className="text-white">Custo / Despesas</TableCell>
                                                        <TableCell className="text-right text-white">{formatCurrency(dreCalculations.custosDespesas)}</TableCell>
                                                    </TableRow>
                                                    <TableRow className={`border-slate-800 ${dreCalculations.balance >= 0 ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
                                                        <TableCell className="text-white font-semibold">Balance</TableCell>
                                                        <TableCell className={`text-right font-semibold ${dreCalculations.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                            {formatCurrency(dreCalculations.balance)}
                                                        </TableCell>
                                                    </TableRow>
                                                    <TableRow className="border-slate-800">
                                                        <TableCell className="text-white">Rentabilidade %</TableCell>
                                                        <TableCell className={`text-right ${dreCalculations.rentabilidade >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                            {dreCalculations.rentabilidade.toFixed(2)}%
                                                        </TableCell>
                                                    </TableRow>
                                                    <TableRow className="border-slate-800">
                                                        <TableCell className="text-white">Lucratividade</TableCell>
                                                        <TableCell className={`text-right ${dreCalculations.lucratividade >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                            {dreCalculations.lucratividade.toFixed(2)}%
                                                        </TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Impostos */}
                                <Card className="bg-slate-900/80 border-slate-800 text-white">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle>Impostos</CardTitle>
                                        {!isEditingTaxes ? (
                                            <Button variant="ghost" size="icon" onClick={handleEditTaxes} className="text-white hover:bg-gray-800">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="sm" onClick={handleSaveTaxes} className="text-green-400 hover:bg-green-900/50">
                                                    <Save className="h-4 w-4 mr-1" />
                                                    Salvar
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={handleCancelEditTaxes} className="text-red-400 hover:bg-red-900/50">
                                                    Cancelar
                                                </Button>
                                            </div>
                                        )}
                                    </CardHeader>
                                    <CardContent>
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="border-slate-700">
                                                        <TableHead className="text-white">Banda</TableHead>
                                                        <TableHead className="text-white">Fundraising</TableHead>
                                                        <TableHead className="text-white">Rate</TableHead>
                                                        <TableHead className="text-white">PIS</TableHead>
                                                        <TableHead className="text-white">Cofins</TableHead>
                                                        <TableHead className="text-white">Margem</TableHead>
                                                        <TableHead className="text-white">CSLL</TableHead>
                                                        <TableHead className="text-white">IRPJ</TableHead>
                                                        <TableHead className="text-white">Custo/Desp</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    <TableRow className="border-slate-800">
                                                        <TableCell className="text-white">
                                                            {isEditingTaxes ? (
                                                                <Input 
                                                                    type="number" 
                                                                    value={taxRates.banda.toString()} 
                                                                    onChange={(e) => handleTaxRateChange('banda', e.target.value)} 
                                                                    className="text-center bg-slate-800 border-slate-700 h-8 w-16" 
                                                                    step="0.01"
                                                                />
                                                            ) : (
                                                                `${taxRates.banda}%`
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-white">
                                                            {isEditingTaxes ? (
                                                                <Input 
                                                                    type="number" 
                                                                    value={taxRates.fundraising.toString()} 
                                                                    onChange={(e) => handleTaxRateChange('fundraising', e.target.value)} 
                                                                    className="text-center bg-slate-800 border-slate-700 h-8 w-16" 
                                                                    step="0.01"
                                                                />
                                                            ) : (
                                                                `${taxRates.fundraising}%`
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-white">
                                                            {isEditingTaxes ? (
                                                                <Input 
                                                                    type="number" 
                                                                    value={taxRates.rate.toString()} 
                                                                    onChange={(e) => handleTaxRateChange('rate', e.target.value)} 
                                                                    className="text-center bg-slate-800 border-slate-700 h-8 w-16" 
                                                                    step="1"
                                                                />
                                                            ) : (
                                                                taxRates.rate.toString()
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-white">
                                                            {isEditingTaxes ? (
                                                                <Input 
                                                                    type="number" 
                                                                    value={taxRates.pis.toString()} 
                                                                    onChange={(e) => handleTaxRateChange('pis', e.target.value)} 
                                                                    className="text-center bg-slate-800 border-slate-700 h-8 w-16" 
                                                                    step="0.01"
                                                                />
                                                            ) : (
                                                                `${taxRates.pis}%`
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-white">
                                                            {isEditingTaxes ? (
                                                                <Input 
                                                                    type="number" 
                                                                    value={taxRates.cofins.toString()} 
                                                                    onChange={(e) => handleTaxRateChange('cofins', e.target.value)} 
                                                                    className="text-center bg-slate-800 border-slate-700 h-8 w-16" 
                                                                    step="0.01"
                                                                />
                                                            ) : (
                                                                `${taxRates.cofins}%`
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-white">
                                                            {isEditingTaxes ? (
                                                                <Input 
                                                                    type="number" 
                                                                    value={taxRates.margem.toString()} 
                                                                    onChange={(e) => handleTaxRateChange('margem', e.target.value)} 
                                                                    className="text-center bg-slate-800 border-slate-700 h-8 w-16" 
                                                                    step="0.01"
                                                                />
                                                            ) : (
                                                                `${taxRates.margem}%`
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-white">
                                                            {isEditingTaxes ? (
                                                                <Input 
                                                                    type="number" 
                                                                    value={taxRates.csll.toString()} 
                                                                    onChange={(e) => handleTaxRateChange('csll', e.target.value)} 
                                                                    className="text-center bg-slate-800 border-slate-700 h-8 w-16" 
                                                                    step="0.01"
                                                                />
                                                            ) : (
                                                                `${taxRates.csll}%`
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-white">
                                                            {isEditingTaxes ? (
                                                                <Input 
                                                                    type="number" 
                                                                    value={taxRates.irpj.toString()} 
                                                                    onChange={(e) => handleTaxRateChange('irpj', e.target.value)} 
                                                                    className="text-center bg-slate-800 border-slate-700 h-8 w-16" 
                                                                    step="0.01"
                                                                />
                                                            ) : (
                                                                `${taxRates.irpj}%`
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-white">
                                                            {isEditingTaxes ? (
                                                                <Input 
                                                                    type="number" 
                                                                    value={taxRates.custoDesp.toString()} 
                                                                    onChange={(e) => handleTaxRateChange('custoDesp', e.target.value)} 
                                                                    className="text-center bg-slate-800 border-slate-700 h-8 w-16" 
                                                                    step="0.01"
                                                                />
                                                            ) : (
                                                                `${taxRates.custoDesp}%`
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
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
                                                            value={selectedPlan ? (selectedPlan.installationCost || 0) : 0}
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
                                                            value={selectedPlan ? (selectedPlan.radioCost || 0) : 0}
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
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                            {/* Receita */}
                                            <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 p-4 rounded-lg border border-blue-500/30">
                                                <h4 className="text-blue-300 text-sm font-medium mb-2">RECEITA</h4>
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

                                            {/* Custos */}
                                            <div className="bg-gradient-to-br from-red-900/50 to-red-800/30 p-4 rounded-lg border border-red-500/30">
                                                <h4 className="text-red-300 text-sm font-medium mb-2">CUSTOS</h4>
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

                                            {/* Lucro */}
                                            <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 p-4 rounded-lg border border-green-500/30">
                                                <h4 className="text-green-300 text-sm font-medium mb-2">LUCRO</h4>
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

                                            {/* Indicadores */}
                                            <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 p-4 rounded-lg border border-purple-500/30">
                                                <h4 className="text-purple-300 text-sm font-medium mb-2">INDICADORES</h4>
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
                                                            {dreCalculations.paybackMeses > 0 ? `${dreCalculations.paybackMeses}m` : 'N/A'}
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
                                        <div className="mt-6 p-4 bg-gradient-to-r from-slate-800/50 to-slate-700/30 rounded-lg border border-slate-600/50">
                                            <h4 className="text-white font-semibold mb-3 flex items-center">
                                                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                                Resumo Executivo
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                <div className="text-center">
                                                    <div className="text-gray-400">Receita Total (12m)</div>
                                                    <div className="text-xl font-bold text-blue-400">
                                                        {formatCurrency((dreCalculations.receitaBruta * 12) + dreCalculations.taxaInstalacao)}
                                                    </div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-gray-400">Lucro Total (12m)</div>
                                                    <div className={`text-xl font-bold ${dreCalculations.lucroLiquido >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                        {formatCurrency(dreCalculations.lucroLiquido * 12)}
                                                    </div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-gray-400">Margem Líquida</div>
                                                    <div className={`text-xl font-bold ${dreCalculations.rentabilidade >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                        {dreCalculations.rentabilidade.toFixed(1)}%
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
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
                                                    <TableHead className="text-right text-white">48 meses</TableHead>
                                                    <TableHead className="text-right text-white">60 meses</TableHead>
                                                    <TableHead className="text-right text-white">Custo de Instalação</TableHead>
                                                    <TableHead className="text-right text-white">Custo Rádio</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {radioPlans.map((plan, index) => (
                                                    <TableRow key={plan.speed} className="border-slate-800">
                                                        <TableCell>{plan.description}</TableCell>
                                                        <TableCell className="text-right">
                                                            <Input type="text" value={(plan.price12 || 0).toFixed(2)} onChange={(e) => handlePriceChange(index, 'price12', e.target.value)} className="text-right bg-slate-800 border-slate-700 h-8" />
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Input type="text" value={(plan.price24 || 0).toFixed(2)} onChange={(e) => handlePriceChange(index, 'price24', e.target.value)} className="text-right bg-slate-800 border-slate-700 h-8" />
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Input type="text" value={(plan.price36 || 0).toFixed(2)} onChange={(e) => handlePriceChange(index, 'price36', e.target.value)} className="text-right bg-slate-800 border-slate-700 h-8" />
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Input type="text" value={(plan.price48 || 0).toFixed(2)} onChange={(e) => handlePriceChange(index, 'price48', e.target.value)} className="text-right bg-slate-800 border-slate-700 h-8" />
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Input type="text" value={(plan.price60 || 0).toFixed(2)} onChange={(e) => handlePriceChange(index, 'price60', e.target.value)} className="text-right bg-slate-800 border-slate-700 h-8" />
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Input type="text" value={(plan.installationCost || 0).toFixed(2)} onChange={(e) => handlePriceChange(index, 'installationCost', e.target.value)} className="text-right bg-slate-800 border-slate-700 h-8" />
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Input type="text" value={(plan.radioCost || 0).toFixed(2)} onChange={(e) => handlePriceChange(index, 'radioCost', e.target.value)} className="text-right bg-slate-800 border-slate-700 h-8" />
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

                                    {/* Seção Informações de Contrato */}
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

                    </Tabs>
                </>
            )}
        </div>
    );
};

export default RadioInternetCalculator;