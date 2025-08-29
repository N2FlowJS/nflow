import React, { useMemo, useState, useEffect } from 'react';
import { FlowNode } from '../../../models/flowTypes';
import { getDiscoveredNodeForms } from '../../../packages/@node-plugin/discovery/ui-discover';
// Fallback direct imports for core forms that should always be present even if
// dynamic discovery (server fs scan + window injection) hasn't populated yet.

interface NodeFormProps {
  form: any;
  selectedNode: FlowNode | null;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

// Cache for dynamically imported forms so they persist across renders/navigation
const dynamicFormCache: Record<string, React.ComponentType<any>> = {};

const NodeForm: React.FC<NodeFormProps> = ({ form, selectedNode, setIsDrawerOpen }) => {
  const discoveredForms = useMemo(() => {
    try { return getDiscoveredNodeForms(); } catch { return {}; }
  }, []);

  const [loadingType, setLoadingType] = useState<string | null>(null);
  const [_, forceRender] = useState(0); // simple force update after dynamic load

  useEffect(() => {
    if (!selectedNode?.type) return;
    const rawType = selectedNode.type;
    const key = rawType.replace(/[^a-zA-Z0-9\-]/g, '');
    if ((discoveredForms as any)[key] || dynamicFormCache[key]) return; // already have it
    const candidates = Array.from(new Set([rawType, key]));
    let cancelled = false;
    setLoadingType(rawType);
    (async () => {
      for (const c of candidates) {
        try {
          const mod = await import(/* webpackMode: "lazy" */ `../../../packages/${c}/form`);
          const comp = (mod as any).default || Object.values(mod)[0];
          if (comp && !cancelled) {
            dynamicFormCache[key] = comp as React.ComponentType<any>;
            setLoadingType(null);
            forceRender(v => v + 1);
            return;
          }
        } catch {
          // continue
        }
      }
      if (!cancelled) setLoadingType(null);
    })();
    return () => { cancelled = true; };
  }, [selectedNode?.type, discoveredForms]);

  if (!selectedNode) return null;
  const key = selectedNode.type?.replace(/[^a-zA-Z0-9\-]/g, '') || '';
  const DynamicForm: React.ComponentType<any> | undefined = (discoveredForms as any)[key]  || dynamicFormCache[key];
  const commonProps = { form, selectedNode, setIsDrawerOpen };

  if (DynamicForm) return <DynamicForm {...commonProps} />;
  if (loadingType === selectedNode.type) {
    return <div style={{ padding: 12 }}><em>Loading dynamic form for: <strong>{selectedNode.type}</strong>...</em></div>;
  }
  return <div style={{ padding: 12 }}>Unsupported node type (no dynamic form found): <strong>{selectedNode.type}</strong></div>;
};

export default NodeForm;
