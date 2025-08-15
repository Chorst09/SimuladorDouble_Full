import { TopologyTemplate, NetworkDevice, Connection } from '../types/topology';
import { calculateLinearLayout } from '../utils/layoutUtils';

export function createFiberTopology(
  customerName: string,
  customizations: Record<string, string> = {}
): TopologyTemplate {
  const layout = {
    width: 800,
    height: 300,
    padding: 50
  };

    const baseDevices: Omit<NetworkDevice, 'position'>[] = [
    {
      id: 'provider-olt',
      type: 'olt',
      label: 'OLT Provedor',
      icon: '🏢',
    },
    {
      id: 'optical-splitter',
      type: 'splitter',
      label: 'Splitter Óptico',
      icon: '🔀',
    },
    {
      id: 'customer-ont',
      type: 'ont',
      label: 'ONT Cliente',
      icon: '📡',
    },
    {
      id: 'customer-router',
      type: 'router',
      label: customizations['q-roteador-modelo'] || 'Router',
      icon: '🔀',
    },
    {
      id: 'client-devices',
      type: 'client',
      label: `Dispositivos (${customizations['q-dispositivos-conectados'] || 'N/A'})`,
      icon: '💻',
    },
  ];

  // Adiciona um switch se especificado no survey
  if (customizations['q-possui-switch'] === 'Sim') {
    baseDevices.push({
      id: 'customer-switch',
      type: 'switch',
      label: 'Switch',
      icon: '🔳',
    });
  }

  const devices = calculateLinearLayout(baseDevices, layout.width, layout.height, layout.padding);

  const connections: Connection[] = [
    {
      id: 'olt-to-splitter',
      from: 'provider-olt',
      to: 'optical-splitter',
      type: 'fiber' as const,
      label: 'Fibra Óptica',
      style: { color: '#10b981', strokeWidth: 3 },
    },
    {
      id: 'splitter-to-ont',
      from: 'optical-splitter',
      to: 'customer-ont',
      type: 'fiber' as const,
      label: 'Drop Fiber',
      style: { color: '#10b981', strokeWidth: 2 },
    },
    {
      id: 'ont-to-router',
      from: 'customer-ont',
      to: 'customer-router',
      type: 'ethernet' as const,
      label: 'Ethernet',
      style: { color: '#3b82f6', strokeWidth: 2 },
    },
  ];

  // Ajusta as conexões se um switch existir
  if (customizations['q-possui-switch'] === 'Sim') {
    connections.push(
      {
        id: 'router-to-switch',
        from: 'customer-router',
        to: 'customer-switch',
        type: 'ethernet' as const,
        label: 'LAN',
        style: { color: '#3b82f6', strokeWidth: 2 },
      },
      {
        id: 'switch-to-devices',
        from: 'customer-switch',
        to: 'client-devices',
        type: 'ethernet' as const,
        label: 'LAN',
        style: { color: '#3b82f6', strokeWidth: 2 },
      }
    );
  } else {
    connections.push({
      id: 'router-to-devices',
      from: 'customer-router',
      to: 'client-devices',
      type: 'ethernet' as const,
      label: 'LAN',
      style: { color: '#3b82f6', strokeWidth: 2 },
    });
  }

  return {
    devices,
    connections,
    layout
  };
}