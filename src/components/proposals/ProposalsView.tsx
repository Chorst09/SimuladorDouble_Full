"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, PlusCircle, FileDown, User, Calendar, DollarSign, FileText, Briefcase, Calculator, ArrowLeft } from 'lucide-react';
import type { Proposal, Partner } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import ProposalForm from './ProposalForm';
import CommercialProposalView from '../commercial-proposal/CommercialProposalView';
import { useAuth } from '@/hooks/use-auth';

interface ProposalsViewProps {
  proposals: Proposal[];
  partners: Partner[];
  onSave: (proposal: Proposal) => void;
  onDelete: (id: string) => void;
  onBackToTop?: () => void;
}

const ProposalsView: React.FC<ProposalsViewProps> = ({ proposals, partners, onSave, onDelete, onBackToTop }) => {
  const router = useRouter();
  const { user } = useAuth(); // Get the user object
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showProposalTypeDialog, setShowProposalTypeDialog] = useState(false);
  const [showCommercialProposal, setShowCommercialProposal] = useState(false);

  const filteredProposals = proposals.filter(proposal => {
    if (!proposal) return false; // Defensively handle null/undefined proposals in the array
    const term = searchTerm.toLowerCase();

    const titleMatch = typeof proposal.title === 'string' && proposal.title.toLowerCase().includes(term);
    const clientMatch = typeof proposal.client === 'string' && proposal.client.toLowerCase().includes(term);
    const accountManagerMatch = typeof proposal.accountManager === 'string' && proposal.accountManager.toLowerCase().includes(term);

    const isMatch = titleMatch || clientMatch || accountManagerMatch;
    return isMatch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Rascunho': return 'bg-gray-100 text-gray-800';
      case 'Enviada': return 'bg-blue-100 text-blue-800';
      case 'Em Análise': return 'bg-yellow-100 text-yellow-800';
      case 'Aprovada': return 'bg-green-100 text-green-800';
      case 'Rejeitada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleEdit = (proposal: Proposal) => {
    setEditingProposal(proposal);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    router.push('/calculators/maquinas-virtuais');
  };

  const handleProposalTypeSelect = (type: 'commercial' | 'technical') => {
    setShowProposalTypeDialog(false);
    if (type === 'commercial') {
      setShowCommercialProposal(true);
    } else {
      setEditingProposal(null);
      setIsFormOpen(true);
    }
  };

  const handleSave = (proposal: Proposal) => {
    onSave(proposal);
    setIsFormOpen(false);
    setEditingProposal(null);
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingProposal(null);
  };

  const handleCommercialProposalClose = () => {
    setShowCommercialProposal(false);
  };

  const getDistributorName = (distributorId: number | string) => {
    const distributor = partners.find(p => p.id.toString() === distributorId.toString());
    return distributor?.name || 'N/A';
  };

  const handleNavigateToCalculator = (proposal: Proposal) => {
    const baseId = proposal.baseId || '';
    let tab = 'dashboard';
    
    if (baseId.startsWith('Prop_PABX_')) tab = 'calculator-pabx-sip';
    else if (baseId.startsWith('Prop_MV_')) tab = 'calculator-maquinas-virtuais';
    else if (baseId.startsWith('Prop_IR_')) tab = 'calculator-radio-internet';
    else if (baseId.startsWith('Prop_IF_')) tab = 'calculator-internet-fibra';
    else if (baseId.startsWith('Prop_DFR_')) tab = 'calculator-double-fibra-radio';
    else if (baseId.startsWith('Prop_IM_')) tab = 'calculator-internet-man';
    
    // Use router.push to navigate to the correct tab
    router.push(`/?tab=${tab}`, { scroll: false });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          {onBackToTop && (
            <Button 
              variant="outline" 
              onClick={onBackToTop}
              className="flex items-center shrink-0"
              aria-label="Voltar para as calculadoras"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Voltar</span>
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Propostas</h1>
            <p className="text-muted-foreground">
              Gerencie suas propostas comerciais
            </p>
          </div>
        </div>
        <Button onClick={handleCreate} className="shrink-0">
          <PlusCircle className="h-4 w-4 mr-2" />
          Nova Proposta
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Propostas</CardTitle>
            <FileDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{proposals.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(proposals.reduce((sum, p) => sum + p.value, 0))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovadas</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {proposals.filter(p => p.status === 'Aprovada').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Análise</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {proposals.filter(p => p.status === 'Em Análise').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtro de Busca */}
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Buscar propostas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Tabela de Propostas */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Propostas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Gerente de Conta</TableHead>
                <TableHead>Distribuidor</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProposals.map((proposal) => (
                <TableRow key={proposal.id}>
                  <TableCell className="font-medium">{proposal.title}</TableCell>
                  <TableCell>{proposal.client}</TableCell>
                  <TableCell>{proposal.accountManager}</TableCell>
                  <TableCell>{getDistributorName(proposal.distributorId)}</TableCell>
                  <TableCell>{formatCurrency(proposal.value)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(proposal.status)}>
                      {proposal.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(proposal.date)}</TableCell>
                  <TableCell>{formatDate(proposal.expiryDate)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleNavigateToCalculator(proposal)}
                        className="flex items-center"
                      >
                        <Calculator className="h-4 w-4 mr-1" />
                        <span>Calcular</span>
                      </Button>
                      {(user?.role === 'admin' || proposal.createdBy === user?.uid) && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(proposal)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(proposal.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredProposals.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma proposta encontrada.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de Seleção do Tipo de Proposta */}
      <Dialog open={showProposalTypeDialog} onOpenChange={setShowProposalTypeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Escolha o Tipo de Proposta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Button 
              onClick={() => handleProposalTypeSelect('commercial')}
              className="w-full h-20 flex flex-col items-center justify-center space-y-2"
              variant="outline"
            >
              <FileText className="h-8 w-8" />
              <span className="font-semibold">Proposta Comercial</span>
              <span className="text-sm text-muted-foreground">Layout personalizado com design profissional</span>
            </Button>
            <Button 
              onClick={() => handleProposalTypeSelect('technical')}
              className="w-full h-20 flex flex-col items-center justify-center space-y-2"
              variant="outline"
            >
              <Briefcase className="h-8 w-8" />
              <span className="font-semibold">Proposta Técnica</span>
              <span className="text-sm text-muted-foreground">Formulário detalhado com especificações técnicas</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo da Proposta Comercial */}
      <Dialog open={showCommercialProposal} onOpenChange={setShowCommercialProposal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Proposta Comercial</DialogTitle>
          </DialogHeader>
          <CommercialProposalView partners={partners} />
        </DialogContent>
      </Dialog>

      {/* Diálogo da Proposta Técnica */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProposal ? 'Editar Proposta' : 'Nova Proposta Técnica'}
            </DialogTitle>
          </DialogHeader>
          <ProposalForm
            proposal={editingProposal}
            partners={partners}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProposalsView; 