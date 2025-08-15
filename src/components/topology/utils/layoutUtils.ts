import { NetworkDevice } from '../types/topology';

export const calculateLinearLayout = (
  devices: Omit<NetworkDevice, 'position'>[],
  width: number,
  height: number,
  padding: number
): NetworkDevice[] => {
  const availableWidth = width - (2 * padding);
  const spacing = availableWidth / (devices.length - 1);
  const centerY = height / 2;

  return devices.map((device, index) => ({
    ...device,
    position: {
      x: padding + (index * spacing),
      y: centerY
    }
  }));
};

export const calculateStarLayout = (
  devices: Omit<NetworkDevice, 'position'>[],
  width: number,
  height: number,
  padding: number
): NetworkDevice[] => {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 3;

  return devices.map((device, index) => {
    if (index === 0) {
      // Central device
      return {
        ...device,
        position: { x: centerX, y: centerY }
      };
    }

    // Surrounding devices
    const angle = (2 * Math.PI * (index - 1)) / (devices.length - 1);
    return {
      ...device,
      position: {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      }
    };
  });
};

export const calculateHubSpokeLayout = (
  devices: Omit<NetworkDevice, 'position'>[],
  width: number,
  height: number,
  padding: number
): NetworkDevice[] => {
  const centerX = width / 2;
  const centerY = height / 2;
  const hubRadius = 80;
  const spokeRadius = Math.min(width, height) / 3;

  return devices.map((device, index) => {
    if (device.type === 'hub' || device.type === 'controller') {
      return {
        ...device,
        position: { x: centerX, y: centerY }
      };
    }

    // Calculate position for spokes
    const spokeIndex = index - 1;
    const totalSpokes = devices.length - 1;
    const angle = (2 * Math.PI * spokeIndex) / totalSpokes;
    
    return {
      ...device,
      position: {
        x: centerX + spokeRadius * Math.cos(angle),
        y: centerY + spokeRadius * Math.sin(angle)
      }
    };
  });
};