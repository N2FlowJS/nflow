import React, { useEffect, useRef, useState } from 'react';
import { Panel } from '@xyflow/react';
import type { CustomNodeType, NodeData } from '@n2flow/types';
import { Settings, X, Hash, Type, List, FileText, ToggleLeft, Link, Eye, EyeOff, Search } from 'lucide-react';
import { getNodeFieldValue } from '../../../back-end/node-registry';
import NumberInput from '../ui/NumberInput';
import { Input, Button, TextArea, Select } from '../ui';
import { apiService } from '../../lib/apiService';
import { maskSecretValue, looksLikeSecret } from '../../lib/utils';
import type { GlobalVariable } from '../../types/editor';

type ConfigField = NonNullable<NodeData['configSchema']>[number];

type ModelOption = {
  id?: string;
  name?: string;
};

type ModelListResponse = {
  ok?: boolean;
  error?: string;
  models?: Array<string | ModelOption>;
};

function getModelOptionLabel(model: string | ModelOption): string {
  if (typeof model === 'string') {
    return model;
  }

  return model.id || model.name || String(model);
}

function getUniqueModelLabels(models: Array<string | ModelOption>): string[] {
  return Array.from(
    new Set(models.map(getModelOptionLabel).filter(Boolean)),
  );
}

function toGlobalVariablePlaceholder(name: string): string {
  return `{{${name}}}`;
}

function getSelectedGlobalVariableName(value: string): string {
  const match = value.match(/^\{\{\s*([^{}]+?)\s*\}\}$/);
  return match?.[1] || '';
}

interface NodeConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CustomNodeType['data'];
  updateNodeData: (newData: Partial<CustomNodeType['data']>) => void;
  handleParamChange: (name: string, value: string | number | boolean) => void;
  highlightedField: string | null;
  configFieldRefs: React.MutableRefObject<Record<string, HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null>>;
  globalVariables: GlobalVariable[];
}

const FieldIcon = ({ type }: { type: ConfigField['type'] }) => {
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
  configFieldRefs,
  globalVariables,
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
      const resData = await apiService.post<ModelListResponse>('/api/llm/models', {
        baseUrl, apiKey: apiKey || '', provider: 'NVIDIA'
      });

      if (resData.ok && Array.isArray(resData.models)) {
        setModels(getUniqueModelLabels(resData.models));
        lastFetchKeyRef.current = fetchKey;
      } else {
        setModelsError(resData.error || 'No models found in response');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setModelsError(`Failed: ${message}`);
      console.error('Model fetch error:', err);
    } finally {
      setModelsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (ev: KeyboardEvent) => { if (ev.key === 'Escape') onClose(); };
    const onMouse = (ev: MouseEvent) => { if (panelRef.current && !panelRef.current.contains(ev.target as globalThis.Node)) onClose(); };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onMouse);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('mousedown', onMouse); };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isPasswordField = (field: ConfigField) =>
    field.type === 'password' ||
    field.name.toLowerCase().includes('password') ||
    field.name.toLowerCase().includes('key') ||
    field.name.toLowerCase().includes('token') ||
    field.name.toLowerCase().includes('secret');

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

        <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-2">
            <TextArea
              label="Description"
              className="nodrag nowheel"
              value={data.description || ''}
              onFocus={() => window.dispatchEvent(new CustomEvent('takeSnapshot'))}
              onChange={(e) => updateNodeData({ description: e.target.value })}
              placeholder="Describe this node's purpose..."
            />
          </div>

          <div className="border-t border-white/5 my-4" />

          {data.configSchema?.filter((field) => !field.hidden).map((field) => {
            const baseVal = String(getNodeFieldValue(data, 'baseUrl') ?? '');
            const apiKeyVal = String(getNodeFieldValue(data, 'apiKey') ?? '');
            const canFetchModels = !!baseVal && !!apiKeyVal;
            const isPassword = isPasswordField(field);
            const showPw = showPassword[field.name];
            const selectedVariableName = getSelectedGlobalVariableName(String(getNodeFieldValue(data, field.name) ?? ''));
            const selectedVariable = selectedVariableName
              ? globalVariables.find((variable) => variable.name === selectedVariableName)
              : undefined;
            const selectedVariableValue = String(selectedVariable?.value || '').trim();
            const selectedVariableNameLooksSecret = looksLikeSecret(selectedVariableName);

            return (
              <div key={field.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-[11px] text-gray-400 uppercase tracking-wider">
                    <FieldIcon type={field.type} />
                    {field.label}
                  </label>
                  {field.name === 'model' && canFetchModels && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => tryFetchModels(baseVal, apiKeyVal)}
                      loading={modelsLoading}
                      className="text-[10px] min-h-0 py-1"
                    >
                      Fetch Models
                    </Button>
                  )}
                </div>

                {field.name === 'model' && canFetchModels ? (
                  <div>
                    {models.length > 0 ? (
                      <Select
                        ref={(el) => { if (el) configFieldRefs.current[field.name] = el; }}
                        className="nodrag"
                        onFocus={() => window.dispatchEvent(new CustomEvent('takeSnapshot'))}
                        value={String(getNodeFieldValue(data, field.name) ?? '')}
                        onChange={(e) => handleParamChange(field.name, e.target.value)}
                        icon={Search}
                      >
                        <option value="" className="text-gray-500">-- Select Model --</option>
                        {models.map((m, index) => (
                          <option key={`${m}-${index}`} value={m} className="bg-slate-900">
                            {m}
                          </option>
                        ))}
                      </Select>
                    ) : (
                      <div className="space-y-2">
                        <Input
                          ref={(el) => { if (el) configFieldRefs.current[field.name] = el; }}
                          className="nodrag"
                          onFocus={() => window.dispatchEvent(new CustomEvent('takeSnapshot'))}
                          value={String(getNodeFieldValue(data, field.name) ?? '')}
                          onChange={(e) => handleParamChange(field.name, e.target.value)}
                          placeholder="Enter model name..."
                        />
                        {modelsError && <div className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
                          {modelsError}
                        </div>}
                      </div>
                    )}
                  </div>
                ) : field.type === 'select' ? (
                  <Select
                    ref={(el) => { if (el) configFieldRefs.current[field.name] = el; }}
                    className="nodrag"
                    onFocus={() => window.dispatchEvent(new CustomEvent('takeSnapshot'))}
                    value={String(getNodeFieldValue(data, field.name) ?? '')}
                    onChange={(e) => handleParamChange(field.name, e.target.value)}
                    icon={List}
                  >
                    {field.options?.map((opt) => (
                      <option key={opt} value={opt} className="bg-slate-900">
                        {opt}
                      </option>
                    ))}
                  </Select>
                ) : field.type === 'textarea' ? (
                  <TextArea
                    ref={(el) => { if (el) configFieldRefs.current[field.name] = el; }}
                    className="nodrag nowheel"
                    onFocus={() => window.dispatchEvent(new CustomEvent('takeSnapshot'))}
                    value={String(getNodeFieldValue(data, field.name) ?? '')}
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
                  <div className="space-y-2">
                    {field.name !== 'apiKey' && globalVariables.length > 0 && (
                      <select
                        className="nodrag w-full bg-black/30 border border-cyan-500/20 rounded-lg px-3 py-2 text-[11px] text-cyan-200 focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/20 outline-none transition-all cursor-pointer"
                        value={getSelectedGlobalVariableName(String(getNodeFieldValue(data, field.name) ?? ''))}
                        onChange={(e) => {
                          const variableName = e.target.value;
                          if (!variableName) {
                            return;
                          }
                          window.dispatchEvent(new CustomEvent('takeSnapshot'));
                          handleParamChange(field.name, toGlobalVariablePlaceholder(variableName));
                        }}
                      >
                        <option value="">Select Global Variable...</option>
                        {globalVariables.map((variable) => (
                          <option key={variable.id} value={variable.name}>
                            {variable.name}
                          </option>
                        ))}
                      </select>
                    )}

                    <div className="relative">
                      <input
                        ref={(el) => { configFieldRefs.current[field.name] = el; }}
                        type={showPw ? 'text' : 'password'}
                        className="nodrag w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 pr-10 text-[12px] text-white focus:border-cyber-primary/50 focus:ring-1 focus:ring-cyber-primary/20 outline-none transition-all"
                        onFocus={() => window.dispatchEvent(new CustomEvent('takeSnapshot'))}
                        value={String(getNodeFieldValue(data, field.name) ?? '')}
                        onChange={(e) => handleParamChange(field.name, e.target.value)}
                        placeholder={field.name === 'apiKey' ? 'Enter API key...' : (globalVariables.length > 0 ? 'Enter value or use {{GLOBAL_VARIABLE}}' : 'Enter value...')}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                        onClick={() => setShowPassword((prev) => ({ ...prev, [field.name]: !prev[field.name] }))}
                      >
                        {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>

                    {field.name !== 'apiKey' && selectedVariable && (
                      <div className="space-y-1 text-[10px]">
                        <div className="text-cyan-300/80">
                          Resolved from variable <span className="font-mono text-cyan-200">{selectedVariable.name}</span>: <span className="font-mono">{maskSecretValue(selectedVariableValue)}</span>
                        </div>
                        {!selectedVariableValue && (
                          <div className="text-amber-400">
                            Selected Global Variable has an empty value. The placeholder will resolve to an empty value.
                          </div>
                        )}
                        {selectedVariableNameLooksSecret && (
                          <div className="text-amber-400">
                            This variable name looks like a real secret. Prefer a name like <span className="font-mono">NVIDIA_API_KEY</span> and put the actual key in the value field.
                          </div>
                        )}
                      </div>
                    )}
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