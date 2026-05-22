import React, { useEffect, useState } from 'react';
import { Copy, Info } from 'lucide-react';
import type { CustomNodeType } from '@n2flow/types';
import { CyberAction, CyberEmptyState, CyberMetaText, CyberPanel, CyberSectionLabel } from '../shared/CyberUI';

type ExecDetail = { data?: CustomNodeType['data']; title?: string; nodeId?: string };

const NodeDataModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<CustomNodeType['data'] | null>(null);
  const [title, setTitle] = useState('EXECUTION_DATA');
  const [copiedKey, setCopiedKey] = useState<'input' | 'output' | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<ExecDetail>;
      setData(ce.detail?.data ?? null);
      setTitle(ce.detail?.title ? ce.detail.title.toUpperCase() : 'EXECUTION_DATA');
      setIsOpen(true);
    };

    window.addEventListener('openExecutionData', handler as EventListener);
    return () => window.removeEventListener('openExecutionData', handler as EventListener);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

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
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey((c) => (c === key ? null : c)), 1400);
  };

  if (!isOpen || !data) return null;

  return (
    <div className="h-full w-full min-h-0">
      <CyberPanel
        title={title}
        icon={Info}
        onClose={() => setIsOpen(false)}
        className="shadow-[0_0_20px_rgba(0,0,0,0.45)] border-cyber-primary/20 h-full rounded-none border-y-0 border-r-0 bg-black/80 backdrop-blur-xl"
        maxHeight={"100%"}
        scrollable={false}
      >
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <CyberSectionLabel label="Input Data" className="border-none p-0 pb-0 text-[8px] text-white/30" />
              <CyberAction
                icon={Copy}
                showLabel
                label={copiedKey === 'input' ? 'Copied' : 'Copy'}
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
                  label={copiedKey === 'output' ? 'Copied' : 'Copy'}
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
  );
};

export default NodeDataModal;
