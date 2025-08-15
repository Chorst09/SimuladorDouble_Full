import React from 'react';

interface LabelProps {
  x: number;
  y: number;
  text: string;
  type?: 'title' | 'subtitle' | 'caption';
  anchor?: 'start' | 'middle' | 'end';
  className?: string;
}

export function Label({ 
  x, 
  y, 
  text, 
  type = 'caption', 
  anchor = 'middle',
  className = '' 
}: LabelProps) {
  const getTextStyle = (labelType: string) => {
    const styles: Record<string, { fontSize: string; fontWeight: string; fill: string }> = {
      'title': { fontSize: '16', fontWeight: '600', fill: '#111827' },
      'subtitle': { fontSize: '12', fontWeight: '500', fill: '#374151' },
      'caption': { fontSize: '10', fontWeight: '400', fill: '#6b7280' }
    };
    return styles[labelType] || styles.caption;
  };

  const style = getTextStyle(type);

  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fontSize={style.fontSize}
      fontWeight={style.fontWeight}
      fill={style.fill}
      className={`select-none ${className}`}
    >
      {text}
    </text>
  );
}