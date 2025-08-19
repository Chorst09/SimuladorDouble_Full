// src/app/page.tsx
'use client';

import { useEffect, useMemo, useState, lazy, Suspense } from 'react';
import { useAuth } from "@/hooks/use-auth";
import { useAdmin } from "@/hooks/use-admin";
import { useRouter } from 'next/navigation';
import {
    Loader2, LogOut, User, Briefcase, BarChart, Calculator,
    Server, Phone, Wifi, Radio, CheckSquare, BarChart3, ClipboardList,
    ChevronDown, Moon, Sun, Users, Shield, MapPin
} from 'lucide-react';

// Importe seus componentes de UI
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

// Lazy load dos componentes pesados
const DashboardView = lazy(() => import('@/components/dashboard/DashboardView'));
const PABXSIPCalculator = lazy(() => import('@/components/calculators/PABXSIPCalculator'));
const MaquinasVirtuaisCalculator = lazy(() => import('@/components/calculators/MaquinasVirtuaisCalculator'));
const FiberLinkCalculator = lazy(() => import('@/components/calculators/FiberLinkCalculator'));
const RadioInternetCalculator = lazy(() => import('@/components/calculators/RadioInternetCalculator'));
const UserManagement = lazy(() => import('@/components/admin/UserManagement'));
const AdminSetup = lazy(() => import('@/components/admin/AdminSetup'));

// Importe dados e tipos se ainda usados aqui
import type { NavItem } from '@/lib/types';

// Importe o hook useTheme
import { useTheme } from 'next-themes';


export default function App() {
    const { user, loading, logout } = useAuth();
    const { hasAnyAdmin, loading: adminLoading } = useAdmin();
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    const [activeTab, setActiveTab] = useState('dashboard');

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        console.log('Auth state:', { loading, user: user ? { email: user.email, role: user.role } : null });
        console.log('Admin check:', { adminLoading, hasAnyAdmin });
        console.log('Is admin?', user?.role === 'admin');
        if (!loading && !user) {
            console.log('Redirecting to login...');
            router.push('/login');
        }
    }, [user, loading, router, adminLoading, hasAnyAdmin]);


    // Definir itens de navegação
    const navItems: NavItem[] = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: <BarChart className="h-4 w-4" />
        },
        {
            id: 'pricing',
            label: 'Precificação',
            icon: <Calculator className="h-4 w-4" />,
            subItems: [
                { id: 'calculator-pabx-sip', label: 'PABX/SIP', icon: <Phone className="h-4 w-4" /> },
                { id: 'calculator-maquinas-virtuais', label: 'Máquinas Virtuais', icon: <Server className="h-4 w-4" /> },
                { id: 'calculator-fiber-link', label: 'Fiber Link', icon: <Wifi className="h-4 w-4" /> },
                { id: 'calculator-radio-internet', label: 'Rádio Internet', icon: <Radio className="h-4 w-4" /> }
            ]
        },
        {
            id: 'tools',
            label: 'Ferramentas',
            icon: <CheckSquare className="h-4 w-4" />,
            subItems: [
                { id: 'site-survey', label: 'Site Survey', icon: <MapPin className="h-4 w-4" /> },
                { id: 'it-assessment', label: 'Assessment de TI', icon: <BarChart3 className="h-4 w-4" /> },
                { id: 'poc', label: 'Provas de Conceito (POC)', icon: <ClipboardList className="h-4 w-4" /> }
            ]
        },
        // Adicionar gerenciamento de usuários apenas para administradores
        ...(user?.role === 'admin' ? [{
            id: 'admin',
            label: 'Administração',
            icon: <Shield className="h-4 w-4" />,
            subItems: [
                { id: 'user-management', label: 'Gerenciar Usuários', icon: <Users className="h-4 w-4" /> }
            ]
        }] : [])
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


    // Função para Renderizar o Conteúdo da View Ativa com Suspense
    const renderContent = () => {
        const LoadingSpinner = () => (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );

        switch (activeTab) {
            case 'dashboard': 
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <DashboardView />
                    </Suspense>
                );
            case 'calculator-pabx-sip': 
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <PABXSIPCalculator />
                    </Suspense>
                );
            case 'calculator-maquinas-virtuais': 
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <MaquinasVirtuaisCalculator />
                    </Suspense>
                );
            case 'calculator-fiber-link': 
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <FiberLinkCalculator />
                    </Suspense>
                );
            case 'calculator-radio-internet': 
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <RadioInternetCalculator />
                    </Suspense>
                );
            case 'user-management':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <UserManagement />
                    </Suspense>
                );
            case 'site-survey':
                return <iframe src="/site-survey" className="w-full h-screen border-0" title="Site Survey" />;
            case 'it-assessment': 
                return <iframe src="/it-assessment.html" className="w-full h-screen border-0" title="Assessment de TI" />;
            case 'poc': 
                return <iframe src="/poc-management.html" className="w-full h-screen border-0" title="Provas de Conceito POC" />;
            default: 
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <DashboardView />
                    </Suspense>
                );
        }
    };


    // Show loading while checking auth and admin status
    if (loading || adminLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-background">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <p className="ml-4">Carregando...</p>
            </div>
        );
    }

    // Show admin setup if no admin exists in the system
    if (!hasAnyAdmin) {
        return (
            <div className="min-h-screen bg-background">
                <Suspense fallback={
                    <div className="flex justify-center items-center min-h-screen">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                }>
                    <AdminSetup />
                </Suspense>
            </div>
        );
    }

    if (!user) {
        return null; // useEffect will redirect to login
    }

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

                        {user && (
                            <Button onClick={logout} variant="destructive" className="w-full">
                                <LogOut className="mr-2 h-4 w-4" />
                                Sair
                            </Button>
                        )}
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
                        {user && (
                            <div className="flex items-center space-x-4">
                                <div className="text-right">
                                    <p className="text-sm font-medium text-foreground">{user.email}</p>
                                    <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                                </div>
                                <User className="h-8 w-8 text-primary" />
                            </div>
                        )}
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
