"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FiberCommissionsSection from './FiberCommissionsSection';
import { Separator } from '@/components/ui/separator';
import { ClientManagerForm, ClientData, AccountManagerData } from './ClientManagerForm';
import { ClientManagerInfo } from './ClientManagerInfo';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/use-auth';
import { 
    Wifi, 
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
export interface Product {
    id: string;
    type: 'FIBRA';
    description: string;
    setup: number;
    monthly: number;
    details: {
        speed?: number;
        contractTerm?: number;
        includeInstallation?: boolean;
        planDescription?: string;
        fiberCost?: number;
        applySalespersonDiscount?: boolean;
        appliedDirectorDiscountPercentage?: number;
        includeReferralPartner?: boolean;
        [key: string]: any;
    };
}

interface FibraPlan {
    speed: number;
    price12: number;
    price24: number;
    price36: number;
    price48: number;
    price60: number;
    installationCost: number;
    description: string;
    baseCost: number;
    fiberCost: number;
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
    updatedAt?: string;
    updatedBy?: string;
    title?: string;
    status?: string;
    distributorId?: string;
    date?: string;
    expiryDate?: string;
    value: number;
    type: string;
}

// Helper function to get monthly price based on contract term
const getMonthlyPrice = (plan: FibraPlan, term: number): number => {
    switch (term) {
        case 12: return plan.price12;
        case 24: return plan.price24;
        case 36: return plan.price36;
        case 48: return plan.price48;
        case 60: return plan.price60;
        default: return 0;
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

// Tabela de Comissão do Parceiro Indicador (Valores - Receita Mensal)
// Usa ate24% até 24 meses e mais24% acima de 24 meses
const PARTNER_INDICATOR_RANGES = [
    { min: 0,      max: 500,    ate24: 1.5,  mais24: 2.5 },
    { min: 500.01, max: 1000,   ate24: 2.5,  mais24: 4.0 },
    { min: 1000.01,max: 1500,   ate24: 4.01, mais24: 5.5 },
    { min: 1500.01,max: 3000,   ate24: 5.51, mais24: 7.0 },
    { min: 3000.01,max: 5000,   ate24: 7.01, mais24: 8.5 },
    { min: 5000.01,max: 6500,   ate24: 8.51, mais24: 10.0 },
    { min: 6500.01,max: 9000,   ate24: 10.01,mais24: 11.5 },
    { min: 9000.01,max: Infinity,ate24: 11.51,mais24: 13.0 },
];

const getPartnerIndicatorRate = (monthlyRevenue: number, contractMonths: number): number => {
    const range = PARTNER_INDICATOR_RANGES.find(r => monthlyRevenue >= r.min && monthlyRevenue <= r.max);
    if (!range) return 0;
    const pct = contractMonths <= 24 ? range.ate24 : range.mais24;
    return (pct || 0) / 100;
};

// Function to handle tax rate changes
const handleTaxRateChange = (taxType: string, value: string) => {
    // Remove non-numeric characters and convert to number
    const numericValue = parseFloat(value.replace(/[^0-9,.]+/g, "").replace(",", ".")) || 0;
    return numericValue;
};

interface InternetFibraCalculatorProps {
    onBackToDashboard?: () => void;
}

const InternetFibraCalculator: React.FC<InternetFibraCalculatorProps> = ({ onBackToDashboard }) => {
    // Estados principais
    const [viewMode, setViewMode] = useState<'search' | 'client-form' | 'calculator' | 'proposal-summary'>('search');
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [currentProposal, setCurrentProposal] = useState<Proposal | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    
    // Estados do cliente
    const [clientData, setClientData] = useState<ClientData>({ name: '', contact: '', projectName: '', email: '', phone: '' });
    const [accountManagerData, setAccountManagerData] = useState<AccountManagerData>({ name: '', email: '', phone: '' });
    
    // Estados do produto
    const [addedProducts, setAddedProducts] = useState<Product[]>([]);
    const [fibraPlans, setFibraPlans] = useState<FibraPlan[]>([]);
    
    // Estados da calculadora
    const [selectedSpeed, setSelectedSpeed] = useState<number>(0);
    const [contractTerm, setContractTerm] = useState<number>(12);
    const [includeInstallation, setIncludeInstallation] = useState<boolean>(true);
    const [isExistingClient, setIsExistingClient] = useState(false);
    const [previousMonthlyFee, setPreviousMonthlyFee] = useState(0);
    const [createLastMile, setCreateLastMile] = useState(false);
    const [lastMileCost, setLastMileCost] = useState(0);
    const [projectValue, setProjectValue] = useState<number>(0);
    const [directorDiscountPercentage, setDirectorDiscountPercentage] = useState<number>(0);
    const [appliedDirectorDiscountPercentage, setAppliedDirectorDiscountPercentage] = useState<number>(0);
    const [applySalespersonDiscount, setApplySalespersonDiscount] = useState<boolean>(false);
    const [includeReferralPartner, setIncludeReferralPartner] = useState<boolean>(false);
    
    // Estados para DRE e tributação
    const [isEditingTaxes, setIsEditingTaxes] = useState<boolean>(false);
    const [commissionPercentage, setCommissionPercentage] = useState<number>(0);
    const [taxRates, setTaxRates] = useState({
        pis: 1.65,
        cofins: 7.6,
        csll: 9,
        irpj: 15,
        cssl: 9,
        inss: 11,
        iss: 5,
        pisCofins: 9.25,
        csllIrpj: 34,
        totalTaxes: 48.25,
        banda: 2.09,
        fundraising: 0,
        rate: 24,
        margem: 0,
        custoDesp: 10
    });

    // Estados para regime tributário
    const [selectedTaxRegime, setSelectedTaxRegime] = useState<string>('lucro_real');
    const [taxRegimeValues, setTaxRegimeValues] = useState({
        pisCofins: '9.25',
        iss: '5.00',
        csllIr: '34'
    });
    
    // Estados para mark-up e comissões
    const [markup, setMarkup] = useState<number>(100);
    const [markupType, setMarkupType] = useState<'cost' | 'price'>('cost');
    
    // Estados para custos adicionais
    const [setupFee, setSetupFee] = useState<number>(500);
    const [managementAndSupportCost, setManagementAndSupportCost] = useState<number>(0);
    
    // Estados para descontos
    const [contractDiscounts, setContractDiscounts] = useState<{ [key: number]: number }>({
        12: 0,
        24: 5,
        36: 10,
        48: 15,
        60: 20,
    });

    // Hooks
    const { user } = useAuth();


    // Cálculos com useMemo
    const revenueTaxes = useMemo(() => {
        const pisCofinsParsed = parseFloat(taxRegimeValues.pisCofins.replace(',', '.')) || 0;
        const issParsed = parseFloat(taxRegimeValues.iss.replace(',', '.')) || 0;
        return pisCofinsParsed + issParsed;
    }, [taxRegimeValues.pisCofins, taxRegimeValues.iss]);

    const profitTaxes = useMemo(() => {
        return parseFloat(taxRegimeValues.csllIr.replace(',', '.')) || 0;
    }, [taxRegimeValues.csllIr]);

    // Partner indicator ranges handled by getPartnerIndicatorRate

    // Calculate the selected fiber plan based on the chosen speed
    const result = useMemo(() => {
        if (!selectedSpeed) return null;
        const plan = fibraPlans.find(p => p.speed === selectedSpeed);
        if (!plan) return null;
        const monthlyPrice = getMonthlyPrice(plan, contractTerm);
        return {
            ...plan,
            monthlyPrice,
            installationCost: plan.installationCost,
            baseCost: plan.baseCost,
            fiberCost: plan.fiberCost,
            paybackValidation: validatePayback(
                includeInstallation ? plan.installationCost : 0,
                monthlyPrice,
                contractTerm
            )
        };
    }, [selectedSpeed, fibraPlans, contractTerm]);

    // Cálculo detalhado de custos e margens (DRE)
    const {
        finalPrice: vmFinalPrice,
        markupValue,
        commissionValue,
        estimatedNetMargin,
        costBreakdown
    } = useMemo(() => {
        // Custo base do produto de fibra (equivalente ao calculateVMCost)
        const C = result ? result.baseCost : 0; // Usar o baseCost do plano de fibra
        const M = markup / 100;
        const Comm = commissionPercentage / 100;
        const T_rev = revenueTaxes / 100;
        const T_profit = profitTaxes / 100;

        // Calcular preço base usando markup sobre o custo
        const markupAmount = C * M;
        const priceWithMarkup = C + markupAmount;

        // Aplicar descontos do vendedor e diretor ao preço com markup
        const priceAfterSalespersonDiscount = priceWithMarkup * (applySalespersonDiscount ? 0.95 : 1);
        const priceAfterDirectorDiscount = priceAfterSalespersonDiscount * (1 - (appliedDirectorDiscountPercentage / 100));

        // O preço final é o preço com markup após todos os descontos
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
        const calculatedMarkupValue = markupAmount;

        return {
            finalPrice: Math.max(0, finalPrice) || 0,
            markupValue: Math.max(0, calculatedMarkupValue) || 0,
            commissionValue: Math.max(0, calculatedCommissionValue) || 0,
            estimatedNetMargin: calculatedNetMargin || 0,
            costBreakdown: {
                baseCost: C,
                taxAmount: revenueTaxValue + profitTaxValue,
                totalCostWithTaxes: C + revenueTaxValue + profitTaxValue,
                markupAmount: calculatedMarkupValue,
                priceBeforeDiscounts: priceWithMarkup, // Preço com markup antes dos descontos
                contractDiscount: { // Adaptar para o desconto de vendedor/diretor
                    percentage: (1 - (finalPrice / priceWithMarkup)) * 100,
                    amount: priceWithMarkup - finalPrice
                },
                directorDiscount: {
                    percentage: appliedDirectorDiscountPercentage,
                    amount: priceWithMarkup * (appliedDirectorDiscountPercentage / 100)
                },
                finalPrice,
                totalCost: C + calculatedCommissionValue,
                grossProfit,
                netMargin: calculatedNetMargin,
                referralPartnerCommission: calculatedReferralPartnerCommission,
                netProfit,
                revenueTaxValue,
                profitTaxValue,
                commissionValue: calculatedCommissionValue,
                cost: C,
                setupFee: result ? result.installationCost : 0, // Usar o custo de instalação do plano de fibra
                priceWithMarkup: priceWithMarkup
            }
        };
    }, [
        result, revenueTaxes, profitTaxes, markup, commissionPercentage,
        applySalespersonDiscount, appliedDirectorDiscountPercentage, includeReferralPartner
    ]);

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
                // Filter for Fibra Internet proposals
                const fibraProposals = proposalsData.filter((p: any) => 
                    p.type === 'FIBER' || p.baseId?.startsWith('Prop_InterFibra_')
                );
                setProposals(fibraProposals);
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
        const initialFibraPlans: FibraPlan[] = [
            { speed: 25, price12: 720.00, price24: 527.00, price36: 474.00, price48: 450.30, price60: 426.60, installationCost: 998.00, description: "25 Mbps", baseCost: 1580.00, fiberCost: 3580.00 },
            { speed: 30, price12: 740.08, price24: 579.00, price36: 527.00, price48: 500.65, price60: 474.30, installationCost: 998.00, description: "30 Mbps", baseCost: 1580.00, fiberCost: 3580.00 },
            { speed: 40, price12: 915.01, price24: 632.00, price36: 579.00, price48: 550.05, price60: 521.10, installationCost: 998.00, description: "40 Mbps", baseCost: 1580.00, fiberCost: 3580.00 },
            { speed: 50, price12: 1103.39, price24: 685.00, price36: 632.00, price48: 600.40, price60: 568.80, installationCost: 998.00, description: "50 Mbps", baseCost: 1580.00, fiberCost: 3580.00 },
            { speed: 60, price12: 1547.44, price24: 790.00, price36: 737.00, price48: 700.15, price60: 663.30, installationCost: 998.00, description: "60 Mbps", baseCost: 1580.00, fiberCost: 3580.00 },
            { speed: 80, price12: 1825.98, price24: 1000.00, price36: 948.00, price48: 900.60, price60: 853.20, installationCost: 998.00, description: "80 Mbps", baseCost: 5700.00, fiberCost: 3580.00 },
            { speed: 100, price12: 2017.05, price24: 1578.00, price36: 1316.00, price48: 1250.20, price60: 1184.40, installationCost: 1996.00, description: "100 Mbps", baseCost: 5700.00, fiberCost: 6700.00 },
            { speed: 150, price12: 2543.18, price24: 1789.00, price36: 1527.00, price48: 1450.65, price60: 1374.30, installationCost: 1996.00, description: "150 Mbps", baseCost: 5700.00, fiberCost: 6700.00 },
            { speed: 200, price12: 3215.98, price24: 2053.00, price36: 1737.00, price48: 1650.15, price60: 1563.30, installationCost: 1996.00, description: "200 Mbps", baseCost: 5700.00, fiberCost: 6700.00 },
            { speed: 300, price12: 7522.00, price24: 4316.00, price36: 4000.00, price48: 3800.00, price60: 3600.00, installationCost: 2500.00, description: "300 Mbps", baseCost: 23300.00, fiberCost: 23200.00 },
            { speed: 400, price12: 9469.00, price24: 5211.00, price36: 4736.00, price48: 4499.20, price60: 4262.40, installationCost: 2500.00, description: "400 Mbps", baseCost: 23300.00, fiberCost: 25360.00 },
            { speed: 500, price12: 11174.00, price24: 5789.00, price36: 5253.00, price48: 4990.35, price60: 4727.70, installationCost: 2500.00, description: "500 Mbps", baseCost: 23300.00, fiberCost: 25360.00 },
            { speed: 600, price12: 12500.00, price24: 6315.00, price36: 5790.00, price48: 5500.50, price60: 5211.00, installationCost: 2500.00, description: "600 Mbps", baseCost: 23300.00, fiberCost: 25360.00 },
            { speed: 700, price12: 13800.00, price24: 6900.00, price36: 6300.00, price48: 5985.00, price60: 5670.00, installationCost: 2500.00, description: "700 Mbps", baseCost: 23300.00, fiberCost: 25360.00 },
            { speed: 800, price12: 15000.00, price24: 7500.00, price36: 6800.00, price48: 6460.00, price60: 6120.00, installationCost: 2500.00, description: "800 Mbps", baseCost: 23300.00, fiberCost: 25360.00 },
            { speed: 900, price12: 16200.00, price24: 8100.00, price36: 7300.00, price48: 6935.00, price60: 6570.00, installationCost: 2500.00, description: "900 Mbps", baseCost: 23300.00, fiberCost: 25360.00 },
            { speed: 1000, price12: 17500.00, price24: 8750.00, price36: 7900.00, price48: 7505.00, price60: 7110.00, installationCost: 2500.00, description: "1000 Mbps (1 Gbps)", baseCost: 23300.00, fiberCost: 25360.00 }
        ];
        const savedPlans = localStorage.getItem('fibraLinkPrices');
        if (savedPlans) {
            setFibraPlans(JSON.parse(savedPlans));
        } else {
            setFibraPlans(initialFibraPlans);
        }

        fetchProposals();
    }, [fetchProposals]);

    // Debug useEffect to monitor addedProducts changes
    useEffect(() => {
        console.log('=== ADDED PRODUCTS CHANGED ===');
        console.log('Length:', addedProducts.length);
        console.log('Products:', addedProducts);
    }, [addedProducts]);

    // Funções
    const formatCurrency = (value: number | undefined | null) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value || 0);
    };

    const generateUniqueId = () => {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    };

    const handlePriceChange = (index: number, field: keyof Omit<FibraPlan, 'description' | 'baseCost' | 'speed'>, value: string) => {
        const newPlans = [...fibraPlans];
        const numericValue = parseFloat(value.replace(/[^0-9,.]+/g, "").replace(",", "."));
        if (!isNaN(numericValue)) {
            (newPlans[index] as any)[field] = numericValue;
            setFibraPlans(newPlans);
        }
    };

    // Calculate price breakdown
    const priceBreakdown = useMemo(() => {
        if (!result) {
            return {
                finalPrice: 0,
                markupValue: 0,
                commissionValue: 0,
                estimatedNetMargin: 0,
                costBreakdown: {
                    baseCost: 0,
                    commission: 0,
                    revenueTax: 0,
                    profitTax: 0,
                    referralPartnerCommission: 0,
                    netProfit: 0,
                    fiberCost: 0
                }
            };
        }

        // Calculate final price after all discounts
        const finalPrice = result.monthlyPrice;
        const priceAfterDirectorDiscount = finalPrice * (1 - (appliedDirectorDiscountPercentage / 100));
        
        // Calculate commission and tax values
        const commissionRate = commissionPercentage / 100;
        const revenueTaxRate = revenueTaxes / 100;
        
        const calculatedCommissionValue = priceAfterDirectorDiscount * commissionRate;
        const revenueTaxValue = priceAfterDirectorDiscount * revenueTaxRate;
        
        // Calculate gross profit
        const grossProfit = priceAfterDirectorDiscount - result.baseCost - calculatedCommissionValue - revenueTaxValue;
        
        // Calculate net profit after profit taxes
        const profitTaxRate = profitTaxes / 100;
        const profitTaxValue = grossProfit * profitTaxRate;
        const netProfit = grossProfit - profitTaxValue;
        
        // Calculate net margin
        const netMargin = (netProfit / priceAfterDirectorDiscount) * 100;
        
        // Calculate referral partner commission if applicable
        const calculatedReferralPartnerCommission = includeReferralPartner
            ? priceAfterDirectorDiscount * getPartnerIndicatorRate(priceAfterDirectorDiscount, contractTerm)
            : 0;
        
        // Calculate final net profit after referral partner commission
        const finalNetProfit = netProfit - calculatedReferralPartnerCommission;
        
        return {
            finalPrice: priceAfterDirectorDiscount,
            markupValue: 0, // Not used in this calculation
            commissionValue: calculatedCommissionValue,
            estimatedNetMargin: netMargin,
            costBreakdown: {
                baseCost: result.baseCost,
                commission: calculatedCommissionValue,
                revenueTax: revenueTaxValue,
                profitTax: profitTaxValue,
                referralPartnerCommission: calculatedReferralPartnerCommission,
                netProfit: finalNetProfit,
                fiberCost: result.fiberCost || 0
            }
        };
    }, [result, commissionPercentage, revenueTaxes, profitTaxes, appliedDirectorDiscountPercentage, includeReferralPartner]);

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

    const handleSavePrices = () => {
        // Use the already calculated price breakdown
        const {
            finalPrice,
            commissionValue,
            estimatedNetMargin,
            costBreakdown
        } = priceBreakdown;

        // Save the prices to local storage
        localStorage.setItem('fibraLinkPrices', JSON.stringify(fibraPlans));
        
        // Show success message or update UI as needed
        alert('Preços salvos com sucesso!');
    };

    const handleAddProduct = () => {
        if (!result) return;
        
        const newProduct: Product = {
            id: `prod-${Date.now()}`,
            type: 'FIBRA',
            description: `Fibra ${result.speed} Mbps`,
            setup: includeInstallation ? result.installationCost : 0,
            monthly: getMonthlyPrice(result, contractTerm),
            details: {
                speed: result.speed,
                contractTerm,
                includeInstallation,
                planDescription: result.description,
                fiberCost: result.fiberCost,
                applySalespersonDiscount,
                appliedDirectorDiscountPercentage,
                includeReferralPartner
            }
        };
        
        setAddedProducts(prev => [...prev, newProduct]);
    };

    const handleRemoveProduct = (id: string) => {
        setAddedProducts((prev: Product[]) => prev.filter(p => p.id !== id));
    };

    const rawTotalSetup = addedProducts.reduce((sum: number, p: Product) => sum + p.setup, 0);
    const rawTotalMonthly = addedProducts.reduce((sum: number, p: Product) => sum + p.monthly, 0);

    // Apply salesperson discount (5% fixed)
    const salespersonDiscountFactor = applySalespersonDiscount ? 0.95 : 1;

    // Apply director discount (customizable)
    const directorDiscountFactor = 1 - (appliedDirectorDiscountPercentage / 100);

    const referralPartnerCommissionValue = (() => {
        if (!includeReferralPartner) return 0;
        const monthlyRevenue = rawTotalMonthly * salespersonDiscountFactor * directorDiscountFactor;
        const rate = getPartnerIndicatorRate(monthlyRevenue, contractTerm);
        return monthlyRevenue * rate;
    })();

    const finalTotalSetup = rawTotalSetup * salespersonDiscountFactor * directorDiscountFactor;
    const finalTotalMonthly = (rawTotalMonthly * salespersonDiscountFactor * directorDiscountFactor) - referralPartnerCommissionValue;

    const saveProposal = async () => {
        if (!user) {
            alert('Erro: Usuário não autenticado');
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
        
        if (addedProducts.length === 0) {
            alert('Por favor, adicione pelo menos um produto antes de salvar.');
            return;
        }

        try {
            const totalMonthly = addedProducts.reduce((sum, p) => sum + p.monthly, 0);
            const totalSetup = addedProducts.reduce((sum, p) => sum + p.setup, 0);

            // Se tiver uma proposta atual, atualiza. Caso contrário, cria uma nova
            if (currentProposal?.id) {
                const proposalToUpdate = {
                    id: currentProposal.id,
                    title: `Proposta Internet Fibra - ${clientData.companyName || clientData.name || 'Cliente'}`,
                    client: clientData.companyName || clientData.name || 'Cliente não informado',
                    value: totalMonthly,
                    type: 'FIBER',
                    status: currentProposal.status || 'Rascunho',
                    updatedBy: user.email || user.uid,
                    updatedAt: new Date().toISOString(),
                    // Manter dados originais importantes
                    createdBy: currentProposal.createdBy,
                    createdAt: currentProposal.createdAt,
                    baseId: currentProposal.baseId,
                    version: (currentProposal.version || 0) + 1,
                    // Atualizar dados editáveis
                    clientData: clientData,
                    accountManager: accountManagerData,
                    products: addedProducts,
                    totalSetup: totalSetup,
                    totalMonthly: totalMonthly,
                    userId: user.uid
                };

                const response = await fetch(`/api/proposals?id=${currentProposal.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`,
                    },
                    body: JSON.stringify(proposalToUpdate),
                });

                if (response.ok) {
                    const updatedProposal = await response.json();
                    alert(`Proposta ${updatedProposal.id} atualizada com sucesso!`);
                    setCurrentProposal(updatedProposal);
                } else {
                    throw new Error('Erro ao atualizar proposta');
                }
            } else {
                const proposalToSave = {
                    title: `Proposta Internet Fibra - ${clientData.companyName || clientData.name || 'Cliente'}`,
                    client: clientData.companyName || clientData.name || 'Cliente não informado',
                    value: totalMonthly,
                    type: 'FIBER',
                    status: 'Rascunho',
                    createdBy: user.email || user.uid,
                    createdAt: new Date().toISOString(),
                    version: 1,
                    // Store additional data as metadata
                    clientData: clientData,
                    accountManager: accountManagerData,
                    products: addedProducts,
                    totalSetup: totalSetup,
                    totalMonthly: totalMonthly,
                    userId: user.uid
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
            }

            fetchProposals();
            clearForm();
            setViewMode('search');
        } catch (error) {
            console.error('Erro ao salvar proposta:', error);
            alert('Erro ao salvar proposta. Por favor, tente novamente.');
        }
    };

    

    const clearForm = () => {
        setClientData({ name: '', contact: '', projectName: '', email: '', phone: '' });
        setAccountManagerData({ name: '', email: '', phone: '' });
        setAddedProducts([]);
        setSelectedSpeed(0);
        setContractTerm(12);
        setIncludeInstallation(true);
        setProjectValue(0);
        setDirectorDiscountPercentage(0);
        setAppliedDirectorDiscountPercentage(0);
        setApplySalespersonDiscount(false);
        setCurrentProposal(null);
        
    };

    const createNewProposal = () => {
        setViewMode('client-form');
        clearForm();
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
                type: 'FIBER',
                description: item.description || 'Internet Fibra',
                setup: item.setup || 0,
                monthly: item.monthly || 0,
                details: item.details || {}
            }));
        }
        
        setAddedProducts(products);
        setViewMode('proposal-summary');
    };

    const editProposal = (proposal: Proposal) => {
        console.log('=== EDIT PROPOSAL DEBUG ===');
        console.log('Proposal:', proposal);
        console.log('Proposal keys:', Object.keys(proposal));
        console.log('Products:', proposal.products);
        console.log('Items:', proposal.items);
        console.log('Full proposal JSON:', JSON.stringify(proposal, null, 2));
        
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
                type: 'FIBER',
                description: item.description || 'Internet Fibra',
                setup: item.setup || 0,
                monthly: item.monthly || 0,
                details: item.details || {}
            }));
        }
        
        console.log('Processed products:', products);
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

    const cancelAction = () => {
        setViewMode('search');
        clearForm();
    };

    const handleDeleteProposal = async (id: string) => {
        if (!user) {
            alert('Erro: Usuário não autenticado');
            return;
        }
        
        if (window.confirm('Tem certeza que deseja excluir esta proposta? Esta ação não pode ser desfeita.')) {
            try {
                const response = await fetch(`/api/proposals?id=${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                    },
                });

                if (response.ok) {
                    fetchProposals();
                    if (currentProposal?.id === id) {
                        setCurrentProposal(null);
                    }
                } else {
                    throw new Error('Erro ao excluir proposta');
                }
            } catch (error) {
                console.error('Erro ao excluir proposta:', error);
                alert('Erro ao excluir proposta. Por favor, tente novamente.');
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
                title="Nova Proposta - Internet via Fibra"
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
                            onClick={onBackToDashboard || (() => setViewMode('calculator'))}
                            className="flex items-center mb-4"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Voltar
                        </Button>
                        <CardTitle>Buscar Propostas - Internet via Fibra</CardTitle>
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
                                            <TableCell>{new Date(p.createdAt).toLocaleDateString('pt-BR')}</TableCell>
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
                                <p className="text-gray-600">Internet via Fibra Óptica</p>
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
                                    {(currentProposal.items || currentProposal.products || []).map((product, index) => (
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
                                    <p><strong>Data da Proposta:</strong> {new Date(currentProposal.createdAt).toLocaleDateString('pt-BR')}</p>
                                    <p><strong>ID da Proposta:</strong> {currentProposal.baseId || currentProposal.id}</p>
                                    <p><strong>Versão:</strong> {currentProposal.version}</p>
                                    <p><strong>Período do Contrato:</strong> {currentProposal.contractPeriod ? `${currentProposal.contractPeriod} meses` : 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Payback Info se disponível */}
                        {(currentProposal.items || currentProposal.products || []).some(p => p.setup > 0) && (
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
                                <p className="text-slate-400 mt-2">Configure e calcule os custos para links de fibra</p>
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
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione uma velocidade..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {fibraPlans.filter(p => getMonthlyPrice(p, contractTerm) > 0).map(plan => (
                                                            <SelectItem key={plan.speed} value={plan.speed.toString()}>
                                                                {plan.description}
                                                            </SelectItem>
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
                                            <Label htmlFor="fiber-cost">Custo Fibra</Label>
                                            <Input type="text" id="fiber-cost" value={result?.fiberCost ? formatCurrency(result.fiberCost) : "R$ 0,00"} readOnly className="bg-slate-800" />
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
                                        
                                        <Button onClick={handleAddProduct} disabled={!result} className="w-full bg-blue-600 hover:bg-blue-700">Adicionar Produto</Button>
                                    </CardContent>
                                </Card>

                                <Card className="bg-slate-900/80 border-slate-800 text-white">
                                    <CardHeader><CardTitle className="flex items-center"><FileText className="mr-2" />Resumo da Proposta</CardTitle></CardHeader>
                                    <CardContent>
                                        {console.log('=== RESUMO DEBUG ===', 'addedProducts.length:', addedProducts.length, 'addedProducts:', addedProducts)}
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
                                                <Separator className="my-4 bg-slate-700" />
                                                
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
                                                
                                                <Separator className="my-4 bg-slate-700" />
                                                <div className="space-y-2">
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
                                                    <div className="flex justify-between">
                                                        <span>Total de Instalação:</span>
                                                        <span className="font-medium">{formatCurrency(addedProducts.reduce((sum, p) => sum + p.setup, 0) * (applySalespersonDiscount ? 0.95 : 1) * (1 - appliedDirectorDiscountPercentage / 100))}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Total Mensal:</span>
                                                        <span className="font-medium">{formatCurrency(addedProducts.reduce((sum, p) => sum + p.monthly, 0) * (applySalespersonDiscount ? 0.95 : 1) * (1 - appliedDirectorDiscountPercentage / 100))}</span>
                                                    </div>
                                                    {includeReferralPartner && (
                                                        <div className="flex justify-between text-yellow-400"><span>Comissão Parceiro Indicador:</span> <span>{formatCurrency(referralPartnerCommissionValue)}</span></div>
                                                    )}
                                                    <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t border-slate-700">
                                                        <span>Total Anual:</span>
                                                        <span>{formatCurrency(addedProducts.reduce((sum, p) => sum + p.monthly * 12, 0))}</span>
                                                    </div>
                                                    
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
                                                <div className="flex justify-end space-x-2 mt-4">
                                                    <Button variant="outline" onClick={clearForm} className="border-slate-600 text-slate-300 hover:bg-slate-700">
                                                        Limpar Tudo
                                                    </Button>
                                                    <Button onClick={saveProposal} className="bg-green-600 hover:bg-green-700">
                                                        <Save className="h-4 w-4 mr-2" />
                                                        {currentProposal ? 'Atualizar Proposta' : 'Salvar Proposta'}
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
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
                                                <div className="flex justify-between">
                                                    <span>Custo Fibra:</span>
                                                    <span className="text-red-400">{result?.fiberCost ? formatCurrency(result.fiberCost) : "R$ 0,00"}</span>
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
                                                    onChange={(e) => {
                                                        setTaxRates(prev => ({ ...prev, pis: parseFloat(e.target.value) || 0 }));
                                                    }}
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
                                                    onChange={(e) => {
                                                        setTaxRates(prev => ({ ...prev, cofins: parseFloat(e.target.value) || 0 }));
                                                    }}
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
                                                    onChange={(e) => {
                                                        setTaxRates(prev => ({ ...prev, csll: parseFloat(e.target.value) || 0 }));
                                                    }}
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
                                                    onChange={(e) => {
                                                        setTaxRates(prev => ({ ...prev, irpj: parseFloat(e.target.value) || 0 }));
                                                    }}
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
                                                    onChange={(e) => {
                                                        setTaxRates(prev => ({ ...prev, banda: parseFloat(e.target.value) || 0 }));
                                                    }}
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
                                                    onChange={(e) => {
                                                        setTaxRates(prev => ({ ...prev, fundraising: parseFloat(e.target.value) || 0 }));
                                                    }}
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
                                                    onChange={(e) => {
                                                        setTaxRates(prev => ({ ...prev, rate: parseFloat(e.target.value) || 0 }));
                                                    }}
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
                                                    onChange={(e) => {
                                                        setTaxRates(prev => ({ ...prev, margem: parseFloat(e.target.value) || 0 }));
                                                    }}
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
                                                    onChange={(e) => {
                                                        setTaxRates(prev => ({ ...prev, custoDesp: parseFloat(e.target.value) || 0 }));
                                                    }}
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
                                            <h4 className="text-cyan-400 mb-2">Custo de Instalação</h4>
                                            <div>
                                                <Label>Custo Único</Label>
                                                <Input 
                                                    type="number"
                                                    value={result ? (result.installationCost || 0) : 0} 
                                                    readOnly
                                                    className="bg-slate-800 border-slate-700 cursor-not-allowed" 
                                                    step="0.01"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-cyan-400 mb-2">Custo MAN</h4>
                                            <div>
                                                <Label>Custo Único</Label>
                                                <Input 
                                                    type="number"
                                                    value={result ? (result.fiberCost || 0) : 0} 
                                                    readOnly
                                                    className="bg-slate-800 border-slate-700 cursor-not-allowed" 
                                                    step="0.01"
                                                />
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
                        </TabsContent>
                        {user?.role === 'admin' && (
                            <TabsContent value="prices">
                                <Card className="bg-slate-900/80 border-slate-800 text-white mt-4">
                                    <CardHeader>
                                        <CardTitle className="text-white">Tabela de Preços - Internet Fibra</CardTitle>
                                        <CardDescription>Atualize os preços conforme necessário</CardDescription>
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
                                                        <TableHead className="text-right text-white">Custo Fibra</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {fibraPlans.map((plan, index) => (
                                                        <TableRow key={plan.speed} className="border-slate-800">
                                                            <TableCell className="font-medium">{plan.description}</TableCell>
                                                            <TableCell>
                                                                <Input
                                                                    type="text"
                                                                    value={(plan.price12 || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                    onChange={(e) => handlePriceChange(index, 'price12', e.target.value)}
                                                                    className="text-right bg-slate-800 border-slate-700"
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Input
                                                                    type="text"
                                                                    value={(plan.price24 || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                    onChange={(e) => handlePriceChange(index, 'price24', e.target.value)}
                                                                    className="text-right bg-slate-800 border-slate-700"
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Input
                                                                    type="text"
                                                                    value={(plan.price36 || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                    onChange={(e) => handlePriceChange(index, 'price36', e.target.value)}
                                                                    className="text-right bg-slate-800 border-slate-700"
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Input
                                                                    type="text"
                                                                    value={(plan.price48 || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                    onChange={(e) => handlePriceChange(index, 'price48', e.target.value)}
                                                                    className="text-right bg-slate-800 border-slate-700"
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Input
                                                                    type="text"
                                                                    value={(plan.price60 || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                    onChange={(e) => handlePriceChange(index, 'price60', e.target.value)}
                                                                    className="text-right bg-slate-800 border-slate-700"
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Input
                                                                    type="text"
                                                                    value={(plan.installationCost || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                    onChange={(e) => handlePriceChange(index, 'installationCost', e.target.value)}
                                                                    className="text-right bg-slate-800 border-slate-700"
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Input
                                                                    type="text"
                                                                    value={(plan.fiberCost || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                    onChange={(e) => handlePriceChange(index, 'fiberCost', e.target.value)}
                                                                    className="text-right bg-slate-800 border-slate-700"
                                                                />
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                        <div className="flex justify-end mt-4">
                                            <Button onClick={handleSavePrices} className="bg-blue-600 hover:bg-blue-700">
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
                        <TabsContent value="commissions-table">
                            <FiberCommissionsSection />
                        </TabsContent>
                    </Tabs>
                </>
            )}
        </div>
    );
};

export default InternetFibraCalculator;