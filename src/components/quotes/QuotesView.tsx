"use client";

import React, { useState } from 'react';
import { Edit, Trash2, PlusCircle, FileDown, User } from 'lucide-react';
import type { Quote, Partner } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import QuoteForm from './QuoteForm';
import { Input } from '@/components/ui/input';

interface QuotesViewProps {
  quotes: Quote[];
  partners: Partner[];
  onSave: (quote: Quote) => void;
  onDelete: (id: string) => void;
}

const QuotesView: React.FC<QuotesViewProps> = ({ quotes, partners, onSave, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
    const [clientFilter, setClientFilter] = useState('');
    const [accountManagerFilter, setAccountManagerFilter] = useState('');

    const handleOpenModal = (quote: Quote | null = null) => {
        setEditingQuote(quote);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingQuote(null);
    };

    const handleSave = (quoteData: Quote) => {
        onSave(quoteData);
        handleCloseModal();
    };

    const getStatusBadge = (status: Quote['status']) => {
        switch (status) {
            case 'Aprovado': return <Badge className="bg-green-500 hover:bg-green-600">Aprovado</Badge>;
            case 'Enviado': return <Badge className="bg-blue-500 hover:bg-blue-600">Enviado</Badge>;
            case 'Pendente': return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pendente</Badge>;
            // Removed 'Aguardando Distribuidor' status
            case 'Rejeitado': return <Badge variant="destructive">Rejeitado</Badge>;
            default: return <Badge variant="secondary">Status</Badge>;
        }
    };

    const filteredQuotes = quotes.filter(quote => {
        const clientMatch = quote.client.toLowerCase().includes(clientFilter.toLowerCase());
        const amMatch = quote.accountManager ? quote.accountManager.toLowerCase().includes(accountManagerFilter.toLowerCase()) : accountManagerFilter === '';
        return clientMatch && amMatch;
    });
    
    return (
        <Card className="shadow-lg">
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <CardTitle className="text-2xl mb-4 sm:mb-0">Orçamentos</CardTitle>
                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => handleOpenModal()}>
                                <PlusCircle size={20} className="mr-2" />
                                Novo Orçamento
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>{editingQuote ? "Editar Orçamento" : "Adicionar Novo Orçamento"}</DialogTitle>
                            </DialogHeader>
                            <QuoteForm
                                quote={editingQuote}
                                onSave={handleSave}
                                onCancel={handleCloseModal}
                                partners={partners}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                    <Input 
                        placeholder="Filtrar por cliente..."
                        value={clientFilter}
                        onChange={(e) => setClientFilter(e.target.value)}
                        className="max-w-sm"
                    />
                    <Input 
                        placeholder="Filtrar por gerente de contas..."
                        value={accountManagerFilter}
                        onChange={(e) => setAccountManagerFilter(e.target.value)}
                        className="max-w-sm"
                    />
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Cliente / Projeto</TableHead>
                                <TableHead className="hidden sm:table-cell">Distribuidor</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-center">Arquivos</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredQuotes.map(quote => {
                                const distributor = partners.find(p => p.id === Number(quote.distributorId));
                                return (
                                    <TableRow key={quote.id}>
                                        <TableCell>
                                            <div className="font-semibold">{quote.client}</div>
                                            <div className="text-sm text-muted-foreground">{quote.projectName}</div>
                                            {quote.accountManager && (
                                                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                                    <User size={12} /> {quote.accountManager}
                                                </div>
                                            )}
                                            <div className="text-xs text-muted-foreground font-code mt-1">{quote.id}</div>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">{distributor?.name || 'N/A'}</TableCell>
                                        <TableCell className="font-medium">
                                            {quote.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </TableCell>
                                        <TableCell>{getStatusBadge(quote.status)}</TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex justify-center items-center gap-2">
                                                {quote.quotationFile && (
                                                    <Button variant="outline" size="icon" onClick={() => alert(`Download: ${quote.quotationFile}`)}>
                                                        <FileDown className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {quote.pricingFile && (
                                                    <Button variant="outline" size="icon" onClick={() => alert(`Download: ${quote.pricingFile}`)}>
                                                        <FileDown className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {!quote.quotationFile && !quote.pricingFile && <span className="text-muted-foreground">-</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex space-x-1 justify-end">
                                                <Button variant="ghost" size="icon" onClick={() => handleOpenModal(quote)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => onDelete(quote.id)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
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

export default QuotesView;
