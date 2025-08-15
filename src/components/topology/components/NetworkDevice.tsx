import React, { useState, useRef } from 'react';
import { X, Pencil } from 'lucide-react';
import { NetworkDevice as NetworkDeviceType } from '../types/topology';

interface NetworkDeviceProps {
  device: NetworkDeviceType;
  onClick?: (device: NetworkDeviceType) => void;
  onDelete?: () => void;
  onUpdatePosition: (position: { x: number; y: number }) => void;
}

export function NetworkDevice({ device, onClick, onDelete, onUpdatePosition }: NetworkDeviceProps) {
  const { id, label, position, type, properties } = device;
  const [isDragging, setIsDragging] = useState(false);
  const offset = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent<SVGGElement>) => {
    setIsDragging(true);
    const CTM = e.currentTarget.getScreenCTM();
    if (CTM) {
        offset.current = {
            x: (e.clientX - CTM.e) / CTM.a - position.x,
            y: (e.clientY - CTM.f) / CTM.d - position.y,
        };
    }
    e.stopPropagation();
  };

  const handleMouseMove = (e: React.MouseEvent<SVGGElement>) => {
    if (isDragging) {
        const CTM = e.currentTarget.getScreenCTM();
        if (CTM) {
            const newPosition = {
                x: (e.clientX - CTM.e) / CTM.a - offset.current.x,
                y: (e.clientY - CTM.f) / CTM.d - offset.current.y,
            };
            onUpdatePosition(newPosition);
        }
    }
    e.stopPropagation();
  };

  const handleMouseUp = (e: React.MouseEvent<SVGGElement>) => {
    setIsDragging(false);
    e.stopPropagation();
  };


  const getDeviceIcon = (deviceType: string) => {
    const icons: Record<string, string> = {
      'olt': '🏢',
      'ont': '📡',
      'router': '🔀',
      'switch': '🔌',
      'ap': '📶',
      'controller': '🎛️',
      'tower': '🗼',
      'antenna': '📡',
      'appliance': '💻',
      'cloud': '☁️',
      'splitter': '🔀',
      'client': '💻'
    };
    return icons[deviceType] || '⚙️';
  };

  const getDeviceColor = (deviceType: string) => {
    const colors: Record<string, string> = {
      'olt': '#2dd4bf',
      'ont': '#60a5fa',
      'router': '#a78bfa',
      'switch': '#facc15',
      'ap': '#34d399',
      'controller': '#818cf8',
      'tower': '#f87171',
      'antenna': '#e879f9',
      'appliance': '#fb923c',
      'cloud': '#2dd4bf',
      'splitter': '#f472b6',
      'client': '#94a3b8'
    };
    return colors[deviceType] || '#9ca3af';
  };

  return (
    <g 
      className={`device-group ${isDragging ? 'dragging' : ''}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp} // Stop dragging if mouse leaves the SVG area
    >
      <g 
        className="hover:opacity-80 transition-opacity"
      >
      {/* Device background */}
      <rect
        x={position.x - 45}
        y={position.y - 30}
        width="90"
        height="60"
        rx="12"
        fill="#f8fafc"
        stroke={getDeviceColor(type)}
        strokeWidth="1.5"
        filter="url(#shadow)"
      />
      
      {/* Device icon background */}
      <circle
        cx={position.x}
        cy={position.y - 10}
        r="12"
        fill={getDeviceColor(type)}
        opacity="0.1"
      />
      
      {/* Device icon */}
      <text
        x={position.x}
        y={position.y - 5}
        textAnchor="middle"
        fontSize="16"
        className="select-none"
      >
        {getDeviceIcon(type)}
      </text>
      
      {/* Device label */}
      <text
        x={position.x}
        y={position.y + 15}
        textAnchor="middle"
        fontSize="11"
        fontWeight="500"
        fill="#374151"
        className="select-none"
      >
        {label}
      </text>
      
      {/* Device type */}
      <text 
        x={position.x}
        y={position.y + 20}
        textAnchor="middle"
        fontSize="11"
        fill="#334155"
        className="font-semibold"
      >
        {type}
      </text>
      
      {/* Status indicator */}
      <circle
        cx={position.x + 35}
        cy={position.y - 20}
        r="4"
        fill="#10b981"
        className="animate-pulse"
      />
      </g>

      {onDelete && (
        <g 
          className="delete-button cursor-pointer"
          onClick={(e) => {
            e.stopPropagation(); // Prevent device onClick from firing
            onDelete();
          }}
        >
          <circle 
            cx={position.x + 45} 
            cy={position.y - 30} 
            r="10" 
            fill="#ef4444"
          />
          <X 
            x={position.x + 39} 
            y={position.y - 36} 
            size={12} 
            color="white" 
          />
        </g>
      )}

      {onClick && (
        <g 
          className="edit-button cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onClick(device);
          }}
        >
          <circle 
            cx={position.x + 25} 
            cy={position.y - 30} 
            r="10" 
            fill="#3b82f6"
          />
          <Pencil 
            x={position.x + 19} 
            y={position.y - 36} 
            size={12} 
            color="white" 
          />
        </g>
      )}
    </g>
  );
}