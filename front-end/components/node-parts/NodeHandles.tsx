import React, { CSSProperties } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeData } from '@n2flow/types';
import type {
  NodeInputHandleConfig,
  NodeSourceHandleConfig,
} from '../../../back-end/node-registry';
import { PortDataType, readPortType } from '../../../back-end/node-registry/utils';

type RegistryHandleConfig = NodeInputHandleConfig | NodeSourceHandleConfig;

export interface NamedHandleRenderOptions {
  kind: 'source' | 'target';
  position: Position;
  id?: string;
  portType: PortDataType;
  style?: CSSProperties;
  borderClass?: string;
  hoverBorderClass?: string;
  badgeParamKey?: string;
  badgeFallback?: PortDataType;
  badgeClassName?: string;
  index: number;
}

function resolveHandlePosition(position: RegistryHandleConfig['position']): Position {
  switch (position) {
    case 'left':
      return Position.Left;
    case 'right':
      return Position.Right;
    case 'top':
      return Position.Top;
    case 'bottom':
    default:
      return Position.Bottom;
  }
}

function resolveHandleStyle(handle: RegistryHandleConfig): CSSProperties | undefined {
  if (!handle.offsetPercent) {
    return undefined;
  }

  return handle.position === 'top' || handle.position === 'bottom'
    ? { left: `${handle.offsetPercent}%` }
    : { top: `${handle.offsetPercent}%` };
}

interface NodeHandlesProps {
  id: string;
  data: NodeData;
  registryInputHandles: NodeInputHandleConfig[];
  registrySourceHandles: NodeSourceHandleConfig[];
  isLLM: boolean;
  isInput: boolean;
  isOutput: boolean;
  isPromptTemplate: boolean;
  promptVariables: string[];
  renderNamedHandle: (options: NamedHandleRenderOptions) => React.ReactNode;
  getHandleClass: (kind: 'source' | 'target', portType: PortDataType, baseClass: string) => string;
  handleBaseClasses: string;
  setHoveredHandle: (handle: string | null) => void;
  hoveredHandle: string | null;
  renderOutputTypeBadge: (paramKey: string, fallback: PortDataType, className: string, isHovered: boolean) => React.ReactNode;
}

export const NodeHandles = ({
  data,
  registryInputHandles,
  registrySourceHandles,
  isLLM,
  isInput,
  isOutput,
  isPromptTemplate,
  promptVariables,
  renderNamedHandle,
  getHandleClass,
  handleBaseClasses,
  setHoveredHandle,
  hoveredHandle,
  renderOutputTypeBadge
}: NodeHandlesProps) => {
  if (isPromptTemplate) {
    return (
      <>
        {promptVariables.length === 0 ? (
          <Handle
            type="target"
            position={Position.Left}
            className={getHandleClass('target', 'text', `!w-3 !h-3 !bg-cyber-panel !border-2 !border-cyber-muted hover:!border-cyber-primary transition-colors ${handleBaseClasses}`)}
          />
        ) : (
          promptVariables.map((varName, index) => {
            const top = ((index + 1) / (promptVariables.length + 1)) * 100;
            const isHovered = hoveredHandle === varName;
            return (
              <React.Fragment key={varName}>
                <div
                  className={`absolute -left-12 -translate-y-1/2 flex flex-col items-center pointer-events-none transition-all duration-200 ${isHovered ? 'opacity-100 -translate-x-1' : 'opacity-0 translate-x-0'}`}
                  style={{ top: `${top}%` }}
                >
                  <span className="text-[8px] font-mono text-green-300 font-bold tracking-tighter">{varName}</span>
                </div>
                <Handle
                  type="target"
                  position={Position.Left}
                  id={varName}
                  style={{ top: `${top}%` }}
                  onMouseEnter={() => setHoveredHandle(varName)}
                  onMouseLeave={() => setHoveredHandle(null)}
                  className={getHandleClass('target', 'text', `!w-3 !h-3 !bg-cyber-panel !border-2 !border-green-500 hover:!border-green-400 transition-colors ${handleBaseClasses}`)}
                />
                {isHovered && (
                  <div
                    className="absolute -left-48 px-2 py-1 rounded-md border border-cyber-primary/40 bg-cyber-panel/90 backdrop-blur-sm text-[10px] font-mono text-cyber-primary shadow-[0_0_12px_rgba(0,240,255,0.25)] pointer-events-none whitespace-nowrap"
                    style={{ top: `${top}%`, transform: 'translateY(-50%)' }}
                  >
                    Connect to {`{${varName}}`}
                  </div>
                )}
              </React.Fragment>
            );
          })
        )}
        {registrySourceHandles.length > 0 ? (
          registrySourceHandles.map((handle, index) => 
            renderNamedHandle({
              kind: 'source',
              position: resolveHandlePosition(handle.position),
              id: handle.id,
              portType: handle.portType,
              style: resolveHandleStyle(handle),
              borderClass: handle.borderClass,
              hoverBorderClass: handle.hoverBorderClass,
              badgeParamKey: handle.badgeParamKey,
              badgeFallback: handle.badgeFallback,
              badgeClassName: handle.badgeClassName,
              index,
            }) || <React.Fragment key={`registry-source-${index}`} />
          )
        ) : (
          <>
            <Handle
              type="source"
              position={Position.Right}
              id="prompt-output"
              onMouseEnter={() => setHoveredHandle('prompt-output')}
              onMouseLeave={() => setHoveredHandle(null)}
              className={getHandleClass('source', readPortType(data, 'output_type', 'text'), `!w-3 !h-3 !bg-cyber-panel !border-2 hover:!border-cyber-primary transition-colors ${handleBaseClasses}`)}
            />
            {hoveredHandle === 'prompt-output' && (
              <div className="absolute -right-44 top-1/2 -translate-y-1/2 px-2 py-1 rounded-md border border-cyber-primary/40 bg-cyber-panel/90 backdrop-blur-sm text-[10px] font-mono text-cyber-primary shadow-[0_0_12px_rgba(0,240,255,0.25)] pointer-events-none whitespace-nowrap">
                Prompt output
              </div>
            )}
            {renderOutputTypeBadge('output_type', 'text', '-right-1.5 top-1/2 -translate-y-1/2 text-cyber-primary border-cyber-primary/60 bg-black/70', hoveredHandle === 'prompt-output')}
          </>
        )}
      </>
    );
  }

  return (
    <>
      {registryInputHandles.map((handle, index) => 
        renderNamedHandle({
          kind: 'target',
          position: resolveHandlePosition(handle.position),
          id: handle.id,
          portType: handle.portType,
          style: resolveHandleStyle(handle),
          borderClass: handle.borderClass,
          hoverBorderClass: handle.hoverBorderClass,
          index,
        }) || <React.Fragment key={`registry-target-${index}`} />
      )}
      {registrySourceHandles.map((handle, index) => 
        renderNamedHandle({
          kind: 'source',
          position: resolveHandlePosition(handle.position),
          id: handle.id,
          portType: handle.portType,
          style: resolveHandleStyle(handle),
          borderClass: handle.borderClass,
          hoverBorderClass: handle.hoverBorderClass,
          badgeParamKey: handle.badgeParamKey,
          badgeFallback: handle.badgeFallback,
          badgeClassName: handle.badgeClassName,
          index,
        }) || <React.Fragment key={`registry-source-${index}`} />
      )}
    </>
  );
};
