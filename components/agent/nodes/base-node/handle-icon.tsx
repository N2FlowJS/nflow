import { CSSProperties } from 'react';
import { Position } from '@xyflow/react';

const baseStyle: Omit<CSSProperties, 'left' | 'right' | 'top' | 'bottom' | 'transform' | 'background'> = {
  position: 'absolute',
  width: '10px',
  height: '10px',
  borderRadius: '50%',
};

const crossSpacing = '8px';

export const targetColor = '#1677ff'; 
export const sourceColor = '#52c41a';

// Cache styles to avoid recalculation
const styleCache = new Map<string, CSSProperties>();

export const getHandleStyle = (position: Position, type: 'target' | 'source'): CSSProperties => {
  const cacheKey = `${position}-${type}`;
  
  if (styleCache.has(cacheKey)) {
    return styleCache.get(cacheKey)!;
  }

  const fill = type === 'target' ? targetColor : sourceColor;
  let style: CSSProperties;

  switch (position) {
    case Position.Left:
      style = {
        ...baseStyle,
        background: fill,
        left: 0,
        top: '50%',
        transform: `translate(-50%, calc(-50% ${type === 'target' ? '-' : '+'} ${crossSpacing}))`,
      };
      break;
    case Position.Right:
      style = {
        ...baseStyle,
        background: fill,
        right: 0,
        top: '50%',
        transform: `translate(50%, calc(-50% ${type === 'target' ? '-' : '+'} ${crossSpacing}))`,
      };
      break;
    case Position.Top:
      style = {
        ...baseStyle,
        background: fill,
        top: 0,
        left: '50%',
        transform: `translate(calc(-50% ${type === 'target' ? '-' : '+'} ${crossSpacing}), -50%)`,
      };
      break;
    case Position.Bottom:
      style = {
        ...baseStyle,
        background: fill,
        bottom: 0,
        left: '50%',
        transform: `translate(calc(-50% ${type === 'target' ? '-' : '+'} ${crossSpacing}), 50%)`,
      };
      break;
    default:
      style = {
        ...baseStyle,
        background: fill,
        bottom: 0,
        left: '50%',
        transform: `translate(calc(-50% ${type === 'target' ? '-' : '+'} ${crossSpacing}), 50%)`,
      };
  }

  styleCache.set(cacheKey, style);
  return style;
};
