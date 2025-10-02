/**
 * Port-Based Handle Hooks
 * 
 * Generate dynamic handles from NodeDefinition input/output ports
 * instead of hard-coded position arrays.
 */

import React, { useMemo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { InputPort, OutputPort } from '../../ports/types';
import { PortType } from '../../ports/types';

/**
 * Get color for port type
 */
export function getPortTypeColor(type: PortType): string {
  const colors = {
    [PortType.TEXT]: '#1890ff',      // Blue
    [PortType.NUMBER]: '#52c41a',    // Green
    [PortType.BOOLEAN]: '#faad14',   // Orange
    [PortType.ARRAY]: '#722ed1',     // Purple
    [PortType.JSON]: '#13c2c2',      // Cyan
    [PortType.OBJECT]: '#13c2c2',    // Cyan (same as JSON)
    [PortType.FILE]: '#f5222d',      // Red
    [PortType.IMAGE]: '#eb2f96',     // Pink
    [PortType.EMBEDDING]: '#fa8c16', // Gold
    [PortType.ANY]: '#8c8c8c',       // Gray
  };
  return colors[type] || '#8c8c8c';
}

/**
 * Get position for port based on index
 * Distributes ports evenly on the side
 */
function getPortPosition(
  _index: number, 
  _total: number, 
  side: 'input' | 'output'
): Position {
  // For now, all inputs on left, all outputs on right
  // Future: distribute on top/bottom if too many
  if (side === 'input') {
    return Position.Left;
  } else {
    return Position.Right;
  }
}

/**
 * Calculate handle style with vertical distribution
 */
function getPortHandleStyle(
  _position: Position,
  index: number,
  total: number,
  opts: {
    color: string;
    required?: boolean;
  }
): React.CSSProperties {
  // Base style
  const style: React.CSSProperties = {
    background: opts.color,
    border: opts.required ? '2px solid #ff4d4f' : '2px solid #d9d9d9',
    width: 12,
    height: 12,
    zIndex: 10,
  };

  // Vertical distribution
  if (total > 1) {
    const spacing = 100 / (total + 1);
    const topPercent = spacing * (index + 1);
    style.top = `${topPercent}%`;
  } else {
    style.top = '50%';
  }

  return style;
}

/**
 * Hook: Generate input handles from port definitions
 */
export const usePortBasedInputHandles = (
  ports: InputPort[] | undefined,
  opts?: {
    sourceColor?: string;
    targetColor?: string;
    borderColor?: string;
  }
) => {
  return useMemo(() => {
    if (!ports || ports.length === 0) return null;

    return ports.map((port, index) => {
      const position = getPortPosition(index, ports.length, 'input');
      const portType = Array.isArray(port.type) ? port.type[0] : port.type;
      const color = getPortTypeColor(portType);
      const handleId = `port-in-${port.id}`;

      return (
        <Handle
          key={handleId}
          id={handleId}
          type="target"
          position={position}
          style={getPortHandleStyle(position, index, ports.length, {
            color: opts?.targetColor || color,
            required: port.required,
          })}
          title={`${port.name} (${port.type})${port.required ? ' *' : ''}`}
        />
      );
    });
  }, [ports, opts]);
};

/**
 * Hook: Generate output handles from port definitions
 */
export const usePortBasedOutputHandles = (
  ports: OutputPort[] | undefined,
  opts?: {
    sourceColor?: string;
    targetColor?: string;
    borderColor?: string;
  }
) => {
  return useMemo(() => {
    if (!ports || ports.length === 0) return null;

    return ports.map((port, index) => {
      const position = getPortPosition(index, ports.length, 'output');
      const portType = Array.isArray(port.type) ? port.type[0] : port.type;
      const color = getPortTypeColor(portType);
      const handleId = `port-out-${port.id}`;

      return (
        <Handle
          key={handleId}
          id={handleId}
          type="source"
          position={position}
          style={getPortHandleStyle(position, index, ports.length, {
            color: opts?.sourceColor || color,
            required: port.required,
          })}
          title={`${port.name} (${port.type})`}
        />
      );
    });
  }, [ports, opts]);
};

/**
 * Hook: Use port-based handles OR fallback to position-based
 * 
 * This provides backward compatibility during migration
 */
export const useAdaptiveHandles = (args: {
  // New: Port-based
  inputPorts?: InputPort[];
  outputPorts?: OutputPort[];
  
  // Legacy: Position-based
  inputPositions?: Position[];
  outputPositions?: Position[];
  
  opts?: {
    sourceColor?: string;
    targetColor?: string;
    borderColor?: string;
  };
  
  // Legacy output handle extras for onClick functionality
  outputHandleExtras?: {
    id: string;
    dataType: string;
    getNode: (id: string) => any;
    wrapperRef: React.RefObject<HTMLDivElement | null>;
    openNextStepModal?: (p: any) => void;
  };
}) => {
  const { inputPorts, outputPorts, inputPositions, outputPositions, opts, outputHandleExtras } = args;

  // Use port-based if available
  const portBasedInputHandles = usePortBasedInputHandles(inputPorts, opts);
  const portBasedOutputHandles = usePortBasedOutputHandles(outputPorts, opts);

  // Legacy position-based (from existing useInputHandles/useOutputHandles)
  const legacyInputHandles = useMemo(() => {
    if (!inputPositions || inputPorts) return null;
    
    // Simple position-based handles (existing logic)
    const grouped = new Map<Position, number>();
    inputPositions.forEach((pos) => grouped.set(pos, (grouped.get(pos) ?? 0) + 1));
    
    const handles: React.ReactNode[] = [];
    grouped.forEach((count, pos) => {
      for (let i = 0; i < count; i++) {
        const hid = `in-${pos}-${i}`;
        handles.push(
          <Handle
            key={hid}
            type="target"
            position={pos}
            id={hid}
            style={{
              background: opts?.targetColor || '#1890ff',
              width: 12,
              height: 12,
            }}
          />
        );
      }
    });
    return handles;
  }, [inputPositions, inputPorts, opts]);

  const legacyOutputHandles = useMemo(() => {
    if (!outputPositions || outputPorts) return null;
    
    const grouped = new Map<Position, number>();
    outputPositions.forEach((pos) => grouped.set(pos, (grouped.get(pos) ?? 0) + 1));
    
    // Create onClick handler if extras provided
    const createOnClick = outputHandleExtras
      ? (hid: string, pos: Position) => (e: React.MouseEvent<HTMLDivElement>) => {
          e.stopPropagation();
          const { id, dataType, getNode, wrapperRef, openNextStepModal } = outputHandleExtras;
          const n = getNode(id);
          const sourceW = n?.width ?? n?.measured?.width ?? wrapperRef.current?.offsetWidth ?? undefined;
          const sourceH = n?.height ?? n?.measured?.height ?? wrapperRef.current?.offsetHeight ?? undefined;
          
          openNextStepModal?.({
            nodeId: id,
            handleId: hid,
            handleType: 'source',
            position: pos,
            nodeType: dataType,
            clientX: (e as any).clientX,
            clientY: (e as any).clientY,
            sourceW: sourceW as number,
            sourceH: sourceH as number,
          });
        }
      : undefined;
    
    const handles: React.ReactNode[] = [];
    grouped.forEach((count, pos) => {
      for (let i = 0; i < count; i++) {
        const hid = `out-${pos}-${i}`;
        handles.push(
          <Handle
            key={hid}
            type="source"
            position={pos}
            id={hid}
            onClick={createOnClick ? createOnClick(hid, pos) : undefined}
            style={{
              background: opts?.sourceColor || '#52c41a',
              width: 12,
              height: 12,
            }}
          />
        );
      }
    });
    return handles;
  }, [outputPositions, outputPorts, opts, outputHandleExtras]);

  return {
    inputHandles: portBasedInputHandles || legacyInputHandles,
    outputHandles: portBasedOutputHandles || legacyOutputHandles,
    isPortBased: !!(inputPorts || outputPorts),
  };
};
