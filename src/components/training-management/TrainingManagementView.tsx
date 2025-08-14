"use client";

import React, { useState } from 'react';
import { Edit, Trash2, PlusCircle } from 'lucide-react';
import type { Training, Partner } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import TrainingForm from './TrainingForm';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface TrainingManagementViewProps {
  trainings: Training[];
  partners: Partner[];
  onSave: (training: Training) => void;
  onDelete: (id: number) => void;
}

const TrainingManagementView: React.FC<TrainingManagementViewProps> = ({ trainings, partners, onSave, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTraining, setEditingTraining] = useState<Training | null>(null);
    const [typeFilter, setTypeFilter] = useState('all');
    const suppliers = partners.filter(p => p.type === 'Fornecedor');

    const handleOpenModal = (training: Training | null = null) => {
        setEditingTraining(training);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTraining(null);
    };

    const handleSave = (trainingData: Training) => {
        onSave(trainingData);
        handleCloseModal();
    };

    const filteredTrainings = trainings.filter(t => typeFilter === 'all' || t.type === typeFilter);

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <CardTitle className="text-2xl mb-4 sm:mb-0">Gestão de Treinamentos</CardTitle>
                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => handleOpenModal()}>
                                <PlusCircle size={20} className="mr-2" />
                                Novo Treinamento
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>{editingTraining ? "Editar Treinamento" : "Novo Treinamento"}</DialogTitle>
                            </DialogHeader>
                            <TrainingForm training={editingTraining} suppliers={suppliers} onSave={handleSave} onCancel={handleCloseModal} />
                        </DialogContent>
                    </Dialog>
                </div>
                 <div className="flex items-center gap-4 mt-4">
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filtrar por tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os Tipos</SelectItem>
                            <SelectItem value="Comercial">Comercial</SelectItem>
                            <SelectItem value="Técnico">Técnico</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fabricante</TableHead>
                                <TableHead>Treinamento</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Participante</TableHead>
                                <TableHead>Data de Validade</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTrainings.map(training => {
                                const supplier = partners.find(p => p.id === Number(training.supplierId));
                                return (
                                    <TableRow key={training.id}>
                                        <TableCell className="font-medium">{supplier?.name || 'N/A'}</TableCell>
                                        <TableCell>{training.trainingName}</TableCell>
                                        <TableCell>
                                            <Badge variant={training.type === 'Técnico' ? 'default' : 'secondary'} className={training.type === 'Técnico' ? 'bg-blue-500' : 'bg-orange-500'}>
                                                {training.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{training.participantName}</TableCell>
                                        <TableCell>{new Date(training.expiryDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex space-x-1 justify-end">
                                                <Button variant="ghost" size="icon" onClick={() => handleOpenModal(training)}><Edit className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" onClick={() => onDelete(training.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};

export default TrainingManagementView;
