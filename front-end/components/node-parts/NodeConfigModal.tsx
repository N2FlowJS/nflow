import React, { useEffect, useRef, useState } from 'react';
import { Panel } from '@xyflow/react';
import { Settings, X, Hash, Type, List, FileText, ToggleLeft, Link, Eye, EyeOff } from 'lucide-react';
import { getNodeFieldValue } from '../../../back-end/node-registry';
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

const FieldIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'select':
      return <List size={12} className="text-purple-400" />;
    case 'textarea':
      return <FileText size={12} className="text-blue-400" />;
    case 'number':
      return <Hash size={12} className="text-cyan-400" />;
    case 'boolean':
      return <ToggleLeft size={12} className="text-amber-400" />;
    default:
      return <Type size={12} className="text-gray-400" />;
  }
};

const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: (val: boolean) => void }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`nodrag relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ${
      checked ? 'bg-cyber-primary' : 'bg-white/10'
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

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
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const lastFetchKeyRef = useRef<string | null>(null);

  const baseValueGlobal = String(getNodeFieldValue(data, 'baseUrl') ?? '');
  const apiKeyValueGlobal = String(getNodeFieldValue(data, 'apiKey') ?? '');

  useEffect(() => {
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
      const response = await fetch(`${API_BASE}/api/llm/models`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseUrl, apiKey: apiKey || '', provider: 'NVIDIA' }),
      });

      if (!response.ok) throw new Error(`Server returned ${response.status}`);

      const resData = await response.json();
      if (resData.ok && Array.isArray(resData.models)) {
        setModels(resData.models.map((m: any) => m.id || m.name || String(m)));
        lastFetchKeyRef.current = fetchKey;
      } else {
        setModelsError('No models found in response');
      }
    } catch (err: any) {
      setModelsError(`Failed: ${err?.message ?? 'Unknown error'}`);
      console.error('Model fetch error:', err);
    } finally {
      setModelsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (ev: KeyboardEvent) => { if (ev.key === 'Escape') onClose(); };
    const onMouse = (ev: MouseEvent) => { if (panelRef.current && !panelRef.current.contains(ev.target as Node)) onClose(); };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onMouse);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('mousedown', onMouse); };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isPasswordField = (field: any) => field.name?.toLowerCase().includes('key') || field.name?.toLowerCase().includes('token') || field.name?.toLowerCase().includes('secret');

  return (
    <Panel position="top-right" className="m-4 w-[min(640px,95%)] z-50">
      <div ref={panelRef} className="bg-cyber-panel/95 border border-cyber-border rounded-xl shadow-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-black/50 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyber-primary/10 rounded-lg">
              <Settings size={16} className="text-cyber-primary" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Node Settings</h4>
              <span className="text-[10px] text-gray-500 font-mono">{data.type}</span>
            </div>
          </div>
          <button type="button" className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText size={12} className="text-gray-500" />
              <label className="text-[10px] text-gray-400 uppercase tracking-wider">Description</label>
            </div>
            <textarea
              className="nodrag nowheel w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-[12px] text-white placeholder-gray-600 focus:border-cyber-primary/50 focus:ring-1 focus:ring-cyber-primary/20 outline-none min-h-[80px] resize-none transition-all"
              value={data.description || ''}
              onFocus={() => window.dispatchEvent(new CustomEvent('takeSnapshot'))}
              onChange={(e) => updateNodeData({ description: e.target.value })}
              placeholder="Describe this node's purpose..."
            />
          </div>

          <div className="border-t border-white/5 my-4" />

          {data.configSchema?.filter((field: any) => !field.hidden).map((field: any) => {
            const baseVal = String(getNodeFieldValue(data, 'baseUrl') ?? '');
            const apiKeyVal = String(getNodeFieldValue(data, 'apiKey') ?? '');
            const canFetchModels = !!baseVal && !!apiKeyVal;
            const isPassword = isPasswordField(field);
            const showPw = showPassword[field.name];

            return (
              <div key={field.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-[11px] text-gray-400 uppercase tracking-wider">
                    <FieldIcon type={field.type} />
                    {field.label}
                  </label>
                  {field.name === 'model' && canFetchModels && (
                    <button
                      type="button"
                      onClick={() => tryFetchModels(baseVal, apiKeyVal)}
                      disabled={modelsLoading}
                      className="text-[10px] px-3 py-1 bg-cyber-primary/10 hover:bg-cyber-primary/20 border border-cyber-primary/30 text-cyber-primary rounded-md transition-colors disabled:opacity-50"
                    >
                      {modelsLoading ? 'Loading...' : 'Fetch Models'}
                    </button>
                  )}
                </div>

                {field.name === 'model' && canFetchModels ? (
                  <div>
                    {models.length > 0 ? (
                      <select
                        ref={(el) => { configFieldRefs.current[field.name] = el; }}
                        className="nodrag w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-[12px] text-white focus:border-cyber-primary/50 focus:ring-1 focus:ring-cyber-primary/20 outline-none transition-all cursor-pointer"
                        onFocus={() => window.dispatchEvent(new CustomEvent('takeSnapshot'))}
                        value={String(getNodeFieldValue(data, field.name) ?? '')}
                        onChange={(e) => handleParamChange(field.name, e.target.value)}
                      >
                        <option value="" className="text-gray-500">-- Select Model --</option>
                        {models.map((m) => <option key={m} value={m} className="text-white">{m}</option>)}
                      </select>
                    ) : (
                      <div className="space-y-2">
                        <input
                          ref={(el) => { configFieldRefs.current[field.name] = el; }}
                          type="text"
                          className="nodrag w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-[12px] text-white focus:border-cyber-primary/50 focus:ring-1 focus:ring-cyber-primary/20 outline-none transition-all"
                          onFocus={() => window.dispatchEvent(new CustomEvent('takeSnapshot'))}
                          value={String(getNodeFieldValue(data, field.name) ?? '')}
                          onChange={(e) => handleParamChange(field.name, e.target.value)}
                          placeholder="Enter model name..."
                        />
                        {modelsError && <div className="text-[10px] text-amber-400">{modelsError}</div>}
                      </div>
                    )}
                  </div>
                ) : field.type === 'select' ? (
                  <div className="relative">
                    <select
                      ref={(el) => { configFieldRefs.current[field.name] = el; }}
                      className="nodrag w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-[12px] text-white focus:border-cyber-primary/50 focus:ring-1 focus:ring-cyber-primary/20 outline-none transition-all cursor-pointer appearance-none"
                      onFocus={() => window.dispatchEvent(new CustomEvent('takeSnapshot'))}
                      value={String(getNodeFieldValue(data, field.name) ?? '')}
                      onChange={(e) => handleParamChange(field.name, e.target.value)}
                    >
                      {field.options?.map((opt: string) => <option key={opt} value={opt} className="text-white">{opt}</option>)}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <List size={14} className="text-gray-500" />
                    </div>
                  </div>
                ) : field.type === 'textarea' ? (
                  <textarea
                    ref={(el) => { configFieldRefs.current[field.name] = el; }}
                    className="nodrag nowheel w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-[12px] text-white placeholder-gray-600 focus:border-cyber-primary/50 focus:ring-1 focus:ring-cyber-primary/20 outline-none min-h-[100px] resize-none transition-all"
                    onFocus={() => window.dispatchEvent(new CustomEvent('takeSnapshot'))}
                    value={(getNodeFieldValue(data, field.name) as string) ?? ''}
                    onChange={(e) => handleParamChange(field.name, e.target.value)}
                  />
                ) : field.type === 'number' ? (
                  <NumberInput
                    inputRef={(el) => { configFieldRefs.current[field.name] = el; }}
                    value={String(getNodeFieldValue(data, field.name) ?? '')}
                    onChange={(val) => handleParamChange(field.name, val)}
                    step={field.name?.toLowerCase().includes('temp') || field.name?.toLowerCase().includes('top_p') ? 0.1 : 1}
                    onFocus={() => window.dispatchEvent(new CustomEvent('takeSnapshot'))}
                    className="nodrag w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-[12px] text-white focus:border-cyber-primary/50 focus:ring-1 focus:ring-cyber-primary/20 outline-none transition-all"
                  />
                ) : field.type === 'boolean' ? (
                  <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-white/5">
                    <span className="text-[12px] text-gray-400">
                      {getNodeFieldValue(data, field.name) ? 'Enabled' : 'Disabled'}
                    </span>
                    <ToggleSwitch
                      checked={getNodeFieldValue(data, field.name) === true}
                      onChange={(val) => handleParamChange(field.name, val)}
                    />
                  </div>
                ) : isPassword ? (
                  <div className="relative">
                    <input
                      ref={(el) => { configFieldRefs.current[field.name] = el; }}
                      type={showPw ? 'text' : 'password'}
                      className="nodrag w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 pr-10 text-[12px] text-white focus:border-cyber-primary/50 focus:ring-1 focus:ring-cyber-primary/20 outline-none transition-all"
                      onFocus={() => window.dispatchEvent(new CustomEvent('takeSnapshot'))}
                      value={String(getNodeFieldValue(data, field.name) ?? '')}
                      onChange={(e) => handleParamChange(field.name, e.target.value)}
                      placeholder="Enter value..."
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                      onClick={() => setShowPassword((prev) => ({ ...prev, [field.name]: !prev[field.name] }))}
                    >
                      {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                ) : (
                  <input
                    ref={(el) => { configFieldRefs.current[field.name] = el; }}
                    type="text"
                    className="nodrag w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-[12px] text-white placeholder-gray-600 focus:border-cyber-primary/50 focus:ring-1 focus:ring-cyber-primary/20 outline-none transition-all"
                    onFocus={() => window.dispatchEvent(new CustomEvent('takeSnapshot'))}
                    value={String(getNodeFieldValue(data, field.name) ?? '')}
                    onChange={(e) => handleParamChange(field.name, e.target.value)}
                    placeholder="Enter value..."
                  />
                )}
              </div>
            );
          })}

          {!data.configSchema && (
            <div className="text-[11px] text-gray-600 italic py-4 text-center">No parameters available for this node.</div>
          )}
        </div>
      </div>
    </Panel>
  );
};