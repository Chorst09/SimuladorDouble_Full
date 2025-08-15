'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { CustomerInfoForm } from '@/components/survey/CustomerInfoForm';
import { DetailedSiteSurveyForm } from '@/components/survey/DetailedSiteSurveyForm';
// import { TopologyViewer } from '@/components/topology/TopologyViewer';
// import { TopologyConfig } from '@/components/topology/types/topology';
import { SurveyDetailsView } from '@/components/survey/SurveyDetailsView';
import { Plus, ArrowLeft, Trash2, Eye } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';

interface CustomerData {
  customerName: string;
  address: string;
  surveyType: string;
}


interface SiteSurvey extends CustomerData {
  id: string;
  details: Record<string, string>;
  createdAt: string;
}

export default function SiteSurveyPage() {
  const [viewMode, setViewMode] = useState('list'); // 'list', 'customer', 'survey', 'details', 'topology'
  const [surveys, setSurveys] = useState<SiteSurvey[]>([]);
  const [currentCustomerData, setCurrentCustomerData] = useState<CustomerData | null>(null);
    const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [surveyToDelete, setSurveyToDelete] = useState<string | null>(null);
    const [selectedSurvey, setSelectedSurvey] = useState<SiteSurvey | null>(null);
  const [topologyConfig, setTopologyConfig] = useState<TopologyConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
    const fetchSurveys = async () => {
      if (!db) {
        toast({ title: "Erro de Conexão", description: "Não foi possível conectar ao banco de dados.", variant: "destructive" });
        setIsLoading(false);
        return;
      }
      try {
        const surveysCollection = collection(db, 'site_surveys');
        const q = query(surveysCollection, orderBy("createdAt", "desc"));
        const surveySnapshot = await getDocs(q);
        const surveyList = surveySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as SiteSurvey[];
        setSurveys(surveyList);
      } catch (error) {
        console.error("Error fetching surveys: ", error);
        toast({ title: "Erro ao Carregar", description: "Não foi possível buscar os surveys.", variant: "destructive" });
      }
      setIsLoading(false);
    };

    fetchSurveys();
  }, [toast]);

  const handleCreateNew = () => {
    setViewMode('customer');
  };

  const handleCustomerSubmit = (data: CustomerData) => {
    setCurrentCustomerData(data);
    setViewMode('survey');
  };

    const handleSurveySubmit = async (details: Record<string, string>) => {
    if (!currentCustomerData) return;

        const newSurvey = {
      ...currentCustomerData,
      details,
      createdAt: new Date().toISOString(),
    };

        if (!db) {
      toast({ 
        title: "Erro de Conexão", 
        description: "Não foi possível conectar ao banco de dados. Verifique sua conexão.", 
        variant: "destructive" 
      });
      return;
    }
    
    try {
            const docRef = await addDoc(collection(db, 'site_surveys'), newSurvey as Omit<SiteSurvey, 'id'>);
            setSurveys(prev => [{ ...newSurvey, id: docRef.id } as SiteSurvey, ...prev]);

    toast({
      title: "Site Survey Salvo!",
              description: `O survey para o cliente ${newSurvey.customerName} foi criado com sucesso.`,
      });
      
      setViewMode('list');
      setCurrentCustomerData(null);
    } catch (error: any) {
      console.error("Error adding document: ", error);
      
      let errorMessage = "Não foi possível salvar o survey.";
      if (error?.code === 'permission-denied') {
        errorMessage = "Erro de permissão. Verifique as regras do Firestore no console do Firebase.";
      } else if (error?.code === 'unavailable') {
        errorMessage = "Serviço temporariamente indisponível. Tente novamente.";
      }
      
      toast({ 
        title: "Erro ao Salvar", 
        description: errorMessage, 
        variant: "destructive" 
      });
    }
  };

    const handleDelete = async (surveyId: string) => {
        if (!db) return;
    try {
      await deleteDoc(doc(db, 'site_surveys', surveyId));
      const updatedSurveys = surveys.filter(s => s.id !== surveyId);
      setSurveys(updatedSurveys);
    toast({
      title: "Site Survey Excluído",
              description: "O levantamento foi removido com sucesso.",
        variant: "destructive",
      });
    } catch (error) {
      console.error("Error deleting document: ", error);
      toast({ title: "Erro ao Excluir", description: "Não foi possível excluir o survey.", variant: "destructive" });
    }
    setSurveyToDelete(null);
    setIsDeleteDialogOpen(false);
  };

    const openDeleteDialog = (surveyId: string) => {
    setSurveyToDelete(surveyId);
    setIsDeleteDialogOpen(true);
  };

  const handleGenerateTopology = (survey: SiteSurvey) => {
    const deviceQuantities = {
      towers: parseInt(survey.details['q-equip-towers'] || '0', 10),
      antennas: parseInt(survey.details['q-equip-antennas'] || '0', 10),
      routers: parseInt(survey.details['q-equip-routers'] || '0', 10),
      switches: parseInt(survey.details['q-equip-switches'] || '0', 10),
      aps: parseInt(survey.details['q-equip-aps'] || '0', 10),
      controllers: parseInt(survey.details['q-equip-controllers'] || '0', 10),
    };

    const config: TopologyConfig = {
      type: survey.surveyType.toLowerCase() as any,
      customerName: survey.customerName,
      address: survey.address,
      customizations: { 
        ...survey.details,
        ...deviceQuantities
      }
    };
    setTopologyConfig(config);
    setViewMode('topology');
  };

  const handleViewDetails = (survey: SiteSurvey) => {
    setSelectedSurvey(survey);
    setViewMode('details');
  };

  const handleBack = () => {
    if (viewMode === 'survey') {
      setViewMode('customer');
    } else if (viewMode === 'customer') {
      setViewMode('list');
    } else if (viewMode === 'details') {
      setSelectedSurvey(null);
      setViewMode('list');
    } else if (viewMode === 'topology') {
      setViewMode('details');
    }
  };

  if (viewMode === 'customer') {
    return (
      <div className="container mx-auto py-8">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <CustomerInfoForm onSubmit={handleCustomerSubmit} onBack={handleBack} />
      </div>
    );
  }

    if (viewMode === 'topology' && selectedSurvey && topologyConfig) {
    return (
      <div className="container mx-auto py-8">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Detalhes
        </Button>
        <h2 className="text-2xl font-bold mb-4">Topologia de Rede para {selectedSurvey.customerName}</h2>
        <div style={{ height: '70vh', border: '1px solid #ccc', borderRadius: '8px' }}>
          <TopologyViewer config={topologyConfig} />
        </div>
      </div>
    );
  }

  if (viewMode === 'details' && selectedSurvey) {
    return <SurveyDetailsView survey={selectedSurvey} onBack={handleBack} onGenerateTopology={handleGenerateTopology} />;
  }

  if (viewMode === 'survey' && currentCustomerData) {
    return (
      <div className="container mx-auto py-8">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Dados do Cliente
        </Button>
        <DetailedSiteSurveyForm
          surveyType={currentCustomerData.surveyType}
          customerName={currentCustomerData.customerName}
          address={currentCustomerData.address}
          onSubmit={handleSurveySubmit}
          onBack={handleBack}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Site Survey</h1>
        <Button onClick={handleCreateNew} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Criar Novo Site Survey
        </Button>
      </div>
      
      {isLoading ? (
        <div className="text-center py-16">
          <p>Carregando surveys...</p>
        </div>
      ) : surveys.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {surveys.map((survey) => (
            <Card key={survey.id}>
              <CardHeader>
                <CardTitle className="truncate">{survey.customerName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground truncate"><strong>Endereço:</strong> {survey.address}</p>
                <p className="text-sm text-muted-foreground"><strong>Tipo:</strong> {survey.surveyType}</p>
                <p className="text-xs text-muted-foreground pt-2">Criado em: {new Date(survey.createdAt).toLocaleString('pt-BR')}</p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" size="icon" onClick={() => handleViewDetails(survey)}>
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="icon" onClick={() => openDeleteDialog(survey.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold">Nenhum Site Survey Encontrado</h2>
          <p className="text-muted-foreground text-sm mt-2">Clique em "Criar Novo Site Survey" para começar.</p>
        </div>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o Site Survey e removerá os dados de nossos servidores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSurveyToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => surveyToDelete && handleDelete(surveyToDelete)}>Continuar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
