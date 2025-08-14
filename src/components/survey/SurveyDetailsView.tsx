'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

interface SiteSurvey {
  id: string;
  customerName: string;
  address: string;
  surveyType: string;
  details: Record<string, string>;
  createdAt: string;
}

interface SurveyDetailsViewProps {
  survey: SiteSurvey;
  onBack: () => void;
}

export function SurveyDetailsView({ survey, onBack }: SurveyDetailsViewProps) {
  return (
    <div className="container mx-auto py-8">
      <Button variant="ghost" onClick={onBack} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para a Lista
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Detalhes do Site Survey</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Dados do Cliente</h3>
            <p><strong>Cliente:</strong> {survey.customerName}</p>
            <p><strong>Endereço:</strong> {survey.address}</p>
            <p><strong>Tipo de Survey:</strong> {survey.surveyType}</p>
            <p><strong>Data de Criação:</strong> {survey.createdAt}</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Respostas do Formulário</h3>
            {Object.entries(survey.details).map(([key, value]) => (
              <div key={key} className="py-2">
                <p className="font-medium capitalize">{key.replace(/q-|-/g, ' ')}</p>
                <p className="text-muted-foreground pl-4">{value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
