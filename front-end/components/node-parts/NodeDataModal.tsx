import React from 'react';
import { createPortal } from 'react-dom';
import { Copy, Info } from 'lucide-react';
import type { CustomNodeType } from '@n2flow/types';
import { CyberAction, CyberEmptyState, CyberPanel, CyberSectionLabel } from '../shared/CyberUI';

interface NodeDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CustomNodeType['data'];
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
      className="fixed inset-0 z-[1190] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onMouseDown={onClose}
    >
      <div className="w-full max-w-[720px] pointer-events-auto" onMouseDown={(e) => e.stopPropagation()}>
        <CyberPanel
          title="EXECUTION_DATA"
          icon={Info}
          onClose={onClose}
          className="border-cyber-primary/20 bg-black/80 backdrop-blur-xl"
          maxHeight="86vh"
          actions={
            <span className="text-[9px] text-white/30 font-mono uppercase tracking-tighter">
              {data.label}
            </span>
          }
        >
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <CyberSectionLabel label="Input Data" className="border-none p-0 pb-0 text-[8px] text-white/30" />
                <CyberAction
                  icon={Copy}
                  showLabel
                  label={copiedDataKey === 'input' ? 'Copied' : 'Copy'}
                  onClick={() => copyJsonValue(data.lastInput ?? '', 'input')}
                  className="h-6 px-2 min-h-0 border-cyber-primary/20 bg-transparent"
                />
              </div>
              <div className="bg-black/40 border border-white/5 rounded-lg p-3 text-[11px] text-gray-400 font-mono break-all whitespace-pre-wrap leading-relaxed shadow-inner">
                {data.lastInput ? (
                  JSON.stringify(data.lastInput, null, 2)
                ) : (
                  <CyberEmptyState label="Empty_Input" className="justify-start text-gray-600 opacity-50 tracking-[0.3em]" />
                )}
              </div>
            </div>

            {data.lastOutput !== undefined && data.lastOutput !== null && (
              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <CyberSectionLabel label="Output Results" className="border-none p-0 pb-0 text-[8px] text-white/30" />
                  <CyberAction
                    icon={Copy}
                    showLabel
                    label={copiedDataKey === 'output' ? 'Copied' : 'Copy'}
                    onClick={() => copyJsonValue(data.lastOutput, 'output')}
                    className="h-6 px-2 min-h-0 border-cyber-primary/20 bg-transparent"
                  />
                </div>
                <div className="bg-black/40 border border-white/5 rounded-lg p-3 text-[11px] text-cyber-primary font-mono break-all whitespace-pre-wrap leading-relaxed shadow-inner">
                  {typeof data.lastOutput === 'string' ? data.lastOutput : JSON.stringify(data.lastOutput, null, 2)}
                </div>
              </div>
            )}
          </div>
        </CyberPanel>
      </div>
    </div>,
    document.body
  );
};
