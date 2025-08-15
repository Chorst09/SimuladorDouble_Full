export interface TopologyConfig {
  type: 'fiber' | 'radio' | 'wifi' | 'sdwan';
  customerName: string;
  address: string;
  customizations?: Record<string, any>;
}

export interface NetworkDevice {
  id: string;
  type: 'olt' | 'ont' | 'router' | 'switch' | 'ap' | 'controller' | 'tower' | 'antenna' | 'appliance' | 'cloud' | 'splitter' | 'client' | 'wan';
  label: string;
  icon?: string; 
  position: { x: number; y: number };
  properties?: Record<string, any>;
}

export interface Connection {
  id: string;
  from: string;
  to: string;
  type: 'fiber' | 'ethernet' | 'wireless' | 'wan' | 'vpn';
  label?: string;
  style?: {
    color?: string;
    strokeWidth?: number;
    strokeDasharray?: string;
  };
}

export interface TemplateDevice {
  id: string;
  label: string;
  type: NetworkDevice['type'];
  quantityKey: string;
}

export interface TemplateConnection {
  from: string;
  to: string;
}

export interface TopologyTemplate {
  layout: {
    width: number;
    height: number;
    padding: number;
  };
  devices: TemplateDevice[];
  connections: TemplateConnection[];
}

export interface ExportConfig {
  format: 'png' | 'pdf' | 'svg';
  quality: 'low' | 'medium' | 'high';
  includeMetadata: boolean;
  customBranding?: {
    logo?: string;
    companyName?: string;
  };
}