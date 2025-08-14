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
import { Plus, Search, Filter, Eye, Edit, Trash2, FileText, Calendar, DollarSign, Users, Award } from 'lucide-react';
import { PriceRecord } from '@/lib/types';
import PriceRecordForm from './PriceRecordForm';

interface PriceRecordViewProps {
  priceRecords: PriceRecord[];
  onAdd: (priceRecord: Omit<PriceRecord, 'id'>) => void;
  onUpdate: (id: string, priceRecord: Omit<PriceRecord, 'id'>) => void;
  onDelete: (id: string) => void;
}

const PriceRecordView: React.FC<PriceRecordViewProps> = ({ priceRecords, onAdd, onUpdate, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingPriceRecord, setEditingPriceRecord] = useState<PriceRecord | null>(null);
  const [viewingPriceRecord, setViewingPriceRecord] = useState<PriceRecord | null>(null);

  const filteredPriceRecords = useMemo(() => {
    return priceRecords.filter(record => {
      const matchesSearch = 
        record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
      const matchesType = typeFilter === 'all' || record.type === typeFilter;
      const matchesCategory = categoryFilter === 'all' || record.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesType && matchesCategory;
    });
  }, [priceRecords, searchTerm, statusFilter, typeFilter, categoryFilter]);

  const handleCreate = () => {
    setEditingPriceRecord(null);
    setShowForm(true);
  };

  const handleEdit = (priceRecord: PriceRecord) => {
    setEditingPriceRecord(priceRecord);
    setShowForm(true);
  };

  const handleView = (priceRecord: PriceRecord) => {
    setViewingPriceRecord(priceRecord);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta ata de registro de preços?')) {
      onDelete(id);
    }
  };

  const handleSubmit = (priceRecordData: Omit<PriceRecord, 'id'>) => {
    if (editingPriceRecord) {
      onUpdate(editingPriceRecord.id, priceRecordData);
    } else {
      onAdd(priceRecordData);
    }
    setShowForm(false);
    setEditingPriceRecord(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo': return 'bg-green-100 text-green-800';
      case 'Suspenso': return 'bg-yellow-100 text-yellow-800';
      case 'Vencido': return 'bg-red-100 text-red-800';
      case 'Cancelado': return 'bg-gray-100 text-gray-800';
      case 'Renovado': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Ata de Registro de Preços': return 'bg-purple-100 text-purple-800';
      case 'Pregão Eletrônico': return 'bg-orange-100 text-orange-800';
      case 'Concorrência': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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

  const getDaysUntilValidity = (validityDate: string) => {
    const today = new Date();
    const validity = new Date(validityDate);
    const diffTime = validity.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Atas de Registro de Preços</h2>
          <p className="text-muted-foreground">
            Gerencie atas de registro de preços, pregões e concorrências
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Ata
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
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Suspenso">Suspenso</SelectItem>
                  <SelectItem value="Vencido">Vencido</SelectItem>
                  <SelectItem value="Cancelado">Cancelado</SelectItem>
                  <SelectItem value="Renovado">Renovado</SelectItem>
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
                  <SelectItem value="Ata de Registro de Preços">Ata de Registro de Preços</SelectItem>
                  <SelectItem value="Pregão Eletrônico">Pregão Eletrônico</SelectItem>
                  <SelectItem value="Concorrência">Concorrência</SelectItem>
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
                  <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                  <SelectItem value="Serviços">Serviços</SelectItem>
                  <SelectItem value="Educação">Educação</SelectItem>
                  <SelectItem value="Saúde">Saúde</SelectItem>
                  <SelectItem value="Segurança">Segurança</SelectItem>
                  <SelectItem value="Administrativo">Administrativo</SelectItem>
                  <SelectItem value="Infraestrutura">Infraestrutura</SelectItem>
                  <SelectItem value="Transporte">Transporte</SelectItem>
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
              <Award className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Atas</p>
                <p className="text-2xl font-bold">{priceRecords.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Ativas</p>
                <p className="text-2xl font-bold">
                  {priceRecords.filter(r => r.status === 'Ativo').length}
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
                  {formatCurrency(priceRecords.reduce((sum, r) => sum + r.totalValue, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Participantes</p>
                <p className="text-2xl font-bold">
                  {priceRecords.reduce((sum, r) => sum + r.participants.length, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Atas de Registro de Preços ({filteredPriceRecords.length})</CardTitle>
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
                <TableHead>Validade</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Itens</TableHead>
                <TableHead>Gerente</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPriceRecords.map((record) => {
                const daysUntilValidity = getDaysUntilValidity(record.validityDate);
                const isExpired = daysUntilValidity < 0;
                const isExpiringSoon = daysUntilValidity <= 30 && daysUntilValidity >= 0;

                return (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{record.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {record.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{record.client}</TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(record.type)}>
                        {record.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(record.status)}>
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{record.category}</TableCell>
                    <TableCell>
                      <div className={`text-sm ${isExpired ? 'text-red-600 font-semibold' : isExpiringSoon ? 'text-orange-600 font-semibold' : ''}`}>
                        {formatDate(record.validityDate)}
                        {isExpired && <div className="text-xs">Vencida há {Math.abs(daysUntilValidity)} dias</div>}
                        {isExpiringSoon && <div className="text-xs">Vence em {daysUntilValidity} dias</div>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold">{formatCurrency(record.totalValue)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{record.items.length} itens</div>
                    </TableCell>
                    <TableCell>{record.accountManager}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(record)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(record)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(record.id)}
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
        <PriceRecordForm
          priceRecord={editingPriceRecord || undefined}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingPriceRecord(null);
          }}
        />
      )}

      {/* Visualização Detalhada */}
      {viewingPriceRecord && (
        <Dialog open={true} onOpenChange={() => setViewingPriceRecord(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Detalhes da {viewingPriceRecord.type}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Título</Label>
                  <p className="text-lg font-semibold">{viewingPriceRecord.title}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Cliente</Label>
                  <p className="text-lg">{viewingPriceRecord.client}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Tipo</Label>
                  <Badge className={getTypeColor(viewingPriceRecord.type)}>
                    {viewingPriceRecord.type}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <Badge className={getStatusColor(viewingPriceRecord.status)}>
                    {viewingPriceRecord.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Data de Publicação</Label>
                  <p>{formatDate(viewingPriceRecord.publishDate)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Data de Validade</Label>
                  <p className={getDaysUntilValidity(viewingPriceRecord.validityDate) < 0 ? 'text-red-600 font-semibold' : ''}>
                    {formatDate(viewingPriceRecord.validityDate)}
                  </p>
                </div>
                {viewingPriceRecord.renewalDate && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Data de Renovação</Label>
                    <p>{formatDate(viewingPriceRecord.renewalDate)}</p>
                  </div>
                )}
                <div>
                  <Label className="text-sm font-medium text-gray-600">Valor Total</Label>
                  <p className="text-lg font-semibold">{formatCurrency(viewingPriceRecord.totalValue)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Gerente de Conta</Label>
                  <p>{viewingPriceRecord.accountManager}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Categoria</Label>
                  <p>{viewingPriceRecord.category}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600">Descrição</Label>
                <p className="text-gray-700 whitespace-pre-wrap">{viewingPriceRecord.description}</p>
              </div>

              {/* Itens da Ata */}
              <div>
                <Label className="text-sm font-medium text-gray-600">Itens da Ata</Label>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Unidade</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Preço Unit.</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Fornecedor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {viewingPriceRecord.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell>{formatCurrency(item.totalPrice)}</TableCell>
                        <TableCell>{item.supplier}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Participantes */}
              {viewingPriceRecord.participants.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Participantes</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {viewingPriceRecord.participants.map((participant, index) => (
                      <div key={index} className="p-2 bg-gray-50 rounded">
                        <span className="text-sm">{participant}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {viewingPriceRecord.notes && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Observações</Label>
                  <p className="text-gray-700 whitespace-pre-wrap">{viewingPriceRecord.notes}</p>
                </div>
              )}

              {viewingPriceRecord.attachments && viewingPriceRecord.attachments.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Anexos</Label>
                  <div className="space-y-2">
                    {viewingPriceRecord.attachments.map((attachment, index) => (
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

export default PriceRecordView; 