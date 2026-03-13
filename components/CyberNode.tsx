
import React, { memo, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Handle, Position, NodeProps, useReactFlow, useEdges, useUpdateNodeInternals } from '@xyflow/react';
import { 
  Bot, BrainCircuit, Database, Search, MessageSquare, 
  Terminal, Clock, Cpu, ArrowRightFromLine, Settings, 
  Play, Trash2, X, CheckCircle2, AlertCircle, Info, ChevronDown, ChevronRight,
  Globe, GitMerge, FileJson, Type, Plus
} from 'lucide-react';
import { CustomNodeType } from '../types';
import {
  AGENT_TEMPLATE_CUSTOM,
  getAgentInstructionByTemplate,
} from '../agent-templates';
import {
  getNodeFieldValue,
  getNodeInputHandles,
  getNodeSourceHandles,
  setNodeFieldValueInSchema,
} from '../node-registry';

type PortDataType = 'text' | 'chat_model' | 'embedding_model' | 'tool' | 'boolean_route' | 'any';
const portTypeOptions: PortDataType[] = ['any', 'text', 'chat_model', 'embedding_model', 'tool', 'boolean_route'];
const outputPortTypeCycle: PortDataType[] = ['any', 'text', 'chat_model', 'embedding_model', 'tool', 'boolean_route'];

const iconMap: Record<string, React.ElementType> = {
  'Agent': Bot,
  'ChatModelComponent': BrainCircuit,
  'OllamaChatModelComponent': BrainCircuit,
  'VLLMChatModelComponent': BrainCircuit,
  'EmbeddingModelComponent': Cpu,
  'OllamaEmbeddingModelComponent': Cpu,
  'VLLMEmbeddingModelComponent': Cpu,
  'LanguageModelComponent': BrainCircuit,
  'MSSQLPyODBCComponent': Database,
  'elasticsearch_search': Search,
  'SerperSearchComponent': Search,
  'HTTPRequestComponent': Globe,
  'GitLabMergeRequestComponent': GitMerge,
  'JSONParserComponent': FileJson,
  'CodeExecutionComponent': Terminal,
  'ConditionComponent': GitMerge,
  'GitLabMRReviewTemplate': Terminal,
  'GitLabMRCommentTemplate': Terminal,
  'ChatInput': MessageSquare,
  'ChatOutput': ArrowRightFromLine,
  'Prompt Template': Terminal,
  'CurrentTime': Clock,
  'TextInput': Type,
  'ImageGenerationComponent': BrainCircuit,
  'VariableComponent': Plus,
  'DataStreamComponent': Cpu,
  'FileSystemComponent': FileJson,
  'WaitComponent': Clock,
  'default': Cpu
};

const CyberNode = ({ id, data, selected }: NodeProps<CustomNodeType>) => {
  const { setNodes, deleteElements } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();
  const edges = useEdges();
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isDataOpen, setIsDataOpen] = useState(false);
  const [hoveredHandle, setHoveredHandle] = useState<string | null>(null);
  const [highlightedField, setHighlightedField] = useState<string | null>(null);
  const [showFullError, setShowFullError] = useState(false);
  const [copiedDataKey, setCopiedDataKey] = useState<'input' | 'output' | null>(null);
  const Icon = iconMap[data.type] || iconMap['default'];
  const isChatModelNode = ['ChatModelComponent', 'OllamaChatModelComponent', 'VLLMChatModelComponent'].includes(data.type);
  const isEmbeddingModelNode = ['EmbeddingModelComponent', 'OllamaEmbeddingModelComponent', 'VLLMEmbeddingModelComponent'].includes(data.type);
  const isLegacyLanguageModel = data.type === 'LanguageModelComponent';
  
  const isAgent = data.type === 'Agent';
  const isLLM = isLegacyLanguageModel || isChatModelNode || isEmbeddingModelNode;
  const isTool = edges.some(e => e.source === id && e.targetHandle === 'tools');
  const promptTemplate = data.type === 'Prompt Template' ? String(getNodeFieldValue(data, 'template') || '') : '';
  const promptVariables = data.type === 'Prompt Template'
    ? Array.from(new Set(Array.from(promptTemplate.matchAll(/\{\s*([a-zA-Z0-9_]+)\s*\}/g)).map(m => m[1]))).slice(0, 8)
    : [];
  const promptVariablesKey = promptVariables.join('|');
  const activeSourcePortType = (data as any).__activeSourcePortType as PortDataType | undefined;
  const activeSourceNodeId = (data as any).__activeSourceNodeId as string | undefined;
  const openConfigToken = (data as any).__openConfigToken as number | undefined;
  const focusFieldName = (data as any).__focusFieldName as string | undefined;
  const focusFieldToken = (data as any).__focusFieldToken as number | undefined;
  const hasActiveConnection = !!activeSourcePortType && !!activeSourceNodeId;
  const registryInputHandles = getNodeInputHandles(data.type);
  const registrySourceHandles = getNodeSourceHandles(data.type);
  const configFieldRefs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null>>({});
  const highlightTimeoutRef = useRef<number | null>(null);
  const copiedDataTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (openConfigToken === undefined) return;
    setIsDataOpen(false);
    setIsConfigOpen(true);
  }, [openConfigToken]);

  useEffect(() => {
    if (!isConfigOpen || !focusFieldName || focusFieldToken === undefined) return;
    const target = configFieldRefs.current[focusFieldName];
    if (!target) return;
    setHighlightedField(focusFieldName);
    if (highlightTimeoutRef.current !== null) {
      window.clearTimeout(highlightTimeoutRef.current);
    }
    highlightTimeoutRef.current = window.setTimeout(() => {
      setHighlightedField((prev) => (prev === focusFieldName ? null : prev));
    }, 2000);
    requestAnimationFrame(() => {
      target.focus();
      if ('select' in target && typeof target.select === 'function') {
        target.select();
      }
      target.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });
  }, [isConfigOpen, focusFieldName, focusFieldToken]);

  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current !== null) {
        window.clearTimeout(highlightTimeoutRef.current);
      }
      if (copiedDataTimeoutRef.current !== null) {
        window.clearTimeout(copiedDataTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isConfigOpen && !isDataOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsConfigOpen(false);
        setIsDataOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isConfigOpen, isDataOpen]);

  useEffect(() => {
    if (data.type !== 'Prompt Template') return;
    updateNodeInternals(id);
  }, [data.type, id, promptVariablesKey, updateNodeInternals]);

  useEffect(() => {
    setShowFullError(false);
  }, [data.errorMessage]);

  const copyJsonValue = async (value: unknown, key: 'input' | 'output') => {
    const payload = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
    try {
      await navigator.clipboard.writeText(payload);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = payload;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }

    setCopiedDataKey(key);
    if (copiedDataTimeoutRef.current !== null) {
      window.clearTimeout(copiedDataTimeoutRef.current);
    }
    copiedDataTimeoutRef.current = window.setTimeout(() => {
      setCopiedDataKey((current) => (current === key ? null : current));
    }, 1400);
  };

  const isCompatibleTargetHandle = (targetType: PortDataType) => {
    if (!hasActiveConnection) return false;
    if (activeSourceNodeId === id) return false;
    return targetType === 'any' || activeSourcePortType === 'any' || activeSourcePortType === targetType;
  };

  const getTargetHandleClass = (targetType: PortDataType, baseClass: string) => {
    if (!hasActiveConnection) return baseClass;
    return `${baseClass} ${isCompatibleTargetHandle(targetType) ? '!opacity-100 !border-cyber-primary !shadow-[0_0_12px_rgba(0,240,255,0.6)]' : 'opacity-30'}`;
  };

  const readPortType = (key: string, fallback: PortDataType): PortDataType => {
    const raw = getNodeFieldValue(data, key);
    if (typeof raw !== 'string') return fallback;
    return (portTypeOptions.includes(raw as PortDataType) ? (raw as PortDataType) : fallback);
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

  const portTypeLabel = (portType: PortDataType) => {
    if (portType === 'chat_model') return 'CHAT';
    if (portType === 'embedding_model') return 'EMB';
    if (portType === 'boolean_route') return 'BOOL';
    return portType.toUpperCase();
  };

  const cycleOutputHandleType = (paramKey: string, fallback: PortDataType, e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('takeSnapshot'));
    const current = readPortType(paramKey, fallback);
    const idx = outputPortTypeCycle.indexOf(current);
    const next = outputPortTypeCycle[(idx + 1) % outputPortTypeCycle.length];
    handleParamChange(paramKey, next);
  };

  const renderOutputTypeBadge = (
    paramKey: string,
    fallback: PortDataType,
    className: string
  ) => {
    const currentType = readPortType(paramKey, fallback);
    return (
      <button
        type="button"
        onClick={(e) => cycleOutputHandleType(paramKey, fallback, e)}
        className={`absolute z-20 px-1.5 py-0.5 text-[8px] font-mono rounded border transition-all opacity-0 group-hover:opacity-100 ${className}`}
        title={`Output type: ${currentType}. Click to change.`}
      >
        {portTypeLabel(currentType)}
      </button>
    );
  };

  const renderHandleTitle = (
    text: string,
    className: string,
    style?: React.CSSProperties,
  ) => (
    <div className={className} style={style}>
      <span className="text-[8px] font-mono font-bold tracking-tighter">{text}</span>
    </div>
  );

  type NamedHandleOptions = {
    kind: 'source' | 'target';
    position: Position;
    portType: PortDataType;
    id?: string;
    style?: React.CSSProperties;
    borderClass?: string;
    hoverBorderClass?: string;
    labelText?: string;
    labelClassName?: string;
    labelStyle?: React.CSSProperties;
    badgeParamKey?: string;
    badgeFallback?: PortDataType;
    badgeClassName?: string;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
  };

  const renderNamedHandle = (options: NamedHandleOptions) => {
    const {
      kind,
      position,
      portType,
      id: handleId,
      style,
      borderClass = '!border-cyber-muted',
      hoverBorderClass = 'hover:!border-cyber-primary transition-colors',
      labelText,
      labelClassName,
      labelStyle,
      badgeParamKey,
      badgeFallback,
      badgeClassName,
      onMouseEnter,
      onMouseLeave,
    } = options;

    const effectiveSourceType =
      kind === 'source' && badgeParamKey
        ? readPortType(badgeParamKey, badgeFallback || portType)
        : portType;

    const baseClass = `!w-3 !h-3 !bg-cyber-panel !border-2 ${borderClass} ${hoverBorderClass} ${handleBaseClasses}`;
    const computedClass =
      kind === 'target'
        ? getTargetHandleClass(portType, baseClass)
        : getSourceHandleClass(effectiveSourceType, baseClass);

    return (
      <React.Fragment key={`${kind}-${String(handleId || 'default')}-${position}`}>
        {labelText && labelClassName && renderHandleTitle(labelText, labelClassName, labelStyle)}
        {kind === 'source' && badgeParamKey && badgeFallback && badgeClassName
          ? renderOutputTypeBadge(badgeParamKey, badgeFallback, badgeClassName)
          : null}
        <Handle
          type={kind}
          position={position}
          id={handleId}
          style={style}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          className={computedClass}
        />
      </React.Fragment>
    );
  };

  const mapRegistryPosition = (position: 'left' | 'right' | 'top' | 'bottom'): Position => {
    if (position === 'left') return Position.Left;
    if (position === 'right') return Position.Right;
    if (position === 'top') return Position.Top;
    return Position.Bottom;
  };

  const buildOffsetStyle = (
    position: 'left' | 'right' | 'top' | 'bottom',
    offsetPercent?: number,
  ): React.CSSProperties | undefined => {
    if (offsetPercent === undefined) return undefined;
    if (position === 'top' || position === 'bottom') {
      return { left: `${offsetPercent}%` };
    }
    return { top: `${offsetPercent}%` };
  };

  const renderRegistryTargetHandles = () => {
    if (registryInputHandles.length === 0) return null;
    return registryInputHandles.map((handle, index) =>
      renderNamedHandle({
        kind: 'target',
        position: mapRegistryPosition(handle.position),
        id: handle.id,
        portType: handle.portType,
        style: buildOffsetStyle(handle.position, handle.offsetPercent),
        borderClass: handle.borderClass,
        hoverBorderClass: handle.hoverBorderClass,
        labelText: handle.labelText,
        labelClassName: handle.labelClassName,
      }) || <React.Fragment key={`registry-target-${index}`} />,
    );
  };

  const renderRegistrySourceHandles = () => {
    if (registrySourceHandles.length === 0) return null;
    return registrySourceHandles.map((handle, index) =>
      renderNamedHandle({
        kind: 'source',
        position: mapRegistryPosition(handle.position),
        id: handle.id,
        portType: handle.portType,
        style: buildOffsetStyle(handle.position, handle.offsetPercent),
        borderClass: handle.borderClass,
        hoverBorderClass: handle.hoverBorderClass,
        labelText: handle.labelText,
        labelClassName: handle.labelClassName,
        badgeParamKey: handle.badgeParamKey,
        badgeFallback: handle.badgeFallback,
        badgeClassName: handle.badgeClassName,
      }) || <React.Fragment key={`registry-source-${index}`} />,
    );
  };

  const onRun = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateNodeData({ status: 'running' });
    setTimeout(() => {
      updateNodeData({ status: 'success' });
      setTimeout(() => updateNodeData({ status: 'idle' }), 3000);
    }, 1500);
  };

  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteElements({ nodes: [{ id }] });
  };

  const updateNodeData = (newData: any) => {
    setNodes((nds) => nds.map((node) => {
      if (node.id === id) {
        return { ...node, data: { ...node.data, ...newData } };
      }
      return node;
    }));
  };

  const handleParamChange = (name: string, value: any) => {
    if (data.type === 'Agent' && name === 'agentTemplate') {
      const templateName = String(value || '');
      let updatedSchema = setNodeFieldValueInSchema(data.configSchema, 'agentTemplate', templateName);

      const templateInstruction = getAgentInstructionByTemplate(templateName);
      if (templateName !== AGENT_TEMPLATE_CUSTOM && templateInstruction) {
        updatedSchema = setNodeFieldValueInSchema(updatedSchema, 'instruction', templateInstruction);
      }

      updateNodeData({ configSchema: updatedSchema });
      return;
    }

    const updatedSchema = setNodeFieldValueInSchema(data.configSchema, name, value);
    updateNodeData({ configSchema: updatedSchema });
  };

  // Status styling
  const statusColors = {
    idle: 'border-cyber-border',
    running: 'border-yellow-400 animate-pulse shadow-[0_0_15px_rgba(250,204,21,0.5)]',
    success: 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]',
    error: 'border-red-500'
  };

  const accentColor = selected ? 'border-cyber-primary ring-1 ring-cyber-primary/50' : statusColors[data.status || 'idle'];

  const handleBaseClasses = "transition-opacity duration-300 opacity-0 group-hover:opacity-100";

  const errorText = (() => {
    if (!data.errorMessage) return '';
    const raw = typeof data.errorMessage === 'string'
      ? data.errorMessage
      : JSON.stringify(data.errorMessage);

    const compact = raw.replace(/\s+/g, ' ').trim();
    const jsonStart = compact.indexOf('{"error"');
    if (jsonStart >= 0) {
      try {
        const payload = JSON.parse(compact.slice(jsonStart));
        const msg = payload?.error?.message;
        if (typeof msg === 'string' && msg.trim()) return msg.trim();
      } catch {
      }
    }

    return compact;
  })();

  const isLongError = errorText.length > 240;
  const displayedErrorText = showFullError || !isLongError
    ? errorText
    : `${errorText.slice(0, 240)}...`;

  return (
    <div className={`
      group relative min-w-[220px] max-w-[300px]
      bg-cyber-panel/90 backdrop-blur-xl
      border-2 ${accentColor} rounded-xl
      transition-all duration-300
      ${isAgent ? 'min-h-[160px]' : ''}
    `}>
      {/* Node Actions Overlay */}
      <div className="absolute -top-10 left-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onRun} className="p-2 bg-black/60 border border-yellow-500/50 rounded-lg hover:bg-yellow-500 hover:text-black transition-all">
          <Play size={14} fill="currentColor" />
        </button>
        <button onClick={() => {
          if (!isConfigOpen) window.dispatchEvent(new CustomEvent('takeSnapshot'));
          setIsConfigOpen(!isConfigOpen);
        }} className="p-2 bg-black/60 border border-cyber-primary/50 rounded-lg hover:bg-cyber-primary hover:text-black transition-all text-cyber-primary">
          <Settings size={14} />
        </button>
        <button onClick={() => {
          setIsConfigOpen(false);
          setIsDataOpen(!isDataOpen);
        }} className="p-2 bg-black/60 border border-cyan-500/50 rounded-lg hover:bg-cyan-500 hover:text-black transition-all text-cyan-400">
          <Info size={14} />
        </button>
        <button onClick={onDelete} className="p-2 bg-black/60 border border-red-500/50 rounded-lg hover:bg-red-500 hover:text-white transition-all text-red-400">
          <Trash2 size={14} />
        </button>
      </div>

      {/* Header */}
      <div className={`flex items-center gap-3 p-3 border-b border-white/5 ${isAgent ? 'bg-cyber-secondary/10' : ''}`}>
        <div className={`p-2 rounded-lg bg-white/5 ${selected ? 'text-cyber-primary' : 'text-gray-400'}`}>
          <Icon size={20} />
        </div>
        <div className="flex flex-col flex-1 overflow-hidden">
          <span className="text-sm font-bold text-gray-100 truncate">{data.label}</span>
          <span className="text-[9px] uppercase tracking-wider text-gray-500 font-mono flex items-center gap-1">
            {data.type.replace(/Component|Model/g, '')}
            {(isChatModelNode || isEmbeddingModelNode || isLegacyLanguageModel) && (
              <>
                <span className="w-1 h-1 rounded-full bg-gray-500"></span>
                <span className={(isEmbeddingModelNode || getNodeFieldValue(data, 'modelType') === 'Embedding') ? 'text-blue-400' : 'text-purple-400'}>
                  {isEmbeddingModelNode ? 'Embedding' : isChatModelNode ? 'Chat' : (getNodeFieldValue(data, 'modelType') as string)}
                </span>
              </>
            )}
          </span>
        </div>
        {data.status === 'success' && <CheckCircle2 size={16} className="text-green-500" />}
        {data.status === 'running' && <div className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />}
        {data.status === 'error' && <AlertCircle size={16} className="text-red-500" />}
      </div>

      {/* Configuration Modal */}
      {isConfigOpen && createPortal(
        <div
          className="fixed inset-0 z-[1200] bg-black/60 backdrop-blur-[1px] flex items-center justify-center p-4"
          onMouseDown={() => setIsConfigOpen(false)}
        >
          <div
            className="w-full max-w-[640px] max-h-[86vh] overflow-y-auto bg-cyber-panel border border-cyber-border rounded-2xl shadow-2xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-white/10 bg-cyber-panel/95 backdrop-blur">
              <div className="flex items-center gap-2">
                <Settings size={15} className="text-cyber-primary" />
                <h4 className="text-[11px] font-bold text-cyber-primary uppercase tracking-widest">Node Settings</h4>
                <span className="text-[10px] text-gray-500">{data.label}</span>
              </div>
              <button
                type="button"
                className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/10"
                onClick={() => setIsConfigOpen(false)}
              >
                <X size={14} />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 uppercase">Description</label>
                <textarea
                  className="nodrag nowheel w-full bg-black/50 border border-white/10 rounded px-2.5 py-2 text-[12px] text-white focus:border-cyber-primary outline-none min-h-[64px]"
                  value={data.description || ''}
                  onFocus={() => window.dispatchEvent(new CustomEvent('takeSnapshot'))}
                  onChange={(e) => updateNodeData({ description: e.target.value })}
                  placeholder="Brief explanation of the node's purpose..."
                />
              </div>

              {data.configSchema?.filter((field) => !field.hidden).map((field) => (
                <div key={field.name} className="space-y-1.5">
                  <label className="text-[10px] text-gray-500 uppercase">{field.label}</label>
                  {field.type === 'select' ? (
                    <select
                      ref={(el) => { configFieldRefs.current[field.name] = el; }}
                      className={`nodrag w-full bg-black/50 border rounded px-2.5 py-2 text-[12px] text-white outline-none transition-[border-color,box-shadow] duration-700 ease-out ${highlightedField === field.name ? 'border-yellow-400 ring-1 ring-yellow-400/60' : 'border-white/10 focus:border-cyber-primary'}`}
                      onFocus={() => window.dispatchEvent(new CustomEvent('takeSnapshot'))}
                      value={String(getNodeFieldValue(data, field.name) ?? '')}
                      onChange={(e) => handleParamChange(field.name, e.target.value)}
                    >
                      {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      ref={(el) => { configFieldRefs.current[field.name] = el; }}
                      className={`nodrag nowheel w-full bg-black/50 border rounded px-2.5 py-2 text-[12px] text-white outline-none min-h-[96px] transition-[border-color,box-shadow] duration-700 ease-out ${highlightedField === field.name ? 'border-yellow-400 ring-1 ring-yellow-400/60' : 'border-white/10 focus:border-cyber-primary'}`}
                      onFocus={() => window.dispatchEvent(new CustomEvent('takeSnapshot'))}
                      value={(getNodeFieldValue(data, field.name) as string) ?? ''}
                      onChange={(e) => handleParamChange(field.name, e.target.value)}
                    />
                  ) : (
                    <input
                      ref={(el) => { configFieldRefs.current[field.name] = el; }}
                      type={field.type}
                      className={`nodrag w-full bg-black/50 border rounded px-2.5 py-2 text-[12px] text-white outline-none transition-[border-color,box-shadow] duration-700 ease-out ${highlightedField === field.name ? 'border-yellow-400 ring-1 ring-yellow-400/60' : 'border-white/10 focus:border-cyber-primary'}`}
                      onFocus={() => window.dispatchEvent(new CustomEvent('takeSnapshot'))}
                      value={String(getNodeFieldValue(data, field.name) ?? '')}
                      onChange={(e) => handleParamChange(field.name, e.target.value)}
                    />
                  )}
                </div>
              ))}

              {!data.configSchema && (
                <div className="text-[11px] text-gray-600 italic">No parameters available for this node.</div>
              )}
            </div>
          </div>
        </div>,
        document.body,
      )}

      {/* Data Modal */}
      {isDataOpen && createPortal(
        <div
          className="fixed inset-0 z-[1190] bg-black/60 backdrop-blur-[1px] flex items-center justify-center p-4"
          onMouseDown={() => setIsDataOpen(false)}
        >
          <div
            className="w-full max-w-[720px] max-h-[86vh] overflow-y-auto bg-cyber-panel border border-cyber-border rounded-2xl shadow-2xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-white/10 bg-cyber-panel/95 backdrop-blur">
              <div className="flex items-center gap-2">
                <Info size={15} className="text-cyan-400" />
                <h4 className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest">Execution Data</h4>
                <span className="text-[10px] text-gray-500">{data.label}</span>
              </div>
              <button
                type="button"
                className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/10"
                onClick={() => setIsDataOpen(false)}
              >
                <X size={14} />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-[10px] text-gray-500 uppercase">Last Input</div>
                  <button
                    type="button"
                    onClick={() => copyJsonValue(data.lastInput ?? '', 'input')}
                    className="text-[10px] px-2 py-0.5 rounded border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20"
                  >
                    {copiedDataKey === 'input' ? 'Copied' : 'Copy JSON'}
                  </button>
                </div>
                <div className="bg-black/50 border border-white/10 rounded p-3 text-[11px] text-gray-300 font-mono break-all whitespace-pre-wrap">
                  {data.lastInput ? JSON.stringify(data.lastInput, null, 2) : <span className="text-gray-600 italic">No input data</span>}
                </div>
              </div>

              {data.lastOutput !== undefined && data.lastOutput !== null && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-[10px] text-gray-500 uppercase">Last Output</div>
                    <button
                      type="button"
                      onClick={() => copyJsonValue(data.lastOutput, 'output')}
                      className="text-[10px] px-2 py-0.5 rounded border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20"
                    >
                      {copiedDataKey === 'output' ? 'Copied' : 'Copy JSON'}
                    </button>
                  </div>
                  <div className="bg-black/50 border border-white/10 rounded p-3 text-[11px] text-gray-300 font-mono break-all whitespace-pre-wrap">
                    {typeof data.lastOutput === 'string' ? data.lastOutput : JSON.stringify(data.lastOutput, null, 2)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body,
      )}

      {/* Body / Specialized Agent Content */}
      <>
        <div className="relative p-3">
          {data.status === 'error' && errorText && (
            <div className="relative z-10 mb-3 p-2 bg-red-500/10 border border-red-500/30 rounded text-[10px] text-red-200 leading-tight">
              <div className={`break-all ${showFullError ? 'max-h-40 overflow-y-auto pr-1' : ''}`}>
                {displayedErrorText}
              </div>
              {isLongError && (
                <button
                  type="button"
                  onClick={() => setShowFullError((prev) => !prev)}
                  className="mt-1 text-[9px] uppercase tracking-wider text-red-300 hover:text-red-100"
                >
                  {showFullError ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          )}
           {isAgent && !(data.status === 'error' && errorText) && (
             <div className="absolute inset-0 flex flex-col justify-center pointer-events-none px-3 py-4">
                <div className="flex justify-between items-center mb-8">
                  <span className="text-[9px] font-mono text-slate-500 font-bold uppercase tracking-tighter">Prompt</span>
                  <span className="text-[9px] font-mono text-cyan-500 font-bold uppercase tracking-tighter">Reply</span>
                </div>
                <div className="flex justify-start">
                   <span className="text-[9px] font-mono text-green-500 font-bold uppercase tracking-tighter">User</span>
                </div>
             </div>
          )}
          {data.description && (
            <div className={`text-[11px] text-gray-400 leading-relaxed italic ${isAgent ? 'opacity-30' : ''}`}>
              {data.description}
            </div>
          )}

          {/* Universal Result Preview */}
          {data.status === 'success' && data.lastOutput !== undefined && data.lastOutput !== null && (
            <div className="mt-3 overflow-hidden rounded-lg bg-black/30 border border-white/5">
              <div className="px-2 py-1 bg-white/5 border-b border-white/5 flex justify-between items-center">
                <span className="text-[9px] font-mono text-gray-500 uppercase tracking-tighter">Result Preview</span>
                <span className="text-[8px] font-mono text-gray-600">
                  {typeof data.lastOutput === 'string' ? `${data.lastOutput.length} chars` : 'Data'}
                </span>
              </div>
              <div className="p-2 max-h-[180px] overflow-auto text-[10px] font-mono text-gray-300 custom-scrollbar">
                {(() => {
                  const out = data.lastOutput;
                  if (!out) return <span className="italic text-gray-600">Empty response</span>;

                  // 0. Detect Image URL
                  if (typeof out === 'string' && (out.startsWith('http') && (out.includes('openai.com') || out.match(/\.(jpeg|jpg|gif|png)$/) !== null))) {
                    return (
                      <div className="relative group">
                        <img 
                          src={out} 
                          alt="Generated" 
                          className="w-full h-auto rounded border border-white/10 hover:border-cyber-primary/50 transition-colors shadow-lg cursor-pointer"
                          onClick={() => window.open(out, '_blank')}
                        />
                        <div className="absolute inset-0 bg-cyber-primary/10 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
                      </div>
                    );
                  }

                  // 1. Detect Boolean
                  if (typeof out === 'boolean') {
                    return (
                      <div className={`text-center py-2 font-bold ${out ? 'text-green-400' : 'text-red-400'}`}>
                        {out ? 'TRUE' : 'FALSE'}
                      </div>
                    );
                  }

                  // 2. Detect Table Shape
                  // Support: { rows: [] } or [{}, {}, ...]
                  let rows: any[] = [];
                  let cols: string[] = [];
                  
                  if (typeof out === 'object') {
                    if ('rows' in out && Array.isArray(out.rows)) {
                      rows = out.rows;
                    } else if (Array.isArray(out)) {
                      rows = out;
                    }
                  } else if (typeof out === 'string') {
                    try {
                      const parsed = JSON.parse(out);
                      if (Array.isArray(parsed)) rows = parsed;
                      else if (parsed && typeof parsed === 'object' && 'rows' in parsed) rows = parsed.rows;
                    } catch {}
                  }

                  if (rows.length > 0 && typeof rows[0] === 'object' && rows[0] !== null) {
                    cols = Object.keys(rows[0]).filter(k => typeof rows[0][k] !== 'object' || rows[0][k] === null).slice(0, 4);
                    // If we have columns, it's a table
                    if (cols.length > 0) {
                      return (
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b border-white/10 text-gray-500 text-[9px]">
                              {cols.map(c => <th key={c} className="text-left px-1 py-0.5 font-bold uppercase">{c}</th>)}
                            </tr>
                          </thead>
                          <tbody>
                            {rows.slice(0, 5).map((r, i) => (
                              <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                                {cols.map(c => (
                                  <td key={c} className="px-1 py-1 truncate max-w-[80px]">
                                    {String(r[c] ?? '')}
                                  </td>
                                ))}
                              </tr>
                            ))}
                            {rows.length > 5 && (
                              <tr>
                                <td colSpan={cols.length} className="text-center py-1 opacity-40 text-[9px]">
                                  + {rows.length - 5} more rows
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      );
                    }
                  }

                  // 3. Detect List Shape (Search results, etc)
                  // We already handled this in Table if it was array of objects, 
                  // but we might want a special list view for search-like objects (title, snippet, link)
                  if (rows.length > 0 && typeof rows[0] === 'object' && rows[0] !== null) {
                     const r0 = rows[0];
                     if ('title' in r0 || 'snippet' in r0 || 'text' in r0) {
                        return (
                          <div className="space-y-2">
                            {rows.slice(0, 3).map((item, i) => (
                              <div key={i} className="pb-2 border-b border-white/5 last:border-0 last:pb-0 group">
                                {item.title && <div className="text-cyber-primary truncate font-bold group-hover:text-cyan-300 transition-colors">{item.title}</div>}
                                {item.link && <div className="text-[8px] text-gray-500 truncate mb-1">{item.link}</div>}
                                <div className="text-gray-400 line-clamp-3 text-[9px] leading-snug">
                                  {item.snippet || item.text || item.content || JSON.stringify(item)}
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                     }
                  }

                  // 4. Fallback (Text or JSON)
                  const text = typeof out === 'string' ? out : JSON.stringify(out, null, 2);
                  return (
                    <div className="whitespace-pre-wrap line-clamp-[12] break-all leading-normal">
                      {text}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </>

      {/* Handles Logic */}
      {isAgent ? (
        <>
          {renderRegistryTargetHandles()}
          {renderRegistrySourceHandles()}
        </>
      ) : data.type === 'ConditionComponent' ? (
        <>
          {renderRegistryTargetHandles()}
          {renderRegistrySourceHandles()}
        </>
      ) : data.type === 'elasticsearch_search' ? (
        <>
          {renderRegistryTargetHandles()}
          {renderRegistrySourceHandles()}
        </>
      ) : data.type === 'Prompt Template' ? (
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
              return (
                <React.Fragment key={varName}>
                  <div
                    className="absolute -left-12 -translate-y-1/2 flex flex-col items-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                    style={{ top: `${top}%` }}
                  >
                    <span className="text-[8px] font-mono text-green-300 font-bold tracking-tighter">{varName}</span>
                  </div>
                  <Handle
                    type="target"
                    position={Position.Left}
                    id={varName}
                    style={{ top: `${top}%` }}
                    onMouseEnter={() => setHoveredHandle(`prompt-in-${varName}`)}
                    onMouseLeave={() => setHoveredHandle(null)}
                    className={getTargetHandleClass('text', `!w-3 !h-3 !bg-cyber-panel !border-2 !border-green-500 hover:!border-green-400 transition-colors ${handleBaseClasses}`)}
                  />
                  {hoveredHandle === `prompt-in-${varName}` && (
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
          {registrySourceHandles.length > 0
            ? renderRegistrySourceHandles()
            : (
              <>
                <Handle
                  type="source"
                  position={Position.Right}
                  onMouseEnter={() => setHoveredHandle('prompt-output')}
                  onMouseLeave={() => setHoveredHandle(null)}
                  className={getSourceHandleClass(readPortType('output_type', 'text'), `!w-3 !h-3 !bg-cyber-panel !border-2 hover:!border-cyber-primary transition-colors ${handleBaseClasses}`)}
                />
                {hoveredHandle === 'prompt-output' && (
                  <div className="absolute -right-44 top-1/2 -translate-y-1/2 px-2 py-1 rounded-md border border-cyber-primary/40 bg-cyber-panel/90 backdrop-blur-sm text-[10px] font-mono text-cyber-primary shadow-[0_0_12px_rgba(0,240,255,0.25)] pointer-events-none whitespace-nowrap">
                    Prompt output
                  </div>
                )}
                {renderOutputTypeBadge('output_type', 'text', '-right-10 top-1/2 -translate-y-1/2 text-cyber-primary border-cyber-primary/60 bg-black/70')}
              </>
            )}
        </>
      ) : (
        <>
          {registryInputHandles.length > 0
            ? renderRegistryTargetHandles()
            : renderNamedHandle({
                kind: 'target',
                position: Position.Left,
                portType: data.type === 'ChatOutput' || data.type === 'Prompt Template' ? 'text' : 'any',
              })}
          {registrySourceHandles.length > 0
            ? renderRegistrySourceHandles()
            : (
              <>
                {renderNamedHandle({
                  kind: 'source',
                  position: isLLM ? Position.Bottom : Position.Right,
                  portType: isChatModelNode
                    ? 'chat_model'
                    : isEmbeddingModelNode
                    ? 'embedding_model'
                    : ['ChatInput', 'TextInput', 'Prompt Template', 'CurrentTime', 'ChatOutput'].includes(data.type)
                    ? 'text'
                    : 'any',
                  badgeParamKey: 'output_type',
                  badgeFallback: isChatModelNode
                    ? 'chat_model'
                    : isEmbeddingModelNode
                    ? 'embedding_model'
                    : ['ChatInput', 'TextInput', 'Prompt Template', 'CurrentTime', 'ChatOutput'].includes(data.type)
                    ? 'text'
                    : 'any',
                  badgeClassName: isLLM
                    ? 'left-1/2 -translate-x-1/2 -bottom-11 text-cyber-primary border-cyber-primary/60 bg-black/70'
                    : '-right-10 top-1/2 -translate-y-1/2 text-cyber-primary border-cyber-primary/60 bg-black/70',
                })}
                {!isLLM && data.type !== 'ChatInput' && data.type !== 'ChatOutput' && (
                  renderNamedHandle({
                    kind: 'source',
                    position: Position.Top,
                    id: 'as_tool',
                    portType: 'tool',
                    borderClass: '!border-amber-500',
                    hoverBorderClass: 'hover:!border-amber-400 transition-colors',
                    labelText: 'AS_TOOL',
                    labelClassName: 'absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity',
                    badgeParamKey: 'as_tool_output_type',
                    badgeFallback: 'tool',
                    badgeClassName: 'left-1/2 -translate-x-1/2 -top-11 text-amber-300 border-amber-500/60 bg-black/70',
                  })
                )}
              </>
            )}
        </>
      )}

      <div className="px-3 py-2 bg-black/20 rounded-b-xl flex justify-between items-center text-[9px] font-mono text-gray-600">
        <span className="flex items-center gap-1">
          <div className={`w-1 h-1 rounded-full ${data.status === 'success' ? 'bg-green-500' : 'bg-gray-700'}`} />
          {data.status?.toUpperCase() || 'IDLE'}
        </span>
        <span>NODE_ID: {id.split('-')[0]}</span>
      </div>
    </div>
  );
};

export default memo(CyberNode);
