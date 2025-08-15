import React from 'react';
import { Connection as ConnectionType, NetworkDevice } from '../types/topology';
import { generatePath } from '../utils/svgUtils';

interface ConnectionProps {
  connection: ConnectionType;
  fromDevice: NetworkDevice;
  toDevice: NetworkDevice;
}

export function Connection({ connection, fromDevice, toDevice }: ConnectionProps) {
  const getConnectionStyle = (connectionType: string) => {
    const styles: Record<string, { color: string; strokeWidth: number; strokeDasharray?: string }> = {
      'fiber': { color: '#10b981', strokeWidth: 3 },
      'ethernet': { color: '#3b82f6', strokeWidth: 2 },
      'wireless': { color: '#f59e0b', strokeWidth: 2, strokeDasharray: '5,5' },
      'wan': { color: '#ef4444', strokeWidth: 3 },
      'vpn': { color: '#8b5cf6', strokeWidth: 2, strokeDasharray: '10,5' }
    };
    return styles[connectionType] || { color: '#6b7280', strokeWidth: 2 };
  };

  const getConnectionLabel = (connectionType: string) => {
    const labels: Record<string, string> = {
      'fiber': 'Fibra Óptica',
      'ethernet': 'Ethernet',
      'wireless': 'Wireless',
      'wan': 'WAN',
      'vpn': 'VPN Tunnel'
    };
    return labels[connectionType] || connectionType;
  };

  const style = getConnectionStyle(connection.type);
  const path = generatePath(
    fromDevice.position, 
    toDevice.position, 
    connection.type === 'wireless' || connection.type === 'vpn'
  );

  const midpoint = {
    x: (fromDevice.position.x + toDevice.position.x) / 2,
    y: (fromDevice.position.y + toDevice.position.y) / 2
  };

  return (
    <g className="connection-group">
      {/* Connection line */}
      <path
        d={path}
        stroke={connection.style?.color || style.color}
        strokeWidth={connection.style?.strokeWidth || style.strokeWidth}
        strokeDasharray={connection.style?.strokeDasharray || style.strokeDasharray}
        fill="none"
        markerEnd="url(#arrowhead)"
        className="transition-all duration-200 hover:opacity-80"
      />
      
      {/* Connection label background */}
      {connection.label && (
        <>
          <rect
            x={midpoint.x - 25}
            y={midpoint.y - 10}
            width="50"
            height="16"
            rx="8"
            fill="white"
            stroke="#e5e7eb"
            strokeWidth="1"
          />
          <text
            x={midpoint.x}
            y={midpoint.y + 2}
            textAnchor="middle"
            fontSize="9"
            fontWeight="500"
            fill="#374151"
            className="select-none"
          >
            {connection.label}
          </text>
        </>
      )}
      
      {/* Connection type indicator */}
      <circle
        cx={midpoint.x}
        cy={midpoint.y - 15}
        r="3"
        fill={style.color}
        className="opacity-60"
      />
    </g>
  );
}