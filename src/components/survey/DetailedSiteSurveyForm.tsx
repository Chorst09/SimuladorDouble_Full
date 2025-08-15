'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from 'react';
import { TopologyViewer } from '@/components/topology/TopologyViewer';
import { TopologyConfig } from '../topology/types/topology';

interface DetailedSiteSurveyFormProps {
  surveyType?: string;
  customerName?: string;
  address?: string;
  onSubmit: (data: Record<string, string>) => void;
  onBack: () => void;
}

export function DetailedSiteSurveyForm({ surveyType, customerName = '', address = '', onSubmit, onBack }: DetailedSiteSurveyFormProps) {
  const [equipmentQuantities, setEquipmentQuantities] = useState({
    towers: 0,
    antennas: 0,
    routers: 0,
    switches: 0,
    aps: 0,
    controllers: 0,
  });

  const [topologyConfig, setTopologyConfig] = useState<TopologyConfig | null>(null);

  useEffect(() => {
    if (surveyType) {
      setTopologyConfig({
        type: surveyType as any,
        customerName,
        address,
        customizations: equipmentQuantities,
      });
    }
  }, [surveyType, customerName, address, equipmentQuantities]);

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setEquipmentQuantities(prev => ({ ...prev, [name.replace('q-equip-', '')]: parseInt(value, 10) || 0 }));
  };
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = value as string;
    });
    onSubmit(data);
  };
  return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Topology Diagram */}
      {topologyConfig && (
        <div className="lg:order-2">
          <TopologyViewer
            config={topologyConfig}
            showExportOptions={true}
            className="sticky top-4"
          />
        </div>
      )}

      {/* Survey Form */}
      <div className="lg:order-1">
        <form className="space-y-8" onSubmit={handleSubmit}>
      <Accordion type="multiple" defaultValue={['general', surveyType].filter(Boolean) as string[]}>
        {/* Seção 1: Questionamentos Gerais */}
        <AccordionItem value="general">
          <AccordionTrigger className="text-xl font-semibold">1. Questionamentos Gerais e de Análise do Cliente</AccordionTrigger>
          <AccordionContent className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="q-bandwidth">Necessidades de Largura de Banda: Qual a demanda de banda atual e futura (próximos 3-5 anos)? Quantos usuários e dispositivos utilizarão a rede simultaneamente?</Label>
              <Textarea id="q-bandwidth" name="q-bandwidth" placeholder="Descreva a demanda de banda..." required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="q-critical-apps">Aplicações Críticas: Quais aplicações são essenciais para a operação do negócio?</Label>
              <Textarea id="q-critical-apps" name="q-critical-apps" placeholder="VoIP, videoconferência, sistemas de gestão..." required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="q-coverage-area">Área de Cobertura: Quais são as áreas exatas que precisam de cobertura?</Label>
              <Textarea id="q-coverage-area" name="q-coverage-area" placeholder="Especifique as áreas e prioridades..." required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="q-existing-infra">Infraestrutura Existente: Já existe alguma infraestrutura de rede no local?</Label>
              <Textarea id="q-existing-infra" name="q-existing-infra" placeholder="Descreva a condição, documentação e se há plantas baixas..." required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="q-power">Alimentação Elétrica: Existem pontos de energia próximos e qual a estabilidade?</Label>
              <Textarea id="q-power" name="q-power" placeholder="Descreva a disponibilidade de tomadas, nobreaks e plano de contingência..." required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="q-security">Segurança: Quais são os requisitos de segurança da rede?</Label>
              <Textarea id="q-security" name="q-security" placeholder="Necessidade de VLANs para convidados, funcionários, etc..." required />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Seção de Equipamentos */}
        <AccordionItem value="equipment">
          <AccordionTrigger className="text-xl font-semibold">Equipamentos da Topologia</AccordionTrigger>
          <AccordionContent className="space-y-6 pt-4">
            <p className="text-sm text-muted-foreground">Informe a quantidade de cada equipamento para gerar a topologia inicial.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="q-equip-towers">Torres</Label>
                                <Input id="q-equip-towers" name="q-equip-towers" type="number" min="0" value={equipmentQuantities.towers} onChange={handleQuantityChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="q-equip-antennas">Antenas/Rádios</Label>
                                <Input id="q-equip-antennas" name="q-equip-antennas" type="number" min="0" value={equipmentQuantities.antennas} onChange={handleQuantityChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="q-equip-routers">Roteadores</Label>
                                <Input id="q-equip-routers" name="q-equip-routers" type="number" min="0" value={equipmentQuantities.routers} onChange={handleQuantityChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="q-equip-switches">Switches</Label>
                                <Input id="q-equip-switches" name="q-equip-switches" type="number" min="0" value={equipmentQuantities.switches} onChange={handleQuantityChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="q-equip-aps">Access Points (APs)</Label>
                                <Input id="q-equip-aps" name="q-equip-aps" type="number" min="0" value={equipmentQuantities.aps} onChange={handleQuantityChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="q-equip-controllers">Controladoras</Label>
                                <Input id="q-equip-controllers" name="q-equip-controllers" type="number" min="0" value={equipmentQuantities.controllers} onChange={handleQuantityChange} />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Seção 2: Fibra Óptica */}
        {surveyType === 'fiber' && (
          <AccordionItem value="fiber">
            <AccordionTrigger className="text-xl font-semibold">2. Site Survey para Internet via Fibra Óptica</AccordionTrigger>
            <AccordionContent className="space-y-6 pt-4">
              <h3 className="font-semibold text-lg">2.1. Análise Externa</h3>
              <div className="space-y-2 pl-4">
                <Label htmlFor="q-fiber-availability">Disponibilidade da Rede: Existe rede de fibra óptica da operadora próxima?</Label>
                <Textarea id="q-fiber-availability" name="q-fiber-availability" placeholder="Na rua, no poste mais próximo..." required />
                <Label htmlFor="q-fiber-route">Rota do Cabo: Qual o trajeto desde o ponto de terminação até a entrada do prédio?</Label>
                <Textarea id="q-fiber-route" name="q-fiber-route" placeholder="Descreva o trajeto..." required />
                <Label htmlFor="q-fiber-obstacles">Obstáculos e Licenças: Existem obstruções ou necessidade de licenças?</Label>
                <Textarea id="q-fiber-obstacles" name="q-fiber-obstacles" placeholder="Árvores, postes, licenças de prefeitura/condomínio..." required />
              </div>
              <h3 className="font-semibold text-lg">2.2. Análise Interna</h3>
              <div className="space-y-2 pl-4">
                  <Label htmlFor="q-fiber-bep">Ponto de Entrada (BEP): Onde o cabo entrará na edificação?</Label>
                  <Textarea id="q-fiber-bep" name="q-fiber-bep" placeholder="Local seguro, protegido de intempéries..." required />
                  <Label htmlFor="q-fiber-pathway">Infraestrutura de Passagem: Existem dutos, canaletas ou forros disponíveis?</Label>
                  <Textarea id="q-fiber-pathway" name="q-fiber-pathway" placeholder="Estado de conservação da infraestrutura interna..." required />
                  <Label htmlFor="q-fiber-distance">Distâncias e Curvaturas: Qual a distância total do cabo e há curvas acentuadas?</Label>
                  <Textarea id="q-fiber-distance" name="q-fiber-distance" placeholder="Verificar raio mínimo de curvatura..." required />
                  <Label htmlFor="q-fiber-rack">Local do Rack e Equipamentos: Onde serão instalados?</Label>
                  <Textarea id="q-fiber-rack" name="q-fiber-rack" placeholder="Local ventilado, seguro, com espaço..." required />
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Seção 3: Rádio Enlace */}
        {surveyType === 'radio' && (
          <AccordionItem value="radio">
            <AccordionTrigger className="text-xl font-semibold">3. Site Survey para Internet via Rádio Enlace</AccordionTrigger>
            <AccordionContent className="space-y-6 pt-4">
              <h3 className="font-semibold text-lg">3.1. Análise de Viabilidade e Visada</h3>
              <div className="space-y-2 pl-4">
                  <Label htmlFor="q-radio-los">Linha de Visada (LoS): Existe uma linha de visada clara e desobstruída?</Label>
                  <Textarea id="q-radio-los" name="q-radio-los" placeholder="Utilizar ferramentas de geolocalização..." required />
                  <Label htmlFor="q-radio-fresnel">Zona de Fresnel: A primeira Zona de Fresnel está livre de obstruções?</Label>
                  <Textarea id="q-radio-fresnel" name="q-radio-fresnel" placeholder="Prédios, árvores, morros..." required />
                  <Label htmlFor="q-radio-distance">Distância do Enlace: Qual a distância exata entre os pontos?</Label>
                  <Textarea id="q-radio-distance" name="q-radio-distance" placeholder="Determinará potência e tipo de antena..." required />
                  <Label htmlFor="q-radio-height">Altura de Instalação: Qual a altura necessária para as antenas?</Label>
                  <Textarea id="q-radio-height" name="q-radio-height" placeholder="Garantir visada e livrar Zona de Fresnel..." required />
              </div>
              <h3 className="font-semibold text-lg">3.2. Análise de Rádio Frequência (RF)</h3>
              <div className="space-y-2 pl-4">
                  <Label htmlFor="q-radio-spectrum">Análise de Espectro: Há outras redes de rádio operando nas proximidades?</Label>
                  <Textarea id="q-radio-spectrum" name="q-radio-spectrum" placeholder="Nível de interferência (ruído) em 5 GHz, 2.4 GHz..." required />
                  <Label htmlFor="q-radio-channel">Seleção de Canal: Qual o canal menos congestionado?</Label>
                  <Textarea id="q-radio-channel" name="q-radio-channel" placeholder="Baseado na análise de espectro..." required />
              </div>
              <h3 className="font-semibold text-lg">3.3. Análise da Estrutura Física</h3>
              <div className="space-y-2 pl-4">
                  <Label htmlFor="q-radio-location">Local de Instalação: Onde as antenas serão fixadas?</Label>
                  <Textarea id="q-radio-location" name="q-radio-location" placeholder="Torre, mastro, telhado, parede..." required />
                  <Label htmlFor="q-radio-structure">Estrutura de Suporte: A estrutura é robusta o suficiente?</Label>
                  <Textarea id="q-radio-structure" name="q-radio-structure" placeholder="Peso e carga de vento da antena..." required />
                  <Label htmlFor="q-radio-grounding">Aterramento: Existe um sistema de aterramento adequado?</Label>
                  <Textarea id="q-radio-grounding" name="q-radio-grounding" placeholder="Proteção contra descargas atmosféricas..." required />
                  <Label htmlFor="q-radio-cable">Passagem do Cabo: Por onde passará o cabo de rede?</Label>
                  <Textarea id="q-radio-cable" name="q-radio-cable" placeholder="Proteção do cabo Cat5e/Cat6 contra intempéries..." required />
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Seção 4: Access Points (Wi-Fi) */}
        {surveyType === 'wifi' && (
          <AccordionItem value="wifi">
            <AccordionTrigger className="text-xl font-semibold">4. Site Survey para Access Points (Wi-Fi)</AccordionTrigger>
            <AccordionContent className="space-y-6 pt-4">
              <h3 className="font-semibold text-lg">4.1. Site Survey Preditivo (Planejamento)</h3>
              <div className="space-y-2 pl-4">
                  <Label htmlFor="q-wifi-floorplan">Upload da Planta Baixa: Inserir planta baixa em software de simulação.</Label>
                  <Textarea id="q-wifi-floorplan" name="q-wifi-floorplan" placeholder="Ekahau, NetSpot..." required />
                  <Label htmlFor="q-wifi-materials">Definição dos Materiais: Identificar materiais de construção.</Label>
                  <Textarea id="q-wifi-materials" name="q-wifi-materials" placeholder="Concreto, drywall, vidro..." required />
                  <Label htmlFor="q-wifi-simulation">Simulação de Cobertura: Posicionar virtualmente os APs.</Label>
                  <Textarea id="q-wifi-simulation" name="q-wifi-simulation" placeholder="Prever mapa de calor, sobreposição de canais..." required />
              </div>
              <h3 className="font-semibold text-lg">4.2. Site Survey Físico (Verificação em Campo)</h3>
              <div className="space-y-2 pl-4">
                  <Label htmlFor="q-wifi-walkthrough">Walkthrough (Inspeção Visual): Identificar obstáculos não previstos.</Label>
                  <Textarea id="q-wifi-walkthrough" name="q-wifi-walkthrough" placeholder="Móveis, espelhos, aquários, estruturas metálicas..." required />
                  <Label htmlFor="q-wifi-spectrum-analysis">Análise de Espectro: Identificar fontes de interferência de RF não-Wi-Fi.</Label>
                  <Textarea id="q-wifi-spectrum-analysis" name="q-wifi-spectrum-analysis" placeholder="Fornos de micro-ondas, telefones sem fio, Bluetooth..." required />
                  <Label htmlFor="q-wifi-neighbor-networks">Verificação de Redes Vizinhas: Mapear redes Wi-Fi vizinhas.</Label>
                  <Textarea id="q-wifi-neighbor-networks" name="q-wifi-neighbor-networks" placeholder="Planejar estratégia de canais para minimizar interferência..." required />
              </div>
              <h3 className="font-semibold text-lg">4.3. Site Survey Ativo e Passivo ("AP on a Stick")</h3>
              <div className="space-y-2 pl-4">
                  <Label htmlFor="q-wifi-passive-survey">Levantamento Passivo: Medir força do sinal e ruído de redes existentes.</Label>
                  <Textarea id="q-wifi-passive-survey" name="q-wifi-passive-survey" placeholder="'Escutar' o ambiente de RF..." required />
                  <Label htmlFor="q-wifi-active-survey">Levantamento Ativo ("AP on a Stick"): Validar cobertura e performance.</Label>
                  <Textarea id="q-wifi-active-survey" name="q-wifi-active-survey" placeholder="Testes de conexão, throughput, latência, roaming..." required />
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Seção 5: SD-WAN */}
        {surveyType === 'sdwan' && (
          <AccordionItem value="sdwan">
            <AccordionTrigger className="text-xl font-semibold">5. Site Survey para SD-WAN</AccordionTrigger>
            <AccordionContent className="space-y-6 pt-4">
              <h3 className="font-semibold text-lg">5.1. Análise de Conectividade WAN</h3>
              <div className="space-y-2 pl-4">
                  <Label htmlFor="q-sdwan-connections">Conexões WAN Disponíveis: Quais tipos de conexão WAN estão disponíveis no local?</Label>
                  <Textarea id="q-sdwan-connections" name="q-sdwan-connections" placeholder="MPLS, Internet banda larga, 4G/5G, fibra dedicada..." required />
                  <Label htmlFor="q-sdwan-bandwidth">Largura de Banda por Conexão: Qual a capacidade de cada link WAN?</Label>
                  <Textarea id="q-sdwan-bandwidth" name="q-sdwan-bandwidth" placeholder="Especificar upload/download de cada conexão..." required />
                  <Label htmlFor="q-sdwan-redundancy">Redundância: Quantas conexões WAN são necessárias para redundância?</Label>
                  <Textarea id="q-sdwan-redundancy" name="q-sdwan-redundancy" placeholder="Primária, secundária, balanceamento de carga..." required />
                  <Label htmlFor="q-sdwan-sla">SLA e Qualidade: Quais são os requisitos de SLA para cada aplicação?</Label>
                  <Textarea id="q-sdwan-sla" name="q-sdwan-sla" placeholder="Latência, jitter, perda de pacotes para VoIP, vídeo..." required />
              </div>
              <h3 className="font-semibold text-lg">5.2. Análise de Sites Remotos</h3>
              <div className="space-y-2 pl-4">
                  <Label htmlFor="q-sdwan-sites">Sites a Conectar: Quantos e quais sites precisam ser conectados?</Label>
                  <Textarea id="q-sdwan-sites" name="q-sdwan-sites" placeholder="Matriz, filiais, home office, data centers..." required />
                  <Label htmlFor="q-sdwan-traffic">Padrões de Tráfego: Qual o fluxo de dados entre os sites?</Label>
                  <Textarea id="q-sdwan-traffic" name="q-sdwan-traffic" placeholder="Site-to-site, hub-and-spoke, any-to-any..." required />
                  <Label htmlFor="q-sdwan-applications">Aplicações Críticas: Quais aplicações precisam de priorização?</Label>
                  <Textarea id="q-sdwan-applications" name="q-sdwan-applications" placeholder="ERP, CRM, videoconferência, backup..." required />
              </div>
              <h3 className="font-semibold text-lg">5.3. Infraestrutura Local</h3>
              <div className="space-y-2 pl-4">
                  <Label htmlFor="q-sdwan-appliance">Local do Appliance SD-WAN: Onde será instalado o equipamento?</Label>
                  <Textarea id="q-sdwan-appliance" name="q-sdwan-appliance" placeholder="Rack, sala de TI, ventilação, energia..." required />
                  <Label htmlFor="q-sdwan-lan">Integração com LAN: Como será a integração com a rede local?</Label>
                  <Textarea id="q-sdwan-lan" name="q-sdwan-lan" placeholder="VLANs, segmentação, firewall existente..." required />
                  <Label htmlFor="q-sdwan-management">Gerenciamento: Como será feito o monitoramento e gerenciamento?</Label>
                  <Textarea id="q-sdwan-management" name="q-sdwan-management" placeholder="Cloud controller, portal web, SNMP..." required />
                  <Label htmlFor="q-sdwan-security">Segurança: Quais recursos de segurança são necessários?</Label>
                  <Textarea id="q-sdwan-security" name="q-sdwan-security" placeholder="Firewall integrado, VPN, IPS, filtro de conteúdo..." required />
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>

          <div className="flex justify-end gap-4 pt-8">
            <Button type="button" variant="outline" size="lg" onClick={onBack}>Voltar</Button>
            <Button type="submit" size="lg">Salvar Site Survey</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
