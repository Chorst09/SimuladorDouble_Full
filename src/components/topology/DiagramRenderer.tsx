'use client';

import React, { useRef, useEffect, useState } from 'react';
import { TopologyTemplate, Connection, NetworkDevice as NetworkDeviceType } from './types/topology';
import { generatePath } from './utils/svgUtils';
import { NetworkDevice } from './components/NetworkDevice';
import { Connection as ConnectionComponent } from './components/Connection';

interface DiagramRendererProps {
  devices: NetworkDeviceType[];
  connections: Connection[];
  layout: {
    width: number;
    height: number;
    padding: number;
  };
  onDeleteDevice: (deviceId: string) => void;
  onDeviceClick: (device: NetworkDeviceType) => void;
  onUpdateDevicePosition: (deviceId: string, position: { x: number; y: number }) => void;
  className?: string;
}

export function DiagramRenderer({ devices, connections, layout, onDeleteDevice, onDeviceClick, onUpdateDevicePosition, className = '' }: DiagramRendererProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });


  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.max(0.5, Math.min(3, prev * delta)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastPanPoint({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - lastPanPoint.x;
    const deltaY = e.clientY - lastPanPoint.y;
    
    setPan(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
    
    setLastPanPoint({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const renderConnection = (connection: Connection) => {
    const fromDevice = devices.find(d => d.id === connection.from);
    const toDevice = devices.find(d => d.id === connection.to);
    
    if (!fromDevice || !toDevice) return null;

    return (
      <ConnectionComponent
        key={connection.id}
        connection={connection}
        fromDevice={fromDevice}
        toDevice={toDevice}
      />
    );
  };



  return (
    <div className={`topology-diagram ${className}`}>
      <svg
        ref={svgRef}
        width="100%"
        height="400"
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        className="border border-gray-200 rounded-lg bg-white cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="#6b7280"
            />
          </marker>
        </defs>
        
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${scale})`}>
          {/* Render connections first (behind devices) */}
          {connections.map(renderConnection)}
          
          {/* Render devices */}
          {devices.map(device => (
            <NetworkDevice 
              key={device.id} 
              device={device} 
              onDelete={() => onDeleteDevice(device.id)} 
              onClick={() => onDeviceClick(device)}
              onUpdatePosition={(position) => onUpdateDevicePosition(device.id, position)}
            />
          ))}
        </g>
      </svg>
      
      {/* Controls */}
      <div className="absolute top-2 right-2 flex gap-2">
        <button
          onClick={() => setScale(prev => Math.min(3, prev * 1.2))}
          className="px-2 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50"
        >
          +
        </button>
        <button
          onClick={() => setScale(prev => Math.max(0.5, prev * 0.8))}
          className="px-2 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50"
        >
          -
        </button>
        <button
          onClick={() => {
            setScale(1);
            setPan({ x: 0, y: 0 });
          }}
          className="px-2 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50"
        >
          Reset
        </button>
      </div>
    </div>
  );
}