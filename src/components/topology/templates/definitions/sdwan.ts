import { TopologyTemplate } from '../../types/topology';

export const sdwanTemplate: TopologyTemplate = {
  layout: {
    width: 800,
    height: 600,
    padding: 50,
  },
  devices: [
    { id: 'branch1', label: 'Branch 1', type: 'router', quantityKey: 'routers' },
    { id: 'branch2', label: 'Branch 2', type: 'router', quantityKey: 'routers' },
    { id: 'datacenter', label: 'Data Center', type: 'server', quantityKey: 'servers' },
    { id: 'cloud', label: 'Cloud', type: 'cloud', quantityKey: 'cloud' },
  ],
  connections: [
    { from: 'branch1', to: 'datacenter' },
    { from: 'branch2', to: 'datacenter' },
    { from: 'branch1', to: 'cloud' },
    { from: 'branch2', to: 'cloud' },
  ],
};
