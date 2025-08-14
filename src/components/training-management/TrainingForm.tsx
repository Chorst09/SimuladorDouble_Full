"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Training, Partner } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const formSchema = z.object({
  supplierId: z.string().min(1, 'Selecione um fabricante.'),
  trainingName: z.string().min(1, 'O nome do treinamento é obrigatório.'),
  type: z.enum(['Comercial', 'Técnico']),
  participantName: z.string().min(1, 'O nome do participante é obrigatório.'),
  expiryDate: z.string().min(1, 'A data de validade é obrigatória.'),
});

interface TrainingFormProps {
  training: Training | null;
  suppliers: Partner[];
  onSave: (data: Training) => void;
  onCancel: () => void;
}

const TrainingForm: React.FC<TrainingFormProps> = ({ training, suppliers, onSave, onCancel }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: training
      ? { ...training, supplierId: String(training.supplierId) }
      : {
        supplierId: '',
        trainingName: '',
        type: 'Comercial',
        participantName: '',
        expiryDate: '',
      },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onSave({ ...values, id: training ? training.id : Date.now(), supplierId: Number(values.supplierId) });
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
        <FormField control={form.control} name="trainingName" render={({ field }) => (
          <FormItem><FormLabel>Nome do Treinamento</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="type" render={({ field }) => (
            <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                    <SelectItem value="Comercial">Comercial</SelectItem>
                    <SelectItem value="Técnico">Técnico</SelectItem>
                </SelectContent>
                </Select>
                <FormMessage />
            </FormItem>
            )} />
            <FormField control={form.control} name="participantName" render={({ field }) => (
              <FormItem><FormLabel>Nome do Participante</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
        </div>
        <FormField control={form.control} name="expiryDate" render={({ field }) => (
          <FormItem><FormLabel>Data de Validade</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="flex justify-end space-x-4 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button type="submit">Salvar</Button>
        </div>
      </form>
    </Form>
  );
};

export default TrainingForm;
