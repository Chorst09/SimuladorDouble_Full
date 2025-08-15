import { TopologyTemplate } from '../../types/topology';

export const wifiTemplate: TopologyTemplate = {
  layout: {
    width: 800,
    height: 600,
    padding: 50,
  },
  devices: [
    { id: 'router', label: 'Router', type: 'router', quantityKey: 'routers' },
    { id: 'switch', label: 'Switch', type: 'switch', quantityKey: 'switches' },
    { id: 'ap', label: 'Access Point', type: 'ap', quantityKey: 'aps' },
    { id: 'controller', label: 'Controller', type: 'controller', quantityKey: 'controllers' },
  ],
  connections: [
    { from: 'router', to: 'switch' },
    { from: 'switch', to: 'ap' },
    { from: 'switch', to: 'controller' },
  ],
};
