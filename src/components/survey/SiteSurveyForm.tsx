'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type SurveyType = 'fiber' | 'radio' | 'access-point';

interface SurveyData {
  clientName: string;
  address: string;
  contact: string;
  email: string;
  surveyType: SurveyType;
  observations: string;
}

export function SiteSurveyForm() {
  const [surveyType, setSurveyType] = useState<SurveyType>('fiber');
  const [formData, setFormData] = useState<Omit<SurveyData, 'surveyType'>>({ 
    clientName: '',
    address: '',
    contact: '',
    email: '',
    observations: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Survey submitted:', { ...formData, surveyType });
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSuccess(false);
        setFormData({
          clientName: '',
          address: '',
          contact: '',
          email: '',
          observations: ''
        });
      }, 3000);
    }, 1000);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Site Survey Form</CardTitle>
        <CardDescription>Fill in the data for the site survey</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="clientName">Nome do Cliente</Label>
              <Input
                id="clientName"
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                required
                placeholder="Nome do cliente"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact">Contato</Label>
              <Input
                id="contact"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                required
                placeholder="Telefone para contato"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="E-mail para contato"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Endereço</Label>
            <Textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              placeholder="Endereço completo para o levantamento"
              rows={2}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="surveyType">Tipo de Levantamento</Label>
            <Select
              value={surveyType}
              onValueChange={(value: SurveyType) => setSurveyType(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de levantamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fiber">Fibra Óptica</SelectItem>
                <SelectItem value="radio">Enlace de Rádio</SelectItem>
                <SelectItem value="access-point">Rede Wi-Fi (Access Point)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="observations">Observações</Label>
            <Textarea
              id="observations"
              name="observations"
              value={formData.observations}
              onChange={handleChange}
              placeholder="Informações adicionais ou requisitos especiais"
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando...' : 'Salvar Levantamento'}
            </Button>
          </div>
          
          {isSuccess && (
            <div className="p-4 bg-green-50 text-green-700 rounded-md">
              Levantamento salvo com sucesso!
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
