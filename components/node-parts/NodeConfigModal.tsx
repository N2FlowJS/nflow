import React from 'react';
import { createPortal } from 'react-dom';
import { Settings, X } from 'lucide-react';
import { getNodeFieldValue } from '../../node-registry';

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
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[1200] bg-black/60 backdrop-blur-[1px] flex items-center justify-center p-4"
      onMouseDown={onClose}
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
            onClick={onClose}
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

          {data.configSchema?.filter((field: any) => !field.hidden).map((field: any) => (
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
    document.body
  );
};
