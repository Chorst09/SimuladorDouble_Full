'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { NetworkDevice } from '../types/topology';

const deviceTypes = [
  'olt', 'ont', 'router', 'switch', 'ap', 'controller', 'tower', 
  'antenna', 'appliance', 'cloud', 'splitter', 'client', 'wan'
];

const formSchema = z.object({
  label: z.string().min(2, { message: 'O nome deve ter pelo menos 2 caracteres.' }),
  type: z.enum(deviceTypes as [string, ...string[]], { required_error: 'Selecione um tipo de dispositivo.' })
});

interface EditDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateDevice: (data: z.infer<typeof formSchema>) => void;
  device: NetworkDevice | null;
}

export function EditDeviceModal({ isOpen, onClose, onUpdateDevice, device }: EditDeviceModalProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (device) {
      form.reset({
        label: device.label,
        type: device.type,
      });
    }
  }, [device, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onUpdateDevice(values);
  };

  if (!device) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Dispositivo</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Dispositivo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Roteador Principal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Dispositivo</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {deviceTypes.map(type => (
                        <SelectItem key={type} value={type} className="capitalize">
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">Cancelar</Button>
              </DialogClose>
              <Button type="submit">Salvar Alterações</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
