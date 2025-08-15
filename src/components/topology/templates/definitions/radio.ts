import { TopologyTemplate } from '../../types/topology';

export const radioTemplate: TopologyTemplate = {
  layout: {
    width: 800,
    height: 600,
    padding: 50,
  },
  devices: [
    { id: 'tower1', label: 'Tower 1', type: 'tower', quantityKey: 'towers' },
    { id: 'tower2', label: 'Tower 2', type: 'tower', quantityKey: 'towers' },
    { id: 'radio1', label: 'Radio 1', type: 'radio', quantityKey: 'antennas' },
    { id: 'radio2', label: 'Radio 2', type: 'radio', quantityKey: 'antennas' },
  ],
  connections: [
    { from: 'tower1', to: 'radio1' },
    { from: 'tower2', to: 'radio2' },
    { from: 'radio1', to: 'radio2' },
  ],
};
