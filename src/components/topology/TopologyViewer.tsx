'use client';

import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { TopologyConfig, NetworkDevice, Connection } from './types/topology';
import { DiagramRenderer } from './DiagramRenderer';
import * as templates from './templates/definitions';

const generateAndPositionDevices = (
  quantities: Record<string, number>,
  layout: { width: number; height: number; padding: number }
): NetworkDevice[] => {
  const newDevices: NetworkDevice[] = [];
  const deviceTypeMap: Record<string, string> = {
    towers: 'tower',
    antennas: 'antenna',
    routers: 'router',
    switches: 'switch',
    aps: 'ap',
    controllers: 'controller',
  };

  Object.entries(quantities).forEach(([key, count]) => {
    const type = deviceTypeMap[key];
    if (type && count > 0) {
      for (let i = 0; i < count; i++) {
        newDevices.push({
          id: `${type}-${i}-${Date.now()}`,
          label: `${type.charAt(0).toUpperCase() + type.slice(1)} ${i + 1}`,
          type: type as any,
          position: { x: 0, y: 0 }, // Placeholder
        });
      }
    }
  });

  // Simple grid layout logic
  const columns = Math.floor((layout.width - 2 * layout.padding) / 150) || 1;
  const columnWidth = (layout.width - 2 * layout.padding) / columns;
  const rowHeight = 120;

  return newDevices.map((device, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    return {
      ...device,
      position: {
        x: layout.padding + col * columnWidth + columnWidth / 2,
        y: layout.padding + row * rowHeight + 150, // Start below template devices
      },
    };
  });
};

import { AddDeviceModal } from './components/AddDeviceModal';
import { EditDeviceModal } from './components/EditDeviceModal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface TopologyViewerProps {
  config: TopologyConfig;
  showExportOptions?: boolean;
  className?: string;
  onExport?: (format: 'png' | 'pdf' | 'svg') => void;
}

export function TopologyViewer({ 
  config, 
  showExportOptions = false, 
  className = '',
  onExport 
}: TopologyViewerProps) {
  const getTopologyTemplate = () => {
    switch (config.type) {
      case 'fiber':
        return templates.fiberTemplate;
      case 'radio':
        return templates.radioTemplate;
      case 'wifi':
        return templates.wifiTemplate;
      case 'sdwan':
        return templates.sdwanTemplate;
      default:
        return templates.fiberTemplate;
    }
  };

  const getTopologyTitle = () => {
    const titles: Record<string, string> = {
      'fiber': 'Topologia - Internet via Fibra Óptica',
      'radio': 'Topologia - Internet via Rádio Enlace',
      'wifi': 'Topologia - Access Points (Wi-Fi)',
      'sdwan': 'Topologia - SD-WAN'
    };
    return titles[config.type] || 'Topologia de Rede';
  };

  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [layout, setLayout] = useState(getTopologyTemplate().layout);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<NetworkDevice | null>(null);
  const diagramRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const template = getTopologyTemplate();
    const quantities = config.customizations || {};

    const newDevices: NetworkDevice[] = [];
    template.devices.forEach(deviceTmpl => {
      const count = quantities[deviceTmpl.quantityKey] || 0;
      for (let i = 0; i < count; i++) {
        newDevices.push({
          id: `${deviceTmpl.id}-${i}`,
          label: `${deviceTmpl.label} ${i + 1}`,
          type: deviceTmpl.type,
          position: { x: Math.random() * template.layout.width, y: Math.random() * template.layout.height },
        });
      }
    });

    const newConnections: Connection[] = [];
    template.connections.forEach((connTmpl, i) => {
      newConnections.push({
        id: `conn-${i}`,
        from: `${connTmpl.from}-0`,
        to: `${connTmpl.to}-0`,
        type: 'ethernet',
      });
    });

    setDevices(newDevices);
    setConnections(newConnections);
    setLayout(template.layout);
  }, [config]);

  const handleDeleteDevice = (deviceId: string) => {
    setDevices(prev => prev.filter(d => d.id !== deviceId));
    setConnections(prev => prev.filter(c => c.from !== deviceId && c.to !== deviceId));
  };

  const handleAddDevice = (data: { label: string; type: string }) => {
    const newDevice: NetworkDevice = {
      id: `device-${Date.now()}`,
      label: data.label,
      type: data.type as any,
      position: { x: 50, y: 50 }, // Default position, can be improved
    };
    setDevices(prev => [...prev, newDevice]);
    setIsAddModalOpen(false);
  };

  const handleDeviceClick = (device: NetworkDevice) => {
    setEditingDevice(device);
    setIsEditModalOpen(true);
  };

  const handleUpdateDevice = (data: { label: string; type: string }) => {
    if (!editingDevice) return;

    setDevices(prev => 
      prev.map(d => 
        d.id === editingDevice.id 
          ? { ...d, label: data.label, type: data.type as any } 
          : d
      )
    );
    setIsEditModalOpen(false);
    setEditingDevice(null);
  };

  const handleUpdateDevicePosition = (deviceId: string, position: { x: number; y: number }) => {
    setDevices(prev =>
      prev.map(d =>
        d.id === deviceId
          ? { ...d, position }
          : d
      )
    );
  };

    const handleExport = async (format: 'png' | 'pdf' | 'svg') => {
    if (!diagramRef.current) return;

    const diagramElement = diagramRef.current;
    const title = getTopologyTitle();
    const fileName = `${title.replace(/ /g, '_')}_${config.customerName.replace(/ /g, '_')}`.toLowerCase();

    if (format === 'svg') {
        const svgElement = diagramElement.querySelector('svg');
        if (svgElement) {
            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(svgElement);
            const blob = new Blob([svgString], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${fileName}.svg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
        return;
    }

    const canvas = await html2canvas(diagramElement, {
        scale: 2, 
        useCORS: true,
        backgroundColor: '#ffffff',
    });

    if (format === 'png') {
        const image = canvas.toDataURL('image/png', 1.0);
        const a = document.createElement('a');
        a.href = image;
        a.download = `${fileName}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } else if (format === 'pdf') {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`${fileName}.pdf`);
    }
  };

  return (
    <div className={`topology-viewer ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {getTopologyTitle()}
          </h3>
          <p className="text-sm text-gray-600">
            Cliente: {config.customerName} | Endereço: {config.address}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
        <Button onClick={() => setIsAddModalOpen(true)} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Dispositivo
        </Button>

        {showExportOptions && (
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('png')}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              PNG
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
            >
              PDF
            </button>
            <button
              onClick={() => handleExport('svg')}
              className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
            >
              SVG
            </button>
          </div>
        )}
      </div>
      </div>

      {/* Diagram */}
            <div className="relative" ref={diagramRef}>
        <DiagramRenderer 
          devices={devices}
          connections={connections}
          layout={layout}
          onDeleteDevice={handleDeleteDevice}
          onDeviceClick={handleDeviceClick}
          onUpdateDevicePosition={handleUpdateDevicePosition}
          className="w-full" 
        />
      </div>

      {/* Legend */}
      <AddDeviceModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddDevice={handleAddDevice}
      />

      <EditDeviceModal 
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingDevice(null);
        }}
        onUpdateDevice={handleUpdateDevice}
        device={editingDevice}
      />

      {/* Legend */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Legenda:</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          {config.type === 'fiber' && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-green-500"></div>
                <span>Fibra Óptica</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-blue-500"></div>
                <span>Ethernet</span>
              </div>
            </>
          )}
          {config.type === 'radio' && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-yellow-500 border-dashed border-t"></div>
                <span>Enlace de Rádio</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-blue-500"></div>
                <span>Ethernet</span>
              </div>
            </>
          )}
          {config.type === 'wifi' && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-blue-500"></div>
                <span>Ethernet/PoE</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-cyan-500 border-dashed border-t"></div>
                <span>CAPWAP</span>
              </div>
            </>
          )}
          {config.type === 'sdwan' && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-red-500"></div>
                <span>WAN</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-purple-500 border-dashed border-t"></div>
                <span>VPN Tunnel</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-green-500"></div>
                <span>LAN</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}