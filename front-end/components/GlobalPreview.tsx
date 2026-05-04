import React, { useEffect, useState } from 'react';
import { Panel } from '@xyflow/react';
import { ResultPreview } from './node-parts/ResultPreview';

type PreviewDetail = { output?: unknown; title?: string };

const GlobalPreview: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<unknown>(null);
  const [title, setTitle] = useState<string>('Result Preview');

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<PreviewDetail>;
      setContent(ce.detail?.output);
      setTitle(ce.detail?.title || 'Result Preview');
      setIsOpen(true);
    };

    window.addEventListener('openResultPreview', handler as EventListener);
    return () => window.removeEventListener('openResultPreview', handler as EventListener);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Panel position="top-right" className="m-4 w-[min(420px,95%)] z-50">
      <div className="bg-cyber-panel/95 border border-cyber-border rounded-xl shadow-2xl overflow-hidden">
        <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between bg-black/30">
          <span className="text-[10px] font-mono uppercase tracking-widest text-cyber-primary">{title}</span>
          <button onClick={() => setIsOpen(false)} className="text-[10px] text-gray-400 hover:text-white">ESC</button>
        </div>
        <div className="p-3 max-h-[60vh] overflow-auto">
          <ResultPreview output={content} />
        </div>
      </div>
    </Panel>
  );
};

export default GlobalPreview;
