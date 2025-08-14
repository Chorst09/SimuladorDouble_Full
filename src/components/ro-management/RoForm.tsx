"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { RO, Partner } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const formSchema = z.object({
  supplierId: z.string().min(1, 'Selecione um fabricante.'),
  roNumber: z.string().min(1, 'O número do RO é obrigatório.'),
  openDate: z.string().min(1, 'A data de abertura é obrigatória.'),
  expiryDate: z.string().min(1, 'A data de expiração é obrigatória.'),
  clientName: z.string().min(1, 'O nome do cliente é obrigatório.'),
  product: z.string().min(1, 'O produto é obrigatório.'),
  value: z.coerce.number().min(0, 'O valor deve ser positivo.'),
});

interface RoFormProps {
  ro: RO | null;
  suppliers: Partner[];
  onSave: (data: RO) => void;
  onCancel: () => void;
}

const RoForm: React.FC<RoFormProps> = ({ ro, suppliers, onSave, onCancel }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: ro
      ? { ...ro, supplierId: String(ro.supplierId) }
      : {
        supplierId: '',
        roNumber: '',
        openDate: '',
        expiryDate: '',
        clientName: '',
        product: '',
        value: 0,
      },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onSave({ ...values, id: ro ? ro.id : Date.now(), supplierId: Number(values.supplierId) });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pr-4">
        <FormField control={form.control} name="supplierId" render={({ field }) => (
          <FormItem>
            <FormLabel>Fabricante</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Selecione um fabricante" /></SelectTrigger></FormControl>
              <SelectContent>
                {suppliers.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="roNumber" render={({ field }) => (
          <FormItem><FormLabel>Nº do RO</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="openDate" render={({ field }) => (
            <FormItem><FormLabel>Data de Abertura</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="expiryDate" render={({ field }) => (
            <FormItem><FormLabel>Data de Expiração</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <FormField control={form.control} name="clientName" render={({ field }) => (
          <FormItem><FormLabel>Nome do Cliente</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="product" render={({ field }) => (
          <FormItem><FormLabel>Produto</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="value" render={({ field }) => (
          <FormItem><FormLabel>Valor (R$)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="flex justify-end space-x-4 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button type="submit">Salvar</Button>
        </div>
      </form>
    </Form>
  );
};

export default RoForm;
