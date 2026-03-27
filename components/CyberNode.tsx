import React, { memo, useEffect } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { CustomNodeType } from '../types';
import {
  getNodeFieldValue,
  getNodeInputHandles,
  getNodeRegistryEntry,
  getNodeSourceHandles,
} from '../node-registry';
import {
  PortDataType,
  readPortType,
} from '../node-registry/utils';

// Sub-components
import { NodeHeader } from './node-parts/NodeHeader';
import { NodeActions } from './node-parts/NodeActions';
import { ResultPreview } from './node-parts/ResultPreview';
import { NodeConfigModal } from './node-parts/NodeConfigModal';
import { NodeDataModal } from './node-parts/NodeDataModal';
import { NodeHandles } from './node-parts/NodeHandles';

// Hook
import { useCyberNode } from '../hooks/useCyberNode';

const PreviewButton: React.FC<{ output: unknown }> = ({ output }) => {
  const onOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      window.dispatchEvent(
        new CustomEvent('openResultPreview', {
          detail: { output, title: 'Result Preview' },
        }),
      );
    } catch {
      // ignore
    }
  };

  return (
    <button
      type="button"
      onClick={onOpen}
      className="px-2 py-1 text-[11px] rounded bg-white/5 hover:bg-white/10"
    >
      Preview
    </button>
  );
};

const outputPortTypeCycle: PortDataType[] = ['any', 'text', 'chat_model', 'embedding_model', 'tool', 'boolean_route'];

const CyberNode = ({ id, data, selected }: NodeProps<CustomNodeType>) => {
  const {
    isConfigOpen, setIsConfigOpen,
    isDataOpen, setIsDataOpen,
    hoveredHandle, setHoveredHandle,
    highlightedField,
    showFullError, setShowFullError,
    copiedDataKey,
    configFieldRefs,
    updateNodeData,
    handleParamChange,
    onRun,
    onDelete,
    copyJsonValue,
    edges,
    updateNodeInternals
  } = useCyberNode(id, data);

  const registryEntry = getNodeRegistryEntry(data.type);
  const category = registryEntry?.category || 'other';

  const isLLM = category === 'llm';
  const isAgent = category === 'agent';
  const isInput = category === 'input';
  const isOutput = category === 'output';
  const isPromptTemplate = data.type === 'Prompt Template' || data.type === 'PromptTemplate';

  const promptTemplate = isPromptTemplate ? String(getNodeFieldValue(data, 'template') || '') : '';
  const promptVariables = isPromptTemplate
    ? Array.from(new Set(Array.from(promptTemplate.matchAll(/\{\s*([a-zA-Z0-9_]+)\s*\}/g)).map(m => m[1]))).slice(0, 8)
    : [];
  const promptVariablesKey = promptVariables.join('|');

  const activeNodeId = (data as any).__activeNodeId as string | undefined;
  const activePortType = (data as any).__activePortType as PortDataType | undefined;
  const activeHandleType = (data as any).__activeHandleType as 'source' | 'target' | undefined;
  const hasActiveConnection = !!activePortType && !!activeNodeId && !!activeHandleType;

  const registryInputHandles = getNodeInputHandles(data.type);
  const registrySourceHandles = getNodeSourceHandles(data.type);

  useEffect(() => {
    if (isPromptTemplate) updateNodeInternals(id);
  }, [isPromptTemplate, id, promptVariablesKey, updateNodeInternals]);

  const isCompatibleHandle = (kind: 'source' | 'target', portType: PortDataType) => {
    if (!hasActiveConnection) return false;
    if (activeNodeId === id) return false;

    // If dragging from source, highlight compatible targets
    if (activeHandleType === 'source' && kind === 'target') {
      return portType === 'any' || activePortType === 'any' || activePortType === portType;
    }

    // If dragging from target, highlight compatible sources
    if (activeHandleType === 'target' && kind === 'source') {
      return portType === 'any' || activePortType === 'any' || activePortType === portType;
    }

    return false;
  };

  const getHandleClass = (kind: 'source' | 'target', portType: PortDataType, baseClass: string) => {
    const bClass = kind === 'source' ? getSourceHandleClass(portType, baseClass) : baseClass;
    if (!hasActiveConnection) return bClass;

    const isCompatible = isCompatibleHandle(kind, portType);
    return `${bClass} ${isCompatible ? '!opacity-100 !border-cyber-primary !shadow-[0_0_15px_rgba(0,240,255,0.8)] animate-pulse scale-125' : 'opacity-20'}`;
  };

  const colorByPortType: Record<PortDataType, string> = {
    any: '!border-cyber-muted',
    text: '!border-green-500',
    chat_model: '!border-purple-500',
    embedding_model: '!border-blue-500',
    tool: '!border-amber-500',
    boolean_route: '!border-pink-500',
  };

  const getSourceHandleClass = (sourceType: PortDataType, baseClass: string) => {
    return `${baseClass} ${colorByPortType[sourceType]}`;
  };

  const handleBaseClasses = "transition-opacity duration-300 opacity-0 group-hover:opacity-100";

  const renderOutputTypeBadge = (paramKey: string, fallback: PortDataType, className: string, isHovered: boolean) => {
    const currentType = readPortType(data, paramKey, fallback);
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          window.dispatchEvent(new CustomEvent('takeSnapshot'));
          const idx = outputPortTypeCycle.indexOf(currentType);
          const next = outputPortTypeCycle[(idx + 1) % outputPortTypeCycle.length];
          handleParamChange(paramKey, next);
        }}
        className={`absolute z-20 px-1.5 py-0.5 text-[8px] font-mono rounded border transition-all duration-200 pointer-events-none ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-1'} ${className}`}
        title={`Output type: ${currentType}. Click to change.`}
      >
        {(currentType === 'chat_model' ? 'CHAT' : currentType === 'embedding_model' ? 'EMB' : currentType === 'boolean_route' ? 'BOOL' : currentType.toUpperCase())}
      </button>
    );
  };

  const renderNamedHandle = (options: any) => {
    const { kind, position, portType, id: hId, style, borderClass = '!border-cyber-muted', hoverBorderClass = 'hover:!border-cyber-primary transition-colors', badgeParamKey, badgeFallback, badgeClassName } = options;
    const effectiveType = kind === 'source' && badgeParamKey ? readPortType(data, badgeParamKey, badgeFallback || portType) : portType;
    const bClass = `!w-3 !h-3 !bg-cyber-panel !border-2 ${borderClass} ${hoverBorderClass} ${handleBaseClasses}`;
    const computedClass = getHandleClass(kind, effectiveType, bClass);
    const isHovered = hoveredHandle === hId;

    return (
      <React.Fragment key={`${kind}-${String(hId || 'default')}-${position}`}>
        {kind === 'source' && badgeParamKey && badgeFallback && badgeClassName && renderOutputTypeBadge(badgeParamKey, badgeFallback, badgeClassName, isHovered)}
        <Handle
          type={kind}
          position={position}
          id={hId}
          style={style}
          onMouseEnter={() => hId && setHoveredHandle(hId)}
          onMouseLeave={() => setHoveredHandle(null)}
          className={computedClass}
        />
      </React.Fragment>
    );
  };

  const errorText = (() => {
    if (!data.errorMessage) return '';
    const raw = typeof data.errorMessage === 'string' ? data.errorMessage : JSON.stringify(data.errorMessage);
    const compact = raw.replace(/\s+/g, ' ').trim();
    const jsonStart = compact.indexOf('{"error"');
    if (jsonStart >= 0) {
      try {
        const payload = JSON.parse(compact.slice(jsonStart));
        const msg = payload?.error?.message;
        if (typeof msg === 'string' && msg.trim()) return msg.trim();
      } catch { }
    }
    return compact;
  })();

  const isLongError = errorText.length > 240;
  const displayedErrorText = showFullError || !isLongError ? errorText : `${errorText.slice(0, 240)}...`;

  return (
    <div className={`group relative min-w-[220px] max-w-[300px] bg-cyber-panel/90 backdrop-blur-xl border-2 ${selected ? 'border-cyber-primary ring-1 ring-cyber-primary/50' : (data.status === 'running' ? 'border-yellow-400 animate-pulse' : data.status === 'success' ? 'border-green-500' : 'border-cyber-border')} rounded-xl transition-all duration-300`}>

      <NodeActions onRun={onRun} onOpenConfig={() => setIsConfigOpen(true)} onOpenData={() => setIsDataOpen(true)} onDelete={onDelete} isConfigOpen={isConfigOpen} isDataOpen={isDataOpen} />

      <NodeHeader data={{ ...data, registryEntry }} selected={selected} isAgent={isAgent} isLLM={isLLM} />

      <div className="relative p-3">
        {data.status === 'error' && errorText && (
          <div className="relative z-10 mb-3 p-2 bg-red-500/10 border border-red-500/30 rounded text-[10px] text-red-200 leading-tight">
            <div className={`break-all ${showFullError ? 'max-h-40 overflow-y-auto pr-1' : ''}`}>{displayedErrorText}</div>
            {isLongError && <button type="button" onClick={() => setShowFullError(!showFullError)} className="mt-1 text-[9px] uppercase tracking-wider text-red-300 hover:text-red-100">{showFullError ? 'Show less' : 'Show more'}</button>}
          </div>
        )}

        {data.description && <div className="text-[11px] text-gray-400 leading-relaxed italic">{data.description}</div>}

        {data.status === 'success' && (
          <>
            <div className="mt-2 flex items-center justify-between gap-2">
              <div className="text-[10px] text-gray-400 truncate max-w-[180px]">
                {typeof data.lastOutput === 'string'
                  ? `${(data.lastOutput as string).slice(0, 80)}${(data.lastOutput as string).length > 80 ? '...' : ''}`
                  : 'Result available'}
              </div>
              <PreviewButton output={data.lastOutput} />
            </div>
          </>
        )}
      </div>

      <NodeHandles
        data={data}
        id={id}
        registryInputHandles={registryInputHandles}
        registrySourceHandles={registrySourceHandles}
        isLLM={isLLM}
        isInput={isInput}
        isOutput={isOutput}
        isPromptTemplate={isPromptTemplate}
        promptVariables={promptVariables}
        renderNamedHandle={renderNamedHandle}
        getHandleClass={getHandleClass}
        handleBaseClasses={handleBaseClasses}
        setHoveredHandle={setHoveredHandle}
        hoveredHandle={hoveredHandle}
        renderOutputTypeBadge={renderOutputTypeBadge}
      />

      <div className="px-3 py-2 bg-black/20 rounded-b-xl flex justify-between items-center text-[9px] font-mono text-gray-600">
        <span className="flex items-center gap-1"><div className={`w-1 h-1 rounded-full ${data.status === 'success' ? 'bg-green-500' : 'bg-gray-700'}`} />{data.status?.toUpperCase() || 'IDLE'}</span>
        <span>NODE_ID: {id.split('-')[0]}</span>
      </div>

      <NodeConfigModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} data={data} updateNodeData={updateNodeData} handleParamChange={handleParamChange} highlightedField={highlightedField} configFieldRefs={configFieldRefs} />
      <NodeDataModal isOpen={isDataOpen} onClose={() => setIsDataOpen(false)} data={data} copyJsonValue={copyJsonValue} copiedDataKey={copiedDataKey} />
    </div>
  );
};

export default memo(CyberNode);
