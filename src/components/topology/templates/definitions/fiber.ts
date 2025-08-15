import { TopologyTemplate } from '../../types/topology';

export const fiberTemplate: TopologyTemplate = {
  layout: {
    width: 800,
    height: 600,
    padding: 50,
  },
  devices: [
    { id: 'olt', label: 'OLT', type: 'olt', quantityKey: 'routers' },
    { id: 'splitter', label: 'Splitter', type: 'splitter', quantityKey: 'switches' },
    { id: 'onu', label: 'ONU', type: 'onu', quantityKey: 'antennas' },
  ],
  connections: [
    { from: 'olt', to: 'splitter' },
    { from: 'splitter', to: 'onu' },
  ],
};
