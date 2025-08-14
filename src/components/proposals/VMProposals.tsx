'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import VMCalculator from '@/components/calculators/VMCalculator'; // Importa a calculadora existente

// Interface simplificada para a proposta de VM
interface VMProposal {
    id: string;
    clientName: string;
    totalMonthly: number;
    date: string;
}

const VMProposals: React.FC = () => {
    const [viewMode, setViewMode] = useState<'search' | 'create' | 'edit'>('search');
    const [proposals, setProposals] = useState<VMProposal[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingProposal, setEditingProposal] = useState<VMProposal | null>(null);

    // Carregar propostas do localStorage
    useEffect(() => {
        try {
            const savedProposals = localStorage.getItem('vmProposals');
            if (savedProposals) {
                setProposals(JSON.parse(savedProposals));
            }
        } catch (error) {
            console.error("Falha ao carregar propostas de VM do localStorage", error);
        }
    }, []);

    const handleCreateNew = () => {
        setEditingProposal(null);
        setViewMode('create');
    };

    const handleEdit = (proposal: VMProposal) => {
        setEditingProposal(proposal);
        setViewMode('edit');
    };

    const handleDelete = (proposalId: string) => {
        const updatedProposals = proposals.filter(p => p.id !== proposalId);
        setProposals(updatedProposals);
        localStorage.setItem('vmProposals', JSON.stringify(updatedProposals));
    };

    const handleSaveProposal = (proposalData: Omit<VMProposal, 'id' | 'date'>) => {
        const newProposals = [...proposals];
        const newProposal: VMProposal = {
            ...proposalData,
            id: new Date().toISOString(),
            date: new Date().toLocaleDateString('pt-BR'),
        };
        newProposals.push(newProposal);
        setProposals(newProposals);
        localStorage.setItem('vmProposals', JSON.stringify(newProposals));
        setViewMode('search');
    };

    const filteredProposals = proposals.filter(p =>
        p.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (viewMode === 'create' || viewMode === 'edit') {
        return (
            <VMCalculator 
                // Passar props para a calculadora, se necessário, para salvar ou cancelar
                // Por enquanto, a calculadora será independente.
                // Para integrar, a calculadora precisaria de callbacks como onSave e onCancel.
            />
        );
    }

    return (
        <div className="p-4 md:p-6 bg-background text-foreground">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Buscar Propostas - VM</h1>
                    <p className="text-muted-foreground">Encontre propostas existentes ou crie uma nova.</p>
                </div>
                <Button onClick={handleCreateNew} size="lg">
                    <Plus className="mr-2 h-5 w-5" />
                    Nova Proposta
                </Button>
            </div>

            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                        placeholder="Buscar por cliente ou ID..." 
                        className="pl-10" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead>Total Mensal</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredProposals.length > 0 ? (
                            filteredProposals.map(p => (
                                <TableRow key={p.id}>
                                    <TableCell className="font-medium">{p.id.substring(0, 8)}</TableCell>
                                    <TableCell>{p.clientName}</TableCell>
                                    <TableCell>{p.date}</TableCell>
                                    <TableCell>{`R$ ${p.totalMonthly.toFixed(2)}`}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(p)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">Nenhuma proposta encontrada.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default VMProposals;
