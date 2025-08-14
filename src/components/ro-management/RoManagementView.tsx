"use client";

import React, { useState } from 'react';
import { Edit, Trash2, PlusCircle } from 'lucide-react';
import type { RO, Partner } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import RoForm from './RoForm';

interface RoManagementViewProps {
  ros: RO[];
  partners: Partner[];
  onSave: (ro: RO) => void;
  onDelete: (id: number) => void;
}

const RoManagementView: React.FC<RoManagementViewProps> = ({ ros, partners, onSave, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRo, setEditingRo] = useState<RO | null>(null);
    const suppliers = partners.filter(p => p.type === 'Fornecedor');

    const handleOpenModal = (ro: RO | null = null) => {
        setEditingRo(ro);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingRo(null);
    };

    const handleSave = (roData: RO) => {
        onSave(roData);
        handleCloseModal();
    };

    return (
        <Card className="shadow-lg">
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <CardTitle className="text-2xl mb-4 sm:mb-0">Gestão de RO's</CardTitle>
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => handleOpenModal()}>
                            <PlusCircle size={20} className="mr-2" />
                            Novo RO
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{editingRo ? "Editar RO" : "Novo Registro de Oportunidade"}</DialogTitle>
                        </DialogHeader>
                        <RoForm ro={editingRo} suppliers={suppliers} onSave={handleSave} onCancel={handleCloseModal} />
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fabricante</TableHead>
                                <TableHead>Nº do RO</TableHead>
                                <TableHead>Expiração</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Produto</TableHead>
                                <TableHead>Valor</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {ros.map(ro => {
                                const supplier = partners.find(p => p.id === Number(ro.supplierId));
                                return (
                                    <TableRow key={ro.id}>
                                        <TableCell className="font-medium">{supplier?.name || 'N/A'}</TableCell>
                                        <TableCell>{ro.roNumber}</TableCell>
                                        <TableCell>{new Date(ro.expiryDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</TableCell>
                                        <TableCell>{ro.clientName}</TableCell>
                                        <TableCell>{ro.product}</TableCell>
                                        <TableCell className="font-medium">{ro.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex space-x-1 justify-end">
                                                <Button variant="ghost" size="icon" onClick={() => handleOpenModal(ro)}><Edit className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" onClick={() => onDelete(ro.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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

export default RoManagementView;
