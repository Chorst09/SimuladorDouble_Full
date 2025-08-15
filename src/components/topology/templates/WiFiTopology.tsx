import { TopologyTemplate, NetworkDevice, Connection } from '../types/topology';
import { calculateStarLayout } from '../utils/layoutUtils';

export function createWiFiTopology(
  customerName: string,
  customizations: Record<string, any> = {}
): TopologyTemplate {
  const layout = {
    width: 800,
    height: 400,
    padding: 50
  };

  const controllerModel = customizations['q-controladora-modelo'] || 'Controller WiFi';
  const switchModel = customizations['q-switch-modelo'] || 'Switch Principal';
  const apCount = parseInt(customizations['q-numero-aps'], 10) || 3;

  const baseDevices: Omit<NetworkDevice, 'position'>[] = [
    // O dispositivo central (switch) deve ser o primeiro da lista para o layout em estrela
    {
      id: 'main-switch',
      type: 'switch',
      label: switchModel,
      icon: '🔌'
    },
    {
      id: 'wifi-controller',
      type: 'controller',
      label: controllerModel,
      icon: '🎛️'
    }
  ];

  const connections: Connection[] = [
    {
      id: 'controller-to-switch',
      from: 'wifi-controller',
      to: 'main-switch',
      type: 'ethernet' as const,
      label: 'Management',
      style: {
        color: '#8b5cf6',
        strokeWidth: 2
      }
    }
  ];

  for (let i = 1; i <= apCount; i++) {
    const apId = `access-point-${i}`;
    baseDevices.push({
      id: apId,
      type: 'ap',
      label: `AP ${i}`,
      icon: '📶'
    });

    connections.push({
      id: `switch-to-${apId}`,
      from: 'main-switch',
      to: apId,
      type: 'ethernet' as const,
      label: 'PoE',
      style: {
        color: '#3b82f6',
        strokeWidth: 2
      }
    });

    connections.push({
      id: `controller-to-${apId}`,
      from: 'wifi-controller',
      to: apId,
      type: 'wireless' as const,
      label: 'CAPWAP',
      style: {
        color: '#06b6d4',
        strokeWidth: 1,
        strokeDasharray: '3,3'
      }
    });
  }
  const devices = calculateStarLayout(baseDevices, layout.width, layout.height, layout.padding);

  return {
    devices,
    connections,
    layout
  };
}