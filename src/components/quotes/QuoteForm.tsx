"use client";

import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Quote, Partner } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Paperclip, X } from 'lucide-react';

const formSchema = z.object({
  client: z.string().min(1, 'O nome do cliente é obrigatório.'),
  projectName: z.string().min(1, 'O nome do projeto é obrigatório.'),
  accountManager: z.string().optional(),
  total: z.coerce.number().min(0, 'O valor total deve ser positivo.'),
  date: z.string().min(1, 'A data é obrigatória.'),
  status: z.enum(['Pendente', 'Enviado', 'Aprovado', 'Rejeitado']),
  partnerId: z.string().optional(),
  quotationFile: z.string().optional(),
  pricingFile: z.string().optional(),
});

interface QuoteFormProps {
  quote: Quote | null;
  partners: Partner[];
  onSave: (data: Quote) => void;
  onCancel: () => void;
}

const QuoteForm: React.FC<QuoteFormProps> = ({ quote, partners, onSave, onCancel }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: quote 
      ? { ...quote, partnerId: String(quote.partnerId || '') }
      : {
        client: '',
        projectName: '',
        accountManager: '',
        total: 0,
        date: new Date().toISOString().split('T')[0],
        status: 'Pendente',
        partnerId: '',
        quotationFile: '',
        pricingFile: '',
      },
  });

  const [quotationFileName, setQuotationFileName] = useState(quote?.quotationFile || '');
  const [pricingFileName, setPricingFileName] = useState(quote?.pricingFile || '');
  const quotationFileInputRef = useRef<HTMLInputElement>(null);
  const pricingFileInputRef = useRef<HTMLInputElement>(null);

  // Removed distributor filtering since distributors no longer exist

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'quotation' | 'pricing') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (fileType === 'quotation') {
        setQuotationFileName(file.name);
        form.setValue('quotationFile', file.name);
      } else {
        setPricingFileName(file.name);
        form.setValue('pricingFile', file.name);
      }
    }
  };

  const handleRemoveFile = (fileType: 'quotation' | 'pricing') => {
    if (fileType === 'quotation') {
      setQuotationFileName('');
      form.setValue('quotationFile', '');
      if (quotationFileInputRef.current) quotationFileInputRef.current.value = "";
    } else {
      setPricingFileName('');
      form.setValue('pricingFile', '');
      if (pricingFileInputRef.current) pricingFileInputRef.current.value = "";
    }
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onSave({ 
      ...values, 
      id: quote ? quote.id : `ORC-${String(Date.now()).slice(-5)}`,
      partnerId: values.partnerId ? Number(values.partnerId) : 0
    });
  };

  const FileUploadButton = ({ name, fileName, fileInputRef, onChange, onRemove }: any) => (
     <div>
        <input type="file" ref={fileInputRef} onChange={onChange} className="hidden" />
        {!fileName ? (
            <Button type="button" variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                <Paperclip className="w-4 h-4 mr-2"/>Anexar {name}
            </Button>
        ) : (
            <div className="flex items-center justify-between p-2 border rounded-lg">
                <span className="text-sm truncate">{fileName}</span>
                <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
                    <X className="w-4 h-4"/>
                </Button>
            </div>
        )}
    </div>
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pr-4">
        <FormField control={form.control} name="client" render={({ field }) => (
          <FormItem><FormLabel>Nome do Cliente</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="projectName" render={({ field }) => (
          <FormItem><FormLabel>Nome do Projeto</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="accountManager" render={({ field }) => (
          <FormItem><FormLabel>Gerente de Contas</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="total" render={({ field }) => (
            <FormItem><FormLabel>Valor Total (R$)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="date" render={({ field }) => (
            <FormItem><FormLabel>Data</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <FormField control={form.control} name="status" render={({ field }) => (
          <FormItem>
            <FormLabel>Status</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
              <SelectContent>
                <SelectItem value="Pendente">Pendente</SelectItem>
                // Removed 'Aguardando Distribuidor' status
                <SelectItem value="Enviado">Enviado</SelectItem>
                <SelectItem value="Aprovado">Aprovado</SelectItem>
                <SelectItem value="Rejeitado">Rejeitado</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
        
        <h4 className="text-md font-semibold pt-4 border-t">Cotação e Precificação</h4>
        
        {/* Removed distributor selection field */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="quotationFile" render={({ field }) => (
              <FormItem>
                <FormLabel>Arquivo da Cotação</FormLabel>
                <FormControl>
                    <FileUploadButton name="Cotação" fileName={quotationFileName} fileInputRef={quotationFileInputRef} onChange={(e:any) => handleFileChange(e, 'quotation')} onRemove={() => handleRemoveFile('quotation')} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="pricingFile" render={({ field }) => (
              <FormItem>
                <FormLabel>Arquivo de Precificação</FormLabel>
                <FormControl>
                     <FileUploadButton name="Precificação" fileName={pricingFileName} fileInputRef={pricingFileInputRef} onChange={(e:any) => handleFileChange(e, 'pricing')} onRemove={() => handleRemoveFile('pricing')} />
                </FormControl>
              </FormItem>
            )} />
        </div>
        
        <div className="flex justify-end space-x-4 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button type="submit">Salvar</Button>
        </div>
      </form>
    </Form>
  );
};

export default QuoteForm;
