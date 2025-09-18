"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Server, Cpu, MemoryStick, HardDrive, AlertTriangle, ArrowRight, Info } from 'lucide-react';

interface P2VResult {
  recommendedVcpus: number;
  recommendedRam: number;
  cpuOverhead: number;
  ramOverhead: number;
  hypervisorReserve: number;
  efficiency: number;
  notes: string[];
}

interface LicensingInfo {
  totalPhysicalCores: number;
  baseCoresToLicense: number;
  totalPacksNeeded: number;
  licenseRightsText: string;
}

const PhysicalVirtualConversion = () => {
  // Physical server inputs - Exemplo: 2 CPUs x 16 cores x 2.9GHz x 48 threads x 64GB RAM
  const [physicalCpus, setPhysicalCpus] = useState<number>(2);
  const [coresPerCpu, setCoresPerCpu] = useState<number>(16);
  const [cpuFrequency, setCpuFrequency] = useState<number>(2.9);
  const [hasHyperThreading, setHasHyperThreading] = useState<boolean>(true);
  const [physicalRam, setPhysicalRam] = useState<number>(64);

  // Virtualization platform
  const [hypervisor, setHypervisor] = useState<string>('vmware');
  const [workloadType, setWorkloadType] = useState<string>('general');
  const [performanceTarget, setPerformanceTarget] = useState<string>('optimal');

  // Licensing inputs
  const [edition, setEdition] = useState<string>('standard');
  const [vmCount, setVmCount] = useState<number>(1);

  // Results
  const [p2vResult, setP2vResult] = useState<P2VResult>({
    recommendedVcpus: 0,
    recommendedRam: 0,
    cpuOverhead: 0,
    ramOverhead: 0,
    hypervisorReserve: 0,
    efficiency: 0,
    notes: []
  });

  const [licensing, setLicensing] = useState<LicensingInfo>({
    totalPhysicalCores: 0,
    baseCoresToLicense: 0,
    totalPacksNeeded: 0,
    licenseRightsText: ''
  });

  const calculateP2V = () => {
    const totalPhysicalCores = physicalCpus * coresPerCpu;
    const totalLogicalCores = hasHyperThreading ? totalPhysicalCores * 2 : totalPhysicalCores;
    
    // Hypervisor overhead and efficiency factors (based on industry standards)
    const hypervisorOverheads = {
      vmware: { cpu: 0.05, ram: 0.08, reserve: 4 }, // VMware vSphere
      hyperv: { cpu: 0.03, ram: 0.06, reserve: 2 }, // Microsoft Hyper-V
      kvm: { cpu: 0.02, ram: 0.04, reserve: 1 },    // KVM/QEMU
      xen: { cpu: 0.03, ram: 0.05, reserve: 2 }     // Citrix XenServer
    };

    // Workload efficiency factors
    const workloadEfficiency = {
      database: 0.7,    // Database servers need more dedicated resources
      web: 0.85,        // Web servers can share resources better
      general: 0.8,     // General purpose applications
      development: 0.9, // Development environments are more flexible
      vdi: 0.75        // VDI workloads have specific requirements
    };

    // Performance target adjustments
    const performanceAdjustments = {
      conservative: 0.7, // Conservative approach - more resources
      optimal: 0.8,      // Balanced approach
      aggressive: 0.9    // Aggressive consolidation
    };

    const overhead = hypervisorOverheads[hypervisor as keyof typeof hypervisorOverheads];
    const efficiency = workloadEfficiency[workloadType as keyof typeof workloadEfficiency];
    const perfAdjustment = performanceAdjustments[performanceTarget as keyof typeof performanceAdjustments];

    // Calculate CPU recommendation
    const cpuOverheadPercent = overhead.cpu * 100;
    const availableCpuAfterOverhead = totalLogicalCores * (1 - overhead.cpu);
    const recommendedVcpus = Math.floor(availableCpuAfterOverhead * efficiency * perfAdjustment);

    // Calculate RAM recommendation
    const ramOverheadPercent = overhead.ram * 100;
    const hypervisorReserveGb = overhead.reserve;
    const availableRamAfterReserve = physicalRam - hypervisorReserveGb;
    const availableRamAfterOverhead = availableRamAfterReserve * (1 - overhead.ram);
    const recommendedRam = Math.floor(availableRamAfterOverhead * efficiency * perfAdjustment);

    // Generate recommendations and notes
    const notes = [];
    
    if (hypervisor === 'vmware') {
      notes.push('VMware vSphere: Considera overhead de CPU (~5%) e RAM (~8%)');
      notes.push('Reserva recomendada: 4GB para vCenter/ESXi');
    } else if (hypervisor === 'hyperv') {
      notes.push('Hyper-V: Overhead menor de CPU (~3%) e RAM (~6%)');
      notes.push('Reserva recomendada: 2GB para host Windows');
    }

    if (workloadType === 'database') {
      notes.push('Workload de banco: Requer mais recursos dedicados');
    } else if (workloadType === 'vdi') {
      notes.push('VDI: Considera picos de uso e boot storms');
    }

    if (performanceTarget === 'conservative') {
      notes.push('Abordagem conservadora: Mais recursos para garantir performance');
    } else if (performanceTarget === 'aggressive') {
      notes.push('Consolidação agressiva: Máximo aproveitamento de recursos');
    }

    // CPU frequency consideration
    if (cpuFrequency < 2.0) {
      notes.push('⚠️ CPU com frequência baixa - considere menos vCPUs');
    } else if (cpuFrequency > 3.5) {
      notes.push('✓ CPU com alta frequência - boa para virtualização');
    }

    setP2vResult({
      recommendedVcpus: Math.max(1, recommendedVcpus),
      recommendedRam: Math.max(1, recommendedRam),
      cpuOverhead: cpuOverheadPercent,
      ramOverhead: ramOverheadPercent,
      hypervisorReserve: hypervisorReserveGb,
      efficiency: efficiency * 100,
      notes
    });
  };

  const calculateLicensing = () => {
    const totalPhysicalCores = physicalCpus * coresPerCpu;
    const minCoresByProcessor = physicalCpus * 8; // Mínimo 8 cores por processador
    const baseCoresToLicense = Math.max(totalPhysicalCores, minCoresByProcessor, 16); // Mínimo 16 cores total

    let totalPacksNeeded = 0;
    let licenseRightsText = '';

    if (edition === 'datacenter') {
      totalPacksNeeded = Math.ceil(baseCoresToLicense / 2);
      licenseRightsText = `Datacenter: Cobre VMs ilimitadas do Windows Server neste host físico.`;
    } else { // standard
      const licenseSets = Math.ceil(vmCount / 2); // Cada licença Standard cobre 2 VMs
      const totalCoresToLicenseForStandard = baseCoresToLicense * licenseSets;
      totalPacksNeeded = Math.ceil(totalCoresToLicenseForStandard / 2);
      licenseRightsText = `Standard: Cobre até ${licenseSets * 2} VMs do Windows Server (${licenseSets} conjunto${licenseSets > 1 ? 's' : ''} de licenças).`;
    }

    setLicensing({
      totalPhysicalCores,
      baseCoresToLicense,
      totalPacksNeeded,
      licenseRightsText
    });
  };

  useEffect(() => {
    calculateP2V();
  }, [physicalCpus, coresPerCpu, cpuFrequency, hasHyperThreading, physicalRam, hypervisor, workloadType, performanceTarget]);

  useEffect(() => {
    calculateLicensing();
  }, [physicalCpus, coresPerCpu, edition, vmCount]);

  const formatNumber = (num: number) => {
    return num.toLocaleString('pt-BR');
  };

  const getHypervisorName = (value: string) => {
    const names: { [key: string]: string } = {
      vmware: 'VMware vSphere/ESXi',
      hyperv: 'Microsoft Hyper-V',
      kvm: 'KVM/QEMU (Linux)',
      xen: 'Citrix XenServer'
    };
    return names[value] || value;
  };

  const getWorkloadName = (value: string) => {
    const names: { [key: string]: string } = {
      database: 'Servidor de Banco de Dados',
      web: 'Servidor Web/Aplicação',
      general: 'Uso Geral/Misto',
      development: 'Desenvolvimento/Teste',
      vdi: 'VDI/Desktop Virtual'
    };
    return names[value] || value;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-6">
      {/* P2V Calculator */}
      <Card className="bg-white dark:bg-slate-900">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-2">
            <Server className="h-8 w-8 text-blue-600" />
            <ArrowRight className="h-6 w-6 text-slate-400" />
            <Server className="h-8 w-8 text-green-600" />
            Calculadora de Conversão Física para Virtual (P2V)
          </CardTitle>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Converta especificações de servidor físico para configuração de máquina virtual otimizada.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Physical Server Specs */}
            <Card className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Server className="h-5 w-5 text-blue-600" />
                  Servidor Físico
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="physicalCpus" className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Número de CPUs (Sockets)
                  </Label>
                  <Input
                    id="physicalCpus"
                    type="number"
                    value={physicalCpus}
                    onChange={(e) => setPhysicalCpus(parseInt(e.target.value) || 1)}
                    min="1"
                    max="8"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="coresPerCpu" className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Núcleos por CPU
                  </Label>
                  <Input
                    id="coresPerCpu"
                    type="number"
                    value={coresPerCpu}
                    onChange={(e) => setCoresPerCpu(parseInt(e.target.value) || 1)}
                    min="1"
                    max="64"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="cpuFrequency" className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Frequência CPU (GHz)
                  </Label>
                  <Input
                    id="cpuFrequency"
                    type="number"
                    step="0.1"
                    value={cpuFrequency}
                    onChange={(e) => setCpuFrequency(parseFloat(e.target.value) || 1.0)}
                    min="1.0"
                    max="5.0"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="hyperThreading" className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Hyper-Threading
                  </Label>
                  <Select value={hasHyperThreading.toString()} onValueChange={(value) => setHasHyperThreading(value === 'true')}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">Desativado</SelectItem>
                      <SelectItem value="true">Ativado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="physicalRam" className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Memória RAM Total (GB)
                  </Label>
                  <Input
                    id="physicalRam"
                    type="number"
                    value={physicalRam}
                    onChange={(e) => setPhysicalRam(parseInt(e.target.value) || 1)}
                    min="1"
                    max="2048"
                    className="mt-1"
                  />
                </div>
                
                {/* Physical Server Summary */}
                <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Resumo Físico:</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Total de Núcleos:</strong> {physicalCpus * coresPerCpu}</p>
                    <p><strong>Total de Threads:</strong> {hasHyperThreading ? (physicalCpus * coresPerCpu * 2) : (physicalCpus * coresPerCpu)}</p>
                    <p><strong>Potência Total:</strong> {(physicalCpus * coresPerCpu * cpuFrequency).toFixed(1)} GHz</p>
                    <p><strong>RAM Total:</strong> {physicalRam} GB</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Virtualization Settings */}
            <Card className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <MemoryStick className="h-5 w-5 text-purple-600" />
                  Configuração de Virtualização
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="hypervisor" className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Plataforma de Virtualização
                  </Label>
                  <Select value={hypervisor} onValueChange={setHypervisor}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vmware">VMware vSphere/ESXi</SelectItem>
                      <SelectItem value="hyperv">Microsoft Hyper-V</SelectItem>
                      <SelectItem value="kvm">KVM/QEMU (Linux)</SelectItem>
                      <SelectItem value="xen">Citrix XenServer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="workloadType" className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Tipo de Workload
                  </Label>
                  <Select value={workloadType} onValueChange={setWorkloadType}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="database">Servidor de Banco de Dados</SelectItem>
                      <SelectItem value="web">Servidor Web/Aplicação</SelectItem>
                      <SelectItem value="general">Uso Geral/Misto</SelectItem>
                      <SelectItem value="development">Desenvolvimento/Teste</SelectItem>
                      <SelectItem value="vdi">VDI/Desktop Virtual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="performanceTarget" className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Objetivo de Performance
                  </Label>
                  <Select value={performanceTarget} onValueChange={setPerformanceTarget}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">Conservador (Máxima Performance)</SelectItem>
                      <SelectItem value="optimal">Otimizado (Balanceado)</SelectItem>
                      <SelectItem value="aggressive">Agressivo (Máxima Consolidação)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Platform Info */}
                <div className="mt-6 p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                  <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Configuração Selecionada:
                  </h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Hypervisor:</strong> {getHypervisorName(hypervisor)}</p>
                    <p><strong>Workload:</strong> {getWorkloadName(workloadType)}</p>
                    <p><strong>Abordagem:</strong> {performanceTarget === 'conservative' ? 'Conservadora' : performanceTarget === 'optimal' ? 'Otimizada' : 'Agressiva'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* VM Recommendation Results */}
            <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
              <CardHeader className="text-center">
                <CardTitle className="text-lg font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2">
                  <Server className="h-5 w-5 text-green-600" />
                  Configuração VM Recomendada
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Main Recommendations */}
                <div className="text-center space-y-4">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">vCPUs Recomendados</p>
                    <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                      {p2vResult.recommendedVcpus}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      de {hasHyperThreading ? (physicalCpus * coresPerCpu * 2) : (physicalCpus * coresPerCpu)} threads disponíveis
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">RAM Recomendada</p>
                    <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                      {p2vResult.recommendedRam} GB
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      de {physicalRam} GB disponíveis
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Overhead Details */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-700 dark:text-slate-300">Overhead e Reservas:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-slate-600 dark:text-slate-400">
                      <p>Overhead CPU:</p>
                      <p>Overhead RAM:</p>
                      <p>Reserva Hypervisor:</p>
                      <p>Eficiência Workload:</p>
                    </div>
                    <div className="text-right font-medium">
                      <p>{p2vResult.cpuOverhead.toFixed(1)}%</p>
                      <p>{p2vResult.ramOverhead.toFixed(1)}%</p>
                      <p>{p2vResult.hypervisorReserve} GB</p>
                      <p>{p2vResult.efficiency.toFixed(0)}%</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Recommendations and Notes */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-700 dark:text-slate-300">Observações:</h4>
                  <div className="space-y-1">
                    {p2vResult.notes.map((note, index) => (
                      <p key={index} className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {note}
                      </p>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Licensing Calculator */}
      <Card className="bg-white dark:bg-slate-900">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-2">
            <HardDrive className="h-6 w-6 text-orange-600" />
            Licenciamento Windows Server
          </CardTitle>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Estimativa de licenças necessárias para o servidor físico.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Licensing Settings */}
            <Card className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-slate-700 dark:text-slate-300">
                  Configuração
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="edition" className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Edição do Windows Server
                  </Label>
                  <Select value={edition} onValueChange={setEdition}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="datacenter">Datacenter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {edition === 'standard' && (
                  <div>
                    <Label htmlFor="vmCount" className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Nº de VMs Windows Server
                    </Label>
                    <Input
                      id="vmCount"
                      type="number"
                      value={vmCount}
                      onChange={(e) => setVmCount(parseInt(e.target.value) || 1)}
                      min="1"
                      max="50"
                      className="mt-1"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Core Details */}
            <Card className="bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-slate-700 dark:text-slate-300">
                  Análise de Cores
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-slate-600 dark:text-slate-400">
                    <p>Cores Físicos:</p>
                    <p>Mínimo por CPU:</p>
                    <p>Mínimo Total:</p>
                    <p>Cores a Licenciar:</p>
                  </div>
                  <div className="text-right font-medium">
                    <p>{licensing.totalPhysicalCores}</p>
                    <p>8 cores</p>
                    <p>16 cores</p>
                    <p className="font-bold text-orange-600">{licensing.baseCoresToLicense}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* License Result */}
            <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-slate-700 dark:text-slate-300 text-center">
                  Licenças Necessárias
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Pacotes de 2-Cores</p>
                  <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                    {formatNumber(licensing.totalPacksNeeded)}
                  </p>
                </div>
                <div className="bg-green-100 dark:bg-green-900 p-3 rounded-md">
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {licensing.licenseRightsText}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Important Notes */}
      <Card className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
              <p className="font-semibold">Considerações Importantes para P2V:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li><strong>Teste sempre:</strong> Faça testes de performance após a conversão P2V</li>
                <li><strong>Storage:</strong> Considere o tipo de storage (SAN, NAS, local) para performance</li>
                <li><strong>Network:</strong> Verifique se a rede suporta o tráfego adicional da VM</li>
                <li><strong>Backup:</strong> Ajuste estratégias de backup para o ambiente virtualizado</li>
                <li><strong>Licenciamento:</strong> Consulte a documentação oficial da Microsoft para confirmação</li>
                <li><strong>Monitoramento:</strong> Implemente monitoramento para validar a performance pós-migração</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PhysicalVirtualConversion;