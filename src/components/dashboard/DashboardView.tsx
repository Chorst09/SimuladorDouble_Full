"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { Proposal, Partner } from '@/lib/types';
import ProposalsView from '@/components/proposals/ProposalsView';
import StatCard from './StatCard';
import { Phone, Server, Wifi, Radio, Calculator, ChevronRight } from 'lucide-react';

interface CalculatorCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  calculatorId: string;
  color: string;
  onNavigate: (calculatorId: string) => void;
}

const CalculatorCard = ({ title, description, icon, calculatorId, color, onNavigate }: CalculatorCardProps) => (
  <div 
    className={`bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 ${color} h-full cursor-pointer`}
    onClick={() => onNavigate(calculatorId)}
  >
    <div className="flex items-center mb-4">
      <div className="p-2 rounded-full bg-opacity-20 bg-current mr-3">
        {icon}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{description}</p>
    <div className="flex items-center text-sm font-medium text-blue-600 dark:text-blue-400">
      Acessar calculadora <ChevronRight className="ml-1 h-4 w-4" />
    </div>
  </div>
);

interface DashboardViewProps {
  onNavigateToCalculator?: (calculatorId: string) => void;
}

const DashboardView = ({ onNavigateToCalculator }: DashboardViewProps) => {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Contar propostas por tipo
  const countProposalsByType = useMemo(() => {
    const counts = {
      pabx: 0,
      maquinasVirtuais: 0,
      radio: 0,
      fibra: 0,
      doubleFibra: 0,
      man: 0
    };
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    proposals.forEach(proposal => {
      const proposalDate = new Date(proposal.date);
      if (proposalDate.getMonth() === currentMonth && proposalDate.getFullYear() === currentYear) {
        if (proposal.baseId?.startsWith('Prop_PabxSip_')) {
          counts.pabx++;
        } else if (proposal.baseId?.startsWith('Prop_MV_')) {
          counts.maquinasVirtuais++;
        } else if (proposal.baseId?.startsWith('Prop_Radio_')) {
          counts.radio++;
        } else if (proposal.baseId?.startsWith('Prop_Fibra_')) {
          counts.fibra++;
        } else if (proposal.baseId?.startsWith('Prop_Double_')) {
          counts.doubleFibra++;
        } else if (proposal.baseId?.startsWith('Prop_InterMan_')) {
          counts.man++;
        }
      }
    });
    
    return counts;
  }, [proposals]);

  useEffect(() => {
    const fetchProposals = async () => {
      if (!user) return;

      try {
        let proposalsQuery;
        const proposalsCollection = collection(db, 'proposals');

        if (user.role === 'admin' || user.role === 'diretor') {
          // Admin ou Diretor: Busca todas as propostas
          proposalsQuery = query(proposalsCollection);
        } else {
          // Usuário: Busca apenas as propostas criadas por ele
          proposalsQuery = query(proposalsCollection, where('createdBy', '==', user.uid));
        }

        const proposalsSnapshot = await getDocs(proposalsQuery);
        const proposalsList = proposalsSnapshot.docs.map(doc => {
          const data = doc.data();
          let title = "Proposta";
          if (data.baseId) {
            if (data.baseId.startsWith("Prop_MV_")) title = `Proposta Máquinas Virtuais - ${data.baseId.split("_")[2]}`;
            else if (data.baseId.startsWith("Prop_PabxSip_")) title = `Proposta PABX/SIP - ${data.baseId.split("_")[1]}`;
            else if (data.baseId.startsWith("Prop_InterMan_")) title = `Proposta Internet MAN - ${data.baseId.split("_")[1]}`;
          }

          const createdAtDate = data.createdAt && data.createdAt.toDate ? data.createdAt.toDate() : new Date();
          const expiryDate = new Date(createdAtDate);
          expiryDate.setDate(createdAtDate.getDate() + 30); // Default 30 days validity

          return {
            id: doc.id,
            baseId: data.baseId || '',
            version: data.version || 1,
            title: title,
            client: data.client?.name || 'N/A',
            value: data.totalMonthly || 0,
            status: data.status || 'Rascunho',
            createdBy: data.userId || 'N/A',
            accountManager: data.accountManager?.name || 'N/A',
            createdAt: data.createdAt,
            distributorId: data.distributorId || 'N/A',
            date: createdAtDate.toISOString(),
            expiryDate: expiryDate.toISOString(),
          } as Proposal;
        });
        setProposals(proposalsList);
      } catch (error) {
        console.error("Error fetching proposals:", error);
      }
    };

    const fetchPartners = async () => {
      try {
        if (db) {
          const partnersCollection = collection(db, 'partners');
          const partnersSnapshot = await getDocs(partnersCollection);
          const partnersList = partnersSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: Number(doc.id) || 0,
              name: data.name || 'Sem nome',
              type: 'Cliente', // Default type as per Partner interface
              contact: data.contact || '',
              phone: data.phone || '',
              status: data.status === 'Ativo' ? 'Ativo' : 'Inativo',
              site: data.site || '',
              products: data.products || '',
              sitePartner: data.sitePartner || '',
              siteRO: data.siteRO || '',
              templateRO: data.templateRO || '',
              procedimentoRO: data.procedimentoRO || '',
              login: data.login || '',
              password: data.password || '',
              mainContact: data.mainContact || ''
            } as Partner;
          });
          setPartners(partnersList);
        }
      } catch (error) {
        console.error("Error fetching partners:", error);
      }
    };

    if (user) {
      fetchProposals();
      fetchPartners();
    }
    setLoading(false);
  }, [user]);

  const handleSave = (proposal: Proposal) => {
    // Lógica para salvar (criar ou atualizar) uma proposta
    console.log('Saving proposal:', proposal);
  };

  const handleDelete = (id: string) => {
    // Lógica para deletar uma proposta
    console.log('Deleting proposal with id:', id);
  };

  const handleBackToTop = () => {
    // Scroll to the calculadoras section smoothly
    const calculadorasSection = document.querySelector('[data-section="calculadoras"]');
    if (calculadorasSection) {
      calculadorasSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // Fallback to scroll to page top if section not found
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-8">
      <div data-section="calculadoras">
        <h2 className="text-2xl font-bold mb-4">Calculadoras</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <CalculatorCard
            title="PABX/SIP"
            description="Calcule orçamentos para soluções de telefonia IP"
            icon={<Phone className="w-5 h-5 text-blue-500" />}
            calculatorId="calculator-pabx-sip"
            color="border-l-blue-500"
            onNavigate={onNavigateToCalculator || (() => {})}
          />
          <CalculatorCard
            title="Máquinas Virtuais"
            description="Calcule recursos e custos de máquinas virtuais"
            icon={<Server className="w-5 h-5 text-purple-500" />}
            calculatorId="calculator-maquinas-virtuais"
            color="border-l-purple-500"
            onNavigate={onNavigateToCalculator || (() => {})}
          />
          <CalculatorCard
            title="Internet Rádio"
            description="Simule valores para links de internet via rádio"
            icon={<Radio className="w-5 h-5 text-orange-500" />}
            calculatorId="calculator-radio-internet"
            color="border-l-orange-500"
            onNavigate={onNavigateToCalculator || (() => {})}
          />
          <CalculatorCard
            title="Internet Fibra"
            description="Calcule valores para planos de internet fibra"
            icon={<Wifi className="w-5 h-5 text-green-500" />}
            calculatorId="calculator-internet-fibra"
            color="border-l-green-500"
            onNavigate={onNavigateToCalculator || (() => {})}
          />
          <CalculatorCard
            title="Double-Fibra/Radio"
            description="Simule valores para links redundantes"
            icon={<Radio className="w-5 h-5 text-red-500" />}
            calculatorId="calculator-double-fibra-radio"
            color="border-l-red-500"
            onNavigate={onNavigateToCalculator || (() => {})}
          />
          <CalculatorCard
            title="Internet MAN"
            description="Calcule valores para redes metropolitanas"
            icon={<Wifi className="w-5 h-5 text-cyan-500" />}
            calculatorId="calculator-internet-man"
            color="border-l-cyan-500"
            onNavigate={onNavigateToCalculator || (() => {})}
          />
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-4">Visão Geral</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatCard 
            icon={<Phone className="w-6 h-6 text-blue-500" />} 
            title="Propostas PABX/SIP" 
            value={countProposalsByType.pabx.toString()} 
            subtext="Este mês" 
          />
          <StatCard 
            icon={<Server className="w-6 h-6 text-purple-500" />} 
            title="Propostas Máquinas Virtuais" 
            value={countProposalsByType.maquinasVirtuais.toString()} 
            subtext="Este mês" 
          />
          <StatCard 
            icon={<Radio className="w-6 h-6 text-orange-500" />} 
            title="Propostas Link Rádio" 
            value={countProposalsByType.radio.toString()} 
            subtext="Este mês" 
          />
          <StatCard 
            icon={<Wifi className="w-6 h-6 text-green-500" />} 
            title="Propostas Internet Fibra" 
            value={countProposalsByType.fibra.toString()} 
            subtext="Este mês" 
          />
          <StatCard 
            icon={<Radio className="w-6 h-6 text-red-500" />} 
            title="Propostas Double-Fibra/Radio" 
            value={countProposalsByType.doubleFibra.toString()} 
            subtext="Este mês" 
          />
          <StatCard 
            icon={<Wifi className="w-6 h-6 text-cyan-500" />} 
            title="Propostas Internet MAN" 
            value={countProposalsByType.man.toString()} 
            subtext="Este mês" 
          />
        </div>
      </div>
      
      <ProposalsView 
        proposals={proposals} 
        partners={partners}
        onSave={handleSave}
        onDelete={handleDelete}
        onBackToTop={handleBackToTop}
      />
    </div>
  );
};

export default DashboardView;