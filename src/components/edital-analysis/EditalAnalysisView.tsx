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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Plus, Search, Filter, Eye, Edit, Trash2, FileText, Calendar,
  DollarSign, Building, AlertTriangle, CheckCircle, Clock,
  Users, Award, BarChart3, Target, TrendingUp, AlertCircle, Brain
} from 'lucide-react';
import { Edital } from '@/lib/types';
import EditalForm from './EditalForm';
import EditalAnalysisForm from './EditalAnalysisForm';

interface EditalAnalysisViewProps {
  editais: Edital[];
  onAdd: (edital: Omit<Edital, 'id'>) => void;
  onUpdate: (id: string, edital: Omit<Edital, 'id'>) => void;
  onDelete: (id: string) => void;
  onAddAnalysis: (editalId: string, analysis: any) => void;
}

const EditalAnalysisView: React.FC<EditalAnalysisViewProps> = ({ 
  editais, onAdd, onUpdate, onDelete, onAddAnalysis 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [bodyTypeFilter, setBodyTypeFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [showAnalysisForm, setShowAnalysisForm] = useState(false);
  const [editingEdital, setEditingEdital] = useState<Edital | null>(null);
  const [viewingEdital, setViewingEdital] = useState<Edital | null>(null);
  const [selectedEditalForAnalysis, setSelectedEditalForAnalysis] = useState<Edital | null>(null);

  const filteredEditais = useMemo(() => {
    return editais.filter(edital => {
      const matchesSearch = 
        edital.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        edital.publishingBody.toLowerCase().includes(searchTerm.toLowerCase()) ||
        edital.publicationNumber.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || edital.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || edital.category === categoryFilter;
      const matchesBodyType = bodyTypeFilter === 'all' || 
        (edital.analysis?.publishingBodyAnalysis.bodyType === bodyTypeFilter);

      return matchesSearch && matchesStatus && matchesCategory && matchesBodyType;
    });
  }, [editais, searchTerm, statusFilter, categoryFilter, bodyTypeFilter]);

  const handleCreate = () => {
    setEditingEdital(null);
    setShowForm(true);
  };

  const handleEdit = (edital: Edital) => {
    setEditingEdital(edital);
    setShowForm(true);
  };

  const handleView = (edital: Edital) => {
    setViewingEdital(edital);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este edital?')) {
      onDelete(id);
    }
  };

  const handleSubmit = (editalData: Omit<Edital, 'id'>) => {
    if (editingEdital) {
      onUpdate(editingEdital.id, editalData);
    } else {
      onAdd(editalData);
    }
    setShowForm(false);
    setEditingEdital(null);
  };

  const handleAnalyze = (edital: Edital) => {
    setSelectedEditalForAnalysis(edital);
    setShowAnalysisForm(true);
  };

  const handleAnalysisSubmit = (analysis: any) => {
    if (selectedEditalForAnalysis) {
      onAddAnalysis(selectedEditalForAnalysis.id, analysis);
      setShowAnalysisForm(false);
      setSelectedEditalForAnalysis(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aberto': return 'bg-green-100 text-green-800';
      case 'Em Análise': return 'bg-blue-100 text-blue-800';
      case 'Fechado': return 'bg-gray-100 text-gray-800';
      case 'Vencido': return 'bg-red-100 text-red-800';
      case 'Cancelado': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Baixo': return 'bg-green-100 text-green-800';
      case 'Médio': return 'bg-yellow-100 text-yellow-800';
      case 'Alto': return 'bg-red-100 text-red-800';
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

  const getDaysUntil = (date: string) => {
    const today = new Date();
    const targetDate = new Date(date);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Análise de Editais</h2>
          <p className="text-muted-foreground">
            Gerencie e analise editais de licitações
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Edital
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
                  placeholder="Buscar por título, órgão..."
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
                  <SelectItem value="Fechado">Fechado</SelectItem>
                  <SelectItem value="Vencido">Vencido</SelectItem>
                  <SelectItem value="Cancelado">Cancelado</SelectItem>
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
                  <SelectItem value="Educação">Educação</SelectItem>
                  <SelectItem value="Segurança">Segurança</SelectItem>
                  <SelectItem value="Saúde">Saúde</SelectItem>
                  <SelectItem value="Infraestrutura">Infraestrutura</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="bodyType">Tipo de Órgão</Label>
              <Select value={bodyTypeFilter} onValueChange={setBodyTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="Federal">Federal</SelectItem>
                  <SelectItem value="Estadual">Estadual</SelectItem>
                  <SelectItem value="Municipal">Municipal</SelectItem>
                  <SelectItem value="Autarquia">Autarquia</SelectItem>
                  <SelectItem value="Empresa Pública">Empresa Pública</SelectItem>
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
                <p className="text-sm font-medium text-gray-600">Total de Editais</p>
                <p className="text-2xl font-bold">{editais.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Em Análise</p>
                <p className="text-2xl font-bold">
                  {editais.filter(e => e.status === 'Em Análise').length}
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
                  {formatCurrency(editais.reduce((sum, e) => sum + e.estimatedValue, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Urgentes</p>
                <p className="text-2xl font-bold">
                  {editais.filter(e => {
                    const daysUntil = getDaysUntil(e.openingDate);
                    return daysUntil <= 7 && daysUntil >= 0;
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Editais ({filteredEditais.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Órgão</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Data Abertura</TableHead>
                <TableHead>Valor Estimado</TableHead>
                <TableHead>Análise</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEditais.map((edital) => {
                const daysUntilOpening = getDaysUntil(edital.openingDate);
                const daysUntilDeadline = getDaysUntil(edital.submissionDeadline);
                const isUrgent = daysUntilOpening <= 7 && daysUntilOpening >= 0;
                const isOverdue = daysUntilDeadline < 0;

                return (
                  <TableRow key={edital.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{edital.title}</div>
                        <div className="text-sm text-gray-500">
                          {edital.publicationNumber}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{edital.publishingBody}</div>
                        {edital.analysis?.publishingBodyAnalysis.bodyType && (
                          <Badge variant="outline" className="text-xs">
                            {edital.analysis.publishingBodyAnalysis.bodyType}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(edital.status)}>
                        {edital.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{edital.category}</TableCell>
                    <TableCell>
                      <div className={`text-sm ${isUrgent ? 'text-red-600 font-semibold' : ''}`}>
                        {formatDate(edital.openingDate)}
                        {isUrgent && <div className="text-xs">Urgente!</div>}
                        {isOverdue && <div className="text-xs text-red-600">Vencido</div>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold">{formatCurrency(edital.estimatedValue)}</div>
                    </TableCell>
                    <TableCell>
                      {edital.analysis ? (
                        <div className="space-y-1">
                          <div className={`text-sm font-semibold ${getScoreColor(edital.analysis.overallAssessment.score)}`}>
                            Score: {edital.analysis.overallAssessment.score}/100
                          </div>
                          <Badge 
                            className={
                              edital.analysis.overallAssessment.recommendation === 'Participar' 
                                ? 'bg-green-100 text-green-800' 
                                : edital.analysis.overallAssessment.recommendation === 'Não Participar'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }
                          >
                            {edital.analysis.overallAssessment.recommendation}
                          </Badge>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAnalyze(edital)}
                        >
                          <BarChart3 className="h-4 w-4 mr-1" />
                          Analisar
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(edital)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(edital)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(edital.id)}
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
        <EditalForm
          edital={editingEdital || undefined}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingEdital(null);
          }}
        />
      )}

      {/* Formulário de Análise */}
      {showAnalysisForm && selectedEditalForAnalysis && (
        <EditalAnalysisForm
          edital={selectedEditalForAnalysis}
          onSubmit={handleAnalysisSubmit}
          onCancel={() => {
            setShowAnalysisForm(false);
            setSelectedEditalForAnalysis(null);
          }}
        />
      )}

      {/* Visualização Detalhada */}
      {viewingEdital && (
        <Dialog open={true} onOpenChange={() => setViewingEdital(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Detalhes do Edital
              </DialogTitle>
            </DialogHeader>

            <Tabs defaultValue="geral" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="geral">Geral</TabsTrigger>
                <TabsTrigger value="documentos">Documentos</TabsTrigger>
                <TabsTrigger value="produtos">Produtos</TabsTrigger>
                <TabsTrigger value="analise">Análise</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>

              <TabsContent value="geral" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Título</Label>
                    <p className="text-lg font-semibold">{viewingEdital.title}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Número de Publicação</Label>
                    <p className="text-lg">{viewingEdital.publicationNumber}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Órgão Publicador</Label>
                    <p className="text-lg">{viewingEdital.publishingBody}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Status</Label>
                    <Badge className={getStatusColor(viewingEdital.status)}>
                      {viewingEdital.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Categoria</Label>
                    <p>{viewingEdital.category}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Valor Estimado</Label>
                    <p className="text-lg font-semibold">{formatCurrency(viewingEdital.estimatedValue)}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600">Descrição</Label>
                  <p className="text-gray-700 whitespace-pre-wrap">{viewingEdital.description}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600">Requisitos</Label>
                  <p className="text-gray-700 whitespace-pre-wrap">{viewingEdital.requirements}</p>
                </div>
              </TabsContent>

              <TabsContent value="documentos" className="space-y-4">
                <div className="space-y-4">
                  {viewingEdital.documents.map((doc) => (
                    <Card key={doc.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{doc.name}</h4>
                              <Badge 
                                className={
                                  doc.type === 'Obrigatório' ? 'bg-red-100 text-red-800' :
                                  doc.type === 'Opcional' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-blue-100 text-blue-800'
                                }
                              >
                                {doc.type}
                              </Badge>
                              <Badge 
                                className={
                                  doc.status === 'Pronto' ? 'bg-green-100 text-green-800' :
                                  doc.status === 'Em Preparação' ? 'bg-yellow-100 text-yellow-800' :
                                  doc.status === 'Enviado' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }
                              >
                                {doc.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{doc.description}</p>
                            {doc.deadline && (
                              <p className="text-sm text-gray-500">
                                Prazo: {formatDate(doc.deadline)}
                              </p>
                            )}
                            {doc.notes && (
                              <p className="text-sm text-gray-700">{doc.notes}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="produtos" className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Preço Unit.</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Fornecedor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {viewingEdital.products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{product.description}</div>
                            <div className="text-sm text-gray-500">{product.specifications}</div>
                            {product.brand && (
                              <div className="text-xs text-gray-400">
                                {product.brand} {product.model}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {product.quantity} {product.unit}
                        </TableCell>
                        <TableCell>{formatCurrency(product.estimatedUnitPrice)}</TableCell>
                        <TableCell>{formatCurrency(product.totalEstimatedPrice)}</TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              product.status === 'Disponível' ? 'bg-green-100 text-green-800' :
                              product.status === 'Em Cotação' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }
                          >
                            {product.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{product.supplier || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="analise" className="space-y-4">
                {viewingEdital.analysis ? (
                  <div className="space-y-6">
                    {/* Score Geral */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5" />
                          Avaliação Geral
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-semibold">Score Geral</span>
                            <span className={`text-2xl font-bold ${getScoreColor(viewingEdital.analysis.overallAssessment.score)}`}>
                              {viewingEdital.analysis.overallAssessment.score}/100
                            </span>
                          </div>
                          <Progress value={viewingEdital.analysis.overallAssessment.score} className="h-3" />
                          <Badge 
                            className={
                              viewingEdital.analysis.overallAssessment.recommendation === 'Participar' 
                                ? 'bg-green-100 text-green-800 text-lg' 
                                : viewingEdital.analysis.overallAssessment.recommendation === 'Não Participar'
                                ? 'bg-red-100 text-red-800 text-lg'
                                : 'bg-yellow-100 text-yellow-800 text-lg'
                            }
                          >
                            {viewingEdital.analysis.overallAssessment.recommendation}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Análise de Documentos */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Análise de Documentações
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {viewingEdital.analysis.documentAnalysis.totalDocuments}
                            </div>
                            <div className="text-sm text-gray-600">Total</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {viewingEdital.analysis.documentAnalysis.readyDocuments}
                            </div>
                            <div className="text-sm text-gray-600">Prontos</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">
                              {viewingEdital.analysis.documentAnalysis.pendingDocuments}
                            </div>
                            <div className="text-sm text-gray-600">Pendentes</div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <p className="text-sm text-gray-700">{viewingEdital.analysis.documentAnalysis.notes}</p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Análise de Produtos */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Award className="h-5 w-5" />
                          Análise de Produtos Solicitados
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {viewingEdital.analysis.productAnalysis.totalProducts}
                            </div>
                            <div className="text-sm text-gray-600">Total</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {viewingEdital.analysis.productAnalysis.availableProducts}
                            </div>
                            <div className="text-sm text-gray-600">Disponíveis</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">
                              {viewingEdital.analysis.productAnalysis.unavailableProducts}
                            </div>
                            <div className="text-sm text-gray-600">Indisponíveis</div>
                          </div>
                        </div>
                        <div className="mt-4 space-y-2">
                          <p className="text-sm font-semibold">Vantagem Competitiva:</p>
                          <p className="text-sm text-gray-700">{viewingEdital.analysis.productAnalysis.competitiveAdvantage}</p>
                          <p className="text-sm text-gray-700">{viewingEdital.analysis.productAnalysis.notes}</p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Análise de Timeline */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Clock className="h-5 w-5" />
                          Análise de Data de Abertura
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {(() => {
                          const daysUntilOpening = getDaysUntil(viewingEdital.openingDate);
                          const daysUntilDeadline = getDaysUntil(viewingEdital.submissionDeadline);
                          const isUrgent = daysUntilOpening <= 7 && daysUntilOpening >= 0;
                          const isOverdue = daysUntilDeadline < 0;
                          
                          return (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="text-center">
                                <div className={`text-2xl font-bold ${isUrgent ? 'text-red-600' : 'text-blue-600'}`}>
                                  {daysUntilOpening}
                                </div>
                                <div className="text-sm text-gray-600">Dias até a abertura</div>
                              </div>
                              <div className="text-center">
                                <div className={`text-2xl font-bold ${isOverdue ? 'text-red-600' : 'text-blue-600'}`}>
                                  {daysUntilDeadline}
                                </div>
                                <div className="text-sm text-gray-600">Dias até o prazo</div>
                              </div>
                            </div>
                          );
                        })()}
                        <div className="mt-4">
                          <Badge className={getRiskColor(viewingEdital.analysis.timelineAnalysis.timelineRisk)}>
                            Risco: {viewingEdital.analysis.timelineAnalysis.timelineRisk}
                          </Badge>
                          <p className="text-sm text-gray-700 mt-2">{viewingEdital.analysis.timelineAnalysis.notes}</p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Análise do Órgão */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Building className="h-5 w-5" />
                          Análise do Órgão de Publicação
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Tipo de Órgão</Label>
                            <p className="font-semibold">{viewingEdital.analysis.publishingBodyAnalysis.bodyType}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Histórico de Pagamento</Label>
                            <Badge 
                              className={
                                viewingEdital.analysis.publishingBodyAnalysis.paymentHistory === 'Excelente' ? 'bg-green-100 text-green-800' :
                                viewingEdital.analysis.publishingBodyAnalysis.paymentHistory === 'Bom' ? 'bg-blue-100 text-blue-800' :
                                viewingEdital.analysis.publishingBodyAnalysis.paymentHistory === 'Regular' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }
                            >
                              {viewingEdital.analysis.publishingBodyAnalysis.paymentHistory}
                            </Badge>
                          </div>
                        </div>
                        <div className="mt-4">
                          <Label className="text-sm font-medium text-gray-600">Experiência Prévia</Label>
                          <p className="text-sm text-gray-700">{viewingEdital.analysis.publishingBodyAnalysis.previousExperience}</p>
                          <p className="text-sm text-gray-700 mt-2">{viewingEdital.analysis.publishingBodyAnalysis.notes}</p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* SWOT */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" />
                          Análise SWOT
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold text-green-600 mb-2">Forças</h4>
                            <ul className="text-sm space-y-1">
                              {viewingEdital.analysis.overallAssessment.strengths.map((strength, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                  <span>{strength}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold text-red-600 mb-2">Fraquezas</h4>
                            <ul className="text-sm space-y-1">
                              {viewingEdital.analysis.overallAssessment.weaknesses.map((weakness, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                                  <span>{weakness}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold text-blue-600 mb-2">Oportunidades</h4>
                            <ul className="text-sm space-y-1">
                              {viewingEdital.analysis.overallAssessment.opportunities.map((opportunity, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                  <span>{opportunity}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold text-orange-600 mb-2">Ameaças</h4>
                            <ul className="text-sm space-y-1">
                              {viewingEdital.analysis.overallAssessment.threats.map((threat, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                                  <span>{threat}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="mt-4">
                          <Label className="text-sm font-medium text-gray-600">Notas Finais</Label>
                          <p className="text-sm text-gray-700">{viewingEdital.analysis.overallAssessment.finalNotes}</p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Análise AI dos Arquivos */}
                    {viewingEdital.files && viewingEdital.files.some(file => file.aiAnalysis) && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Brain className="h-5 w-5" />
                            Análise AI dos Arquivos
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {viewingEdital.files
                              .filter(file => file.aiAnalysis)
                              .map((file) => (
                                <div key={file.id} className="border rounded-lg p-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                      <FileText className="h-5 w-5 text-blue-500" />
                                      <span className="font-semibold">{file.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Badge className="bg-green-100 text-green-800">
                                        {file.aiAnalysis!.confidence}% confiança
                                      </Badge>
                                      <span className="text-sm text-gray-500">
                                        {file.aiAnalysis!.processingTime}s
                                      </span>
                                    </div>
                                  </div>

                                  <div className="space-y-3">
                                    <div>
                                      <Label className="text-sm font-medium text-gray-600">Resumo</Label>
                                      <p className="text-sm text-gray-700">{file.aiAnalysis!.summary}</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <Label className="text-sm font-medium text-gray-600">Pontos-Chave</Label>
                                        <ul className="text-sm space-y-1 mt-1">
                                          {file.aiAnalysis!.keyPoints.map((point, index) => (
                                            <li key={index} className="flex items-start gap-2">
                                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                              <span>{point}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>

                                      <div>
                                        <Label className="text-sm font-medium text-gray-600">Requisitos</Label>
                                        <ul className="text-sm space-y-1 mt-1">
                                          {file.aiAnalysis!.requirements.map((req, index) => (
                                            <li key={index} className="flex items-start gap-2">
                                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                              <span>{req}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>

                                      <div>
                                        <Label className="text-sm font-medium text-gray-600">Prazos</Label>
                                        <ul className="text-sm space-y-1 mt-1">
                                          {file.aiAnalysis!.deadlines.map((deadline, index) => (
                                            <li key={index} className="flex items-start gap-2">
                                              <Clock className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                              <span>{deadline}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>

                                      <div>
                                        <Label className="text-sm font-medium text-gray-600">Valores</Label>
                                        <ul className="text-sm space-y-1 mt-1">
                                          {file.aiAnalysis!.values.map((value, index) => (
                                            <li key={index} className="flex items-start gap-2">
                                              <DollarSign className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                              <span>{value}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <Label className="text-sm font-medium text-gray-600">Riscos</Label>
                                        <ul className="text-sm space-y-1 mt-1">
                                          {file.aiAnalysis!.risks.map((risk, index) => (
                                            <li key={index} className="flex items-start gap-2">
                                              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                                              <span>{risk}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>

                                      <div>
                                        <Label className="text-sm font-medium text-gray-600">Oportunidades</Label>
                                        <ul className="text-sm space-y-1 mt-1">
                                          {file.aiAnalysis!.opportunities.map((opp, index) => (
                                            <li key={index} className="flex items-start gap-2">
                                              <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                              <span>{opp}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>

                                    <div>
                                      <Label className="text-sm font-medium text-gray-600">Recomendações</Label>
                                      <ul className="text-sm space-y-1 mt-1">
                                        {file.aiAnalysis!.recommendations.map((rec, index) => (
                                          <li key={index} className="flex items-start gap-2">
                                            <Target className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                                            <span>{rec}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhuma análise realizada ainda</p>
                    <Button 
                      className="mt-4"
                      onClick={() => handleAnalyze(viewingEdital)}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Realizar Análise
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="timeline" className="space-y-4">
                <div className="space-y-4">
                  {(() => {
                    const daysUntilOpening = getDaysUntil(viewingEdital.openingDate);
                    const daysUntilDeadline = getDaysUntil(viewingEdital.submissionDeadline);
                    const isUrgent = daysUntilOpening <= 7 && daysUntilOpening >= 0;
                    const isOverdue = daysUntilDeadline < 0;
                    
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                          <CardContent className="p-4 text-center">
                            <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                            <div className="text-lg font-semibold">Publicação</div>
                            <div className="text-sm text-gray-600">{formatDate(viewingEdital.publishDate)}</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                            <div className="text-lg font-semibold">Prazo de Entrega</div>
                            <div className="text-sm text-gray-600">{formatDate(viewingEdital.submissionDeadline)}</div>
                            <div className={`text-xs mt-1 ${isOverdue ? 'text-red-600 font-semibold' : ''}`}>
                              {daysUntilDeadline} dias
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                            <div className="text-lg font-semibold">Abertura</div>
                            <div className="text-sm text-gray-600">{formatDate(viewingEdital.openingDate)}</div>
                            <div className={`text-xs mt-1 ${isUrgent ? 'text-red-600 font-semibold' : ''}`}>
                              {daysUntilOpening} dias
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })()}
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default EditalAnalysisView; 