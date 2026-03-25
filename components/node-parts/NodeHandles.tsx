import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { PortDataType, readPortType } from '../../node-registry/utils';

interface NodeHandlesProps {
  id: string;
  data: any;
  registryInputHandles: any[];
  registrySourceHandles: any[];
  isLLM: boolean;
  isInput: boolean;
  isOutput: boolean;
  isPromptTemplate: boolean;
  promptVariables: string[];
  renderNamedHandle: (options: any) => React.ReactNode;
  getTargetHandleClass: (targetType: PortDataType, baseClass: string) => string;
  getSourceHandleClass: (sourceType: PortDataType, baseClass: string) => string;
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
  getTargetHandleClass,
  getSourceHandleClass,
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
            className={getTargetHandleClass('text', `!w-3 !h-3 !bg-cyber-panel !border-2 !border-cyber-muted hover:!border-cyber-primary transition-colors ${handleBaseClasses}`)}
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
                  className={getTargetHandleClass('text', `!w-3 !h-3 !bg-cyber-panel !border-2 !border-green-500 hover:!border-green-400 transition-colors ${handleBaseClasses}`)}
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
              position: handle.position === 'left' ? Position.Left : handle.position === 'right' ? Position.Right : handle.position === 'top' ? Position.Top : Position.Bottom,
              id: handle.id,
              portType: handle.portType,
              style: handle.offsetPercent ? (handle.position === 'top' || handle.position === 'bottom' ? { left: `${handle.offsetPercent}%` } : { top: `${handle.offsetPercent}%` }) : undefined,
              borderClass: handle.borderClass,
              hoverBorderClass: handle.hoverBorderClass,
              badgeParamKey: handle.badgeParamKey,
              badgeFallback: handle.badgeFallback,
              badgeClassName: handle.badgeClassName,
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
              className={getSourceHandleClass(readPortType(data, 'output_type', 'text'), `!w-3 !h-3 !bg-cyber-panel !border-2 hover:!border-cyber-primary transition-colors ${handleBaseClasses}`)}
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
      {registryInputHandles.length > 0 ? (
        registryInputHandles.map((handle, index) => 
          renderNamedHandle({
            kind: 'target',
            position: handle.position === 'left' ? Position.Left : handle.position === 'right' ? Position.Right : handle.position === 'top' ? Position.Top : Position.Bottom,
            id: handle.id,
            portType: handle.portType,
            style: handle.offsetPercent ? (handle.position === 'top' || handle.position === 'bottom' ? { left: `${handle.offsetPercent}%` } : { top: `${handle.offsetPercent}%` }) : undefined,
            borderClass: handle.borderClass,
            hoverBorderClass: handle.hoverBorderClass,
          }) || <React.Fragment key={`registry-target-${index}`} />
        )
      ) : (
        renderNamedHandle({
          kind: 'target',
          position: Position.Left,
          portType: isOutput ? 'text' : 'any',
        })
      )}
      {registrySourceHandles.length > 0 ? (
        registrySourceHandles.map((handle, index) => 
          renderNamedHandle({
            kind: 'source',
            position: handle.position === 'left' ? Position.Left : handle.position === 'right' ? Position.Right : handle.position === 'top' ? Position.Top : Position.Bottom,
            id: handle.id,
            portType: handle.portType,
            style: handle.offsetPercent ? (handle.position === 'top' || handle.position === 'bottom' ? { left: `${handle.offsetPercent}%` } : { top: `${handle.offsetPercent}%` }) : undefined,
            borderClass: handle.borderClass,
            hoverBorderClass: handle.hoverBorderClass,
            badgeParamKey: handle.badgeParamKey,
            badgeFallback: handle.badgeFallback,
            badgeClassName: handle.badgeClassName,
          }) || <React.Fragment key={`registry-source-${index}`} />
        )
      ) : (
        <>
          {renderNamedHandle({
            kind: 'source',
            position: isLLM ? Position.Bottom : Position.Right,
            portType: isLLM ? 'chat_model' : isInput ? 'text' : 'any',
            badgeParamKey: 'output_type',
            badgeFallback: isLLM ? 'chat_model' : isInput ? 'text' : 'any',
            badgeClassName: isLLM
              ? 'left-1/2 -translate-x-1/2 -bottom-6 text-cyber-primary border-cyber-primary/60 bg-black/70'
              : '-right-1.5 top-1/2 -translate-y-1/2 text-cyber-primary border-cyber-primary/60 bg-black/70',
          })}
          {!isLLM && !isInput && !isOutput && renderNamedHandle({
            kind: 'source',
            position: Position.Top,
            id: 'as_tool',
            portType: 'tool',
            borderClass: '!border-amber-500',
            hoverBorderClass: 'hover:!border-amber-400 transition-colors',
            badgeParamKey: 'as_tool_output_type',
            badgeFallback: 'tool',
            badgeClassName: 'left-1/2 -translate-x-1/2 -top-6 text-amber-300 border-amber-500/60 bg-black/70',
          })}
        </>
      )}
    </>
  );
};
