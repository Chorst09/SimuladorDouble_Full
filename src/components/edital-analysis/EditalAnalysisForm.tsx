"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { X, Plus, FileText, Award, Clock, Building, Target, TrendingUp, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { Edital } from '@/lib/types';

interface EditalAnalysisFormProps {
  edital: Edital;
  onSubmit: (analysis: any) => void;
  onCancel: () => void;
}

const EditalAnalysisForm: React.FC<EditalAnalysisFormProps> = ({ edital, onSubmit, onCancel }) => {
  const [analysisData, setAnalysisData] = useState({
    analysisDate: new Date().toISOString().split('T')[0],
    analyst: '',
    documentAnalysis: {
      totalDocuments: edital.documents.length,
      readyDocuments: edital.documents.filter(d => d.status === 'Pronto' || d.status === 'Enviado').length,
      pendingDocuments: edital.documents.filter(d => d.status === 'Pendente' || d.status === 'Em Preparação').length,
      criticalDocuments: [] as string[],
      notes: ''
    },
    productAnalysis: {
      totalProducts: edital.products.length,
      availableProducts: edital.products.filter(p => p.status === 'Disponível').length,
      unavailableProducts: edital.products.filter(p => p.status === 'Indisponível').length,
      totalEstimatedValue: edital.products.reduce((sum, p) => sum + p.totalEstimatedPrice, 0),
      competitiveAdvantage: '',
      notes: ''
    },
    timelineAnalysis: {
      daysUntilOpening: 0,
      daysUntilDeadline: 0,
      isUrgent: false,
      timelineRisk: 'Baixo' as 'Baixo' | 'Médio' | 'Alto',
      notes: ''
    },
    publishingBodyAnalysis: {
      bodyType: 'Municipal' as 'Federal' | 'Estadual' | 'Municipal' | 'Autarquia' | 'Empresa Pública',
      previousExperience: '',
      paymentHistory: 'Bom' as 'Excelente' | 'Bom' | 'Regular' | 'Ruim',
      notes: ''
    },
    overallAssessment: {
      score: 0,
      recommendation: 'Avaliar Mais' as 'Participar' | 'Não Participar' | 'Avaliar Mais',
      strengths: [] as string[],
      weaknesses: [] as string[],
      opportunities: [] as string[],
      threats: [] as string[],
      finalNotes: ''
    }
  });

  const [newStrength, setNewStrength] = useState('');
  const [newWeakness, setNewWeakness] = useState('');
  const [newOpportunity, setNewOpportunity] = useState('');
  const [newThreat, setNewThreat] = useState('');
  const [newCriticalDocument, setNewCriticalDocument] = useState('');

  const analysts = [
    'João da Silva', 'Maria Oliveira', 'Carlos Pereira', 
    'Ana Costa', 'Pedro Santos', 'Lucia Ferreira'
  ];

  const bodyTypes = ['Federal', 'Estadual', 'Municipal', 'Autarquia', 'Empresa Pública'];
  const paymentHistories = ['Excelente', 'Bom', 'Regular', 'Ruim'];
  const timelineRisks = ['Baixo', 'Médio', 'Alto'];
  const recommendations = ['Participar', 'Não Participar', 'Avaliar Mais'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calcular score baseado nas análises
    let score = 0;
    
    // Documentos (25%)
    const documentScore = (analysisData.documentAnalysis.readyDocuments / analysisData.documentAnalysis.totalDocuments) * 25;
    score += documentScore;
    
    // Produtos (25%)
    const productScore = (analysisData.productAnalysis.availableProducts / analysisData.productAnalysis.totalProducts) * 25;
    score += productScore;
    
    // Timeline (20%)
    const timelineScore = analysisData.timelineAnalysis.timelineRisk === 'Baixo' ? 20 : 
                         analysisData.timelineAnalysis.timelineRisk === 'Médio' ? 15 : 5;
    score += timelineScore;
    
    // Órgão (30%)
    const paymentScore = analysisData.publishingBodyAnalysis.paymentHistory === 'Excelente' ? 30 :
                        analysisData.publishingBodyAnalysis.paymentHistory === 'Bom' ? 25 :
                        analysisData.publishingBodyAnalysis.paymentHistory === 'Regular' ? 15 : 5;
    score += paymentScore;

    const finalAnalysis = {
      ...analysisData,
      overallAssessment: {
        ...analysisData.overallAssessment,
        score: Math.round(score)
      }
    };

    onSubmit(finalAnalysis);
  };

  const addStrength = () => {
    if (newStrength.trim()) {
      setAnalysisData(prev => ({
        ...prev,
        overallAssessment: {
          ...prev.overallAssessment,
          strengths: [...prev.overallAssessment.strengths, newStrength.trim()]
        }
      }));
      setNewStrength('');
    }
  };

  const removeStrength = (index: number) => {
    setAnalysisData(prev => ({
      ...prev,
      overallAssessment: {
        ...prev.overallAssessment,
        strengths: prev.overallAssessment.strengths.filter((_, i) => i !== index)
      }
    }));
  };

  const addWeakness = () => {
    if (newWeakness.trim()) {
      setAnalysisData(prev => ({
        ...prev,
        overallAssessment: {
          ...prev.overallAssessment,
          weaknesses: [...prev.overallAssessment.weaknesses, newWeakness.trim()]
        }
      }));
      setNewWeakness('');
    }
  };

  const removeWeakness = (index: number) => {
    setAnalysisData(prev => ({
      ...prev,
      overallAssessment: {
        ...prev.overallAssessment,
        weaknesses: prev.overallAssessment.weaknesses.filter((_, i) => i !== index)
      }
    }));
  };

  const addOpportunity = () => {
    if (newOpportunity.trim()) {
      setAnalysisData(prev => ({
        ...prev,
        overallAssessment: {
          ...prev.overallAssessment,
          opportunities: [...prev.overallAssessment.opportunities, newOpportunity.trim()]
        }
      }));
      setNewOpportunity('');
    }
  };

  const removeOpportunity = (index: number) => {
    setAnalysisData(prev => ({
      ...prev,
      overallAssessment: {
        ...prev.overallAssessment,
        opportunities: prev.overallAssessment.opportunities.filter((_, i) => i !== index)
      }
    }));
  };

  const addThreat = () => {
    if (newThreat.trim()) {
      setAnalysisData(prev => ({
        ...prev,
        overallAssessment: {
          ...prev.overallAssessment,
          threats: [...prev.overallAssessment.threats, newThreat.trim()]
        }
      }));
      setNewThreat('');
    }
  };

  const removeThreat = (index: number) => {
    setAnalysisData(prev => ({
      ...prev,
      overallAssessment: {
        ...prev.overallAssessment,
        threats: prev.overallAssessment.threats.filter((_, i) => i !== index)
      }
    }));
  };

  const addCriticalDocument = () => {
    if (newCriticalDocument.trim()) {
      setAnalysisData(prev => ({
        ...prev,
        documentAnalysis: {
          ...prev.documentAnalysis,
          criticalDocuments: [...prev.documentAnalysis.criticalDocuments, newCriticalDocument.trim()]
        }
      }));
      setNewCriticalDocument('');
    }
  };

  const removeCriticalDocument = (index: number) => {
    setAnalysisData(prev => ({
      ...prev,
      documentAnalysis: {
        ...prev.documentAnalysis,
        criticalDocuments: prev.documentAnalysis.criticalDocuments.filter((_, i) => i !== index)
      }
    }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getDaysUntil = (date: string) => {
    const today = new Date();
    const targetDate = new Date(date);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Análise do Edital: {edital.title}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas da Análise */}
          <Card>
            <CardHeader>
              <CardTitle>Informações da Análise</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="analysisDate">Data da Análise</Label>
                  <Input
                    id="analysisDate"
                    type="date"
                    value={analysisData.analysisDate}
                    onChange={(e) => setAnalysisData(prev => ({ ...prev, analysisDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="analyst">Analista</Label>
                  <Select 
                    value={analysisData.analyst} 
                    onValueChange={(value) => setAnalysisData(prev => ({ ...prev, analyst: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o analista" />
                    </SelectTrigger>
                    <SelectContent>
                      {analysts.map((analyst) => (
                        <SelectItem key={analyst} value={analyst}>
                          {analyst}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="documentos" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="documentos">Documentações</TabsTrigger>
              <TabsTrigger value="produtos">Produtos</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="orgao">Órgão</TabsTrigger>
            </TabsList>

            {/* Análise de Documentações */}
            <TabsContent value="documentos" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Análise de Documentações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {analysisData.documentAnalysis.totalDocuments}
                      </div>
                      <div className="text-sm text-gray-600">Total de Documentos</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {analysisData.documentAnalysis.readyDocuments}
                      </div>
                      <div className="text-sm text-gray-600">Documentos Prontos</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {analysisData.documentAnalysis.pendingDocuments}
                      </div>
                      <div className="text-sm text-gray-600">Documentos Pendentes</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Documentos Críticos</Label>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            value={newCriticalDocument}
                            onChange={(e) => setNewCriticalDocument(e.target.value)}
                            placeholder="Nome do documento crítico"
                          />
                          <Button type="button" onClick={addCriticalDocument} variant="outline" size="sm">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {analysisData.documentAnalysis.criticalDocuments.length > 0 && (
                          <div className="space-y-1">
                            {analysisData.documentAnalysis.criticalDocuments.map((doc, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded">
                                <span className="text-sm text-red-800">{doc}</span>
                                <Button
                                  type="button"
                                  onClick={() => removeCriticalDocument(index)}
                                  variant="ghost"
                                  size="sm"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="documentNotes">Observações sobre Documentação</Label>
                      <Textarea
                        id="documentNotes"
                        value={analysisData.documentAnalysis.notes}
                        onChange={(e) => setAnalysisData(prev => ({
                          ...prev,
                          documentAnalysis: { ...prev.documentAnalysis, notes: e.target.value }
                        }))}
                        placeholder="Observações sobre a documentação necessária..."
                        rows={4}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Análise de Produtos */}
            <TabsContent value="produtos" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Análise de Produtos Solicitados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {analysisData.productAnalysis.totalProducts}
                      </div>
                      <div className="text-sm text-gray-600">Total de Produtos</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {analysisData.productAnalysis.availableProducts}
                      </div>
                      <div className="text-sm text-gray-600">Disponíveis</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {analysisData.productAnalysis.unavailableProducts}
                      </div>
                      <div className="text-sm text-gray-600">Indisponíveis</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {formatCurrency(analysisData.productAnalysis.totalEstimatedValue)}
                      </div>
                      <div className="text-sm text-gray-600">Valor Total</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="competitiveAdvantage">Vantagem Competitiva</Label>
                      <Input
                        id="competitiveAdvantage"
                        value={analysisData.productAnalysis.competitiveAdvantage}
                        onChange={(e) => setAnalysisData(prev => ({
                          ...prev,
                          productAnalysis: { ...prev.productAnalysis, competitiveAdvantage: e.target.value }
                        }))}
                        placeholder="Descreva as vantagens competitivas..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="productNotes">Observações sobre Produtos</Label>
                      <Textarea
                        id="productNotes"
                        value={analysisData.productAnalysis.notes}
                        onChange={(e) => setAnalysisData(prev => ({
                          ...prev,
                          productAnalysis: { ...prev.productAnalysis, notes: e.target.value }
                        }))}
                        placeholder="Observações sobre os produtos/serviços..."
                        rows={4}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Análise de Timeline */}
            <TabsContent value="timeline" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Análise de Data de Abertura
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {getDaysUntil(edital.openingDate)}
                      </div>
                      <div className="text-sm text-gray-600">Dias até a Abertura</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {getDaysUntil(edital.submissionDeadline)}
                      </div>
                      <div className="text-sm text-gray-600">Dias até o Prazo</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="timelineRisk">Risco de Timeline</Label>
                      <Select 
                        value={analysisData.timelineAnalysis.timelineRisk} 
                        onValueChange={(value) => setAnalysisData(prev => ({
                          ...prev,
                          timelineAnalysis: { 
                            ...prev.timelineAnalysis, 
                            timelineRisk: value as 'Baixo' | 'Médio' | 'Alto',
                            isUrgent: getDaysUntil(edital.openingDate) <= 7
                          }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o risco" />
                        </SelectTrigger>
                        <SelectContent>
                          {timelineRisks.map((risk) => (
                            <SelectItem key={risk} value={risk}>
                              {risk}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="timelineNotes">Observações sobre Timeline</Label>
                      <Textarea
                        id="timelineNotes"
                        value={analysisData.timelineAnalysis.notes}
                        onChange={(e) => setAnalysisData(prev => ({
                          ...prev,
                          timelineAnalysis: { ...prev.timelineAnalysis, notes: e.target.value }
                        }))}
                        placeholder="Observações sobre prazos e timeline..."
                        rows={4}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Análise do Órgão */}
            <TabsContent value="orgao" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Análise do Órgão de Publicação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <Label htmlFor="bodyType">Tipo de Órgão</Label>
                      <Select 
                        value={analysisData.publishingBodyAnalysis.bodyType} 
                        onValueChange={(value) => setAnalysisData(prev => ({
                          ...prev,
                          publishingBodyAnalysis: { 
                            ...prev.publishingBodyAnalysis, 
                            bodyType: value as 'Federal' | 'Estadual' | 'Municipal' | 'Autarquia' | 'Empresa Pública'
                          }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {bodyTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="paymentHistory">Histórico de Pagamento</Label>
                      <Select 
                        value={analysisData.publishingBodyAnalysis.paymentHistory} 
                        onValueChange={(value) => setAnalysisData(prev => ({
                          ...prev,
                          publishingBodyAnalysis: { 
                            ...prev.publishingBodyAnalysis, 
                            paymentHistory: value as 'Excelente' | 'Bom' | 'Regular' | 'Ruim'
                          }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o histórico" />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentHistories.map((history) => (
                            <SelectItem key={history} value={history}>
                              {history}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="previousExperience">Experiência Prévia</Label>
                      <Input
                        id="previousExperience"
                        value={analysisData.publishingBodyAnalysis.previousExperience}
                        onChange={(e) => setAnalysisData(prev => ({
                          ...prev,
                          publishingBodyAnalysis: { ...prev.publishingBodyAnalysis, previousExperience: e.target.value }
                        }))}
                        placeholder="Descreva experiências prévias com este órgão..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="bodyNotes">Observações sobre o Órgão</Label>
                      <Textarea
                        id="bodyNotes"
                        value={analysisData.publishingBodyAnalysis.notes}
                        onChange={(e) => setAnalysisData(prev => ({
                          ...prev,
                          publishingBodyAnalysis: { ...prev.publishingBodyAnalysis, notes: e.target.value }
                        }))}
                        placeholder="Observações sobre o órgão publicador..."
                        rows={4}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Avaliação Geral e SWOT */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Avaliação Geral e SWOT
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="recommendation">Recomendação Final</Label>
                  <Select 
                    value={analysisData.overallAssessment.recommendation} 
                    onValueChange={(value) => setAnalysisData(prev => ({
                      ...prev,
                      overallAssessment: { 
                        ...prev.overallAssessment, 
                        recommendation: value as 'Participar' | 'Não Participar' | 'Avaliar Mais'
                      }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a recomendação" />
                    </SelectTrigger>
                    <SelectContent>
                      {recommendations.map((rec) => (
                        <SelectItem key={rec} value={rec}>
                          {rec}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* SWOT Analysis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Forças */}
                  <div>
                    <Label className="text-sm font-medium text-green-600">Forças</Label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={newStrength}
                          onChange={(e) => setNewStrength(e.target.value)}
                          placeholder="Adicionar força..."
                        />
                        <Button type="button" onClick={addStrength} variant="outline" size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {analysisData.overallAssessment.strengths.length > 0 && (
                        <div className="space-y-1">
                          {analysisData.overallAssessment.strengths.map((strength, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm">{strength}</span>
                              </div>
                              <Button
                                type="button"
                                onClick={() => removeStrength(index)}
                                variant="ghost"
                                size="sm"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Fraquezas */}
                  <div>
                    <Label className="text-sm font-medium text-red-600">Fraquezas</Label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={newWeakness}
                          onChange={(e) => setNewWeakness(e.target.value)}
                          placeholder="Adicionar fraqueza..."
                        />
                        <Button type="button" onClick={addWeakness} variant="outline" size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {analysisData.overallAssessment.weaknesses.length > 0 && (
                        <div className="space-y-1">
                          {analysisData.overallAssessment.weaknesses.map((weakness, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded">
                              <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-red-600" />
                                <span className="text-sm">{weakness}</span>
                              </div>
                              <Button
                                type="button"
                                onClick={() => removeWeakness(index)}
                                variant="ghost"
                                size="sm"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Oportunidades */}
                  <div>
                    <Label className="text-sm font-medium text-blue-600">Oportunidades</Label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={newOpportunity}
                          onChange={(e) => setNewOpportunity(e.target.value)}
                          placeholder="Adicionar oportunidade..."
                        />
                        <Button type="button" onClick={addOpportunity} variant="outline" size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {analysisData.overallAssessment.opportunities.length > 0 && (
                        <div className="space-y-1">
                          {analysisData.overallAssessment.opportunities.map((opportunity, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                              <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-blue-600" />
                                <span className="text-sm">{opportunity}</span>
                              </div>
                              <Button
                                type="button"
                                onClick={() => removeOpportunity(index)}
                                variant="ghost"
                                size="sm"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ameaças */}
                  <div>
                    <Label className="text-sm font-medium text-orange-600">Ameaças</Label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={newThreat}
                          onChange={(e) => setNewThreat(e.target.value)}
                          placeholder="Adicionar ameaça..."
                        />
                        <Button type="button" onClick={addThreat} variant="outline" size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {analysisData.overallAssessment.threats.length > 0 && (
                        <div className="space-y-1">
                          {analysisData.overallAssessment.threats.map((threat, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-orange-50 rounded">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-orange-600" />
                                <span className="text-sm">{threat}</span>
                              </div>
                              <Button
                                type="button"
                                onClick={() => removeThreat(index)}
                                variant="ghost"
                                size="sm"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="finalNotes">Notas Finais</Label>
                  <Textarea
                    id="finalNotes"
                    value={analysisData.overallAssessment.finalNotes}
                    onChange={(e) => setAnalysisData(prev => ({
                      ...prev,
                      overallAssessment: { ...prev.overallAssessment, finalNotes: e.target.value }
                    }))}
                    placeholder="Notas finais e conclusões da análise..."
                    rows={4}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit">
              Salvar Análise
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditalAnalysisForm; 