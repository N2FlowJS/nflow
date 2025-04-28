import { CSSProperties } from 'react';
import { Position } from '@xyflow/react';

const baseStyle: Omit<CSSProperties, 'left' | 'right' | 'top' | 'bottom' | 'transform' | 'background'> = {
  position: 'absolute',
  width: '10px',
  height: '10px',
  borderRadius: '50%',
};

// add a small offset to separate dual handles
const crossSpacing = '8px';

export const targetColor = '#1677ff'; 
export const sourceColor = '#52c41a';

export const getHandleStyle = (position: Position, type: 'target' | 'source'): CSSProperties => {
  const fill = type === 'target' ? targetColor : sourceColor;

  switch (position) {
    case Position.Left:
      return {
        ...baseStyle,
        background: fill,
        left: 0,
        top: '50%',
        transform: `translate(-50%, calc(-50% ${type === 'target' ? '-' : '+'} ${crossSpacing}))`,
      };
    case Position.Right:
      return {
        ...baseStyle,
        background: fill,
        right: 0,
        top: '50%',
        transform: `translate(50%, calc(-50% ${type === 'target' ? '-' : '+'} ${crossSpacing}))`,
      };
    case Position.Top:
      return {
        ...baseStyle,
        background: fill,
        top: 0,
        left: '50%',
        transform: `translate(calc(-50% ${type === 'target' ? '-' : '+'} ${crossSpacing}), -50%)`,
      };
    case Position.Bottom:
      return {
        ...baseStyle,
        background: fill,
        bottom: 0,
        left: '50%',
        transform: `translate(calc(-50% ${type === 'target' ? '-' : '+'} ${crossSpacing}), 50%)`,
      };
    default:
      return {
        ...baseStyle,
        background: fill,
        bottom: 0,
        left: '50%',
        transform: `translate(calc(-50% ${type === 'target' ? '-' : '+'} ${crossSpacing}), 50%)`,
      };
  }
};
