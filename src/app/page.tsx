// src/app/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react'; // Mantenha todos os hooks necessários
// Importação de useAuth removida
// import { useAuth } from "@/hooks/use-auth";
import { useRouter } from 'next/navigation';
import {
    Loader2, LogOut, User, Briefcase, BarChart, Search,
    Users, DollarSign, Archive, Calculator, PlusCircle,
    Trash2, Edit, Building, ShoppingCart, ExternalLink, FileDown, Paperclip,
    X, Server, Headset, Printer, ChevronDown, Tag, Info, Settings, FileText,
    BarChart2, TrendingUp, Percent, ShoppingBag, Repeat, Wrench, Zap,
    CheckCircle, Award, Gavel, Moon, Sun, Brain, Phone, Wifi, Radio, CheckSquare, BarChart3, ClipboardList // Ícones para o botão de tema
} from 'lucide-react'; // Importe todos os ícones usados diretamente aqui

// Importe seus componentes de UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

// Importe seus componentes de View
import DashboardView from '@/components/dashboard/DashboardView';
// Removed imports for PartnerView, QuotesView, ProposalsView, RoManagementView, TrainingManagementView
import CalculatorFrame from '@/components/calculators/CalculatorFrame';
// Removed imports for BidsAnalysis, BidsDocumentationView, RFPView, PriceRecordView, EditalAnalysisView
import VMProposals from '@/components/proposals/VMProposals';
import PABXSIPCalculator from '@/components/calculators/PABXSIPCalculator';
import MaquinasVirtuaisCalculator from '@/components/calculators/MaquinasVirtuaisCalculator';
import FiberLinkCalculator from '@/components/calculators/FiberLinkCalculator';
import RadioInternetCalculator from '@/components/calculators/RadioInternetCalculator';

// Importe dados e tipos se ainda usados aqui
import type { Partner, RO, Training, NavItem, NavSubItem } from '@/lib/types';
import { initialTrainings } from '@/lib/data';

// Importe o hook useTheme
import { useTheme } from 'next-themes'; // <--- ADICIONADO ESTE IMPORT


export default function App() { // Ou Home
    // Chamada e uso de useAuth removidos
    // const { user, loading, logout } = useAuth();
    const router = useRouter();
    // Use useTheme() para gerenciar o tema (chamado incondicionalmente)
    const { theme, setTheme } = useTheme(); // <-- useTheme chamado incondicionalmente
    const [mounted, setMounted] = useState(false); // Estado para verificar se montou no cliente

    const [activeTab, setActiveTab] = useState('dashboard'); // Estado da aba ativa
    // Você pode remover ou adaptar estes estados se os componentes de view gerenciarem seus próprios dados carregados do Firestore
    const [trainings, setTrainings] = useState<Training[]>(initialTrainings);

    // Estado para controlar se as seções colapsáveis estão abertas (adapte)
    const [openSections, setOpenSections] = useState({
        pricing: true,
        bids: true,
    });


    // Efeito para verificar montagem no cliente (útil para coisas como useTheme)
    useEffect(() => {
        setMounted(true);
    }, []);


    // Efeito para redirecionamento removido
    // useEffect(() => { ... }, [user, loading, router]);


    // Definição dos Itens de Navegação (adapte do seu código original)
    const navItems: NavItem[] = [
        { id: 'dashboard', label: 'Dashboard', icon: <BarChart size={20} /> },
        {
            id: 'pricing',
            label: 'Precificação',
            icon: <Calculator size={20} />,
            subItems: [
                { id: 'calculator-pabx-sip', label: 'PABX/SIP', icon: <Phone size={16} /> },
                { id: 'calculator-maquinas-virtuais', label: 'Máquinas Virtuais', icon: <Server size={16} /> },
                { id: 'calculator-fiber-link', label: 'Link via Fibra', icon: <Wifi size={16} /> },
                { id: 'calculator-radio-internet', label: 'Internet via Rádio', icon: <Radio size={16} /> },
            ]
        },
        { id: 'it-assessment', label: 'Assessment de TI', icon: <CheckSquare size={20} /> },
        { id: 'poc', label: 'Provas de Conceito POC', icon: <BarChart3 size={20} /> },
        { 
          id: 'site-survey', 
          label: 'Site Survey', 
          icon: <ClipboardList size={20} />,
          href: '/site-survey'
        },
    ];

    // Lógica para encontrar o item de navegação atual (adapte)
    const currentNavItem = useMemo(() => {
        for (const item of navItems) {
            if (item.id === activeTab) return { ...item, parentLabel: null };
            if (item.href) continue; // Skip items with href as they are handled by Next.js router
            if (item.subItems) {
                const subItem = item.subItems.find(sub => sub.id === activeTab);
                if (subItem) return { ...subItem, parentLabel: item.label };
            }
        }
        return { ...navItems[0], parentLabel: null };
    }, [activeTab]);


    // Função para Renderizar o Conteúdo da View Ativa (adapte do seu código original)
    const renderContent = () => {
        // NOTA: Os componentes de view (DashboardView, PartnerView, etc.) agora devem gerenciar seus próprios dados.
        // Remova a dependência de useAuth() dentro deles, se houver.

        switch (activeTab) {
            case 'dashboard': return <DashboardView />;
            // Removed distributors, suppliers, ro-management, training-management, quotes, and proposals cases
            // Removed calculator-ti-vls case (Venda/Locação/Serviços) as requested
            case 'calculator-pabx-sip': return <PABXSIPCalculator />;
            case 'calculator-maquinas-virtuais': return <MaquinasVirtuaisCalculator />;
            case 'calculator-fiber-link': return <FiberLinkCalculator />;
            case 'calculator-radio-internet': return <RadioInternetCalculator />;

            // Removed bids-analyzer, bids-analysis, bids-docs, rfp, price-records cases
            case 'it-assessment': return <iframe src="/it-assessment.html" className="w-full h-screen border-0" title="Assessment de TI" />;
            case 'poc': return <iframe src="/poc-management.html" className="w-full h-screen border-0" title="Provas de Conceito POC" />;
            default: return <DashboardView />;
        }
    };


    // **Renderização da UI completa da página principal (sem verificações de autenticação)**
    return (
        <div className="min-h-screen font-body bg-background text-foreground transition-colors duration-500">
            <div className="flex">

                {/* Sidebar - Adaptada para usar navItems e activeTab/setActiveTab */}
                <aside className="w-64 bg-card shadow-xl flex-col h-screen sticky top-0 hidden md:flex">
                    {/* Cabeçalho da Sidebar */}
                    <div className="flex items-center justify-center h-20 border-b border-border">
                        <Briefcase className="w-8 h-8 text-primary" />
                        <span className="ml-3 text-xl font-bold text-foreground">Simuladores Double TI</span>
                    </div>
                    {/* Navegação da Sidebar */}
                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {navItems.map(item => {
                            // Handle items with href (external links)
                            if (item.href) {
                                return (
                                    <a 
                                        key={item.id}
                                        href={item.href}
                                        className="flex items-center px-4 py-3 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground"
                                    >
                                        {item.icon}
                                        <span className="ml-4">{item.label}</span>
                                    </a>
                                );
                            }
                            
                            // Handle items with sub-items
                            if (item.subItems) {
                                return (
                                    <Collapsible
                                        key={item.id}
                                        defaultOpen={item.subItems.some(sub => sub.id === activeTab)}
                                    >
                                        <CollapsibleTrigger className={`w-full inline-flex items-center justify-between gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 ${
                                            item.subItems.some(sub => sub.id === activeTab) 
                                                ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80' 
                                                : 'hover:bg-accent hover:text-accent-foreground'
                                        }`}>
                                            <div className="flex items-center gap-3">
                                                {item.icon}
                                                <span>{item.label}</span>
                                            </div>
                                            <ChevronDown className="h-4 w-4 transition-transform [&[data-state=open]]:rotate-180" />
                                        </CollapsibleTrigger>
                                        <CollapsibleContent className="pl-6 mt-1 space-y-1">
                                            {item.subItems.map((subItem) => (
                                                <Button
                                                    key={subItem.id}
                                                    variant={subItem.id === activeTab ? 'secondary' : 'ghost'}
                                                    className="w-full justify-start gap-3"
                                                    onClick={() => setActiveTab(subItem.id)}
                                                >
                                                    {subItem.icon}
                                                    {subItem.label}
                                                </Button>
                                            ))}
                                        </CollapsibleContent>
                                    </Collapsible>
                                );
                            }
                            
                            // Handle regular items without sub-items
                            return (
                                <Button
                                    key={item.id}
                                    variant={item.id === activeTab ? 'secondary' : 'ghost'}
                                    className="w-full justify-start gap-3"
                                    onClick={() => setActiveTab(item.id)}
                                >
                                    {item.icon}
                                    {item.label}
                                </Button>
                            );
                        })}
                    </nav>
                    {/* Bottom of Sidebar (Theme Toggle, Logout removed) */}
                    <div className="p-4 border-t border-border flex flex-col gap-2">
                        {/* Botão de Tema - Usa mounted para renderizar o conteúdo condicionalmente */}
                        <Button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} variant="outline" className="w-full">
                            {mounted ? (
                                <>
                                    {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                                    {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
                                </>
                            ) : (
                                <>
                                    <Sun className="mr-2 h-4 w-4" />
                                    Mudar Tema
                                </>
                            )}
                        </Button>

                        {/* Botão de Logout removido */}
                        {/* <Button onClick={logout} variant="destructive" className="w-full"> ... </Button> */}
                    </div>
                </aside>


                {/* Conteúdo Principal da Página (Main) */}
                <main className="flex-1 p-6 sm:p-10 max-h-screen overflow-y-auto">
                    {/* Header da Main (Busca, Info do Usuário removido) */}
                    <header className="flex justify-between items-center mb-8">
                        {/* Título da Página Atual - Usa a lógica currentNavItem ou activeTab */}
                        <div>
                            <h1 className="text-3xl font-bold text-foreground capitalize">{currentNavItem.parentLabel || currentNavItem.label}</h1>
                            {currentNavItem.parentLabel && <p className="text-sm text-muted-foreground">{currentNavItem.label}</p>}
                        </div>
                        {/* Info do Usuário Logado removido ou adaptado */}
                        {/* <div className="flex items-center space-x-4"> ... </div> */}
                    </header>

                    {/* Área de Conteúdo Principal - Renderiza a view ativa */}
                    <div className="h-[calc(100%-100px)]">
                        {renderContent()} {/* Chama a função para renderizar a view ativa */}
                    </div>

                </main>
            </div>
        </div>
    );
}
