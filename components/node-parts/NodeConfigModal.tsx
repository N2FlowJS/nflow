import React, { useEffect, useRef, useState } from 'react';
import { Panel } from '@xyflow/react';
import { Settings, X } from 'lucide-react';
import { getNodeFieldValue } from '../../node-registry';
import NumberInput from '../ui/NumberInput';
import { API_BASE } from '../../lib/api';

interface NodeConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  updateNodeData: (newData: any) => void;
  handleParamChange: (name: string, value: any) => void;
  highlightedField: string | null;
  configFieldRefs: React.MutableRefObject<Record<string, HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null>>;
}

export const NodeConfigModal = ({
  isOpen,
  onClose,
  data,
  updateNodeData,
  handleParamChange,
  highlightedField,
  configFieldRefs
}: NodeConfigModalProps) => {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [models, setModels] = useState<string[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsError, setModelsError] = useState<string | null>(null);
  const lastFetchKeyRef = useRef<string | null>(null);

  const baseValueGlobal = String(getNodeFieldValue(data, 'baseUrl') ?? '');
  const apiKeyValueGlobal = String(getNodeFieldValue(data, 'apiKey') ?? '');

  useEffect(() => {
    // clear loaded models when base/api change
    setModels([]);
    setModelsError(null);
    setModelsLoading(false);
    lastFetchKeyRef.current = null;
  }, [baseValueGlobal, apiKeyValueGlobal]);

  const tryFetchModels = async (baseUrl: string, apiKey?: string) => {
    if (!baseUrl) {
      setModelsError('No base URL provided');
      return;
    }
    const fetchKey = `${baseUrl}::${apiKey || ''}`;
    if (lastFetchKeyRef.current === fetchKey && models.length > 0) return;
    
    setModelsLoading(true);
    setModelsError(null);
    setModels([]);
    
    try {
      // Use backend endpoint to avoid CORS issues
      const response = await fetch(`${API_BASE}/api/llm/models`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          baseUrl,
          apiKey: apiKey || '',
          provider: 'NVIDIA', // Detect from context if needed
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      if (data.ok && Array.isArray(data.models)) {
        setModels(data.models.map((m: any) => m.id || m.name || String(m)));
        lastFetchKeyRef.current = fetchKey;
      } else {
        setModelsError('No models found in response');
      }
    } catch (err: any) {
      setModelsError(`Failed to fetch models: ${err?.message ?? 'Unknown error'}. Make sure the base URL and API key are correct.`);
      console.error('Model fetch error:', err);
    } finally {
      setModelsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') onClose();
    };
    const onMouse = (ev: MouseEvent) => {
      if (!panelRef.current) return;
      if (!panelRef.current.contains(ev.target as Node)) onClose();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onMouse);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onMouse);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <Panel position="top-right" className="m-4 w-[min(640px,95%)] z-50">
      <div ref={panelRef} className="bg-cyber-panel/95 border border-cyber-border rounded-xl shadow-2xl overflow-hidden">
        <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between bg-black/30">
          <div className="flex items-center gap-2">
            <Settings size={15} className="text-cyber-primary" />
            <h4 className="text-[11px] font-bold text-cyber-primary uppercase tracking-widest">Node Settings</h4>
            <span className="text-[10px] text-gray-500">{data.label}</span>
          </div>
          <button
            type="button"
            className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/10"
            onClick={onClose}
          >
            <X size={14} />
          </button>
        </div>

        <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
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

          {data.configSchema?.filter((field: any) => !field.hidden).map((field: any) => {
            const baseVal = String(getNodeFieldValue(data, 'baseUrl') ?? '');
            const apiKeyVal = String(getNodeFieldValue(data, 'apiKey') ?? '');
            const canFetchModels = !!baseVal && !!apiKeyVal;

            return (
              <div key={field.name} className="space-y-1.5">
                <label className="text-[10px] text-gray-500 uppercase flex items-center justify-between">
                  <span>{field.label}</span>
                  {field.name === 'model' && canFetchModels && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => tryFetchModels(baseVal, apiKeyVal)}
                        className="text-[11px] px-2 py-0.5 bg-black/20 border border-white/6 rounded text-cyber-primary hover:bg-white/5"
                      >
                        Load models
                      </button>
                      {modelsLoading && <span className="text-[11px] text-gray-400">Loading...</span>}
                    </div>
                  )}
                </label>

                {field.name === 'model' && canFetchModels ? (
                  // when baseUrl+apiKey present allow loading selectable models
                  <div>
                    {models.length > 0 ? (
                      <select
                        ref={(el) => { configFieldRefs.current[field.name] = el; }}
                        className={`nodrag w-full bg-black/50 border rounded px-2.5 py-2 text-[12px] text-white outline-none transition-[border-color,box-shadow] duration-700 ease-out ${highlightedField === field.name ? 'border-yellow-400 ring-1 ring-yellow-400/60' : 'border-white/10 focus:border-cyber-primary'}`}
                        onFocus={() => window.dispatchEvent(new CustomEvent('takeSnapshot'))}
                        value={String(getNodeFieldValue(data, field.name) ?? '')}
                        onChange={(e) => handleParamChange(field.name, e.target.value)}
                      >
                        <option value="">-- choose model --</option>
                        {models.map((m) => <option key={m} value={m}>{m}</option>)}
                      </select>
                    ) : (
                      <div>
                        <input
                          ref={(el) => { configFieldRefs.current[field.name] = el; }}
                          type={field.type}
                          className={`nodrag w-full bg-black/50 border rounded px-2.5 py-2 text-[12px] text-white outline-none transition-[border-color,box-shadow] duration-700 ease-out ${highlightedField === field.name ? 'border-yellow-400 ring-1 ring-yellow-400/60' : 'border-white/10 focus:border-cyber-primary'}`}
                          onFocus={() => window.dispatchEvent(new CustomEvent('takeSnapshot'))}
                          value={String(getNodeFieldValue(data, field.name) ?? '')}
                          onChange={(e) => handleParamChange(field.name, e.target.value)}
                        />
                        {modelsError && <div className="text-xs text-amber-400 mt-1">{modelsError}</div>}
                      </div>
                    )}
                  </div>
                ) : field.type === 'select' ? (
                  <select
                    ref={(el) => { configFieldRefs.current[field.name] = el; }}
                    className={`nodrag w-full bg-black/50 border rounded px-2.5 py-2 text-[12px] text-white outline-none transition-[border-color,box-shadow] duration-700 ease-out ${highlightedField === field.name ? 'border-yellow-400 ring-1 ring-yellow-400/60' : 'border-white/10 focus:border-cyber-primary'}`}
                    onFocus={() => window.dispatchEvent(new CustomEvent('takeSnapshot'))}
                    value={String(getNodeFieldValue(data, field.name) ?? '')}
                    onChange={(e) => handleParamChange(field.name, e.target.value)}
                  >
                    {field.options?.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                ) : field.type === 'textarea' ? (
                  <textarea
                    ref={(el) => { configFieldRefs.current[field.name] = el; }}
                    className={`nodrag nowheel w-full bg-black/50 border rounded px-2.5 py-2 text-[12px] text-white outline-none min-h-[96px] transition-[border-color,box-shadow] duration-700 ease-out ${highlightedField === field.name ? 'border-yellow-400 ring-1 ring-yellow-400/60' : 'border-white/10 focus:border-cyber-primary'}`}
                    onFocus={() => window.dispatchEvent(new CustomEvent('takeSnapshot'))}
                    value={(getNodeFieldValue(data, field.name) as string) ?? ''}
                    onChange={(e) => handleParamChange(field.name, e.target.value)}
                  />
                ) : field.type === 'number' ? (
                  <NumberInput
                    inputRef={(el) => { configFieldRefs.current[field.name] = el; }}
                    value={String(getNodeFieldValue(data, field.name) ?? '')}
                    onChange={(val) => handleParamChange(field.name, val)}
                    step={field.name?.toLowerCase().includes('temp') || field.name?.toLowerCase().includes('temperature') || field.name?.toLowerCase().includes('top_p') ? 0.1 : 1}
                    onFocus={() => window.dispatchEvent(new CustomEvent('takeSnapshot'))}
                    className={`nodrag w-full bg-black/50 border rounded px-2.5 py-2 text-[12px] text-white outline-none transition-[border-color,box-shadow] duration-700 ease-out ${highlightedField === field.name ? 'border-yellow-400 ring-1 ring-yellow-400/60' : 'border-white/10 focus:border-cyber-primary'}`}
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
            );
          })}

          {!data.configSchema && (
            <div className="text-[11px] text-gray-600 italic">No parameters available for this node.</div>
          )}
        </div>
      </div>
    </Panel>
  );
};
