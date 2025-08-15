export const createSVGElement = (tag: string, attributes: Record<string, string | number>) => {
  const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value.toString());
  });
  return element;
};

export const calculateDistance = (point1: { x: number; y: number }, point2: { x: number; y: number }) => {
  return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
};

export const calculateMidpoint = (point1: { x: number; y: number }, point2: { x: number; y: number }) => {
  return {
    x: (point1.x + point2.x) / 2,
    y: (point1.y + point2.y) / 2
  };
};

export const generatePath = (from: { x: number; y: number }, to: { x: number; y: number }, curved = false) => {
  if (!curved) {
    return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
  }
  
  const midpoint = calculateMidpoint(from, to);
  const controlPoint = {
    x: midpoint.x,
    y: midpoint.y - 20 // Slight curve
  };
  
  return `M ${from.x} ${from.y} Q ${controlPoint.x} ${controlPoint.y} ${to.x} ${to.y}`;
};