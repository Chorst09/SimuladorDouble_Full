"use client";

import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Partner } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Paperclip, X } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório.'),
  // Adicionado o campo mainContact aqui
  mainContact: z.string().optional(),
  contact: z.string().email('Email de contato inválido.'),
  phone: z.string().optional(),
  status: z.enum(['Ativo', 'Inativo']),
  site: z.string().url().optional().or(z.literal('')),
  login: z.string().optional(),
  password: z.string().optional(),
  products: z.string().optional(),
  sitePartner: z.string().url().optional().or(z.literal('')),
  siteRO: z.string().url().optional().or(z.literal('')),
  templateRO: z.string().optional(),
  procedimentoRO: z.string().optional(),
});

interface PartnerFormProps {
  partner: Partner | null;
  onSave: (data: Partner) => void;
  onCancel: () => void;
  partnerType: 'Distribuidor' | 'Fornecedor';
}

const PartnerForm: React.FC<PartnerFormProps> = ({ partner, onSave, onCancel, partnerType }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: partner || {
      name: '',
      // Adicionado mainContact nos defaultValues
      mainContact: '',
      contact: '',
      phone: '',
      status: 'Ativo',
      site: '',
      login: '',
      password: '',
      products: '',
      sitePartner: '',
      siteRO: '',
      templateRO: '',
      procedimentoRO: '',
    },
  });

  const [fileName, setFileName] = useState(partner?.templateRO || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      form.setValue('templateRO', file.name);
    }
  };

  const handleRemoveFile = () => {
    setFileName('');
    form.setValue('templateRO', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Certifique-se de que mainContact está incluído nos dados salvos
    onSave({ 
      ...values, 
      id: partner ? partner.id : Date.now(), 
      type: partnerType,
      phone: values.phone || '' // Garantir que phone não seja undefined
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pr-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem><FormLabel>Nome do {partnerType}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        {/* Adicionado o FormField para Contato Principal aqui */}
        <FormField control={form.control} name="mainContact" render={({ field }) => (
          <FormItem><FormLabel>Contato Principal</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="contact" render={({ field }) => (
          <FormItem><FormLabel>Email de Contato</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="phone" render={({ field }) => (
          <FormItem><FormLabel>Telefone</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="status" render={({ field }) => (
          <FormItem>
            <FormLabel>Status</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
              <SelectContent><SelectItem value="Ativo">Ativo</SelectItem><SelectItem value="Inativo">Inativo</SelectItem></SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />

        {partnerType === 'Distribuidor' && (
          <>
            <h4 className="text-md font-semibold pt-4 border-t">Informações do Portal</h4>
            <FormField control={form.control} name="site" render={({ field }) => (
              <FormItem><FormLabel>Site de Acesso</FormLabel><FormControl><Input placeholder="https://portal.distribuidor.com" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="login" render={({ field }) => (
                <FormItem><FormLabel>Login</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem><FormLabel>Senha</FormLabel><FormControl><Input type="text" {...field} /></FormControl><FormMessage /></FormItem>
              )} />{/* Alterado type para text */}
            </div>
            <FormField control={form.control} name="products" render={({ field }) => (
              <FormItem><FormLabel>Produtos Principais</FormLabel><FormControl><Textarea placeholder="Ex: Microsoft, Dell, Cisco..." {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </>
        )}

        {partnerType === 'Fornecedor' && (
          <>
            <h4 className="text-md font-semibold pt-4 border-t">Informações de RO</h4>
            <FormField control={form.control} name="sitePartner" render={({ field }) => (
              <FormItem><FormLabel>Site Partner</FormLabel><FormControl><Input placeholder="https://partner.fornecedor.com" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="login" render={({ field }) => (
                <FormItem><FormLabel>Login</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem><FormLabel>Senha</FormLabel><FormControl><Input type="text" {...field} /></FormControl><FormMessage /></FormItem>
              )} />{/* Alterado type para text */}
            </div>
            <FormField control={form.control} name="siteRO" render={({ field }) => (
              <FormItem><FormLabel>Site Abertura de RO</FormLabel><FormControl><Input placeholder="https://partner.fornecedor.com/ro" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="templateRO" render={({ field }) => (
              <FormItem>
                <FormLabel>Template RO</FormLabel>
                <FormControl>
                    <div>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                        {!fileName ? (
                            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                                <Paperclip className="w-4 h-4 mr-2"/>Anexar Arquivo
                            </Button>
                        ) : (
                            <div className="flex items-center justify-between p-2 border rounded-lg">
                                <span className="text-sm truncate">{fileName}</span>
                                <Button type="button" variant="ghost" size="icon" onClick={handleRemoveFile}>
                                    <X className="w-4 h-4"/>
                                </Button>
                            </div>
                        )}
                    </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="procedimentoRO" render={({ field }) => (
              <FormItem><FormLabel>Procedimento para RO</FormLabel><FormControl><Textarea placeholder="Descreva o passo a passo..." {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </>
        )}

        <div className="flex justify-end space-x-4 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button type="submit">Salvar</Button>
        </div>
      </form>
    </Form>
  );
};

export default PartnerForm;
