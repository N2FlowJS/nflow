import { useState, useEffect, useRef, useCallback } from 'react';
import { useReactFlow, useUpdateNodeInternals, useEdges } from '@xyflow/react';
import type { CustomNodeType } from '@n2flow/types';
import {
  AGENT_TEMPLATE_CUSTOM,
  getAgentInstructionByTemplate,
} from '../../back-end/agent-templates';
import {
  getNodeFieldValue,
  setNodeFieldValueInSchema,
} from '../../back-end/node-registry';

type CyberNodeTransientData = CustomNodeType['data'] & {
  __openConfigToken?: number;
  __openDataToken?: number;
  __focusFieldName?: string;
  __focusFieldToken?: number;
};

export const useCyberNode = (id: string, data: CustomNodeType['data']) => {
  const { setNodes, deleteElements } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();
  const edges = useEdges();
  const transientData = data as CyberNodeTransientData;

  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isDataOpen, setIsDataOpen] = useState(false);
  const [hoveredHandle, setHoveredHandle] = useState<string | null>(null);
  const [highlightedField, setHighlightedField] = useState<string | null>(null);
  const [showFullError, setShowFullError] = useState(false);
  const [copiedDataKey, setCopiedDataKey] = useState<'input' | 'output' | null>(null);

  const highlightTimeoutRef = useRef<number | null>(null);
  const copiedDataTimeoutRef = useRef<number | null>(null);
  const configFieldRefs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null>>({});

  const openConfigToken = transientData.__openConfigToken;
  const openDataToken = transientData.__openDataToken;
  const focusFieldName = transientData.__focusFieldName;
  const focusFieldToken = transientData.__focusFieldToken;

  useEffect(() => {
    if (openConfigToken === undefined) return;
    setIsDataOpen(false);
    setIsConfigOpen(true);
  }, [openConfigToken]);

  useEffect(() => {
    if (openDataToken === undefined) return;
    setIsConfigOpen(false);
    setIsDataOpen(true);
  }, [openDataToken]);

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
      if (highlightTimeoutRef.current !== null) window.clearTimeout(highlightTimeoutRef.current);
      if (copiedDataTimeoutRef.current !== null) window.clearTimeout(copiedDataTimeoutRef.current);
    };
  }, []);

  const updateNodeData = useCallback((newData: Partial<any>) => {
    setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...newData } } : n)));
  }, [id, setNodes]);

  const handleParamChange = useCallback((name: string, value: any) => {
    let updatedSchema = setNodeFieldValueInSchema(data.configSchema, name, value);
    
    if (data.type === 'Agent' && name === 'agentTemplate') {
      const templateName = String(value || '');
      const templateInstruction = getAgentInstructionByTemplate(templateName);
      if (templateName !== AGENT_TEMPLATE_CUSTOM && templateInstruction) {
        updatedSchema = setNodeFieldValueInSchema(updatedSchema, 'instruction', templateInstruction);
      }
    }
    
    updateNodeData({ configSchema: updatedSchema });
  }, [data.type, data.configSchema, updateNodeData]);


  const onRun = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    updateNodeData({ status: 'running' });
    setTimeout(() => {
      updateNodeData({ status: 'success' });
      setTimeout(() => updateNodeData({ status: 'idle' }), 3000);
    }, 1500);
  }, [updateNodeData]);

  const onDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    deleteElements({ nodes: [{ id }] });
  }, [id, deleteElements]);

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
    if (copiedDataTimeoutRef.current !== null) window.clearTimeout(copiedDataTimeoutRef.current);
    copiedDataTimeoutRef.current = window.setTimeout(() => {
      setCopiedDataKey((current) => (current === key ? null : current));
    }, 1400);
  };

  return {
    isConfigOpen, setIsConfigOpen,
    isDataOpen, setIsDataOpen,
    hoveredHandle, setHoveredHandle,
    highlightedField, setHighlightedField,
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
  };
};
