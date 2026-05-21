import React, { useEffect, useState } from 'react';
import { Panel } from '@xyflow/react';
import { ResultPreview } from './node-parts/ResultPreview';
import { CyberPanel } from './shared/CyberUI';
import { Eye } from 'lucide-react';

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
    <Panel position="top-right" className="m-4 w-[min(480px,95%)] z-50 animate-in fade-in slide-in-from-right-4 duration-300">
      <CyberPanel
        title={title.toUpperCase()}
        icon={Eye}
        onClose={() => setIsOpen(false)}
        className="shadow-[0_0_20px_rgba(0,0,0,0.45)] border-cyber-primary/20"
      >
        <div className="p-1 max-h-[70vh] overflow-auto scrollbar-hide">
          <div className="bg-black/20 rounded-lg p-2">
            <ResultPreview output={content} />
          </div>
        </div>
      </CyberPanel>
    </Panel>
  );
};

export default GlobalPreview;
