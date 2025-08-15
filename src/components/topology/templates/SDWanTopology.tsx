import { TopologyTemplate, NetworkDevice, Connection } from '../types/topology';
import { calculateHubSpokeLayout } from '../utils/layoutUtils';

export function createSDWanTopology(
  customerName: string,
  customizations: Record<string, any> = {}
): TopologyTemplate {
  const layout = {
    width: 900,
    height: 500,
    padding: 60
  };

  // Customization values
  const controllerModel = customizations['q-sdwan-controller-modelo'] || 'SD-WAN Controller';
  const mainApplianceModel = customizations['q-sdwan-appliance-principal-modelo'] || 'Appliance Principal';
  const remoteSites = (customizations['q-sdwan-filiais'] || 'Filial 1,Filial 2').split(',').map((s: string) => s.trim());
  const wanLinks = (customizations['q-sdwan-links-wan'] || 'mpls,internet,lte').split(',').map((s: string) => s.trim());

  const baseDevices: Omit<NetworkDevice, 'position'>[] = [
    {
      id: 'cloud-controller',
      type: 'controller',
      label: controllerModel,
      icon: '☁️'
    },
    {
      id: 'main-appliance',
      type: 'appliance',
      label: mainApplianceModel,
      icon: '💻'
    },
    {
      id: 'local-lan',
      type: 'switch',
      label: 'LAN Local',
      icon: '🔌'
    }
  ];

  const connections: Connection[] = [
    {
      id: 'controller-to-appliance',
      from: 'cloud-controller',
      to: 'main-appliance',
      type: 'vpn' as const,
      label: 'Management',
      style: { color: '#8b5cf6', strokeWidth: 2, strokeDasharray: '8,4' }
    },
    {
      id: 'appliance-to-lan',
      from: 'main-appliance',
      to: 'local-lan',
      type: 'ethernet' as const,
      label: 'LAN',
      style: { color: '#10b981', strokeWidth: 2 }
    }
  ];

  // Dynamically add WAN links
  if (wanLinks.includes('mpls')) {
    baseDevices.push({ id: 'mpls-connection', type: 'wan', label: 'MPLS', icon: '🌐' });
    connections.push({
      id: 'appliance-to-mpls',
      from: 'main-appliance',
      to: 'mpls-connection',
      type: 'wan' as const,
      label: 'MPLS Link',
      style: { color: '#ef4444', strokeWidth: 3 }
    });
  }
  if (wanLinks.includes('internet')) {
    baseDevices.push({ id: 'internet-connection', type: 'wan', label: 'Internet', icon: '🌍' });
    connections.push({
      id: 'appliance-to-internet',
      from: 'main-appliance',
      to: 'internet-connection',
      type: 'wan' as const,
      label: 'Internet Link',
      style: { color: '#3b82f6', strokeWidth: 3 }
    });
  }
  if (wanLinks.includes('lte')) {
    baseDevices.push({ id: 'lte-connection', type: 'wan', label: '4G/5G', icon: '📱' });
    connections.push({
      id: 'appliance-to-lte',
      from: 'main-appliance',
      to: 'lte-connection',
      type: 'wireless' as const,
      label: 'Backup LTE',
      style: { color: '#f59e0b', strokeWidth: 2, strokeDasharray: '5,5' }
    });
  }

  // Dynamically add remote sites
  remoteSites.forEach((siteName: string, index: number) => {
    const siteId = `remote-site-${index + 1}`;
    baseDevices.push({ id: siteId, type: 'appliance', label: siteName, icon: '🏢' });
    connections.push({
      id: `tunnel-to-${siteId}`,
      from: 'main-appliance',
      to: siteId,
      type: 'vpn' as const,
      label: 'VPN Tunnel',
      style: { color: '#8b5cf6', strokeWidth: 2, strokeDasharray: '10,5' }
    });
    connections.push({
      id: `controller-to-${siteId}`,
      from: 'cloud-controller',
      to: siteId,
      type: 'vpn' as const,
      label: 'Management',
      style: { color: '#6b7280', strokeWidth: 1, strokeDasharray: '3,3' }
    });
  });

  const devices = calculateHubSpokeLayout(baseDevices, layout.width, layout.height, layout.padding);

  return {
    devices,
    connections,
    layout
  };
}