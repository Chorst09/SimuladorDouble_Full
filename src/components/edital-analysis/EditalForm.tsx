"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { X, Plus, FileText, Trash2, Upload, Brain, FileUp } from 'lucide-react';
import { Edital, EditalDocument, EditalProduct, EditalFile } from '@/lib/types';

interface EditalFormProps {
  edital?: Edital;
  onSubmit: (edital: Omit<Edital, 'id'>) => void;
  onCancel: () => void;
}

const EditalForm: React.FC<EditalFormProps> = ({ edital, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: edital?.title || '',
    publicationNumber: edital?.publicationNumber || '',
    publishingBody: edital?.publishingBody || '',
    publishDate: edital?.publishDate || new Date().toISOString().split('T')[0],
    openingDate: edital?.openingDate || '',
    submissionDeadline: edital?.submissionDeadline || '',
    estimatedValue: edital?.estimatedValue || 0,
    category: edital?.category || '',
    status: edital?.status || 'Aberto',
    description: edital?.description || '',
    requirements: edital?.requirements || '',
    documents: edital?.documents || [],
    products: edital?.products || [],
    files: edital?.files || [],
    attachments: edital?.attachments || [],
    notes: edital?.notes || ''
  });

  const [newAttachment, setNewAttachment] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [newDocument, setNewDocument] = useState<Omit<EditalDocument, 'id'>>({
    name: '',
    type: 'Obrigatório',
    description: '',
    deadline: '',
    status: 'Pendente',
    notes: ''
  });

  const [newProduct, setNewProduct] = useState<Omit<EditalProduct, 'id' | 'totalEstimatedPrice'>>({
    description: '',
    quantity: 0,
    unit: '',
    estimatedUnitPrice: 0,
    specifications: '',
    brand: '',
    model: '',
    supplier: '',
    status: 'Disponível'
  });

  const categories = [
    'Tecnologia', 'Educação', 'Segurança', 'Saúde', 'Infraestrutura', 
    'Administrativo', 'Transporte', 'Meio Ambiente', 'Outros'
  ];

  const documentTypes = ['Obrigatório', 'Opcional', 'Complementar'];
  const documentStatuses = ['Pendente', 'Em Preparação', 'Pronto', 'Enviado'];
  const productStatuses = ['Disponível', 'Em Cotação', 'Indisponível'];
  const units = [
    'unidade', 'kg', 'litro', 'metro', 'hora', 'dia', 'mês', 'ano',
    'resma', 'caixa', 'pacote', 'conjunto', 'licença', 'usuário'
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    const fileType = selectedFile.name.split('.').pop()?.toLowerCase() || 'other';
    const validTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx'];
    const type = validTypes.includes(fileType) ? fileType as any : 'other';

    const newFile: EditalFile = {
      id: `FILE-${Date.now()}`,
      name: selectedFile.name,
      type,
      size: selectedFile.size,
      uploadDate: new Date().toISOString().split('T')[0]
    };

    setFormData(prev => ({
      ...prev,
      files: [...prev.files, newFile]
    }));

    setSelectedFile(null);
  };

  const handleAIAnalysis = async (fileId: string) => {
    setIsAnalyzing(true);
    
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const aiAnalysis = {
        id: `AI-${Date.now()}`,
        fileId,
        analysisDate: new Date().toISOString().split('T')[0],
        summary: "Análise automática do edital realizada com sucesso. Foram identificados pontos-chave importantes para a participação na licitação.",
        keyPoints: [
          "Prazo de submissão: 30 dias",
          "Valor estimado: R$ 2.500.000,00",
          "Documentação obrigatória: 15 itens",
          "Experiência mínima: 3 anos"
        ],
        requirements: [
          "Certificado de Registro Cadastral",
          "Certificado de Capacidade Técnica",
          "Proposta comercial detalhada",
          "Documentação fiscal"
        ],
        deadlines: [
          "Abertura: 15/08/2024",
          "Submissão: 10/08/2024",
          "Validade: 60 dias"
        ],
        values: [
          "Valor total: R$ 2.500.000,00",
          "Garantia: R$ 50.000,00",
          "Prazo de pagamento: 30 dias"
        ],
        risks: [
          "Prazo apertado para documentação",
          "Concorrência forte no setor",
          "Especificações técnicas complexas"
        ],
        opportunities: [
          "Possibilidade de parcerias",
          "Mercado em crescimento",
          "Órgão com histórico positivo"
        ],
        recommendations: [
          "Participar da licitação",
          "Acelerar preparação de documentos",
          "Buscar parcerias estratégicas"
        ],
        confidence: 85,
        processingTime: 3.2
      };

      setFormData(prev => ({
        ...prev,
        files: prev.files.map(file => 
          file.id === fileId 
            ? { ...file, aiAnalysis } 
            : file
        )
      }));
    } catch (error) {
      console.error('Erro na análise AI:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const removeFile = (fileId: string) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter(file => file.id !== fileId)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title: formData.title,
      publicationNumber: formData.publicationNumber,
      publishingBody: formData.publishingBody,
      publishDate: formData.publishDate,
      openingDate: formData.openingDate,
      submissionDeadline: formData.submissionDeadline,
      estimatedValue: formData.estimatedValue,
      category: formData.category,
      status: formData.status as 'Aberto' | 'Em Análise' | 'Fechado' | 'Vencido' | 'Cancelado',
      description: formData.description,
      requirements: formData.requirements,
      documents: formData.documents,
      products: formData.products,
      files: formData.files.length > 0 ? formData.files : undefined,
      notes: formData.notes || undefined,
      attachments: formData.attachments.length > 0 ? formData.attachments : undefined
    });
  };

  const addAttachment = () => {
    if (newAttachment.trim()) {
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, newAttachment.trim()]
      }));
      setNewAttachment('');
    }
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const addDocument = () => {
    if (newDocument.name && newDocument.description) {
      const document: EditalDocument = {
        id: Date.now().toString(),
        ...newDocument
      };

      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, document]
      }));

      setNewDocument({
        name: '',
        type: 'Obrigatório',
        description: '',
        deadline: '',
        status: 'Pendente',
        notes: ''
      });
    }
  };

  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const addProduct = () => {
    if (newProduct.description && newProduct.quantity > 0 && newProduct.unit && newProduct.estimatedUnitPrice > 0) {
      const totalEstimatedPrice = newProduct.quantity * newProduct.estimatedUnitPrice;
      const product: EditalProduct = {
        id: Date.now().toString(),
        ...newProduct,
        totalEstimatedPrice
      };

      setFormData(prev => ({
        ...prev,
        products: [...prev.products, product],
        estimatedValue: prev.estimatedValue + totalEstimatedPrice
      }));

      setNewProduct({
        description: '',
        quantity: 0,
        unit: '',
        estimatedUnitPrice: 0,
        specifications: '',
        brand: '',
        model: '',
        supplier: '',
        status: 'Disponível'
      });
    }
  };

  const removeProduct = (index: number) => {
    const product = formData.products[index];
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
      estimatedValue: prev.estimatedValue - product.totalEstimatedPrice
    }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {edital ? 'Editar Edital' : 'Novo Edital'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Digite o título do edital"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="publicationNumber">Número de Publicação *</Label>
                  <Input
                    id="publicationNumber"
                    value={formData.publicationNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, publicationNumber: e.target.value }))}
                    placeholder="Ex: 001/2024"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="publishingBody">Órgão Publicador *</Label>
                  <Input
                    id="publishingBody"
                    value={formData.publishingBody}
                    onChange={(e) => setFormData(prev => ({ ...prev, publishingBody: e.target.value }))}
                    placeholder="Nome do órgão"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Categoria *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as 'Aberto' | 'Em Análise' | 'Fechado' | 'Vencido' | 'Cancelado' }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Aberto">Aberto</SelectItem>
                      <SelectItem value="Em Análise">Em Análise</SelectItem>
                      <SelectItem value="Fechado">Fechado</SelectItem>
                      <SelectItem value="Vencido">Vencido</SelectItem>
                      <SelectItem value="Cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="estimatedValue">Valor Estimado (R$)</Label>
                  <Input
                    id="estimatedValue"
                    type="number"
                    value={formData.estimatedValue}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedValue: parseFloat(e.target.value) || 0 }))}
                    placeholder="0,00"
                  />
                </div>

                <div>
                  <Label htmlFor="publishDate">Data de Publicação *</Label>
                  <Input
                    id="publishDate"
                    type="date"
                    value={formData.publishDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, publishDate: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="openingDate">Data de Abertura *</Label>
                  <Input
                    id="openingDate"
                    type="date"
                    value={formData.openingDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, openingDate: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="submissionDeadline">Prazo de Entrega *</Label>
                  <Input
                    id="submissionDeadline"
                    type="date"
                    value={formData.submissionDeadline}
                    onChange={(e) => setFormData(prev => ({ ...prev, submissionDeadline: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="mt-4">
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva detalhadamente o edital"
                  rows={4}
                  required
                />
              </div>

              <div className="mt-4">
                <Label htmlFor="requirements">Requisitos</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                  placeholder="Descreva os requisitos para participação"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Documentos */}
          <Card>
            <CardHeader>
              <CardTitle>Documentos Necessários</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
                  <div>
                    <Label>Nome *</Label>
                    <Input
                      value={newDocument.name}
                      onChange={(e) => setNewDocument(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nome do documento"
                    />
                  </div>
                  <div>
                    <Label>Tipo *</Label>
                    <Select value={newDocument.type} onValueChange={(value) => setNewDocument(prev => ({ ...prev, type: value as any }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {documentTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Status *</Label>
                    <Select value={newDocument.status} onValueChange={(value) => setNewDocument(prev => ({ ...prev, status: value as any }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {documentStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Prazo</Label>
                    <Input
                      type="date"
                      value={newDocument.deadline}
                      onChange={(e) => setNewDocument(prev => ({ ...prev, deadline: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Descrição *</Label>
                    <Input
                      value={newDocument.description}
                      onChange={(e) => setNewDocument(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descrição do documento"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button type="button" onClick={addDocument} variant="outline" size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {formData.documents.length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Prazo</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formData.documents.map((doc, index) => (
                        <TableRow key={doc.id}>
                          <TableCell>{doc.name}</TableCell>
                          <TableCell>{doc.type}</TableCell>
                          <TableCell>{doc.status}</TableCell>
                          <TableCell>{doc.deadline || '-'}</TableCell>
                          <TableCell>{doc.description}</TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              onClick={() => removeDocument(index)}
                              variant="ghost"
                              size="sm"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Produtos */}
          <Card>
            <CardHeader>
              <CardTitle>Produtos/Serviços Solicitados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
                  <div>
                    <Label>Descrição *</Label>
                    <Input
                      value={newProduct.description}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descrição do produto"
                    />
                  </div>
                  <div>
                    <Label>Quantidade *</Label>
                    <Input
                      type="number"
                      value={newProduct.quantity}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label>Unidade *</Label>
                    <Select value={newProduct.unit} onValueChange={(value) => setNewProduct(prev => ({ ...prev, unit: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Unidade" />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Preço Unit. *</Label>
                    <Input
                      type="number"
                      value={newProduct.estimatedUnitPrice}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, estimatedUnitPrice: parseFloat(e.target.value) || 0 }))}
                      placeholder="0,00"
                    />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select value={newProduct.status} onValueChange={(value) => setNewProduct(prev => ({ ...prev, status: value as any }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {productStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Fornecedor</Label>
                    <Input
                      value={newProduct.supplier}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, supplier: e.target.value }))}
                      placeholder="Nome do fornecedor"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button type="button" onClick={addProduct} variant="outline" size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {formData.products.length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Quantidade</TableHead>
                        <TableHead>Preço Unit.</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Fornecedor</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formData.products.map((product, index) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{product.description}</div>
                              <div className="text-sm text-gray-500">{product.specifications}</div>
                            </div>
                          </TableCell>
                          <TableCell>{product.quantity} {product.unit}</TableCell>
                          <TableCell>{formatCurrency(product.estimatedUnitPrice)}</TableCell>
                          <TableCell>{formatCurrency(product.totalEstimatedPrice)}</TableCell>
                          <TableCell>{product.status}</TableCell>
                          <TableCell>{product.supplier || '-'}</TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              onClick={() => removeProduct(index)}
                              variant="ghost"
                              size="sm"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upload de Arquivos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileUp className="h-5 w-5" />
                Upload de Arquivos do Edital
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Selecionar Arquivo (PDF, DOC, XLS)</Label>
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    onChange={handleFileSelect}
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    onClick={handleFileUpload} 
                    disabled={!selectedFile}
                    variant="outline"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </div>

              {formData.files.length > 0 && (
                <div className="space-y-2">
                  <Label>Arquivos Anexados</Label>
                  {formData.files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <div>
                          <div className="font-medium">{file.name}</div>
                          <div className="text-sm text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB • {file.uploadDate}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!file.aiAnalysis && (
                          <Button
                            type="button"
                            onClick={() => handleAIAnalysis(file.id)}
                            disabled={isAnalyzing}
                            variant="outline"
                            size="sm"
                          >
                            {isAnalyzing ? (
                              <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                                Analisando...
                              </div>
                            ) : (
                              <>
                                <Brain className="h-4 w-4 mr-2" />
                                Analisar com IA
                              </>
                            )}
                          </Button>
                        )}
                        {file.aiAnalysis && (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-green-600">
                              <Brain className="h-4 w-4" />
                              <span className="text-sm">Analisado</span>
                            </div>
                            <div className="text-sm text-gray-500">
                              {file.aiAnalysis.confidence}% confiança
                            </div>
                          </div>
                        )}
                        <Button
                          type="button"
                          onClick={() => removeFile(file.id)}
                          variant="ghost"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Anexos */}
          <div>
            <Label>Anexos</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newAttachment}
                  onChange={(e) => setNewAttachment(e.target.value)}
                  placeholder="Nome do arquivo (ex: edital.pdf)"
                />
                <Button type="button" onClick={addAttachment} variant="outline" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {formData.attachments.length > 0 && (
                <div className="space-y-1">
                  {formData.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{attachment}</span>
                      </div>
                      <Button
                        type="button"
                        onClick={() => removeAttachment(index)}
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
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Observações adicionais"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit">
              {edital ? 'Atualizar' : 'Criar'} Edital
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditalForm; 