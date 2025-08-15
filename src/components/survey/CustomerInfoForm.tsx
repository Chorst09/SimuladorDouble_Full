'use client';

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useState } from 'react';

interface CustomerInfoFormProps {
  onSubmit: (data: { customerName: string; address: string; surveyType: string }) => void;
  onBack: () => void;
}

export function CustomerInfoForm({ onSubmit, onBack }: CustomerInfoFormProps) {
  const [surveyType, setSurveyType] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = {
      customerName: formData.get('customerName') as string,
      address: formData.get('address') as string,
      surveyType: surveyType,
    };
    if (data.customerName && data.address && data.surveyType) {
      onSubmit(data);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados do Cliente e Tipo de Survey</CardTitle>
        <CardDescription>Preencha as informações do cliente para iniciar o levantamento.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="customerName">Nome do Cliente</Label>
            <Input id="customerName" name="customerName" placeholder="Nome do Cliente" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Endereço do Site Survey</Label>
            <Input id="address" name="address" placeholder="Endereço Completo" required />
          </div>
          <div className="space-y-2">
            <Label>Tipo do Survey</Label>
            <Select onValueChange={setSurveyType} required name="surveyType">
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de levantamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fiber">Internet via Fibra Óptica</SelectItem>
                <SelectItem value="radio">Internet via Rádio Enlace</SelectItem>
                <SelectItem value="wifi">Access Points (Wi-Fi)</SelectItem>
                <SelectItem value="sdwan">SD-WAN</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end pt-4">
            <Button type="button" variant="outline" size="lg" onClick={onBack}>Voltar</Button>
            <Button type="submit" size="lg">Avançar</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
