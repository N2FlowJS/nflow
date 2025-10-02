import React, { useEffect, useMemo, useState } from 'react';
import { getDiscoveredNodeForms } from '../../@node-plugin/discovery/ui-discover';
import { normalizeKey } from '../../../utils/normalizeKey';
import { FlowNode } from '../type';
import DynamicForm from '../form/DynamicForm'; // Import generic form generator

interface DynamicNodeFormProps {
  form: any;
  selectedNode: FlowNode | null;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const DynamicNodeForm: React.FC<DynamicNodeFormProps> = ({ form, selectedNode, setIsDrawerOpen }) => {
  const [discoveredForms, setDiscoveredForms] = useState<Record<string, React.ComponentType<any>>>({});
  const [loadingType, setLoadingType] = useState<string | null>(null);
  const [_, forceRender] = useState(0); // simple force update after dynamic load

  // Normalize to match how registry/types are built (shared util)

  // Build a mapping from normalized node type => package folder name using injected plugin config
  const typeToPackage = useMemo(() => {
    try {
      const cfg = (typeof window !== 'undefined' ? (window as any).__NFLOW_NODE_PLUGIN_CONFIG__ : undefined) || {};
      const map: Record<string, string> = {};
      for (const pkg of Object.keys(cfg)) {
        map[normalizeKey(pkg)] = pkg; // e.g. 'fileanalysis' => 'file-analysis'
      }
      return map;
    } catch {
      return {} as Record<string, string>;
    }
  }, []);

  // Load discovered forms on mount
  useEffect(() => {
    try {
      const forms = getDiscoveredNodeForms();
      setDiscoveredForms(forms);
    } catch (err) {
      console.error('Failed to load discovered forms:', err);
    }
  }, []);

  // Handle dynamic import for forms not pre-discovered
  useEffect(() => {
    if (!selectedNode?.type) return;
    const rawType = selectedNode.type;
    const normKey = normalizeKey(rawType);
    if (discoveredForms[normKey]) return; // already have it
    const pkgFromConfig = typeToPackage[normKey];
    const candidates = Array.from(new Set([
      // Prefer package folder from injected config
      pkgFromConfig,
      // Fallbacks if type string already matches folder name variants
      rawType,
    ].filter(Boolean) as string[]));
    let cancelled = false;
    setLoadingType(rawType);
    (async () => {
      for (const c of candidates) {
        try {
          const mod = await import(/* webpackMode: "lazy" */ `../../../packages/${c}/form`);
          const comp = (mod as any).default || Object.values(mod)[0];
          if (comp && !cancelled) {
            setDiscoveredForms(prev => ({ ...prev, [normKey]: comp as React.ComponentType<any> }));
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
  }, [selectedNode?.type, discoveredForms, typeToPackage]);

  if (!selectedNode) return null;

  const key = normalizeKey(selectedNode.type || '');
  const CustomForm: React.ComponentType<any> | undefined = discoveredForms[key];
  const commonProps = { form, selectedNode, setIsDrawerOpen };

  // Priority: Custom form > Loading state > Generic form from definition
  if (CustomForm) return <CustomForm {...commonProps} />;
  if (loadingType === selectedNode.type) {
    return <div style={{ padding: 12 }}><em>Loading dynamic form for: <strong>{selectedNode.type}</strong>...</em></div>;
  }
  
  // Fallback to generic form generator (uses NodeDefinition.config)
  return <DynamicForm {...commonProps} />;
};

export default DynamicNodeForm;
