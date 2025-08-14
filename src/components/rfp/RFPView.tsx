"use client";

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Search, Filter, Eye, Edit, Trash2, FileText, Calendar, DollarSign, User } from 'lucide-react';
import { RFP } from '@/lib/types';
import RFPForm from './RFPForm';

interface RFPViewProps {
  rfps: RFP[];
  onAdd: (rfp: Omit<RFP, 'id'>) => void;
  onUpdate: (id: string, rfp: Omit<RFP, 'id'>) => void;
  onDelete: (id: string) => void;
}

const RFPView: React.FC<RFPViewProps> = ({ rfps, onAdd, onUpdate, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingRFP, setEditingRFP] = useState<RFP | null>(null);
  const [viewingRFP, setViewingRFP] = useState<RFP | null>(null);

  const filteredRFPs = useMemo(() => {
    return rfps.filter(rfp => {
      const matchesSearch = 
        rfp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rfp.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rfp.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || rfp.status === statusFilter;
      const matchesType = typeFilter === 'all' || rfp.type === typeFilter;
      const matchesCategory = categoryFilter === 'all' || rfp.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesType && matchesCategory;
    });
  }, [rfps, searchTerm, statusFilter, typeFilter, categoryFilter]);

  const handleCreate = () => {
    setEditingRFP(null);
    setShowForm(true);
  };

  const handleEdit = (rfp: RFP) => {
    setEditingRFP(rfp);
    setShowForm(true);
  };

  const handleView = (rfp: RFP) => {
    setViewingRFP(rfp);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este RFP/RFI?')) {
      onDelete(id);
    }
  };

  const handleSubmit = (rfpData: Omit<RFP, 'id'>) => {
    if (editingRFP) {
      onUpdate(editingRFP.id, rfpData);
    } else {
      onAdd(rfpData);
    }
    setShowForm(false);
    setEditingRFP(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aberto': return 'bg-green-100 text-green-800';
      case 'Em Análise': return 'bg-blue-100 text-blue-800';
      case 'Respondido': return 'bg-yellow-100 text-yellow-800';
      case 'Fechado': return 'bg-gray-100 text-gray-800';
      case 'Vencido': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'RFP' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getDaysUntilDeadline = (deadlineDate: string) => {
    const today = new Date();
    const deadline = new Date(deadlineDate);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestão de RFP/RFI</h2>
          <p className="text-muted-foreground">
            Gerencie solicitações de propostas e informações
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Novo RFP/RFI
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Buscar por título, cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="Aberto">Aberto</SelectItem>
                  <SelectItem value="Em Análise">Em Análise</SelectItem>
                  <SelectItem value="Respondido">Respondido</SelectItem>
                  <SelectItem value="Fechado">Fechado</SelectItem>
                  <SelectItem value="Vencido">Vencido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="type">Tipo</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="RFP">RFP</SelectItem>
                  <SelectItem value="RFI">RFI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="category">Categoria</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  <SelectItem value="Saúde">Saúde</SelectItem>
                  <SelectItem value="Governo">Governo</SelectItem>
                  <SelectItem value="Educação">Educação</SelectItem>
                  <SelectItem value="Financeiro">Financeiro</SelectItem>
                  <SelectItem value="Transporte">Transporte</SelectItem>
                  <SelectItem value="Varejo">Varejo</SelectItem>
                  <SelectItem value="Indústria">Indústria</SelectItem>
                  <SelectItem value="Serviços">Serviços</SelectItem>
                  <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total RFP/RFI</p>
                <p className="text-2xl font-bold">{rfps.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Em Aberto</p>
                <p className="text-2xl font-bold">
                  {rfps.filter(r => r.status === 'Aberto').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(rfps.reduce((sum, r) => sum + (r.value || 0), 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Respondidos</p>
                <p className="text-2xl font-bold">
                  {rfps.filter(r => r.status === 'Respondido').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>RFP/RFI ({filteredRFPs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Prazo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Gerente</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRFPs.map((rfp) => {
                const daysUntilDeadline = getDaysUntilDeadline(rfp.deadlineDate);
                const isOverdue = daysUntilDeadline < 0;
                const isUrgent = daysUntilDeadline <= 7 && daysUntilDeadline >= 0;

                return (
                  <TableRow key={rfp.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{rfp.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {rfp.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{rfp.client}</TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(rfp.type)}>
                        {rfp.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(rfp.status)}>
                        {rfp.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{rfp.category}</TableCell>
                    <TableCell>
                      <div className={`text-sm ${isOverdue ? 'text-red-600 font-semibold' : isUrgent ? 'text-orange-600 font-semibold' : ''}`}>
                        {formatDate(rfp.deadlineDate)}
                        {isOverdue && <div className="text-xs">Vencido há {Math.abs(daysUntilDeadline)} dias</div>}
                        {isUrgent && <div className="text-xs">Vence em {daysUntilDeadline} dias</div>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {rfp.value ? formatCurrency(rfp.value) : '-'}
                    </TableCell>
                    <TableCell>{rfp.accountManager}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(rfp)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(rfp)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(rfp.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Formulário */}
      {showForm && (
        <RFPForm
          rfp={editingRFP || undefined}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingRFP(null);
          }}
        />
      )}

      {/* Visualização Detalhada */}
      {viewingRFP && (
        <Dialog open={true} onOpenChange={() => setViewingRFP(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Detalhes do {viewingRFP.type}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Título</Label>
                  <p className="text-lg font-semibold">{viewingRFP.title}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Cliente</Label>
                  <p className="text-lg">{viewingRFP.client}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Tipo</Label>
                  <Badge className={getTypeColor(viewingRFP.type)}>
                    {viewingRFP.type}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <Badge className={getStatusColor(viewingRFP.status)}>
                    {viewingRFP.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Data de Publicação</Label>
                  <p>{formatDate(viewingRFP.publishDate)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Data Limite</Label>
                  <p className={getDaysUntilDeadline(viewingRFP.deadlineDate) < 0 ? 'text-red-600 font-semibold' : ''}>
                    {formatDate(viewingRFP.deadlineDate)}
                  </p>
                </div>
                {viewingRFP.submissionDate && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Data de Submissão</Label>
                    <p>{formatDate(viewingRFP.submissionDate)}</p>
                  </div>
                )}
                {viewingRFP.value && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Valor Estimado</Label>
                    <p className="text-lg font-semibold">{formatCurrency(viewingRFP.value)}</p>
                  </div>
                )}
                <div>
                  <Label className="text-sm font-medium text-gray-600">Gerente de Conta</Label>
                  <p>{viewingRFP.accountManager}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Categoria</Label>
                  <p>{viewingRFP.category}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600">Descrição</Label>
                <p className="text-gray-700 whitespace-pre-wrap">{viewingRFP.description}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600">Requisitos</Label>
                <p className="text-gray-700 whitespace-pre-wrap">{viewingRFP.requirements}</p>
              </div>

              {viewingRFP.notes && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Observações</Label>
                  <p className="text-gray-700 whitespace-pre-wrap">{viewingRFP.notes}</p>
                </div>
              )}

              {viewingRFP.attachments && viewingRFP.attachments.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Anexos</Label>
                  <div className="space-y-2">
                    {viewingRFP.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{attachment}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default RFPView; 