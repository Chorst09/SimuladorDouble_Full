"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RFP } from '@/lib/types';

interface RFPFormProps {
    rfp?: RFP;
    onSubmit: (rfpData: Omit<RFP, 'id'>) => void;
    onCancel: () => void;
}

const RFPForm: React.FC<RFPFormProps> = ({ rfp, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState<Omit<RFP, 'id'>>({
        title: '',
        client: '',
        type: 'RFP',
        description: '',
        status: 'Aberto',
        publishDate: new Date().toISOString().split('T')[0],
        deadlineDate: '',
        submissionDate: '',
        value: 0,
        accountManager: '',
        category: '',
        requirements: '',
        attachments: [],
        notes: ''
    });

    useEffect(() => {
        if (rfp) {
            setFormData({
                title: rfp.title,
                client: rfp.client,
                type: rfp.type,
                description: rfp.description,
                status: rfp.status,
                publishDate: rfp.publishDate,
                deadlineDate: rfp.deadlineDate,
                submissionDate: rfp.submissionDate || '',
                value: rfp.value || 0,
                accountManager: rfp.accountManager,
                category: rfp.category,
                requirements: rfp.requirements,
                attachments: rfp.attachments || [],
                notes: rfp.notes || ''
            });
        }
    }, [rfp]);

    const handleInputChange = (field: keyof Omit<RFP, 'id'>, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Dialog open={true} onOpenChange={onCancel}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {rfp ? 'Editar RFP/RFI' : 'Novo RFP/RFI'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="title">Título *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="client">Cliente *</Label>
                            <Input
                                id="client"
                                value={formData.client}
                                onChange={(e) => handleInputChange('client', e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="type">Tipo *</Label>
                            <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="RFP">RFP</SelectItem>
                                    <SelectItem value="RFI">RFI</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="status">Status *</Label>
                            <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Aberto">Aberto</SelectItem>
                                    <SelectItem value="Em Análise">Em Análise</SelectItem>
                                    <SelectItem value="Respondido">Respondido</SelectItem>
                                    <SelectItem value="Fechado">Fechado</SelectItem>
                                    <SelectItem value="Vencido">Vencido</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="publishDate">Data de Publicação *</Label>
                            <Input
                                id="publishDate"
                                type="date"
                                value={formData.publishDate}
                                onChange={(e) => handleInputChange('publishDate', e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="deadlineDate">Data Limite *</Label>
                            <Input
                                id="deadlineDate"
                                type="date"
                                value={formData.deadlineDate}
                                onChange={(e) => handleInputChange('deadlineDate', e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="submissionDate">Data de Submissão</Label>
                            <Input
                                id="submissionDate"
                                type="date"
                                value={formData.submissionDate}
                                onChange={(e) => handleInputChange('submissionDate', e.target.value)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="value">Valor Estimado (R$)</Label>
                            <Input
                                id="value"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.value}
                                onChange={(e) => handleInputChange('value', parseFloat(e.target.value) || 0)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="accountManager">Gerente de Conta *</Label>
                            <Input
                                id="accountManager"
                                value={formData.accountManager}
                                onChange={(e) => handleInputChange('accountManager', e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="category">Categoria *</Label>
                            <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione uma categoria" />
                                </SelectTrigger>
                                <SelectContent>
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

                    <div>
                        <Label htmlFor="description">Descrição *</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            rows={4}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="requirements">Requisitos *</Label>
                        <Textarea
                            id="requirements"
                            value={formData.requirements}
                            onChange={(e) => handleInputChange('requirements', e.target.value)}
                            rows={4}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="notes">Observações</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => handleInputChange('notes', e.target.value)}
                            rows={3}
                        />
                    </div>

                    <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Cancelar
                        </Button>
                        <Button type="submit">
                            {rfp ? 'Atualizar' : 'Criar'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default RFPForm;