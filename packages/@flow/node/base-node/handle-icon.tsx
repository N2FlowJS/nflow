import { CSSProperties } from 'react';
import { Position } from '@xyflow/react';

// Base without geometry; geometry is applied per type/position
const baseStyle: Omit<CSSProperties, 'left' | 'right' | 'top' | 'bottom' | 'transform' | 'background' | 'width' | 'height' | 'borderRadius'> = {
  position: 'absolute',
};

const crossSpacing = '8px';

export type HandleStyleOptions = {
  sourceColor?: string; // output
  targetColor?: string; // input
  borderColor?: string;
  shadow?: string;
};

// Fallback colors if Ant Design tokens are not provided
const FALLBACK_SOURCE = '#52c41a';
const FALLBACK_TARGET = '#1677ff';
const FALLBACK_BORDER = 'rgba(0,0,0,0.12)';
const FALLBACK_SHADOW = '0 1px 2px rgba(0,0,0,0.08)';

// Sizes
const SQUARE_SIZE = 12; // source (output) square button
const LINE_THICKNESS = 3; // target (input) line thickness
const LINE_LENGTH = 20; // target (input) line length

// Cache styles to avoid recalculation
const styleCache = new Map<string, CSSProperties>();

export const getHandleStyle = (
  position: Position,
  type: 'target' | 'source',
  index?: number,
  total?: number,
  opts?: HandleStyleOptions
): CSSProperties => {
  const cacheKey = `${position}-${type}-${index ?? 'na'}-${total ?? 'na'}-${opts?.sourceColor ?? ''}-${opts?.targetColor ?? ''}-${opts?.borderColor ?? ''}-${opts?.shadow ?? ''}`;

  if (styleCache.has(cacheKey)) {
    return styleCache.get(cacheKey)!;
  }

  const fill = type === 'target' ? (opts?.targetColor ?? FALLBACK_TARGET) : (opts?.sourceColor ?? FALLBACK_SOURCE);
  const borderColor = opts?.borderColor ?? FALLBACK_BORDER;
  const shadow = opts?.shadow ?? FALLBACK_SHADOW;

  let style: CSSProperties;

  const hasGrouping = typeof index === 'number' && typeof total === 'number' && total > 1 && index >= 0 && index < total;
  const pct = hasGrouping ? ((index! + 1) / (total! + 1)) * 100 : 50;

  // Geometry per type
  const squareGeom: CSSProperties = {
    width: `${SQUARE_SIZE}px`,
    height: `${SQUARE_SIZE}px`,
    borderRadius: 4,
    border: `2px solid ${borderColor}`,
    boxShadow: shadow,
    cursor: 'pointer',
  };

  const lineGeomVertical: CSSProperties = {
    width: `${LINE_THICKNESS}px`,
    height: `${LINE_LENGTH}px`,
    borderRadius: 2,
  };

  const lineGeomHorizontal: CSSProperties = {
    width: `${LINE_LENGTH}px`,
    height: `${LINE_THICKNESS}px`,
    borderRadius: 2,
  };

  switch (position) {
    case Position.Left: {
      if (type === 'source') {
        style = hasGrouping
          ? {
              ...baseStyle,
              ...squareGeom,
              background: fill,
              left: 0,
              top: `${pct}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: 2,
            }
          : {
              ...baseStyle,
              ...squareGeom,
              background: fill,
              left: 0,
              top: '50%',
              transform: `translate(-50%, calc(-50% + ${crossSpacing}))`,
              zIndex: 2,
            };
      } else {
        // target as vertical line
        style = hasGrouping
          ? {
              ...baseStyle,
              ...lineGeomVertical,
              background: fill,
              left: 0,
              top: `${pct}%`,
              transform: 'translate(-50%, -50%)',
            }
          : {
              ...baseStyle,
              ...lineGeomVertical,
              background: fill,
              left: 0,
              top: '50%',
              transform: 'translate(-50%, -50%)',
            };
      }
      break;
    }
    case Position.Right: {
      if (type === 'source') {
        style = hasGrouping
          ? {
              ...baseStyle,
              ...squareGeom,
              background: fill,
              right: 0,
              top: `${pct}%`,
              transform: 'translate(50%, -50%)',
              zIndex: 2,
            }
          : {
              ...baseStyle,
              ...squareGeom,
              background: fill,
              right: 0,
              top: '50%',
              transform: `translate(50%, calc(-50% - ${crossSpacing}))`,
              zIndex: 2,
            };
      } else {
        // target as vertical line
        style = hasGrouping
          ? {
              ...baseStyle,
              ...lineGeomVertical,
              background: fill,
              right: 0,
              top: `${pct}%`,
              transform: 'translate(50%, -50%)',
            }
          : {
              ...baseStyle,
              ...lineGeomVertical,
              background: fill,
              right: 0,
              top: '50%',
              transform: 'translate(50%, -50%)',
            };
      }
      break;
    }
    case Position.Top: {
      if (type === 'source') {
        style = hasGrouping
          ? {
              ...baseStyle,
              ...squareGeom,
              background: fill,
              top: 0,
              left: `${pct}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: 2,
            }
          : {
              ...baseStyle,
              ...squareGeom,
              background: fill,
              top: 0,
              left: '50%',
              transform: `translate(calc(-50% - ${crossSpacing}), -50%)`,
              zIndex: 2,
            };
      } else {
        // target as horizontal line
        style = hasGrouping
          ? {
              ...baseStyle,
              ...lineGeomHorizontal,
              background: fill,
              top: 0,
              left: `${pct}%`,
              transform: 'translate(-50%, -50%)',
            }
          : {
              ...baseStyle,
              ...lineGeomHorizontal,
              background: fill,
              top: 0,
              left: '50%',
              transform: 'translate(-50%, -50%)',
            };
      }
      break;
    }
    case Position.Bottom: {
      if (type === 'source') {
        style = hasGrouping
          ? {
              ...baseStyle,
              ...squareGeom,
              background: fill,
              bottom: 0,
              left: `${pct}%`,
              transform: 'translate(-50%, 50%)',
              zIndex: 2,
            }
          : {
              ...baseStyle,
              ...squareGeom,
              background: fill,
              bottom: 0,
              left: '50%',
              transform: `translate(calc(-50% + ${crossSpacing}), 50%)`,
              zIndex: 2,
            };
      } else {
        // target as horizontal line
        style = hasGrouping
          ? {
              ...baseStyle,
              ...lineGeomHorizontal,
              background: fill,
              bottom: 0,
              left: `${pct}%`,
              transform: 'translate(-50%, 50%)',
            }
          : {
              ...baseStyle,
              ...lineGeomHorizontal,
              background: fill,
              bottom: 0,
              left: '50%',
              transform: 'translate(-50%, 50%)',
            };
      }
      break;
    }
    default: {
      style = {
        ...baseStyle,
        ...lineGeomHorizontal,
        background: fill,
        bottom: 0,
        left: '50%',
        transform: 'translate(-50%, 50%)',
      };
    }
  }

  styleCache.set(cacheKey, style);
  return style;
};
