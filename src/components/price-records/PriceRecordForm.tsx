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
import { X, Plus, FileText, Trash2 } from 'lucide-react';
import { PriceRecord, PriceRecordItem } from '@/lib/types';

interface PriceRecordFormProps {
  priceRecord?: PriceRecord;
  onSubmit: (priceRecord: Omit<PriceRecord, 'id'>) => void;
  onCancel: () => void;
}

const PriceRecordForm: React.FC<PriceRecordFormProps> = ({ priceRecord, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: priceRecord?.title || '',
    client: priceRecord?.client || '',
    type: priceRecord?.type || 'Ata de Registro de Preços',
    description: priceRecord?.description || '',
    status: priceRecord?.status || 'Ativo',
    publishDate: priceRecord?.publishDate || new Date().toISOString().split('T')[0],
    validityDate: priceRecord?.validityDate || '',
    renewalDate: priceRecord?.renewalDate || '',
    totalValue: priceRecord?.totalValue || 0,
    accountManager: priceRecord?.accountManager || '',
    category: priceRecord?.category || '',
    items: priceRecord?.items || [],
    participants: priceRecord?.participants || [],
    attachments: priceRecord?.attachments || [],
    notes: priceRecord?.notes || ''
  });

  const [newAttachment, setNewAttachment] = useState('');
  const [newParticipant, setNewParticipant] = useState('');
  const [newItem, setNewItem] = useState<Omit<PriceRecordItem, 'id' | 'totalPrice'>>({
    description: '',
    unit: '',
    quantity: 0,
    unitPrice: 0,
    supplier: '',
    brand: '',
    model: ''
  });

  const categories = [
    'Tecnologia', 'Serviços', 'Educação', 'Saúde', 'Segurança', 
    'Administrativo', 'Infraestrutura', 'Transporte', 'Outros'
  ];

  const accountManagers = [
    'João da Silva', 'Maria Oliveira', 'Carlos Pereira', 
    'Ana Costa', 'Pedro Santos', 'Lucia Ferreira'
  ];

  const units = [
    'unidade', 'kg', 'litro', 'metro', 'hora', 'dia', 'mês', 'ano',
    'resma', 'caixa', 'pacote', 'conjunto', 'licença', 'usuário'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title: formData.title,
      client: formData.client,
      type: formData.type as 'Ata de Registro de Preços' | 'Pregão Eletrônico' | 'Concorrência',
      description: formData.description,
      status: formData.status as 'Ativo' | 'Suspenso' | 'Vencido' | 'Cancelado' | 'Renovado',
      publishDate: formData.publishDate,
      validityDate: formData.validityDate,
      renewalDate: formData.renewalDate || undefined,
      totalValue: formData.totalValue,
      accountManager: formData.accountManager,
      category: formData.category,
      items: formData.items,
      participants: formData.participants,
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

  const addParticipant = () => {
    if (newParticipant.trim()) {
      setFormData(prev => ({
        ...prev,
        participants: [...prev.participants, newParticipant.trim()]
      }));
      setNewParticipant('');
    }
  };

  const removeParticipant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.filter((_, i) => i !== index)
    }));
  };

  const addItem = () => {
    if (newItem.description && newItem.unit && newItem.quantity > 0 && newItem.unitPrice > 0 && newItem.supplier) {
      const totalPrice = newItem.quantity * newItem.unitPrice;
      const item: PriceRecordItem = {
        id: Date.now().toString(),
        ...newItem,
        totalPrice
      };

      setFormData(prev => ({
        ...prev,
        items: [...prev.items, item],
        totalValue: prev.totalValue + totalPrice
      }));

      setNewItem({
        description: '',
        unit: '',
        quantity: 0,
        unitPrice: 0,
        supplier: '',
        brand: '',
        model: ''
      });
    }
  };

  const removeItem = (index: number) => {
    const item = formData.items[index];
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
      totalValue: prev.totalValue - item.totalPrice
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
            {priceRecord ? 'Editar Ata de Registro de Preços' : 'Nova Ata de Registro de Preços'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Digite o título da ata"
                required
              />
            </div>

            <div>
              <Label htmlFor="client">Cliente *</Label>
              <Input
                id="client"
                value={formData.client}
                onChange={(e) => setFormData(prev => ({ ...prev, client: e.target.value }))}
                placeholder="Nome do cliente"
                required
              />
            </div>

            <div>
              <Label htmlFor="type">Tipo *</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as 'Ata de Registro de Preços' | 'Pregão Eletrônico' | 'Concorrência' }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ata de Registro de Preços">Ata de Registro de Preços</SelectItem>
                  <SelectItem value="Pregão Eletrônico">Pregão Eletrônico</SelectItem>
                  <SelectItem value="Concorrência">Concorrência</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status *</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as 'Ativo' | 'Suspenso' | 'Vencido' | 'Cancelado' | 'Renovado' }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Suspenso">Suspenso</SelectItem>
                  <SelectItem value="Vencido">Vencido</SelectItem>
                  <SelectItem value="Cancelado">Cancelado</SelectItem>
                  <SelectItem value="Renovado">Renovado</SelectItem>
                </SelectContent>
              </Select>
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
              <Label htmlFor="validityDate">Data de Validade *</Label>
              <Input
                id="validityDate"
                type="date"
                value={formData.validityDate}
                onChange={(e) => setFormData(prev => ({ ...prev, validityDate: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="renewalDate">Data de Renovação</Label>
              <Input
                id="renewalDate"
                type="date"
                value={formData.renewalDate}
                onChange={(e) => setFormData(prev => ({ ...prev, renewalDate: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="totalValue">Valor Total (R$)</Label>
              <Input
                id="totalValue"
                type="number"
                value={formData.totalValue}
                onChange={(e) => setFormData(prev => ({ ...prev, totalValue: parseFloat(e.target.value) || 0 }))}
                placeholder="0,00"
                readOnly
              />
            </div>

            <div>
              <Label htmlFor="accountManager">Gerente de Conta *</Label>
              <Select 
                value={formData.accountManager} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, accountManager: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o gerente" />
                </SelectTrigger>
                <SelectContent>
                  {accountManagers.map((manager) => (
                    <SelectItem key={manager} value={manager}>
                      {manager}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
          </div>

          <div>
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva detalhadamente a ata de registro de preços"
              rows={4}
              required
            />
          </div>

          {/* Itens da Ata */}
          <Card>
            <CardHeader>
              <CardTitle>Itens da Ata</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
                  <div>
                    <Label>Descrição *</Label>
                    <Input
                      value={newItem.description}
                      onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descrição do item"
                    />
                  </div>
                  <div>
                    <Label>Unidade *</Label>
                    <Select value={newItem.unit} onValueChange={(value) => setNewItem(prev => ({ ...prev, unit: value }))}>
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
                    <Label>Quantidade *</Label>
                    <Input
                      type="number"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label>Preço Unitário *</Label>
                    <Input
                      type="number"
                      value={newItem.unitPrice}
                      onChange={(e) => setNewItem(prev => ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }))}
                      placeholder="0,00"
                    />
                  </div>
                  <div>
                    <Label>Fornecedor *</Label>
                    <Input
                      value={newItem.supplier}
                      onChange={(e) => setNewItem(prev => ({ ...prev, supplier: e.target.value }))}
                      placeholder="Nome do fornecedor"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button type="button" onClick={addItem} variant="outline" size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {formData.items.length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Unidade</TableHead>
                        <TableHead>Quantidade</TableHead>
                        <TableHead>Preço Unit.</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Fornecedor</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formData.items.map((item, index) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.description}</TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                          <TableCell>{formatCurrency(item.totalPrice)}</TableCell>
                          <TableCell>{item.supplier}</TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              onClick={() => removeItem(index)}
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

          {/* Participantes */}
          <div>
            <Label>Participantes</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newParticipant}
                  onChange={(e) => setNewParticipant(e.target.value)}
                  placeholder="Nome do participante"
                />
                <Button type="button" onClick={addParticipant} variant="outline" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {formData.participants.length > 0 && (
                <div className="space-y-1">
                  {formData.participants.map((participant, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{participant}</span>
                      <Button
                        type="button"
                        onClick={() => removeParticipant(index)}
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

          <div>
            <Label>Anexos</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newAttachment}
                  onChange={(e) => setNewAttachment(e.target.value)}
                  placeholder="Nome do arquivo (ex: ata.pdf)"
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

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit">
              {priceRecord ? 'Atualizar' : 'Criar'} Ata
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PriceRecordForm; 