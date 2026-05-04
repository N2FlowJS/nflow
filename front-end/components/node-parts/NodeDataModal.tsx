import React from 'react';
import { createPortal } from 'react-dom';
import { Info, X } from 'lucide-react';

interface NodeDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  copyJsonValue: (value: unknown, key: 'input' | 'output') => void;
  copiedDataKey: 'input' | 'output' | null;
}

export const NodeDataModal = ({
  isOpen,
  onClose,
  data,
  copyJsonValue,
  copiedDataKey
}: NodeDataModalProps) => {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[1190] bg-black/60 backdrop-blur-[1px] flex items-center justify-center p-4"
      onMouseDown={onClose}
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
            onClick={onClose}
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
    document.body
  );
};
