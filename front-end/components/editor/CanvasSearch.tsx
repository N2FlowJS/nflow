import React, { useEffect, useRef, useState } from 'react';
import { useReactFlow, Node } from '@xyflow/react';
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react';
import { CyberPanel } from '../shared/CyberUI';

interface CanvasSearchProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: Node[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
}

export default function CanvasSearch({ isOpen, onClose, nodes, setNodes }: CanvasSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { setCenter, getZoom } = useReactFlow();

  const matchingNodes = React.useMemo(() => {
    if (!searchTerm) return [];
    const term = searchTerm.toLowerCase();
    return nodes.filter((n) => {
      const label = String(n.data?.label || "").toLowerCase();
      const type = String(n.data?.type || "").toLowerCase();
      const description = String(n.data?.description || "").toLowerCase();

      if (label.includes(term) || type.includes(term) || description.includes(term))
        return true;

      if (n.data?.configSchema && Array.isArray(n.data.configSchema)) {
        return n.data.configSchema.some((field: any) => {
          const val = String(field.value || "").toLowerCase();
          return val.includes(term);
        });
      }
      return false;
    });
  }, [nodes, searchTerm]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSearchTerm('');
      setCurrentIndex(0);
    } else {
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          className: n.className?.replace(' outline outline-4 outline-cyber-primary shadow-[0_0_30px_rgba(0,240,255,0.8)]', ''),
        }))
      );
    }
  }, [isOpen, setNodes]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [searchTerm]);

  useEffect(() => {
    if (!isOpen || matchingNodes.length === 0) return;
    
    const targetNode = matchingNodes[currentIndex];
    if (targetNode) {
      setNodes((nds) =>
        nds.map((n) => {
          const baseClass = n.className?.replace(' outline outline-4 outline-cyber-primary shadow-[0_0_30px_rgba(0,240,255,0.8)]', '') || '';
          if (n.id === targetNode.id) {
            return {
              ...n,
              className: `${baseClass} outline outline-4 outline-cyber-primary shadow-[0_0_30px_rgba(0,240,255,0.8)]`,
            };
          }
          return { ...n, className: baseClass };
        })
      );

      const x = targetNode.position.x + (targetNode.measured?.width || 200) / 2;
      const y = targetNode.position.y + (targetNode.measured?.height || 100) / 2;
      setCenter(x, y, { zoom: Math.max(1.2, getZoom()), duration: 300 });
    }
  }, [currentIndex, searchTerm, isOpen]);

  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter') {
      if (e.shiftKey) {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : Math.max(0, matchingNodes.length - 1)));
      } else {
        setCurrentIndex((prev) => (prev < matchingNodes.length - 1 ? prev + 1 : 0));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCurrentIndex((prev) => (prev > 0 ? prev - 1 : Math.max(0, matchingNodes.length - 1)));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCurrentIndex((prev) => (prev < matchingNodes.length - 1 ? prev + 1 : 0));
    }
  };

  return (
    <div className="absolute top-2 right-4 z-[100] animate-in slide-in-from-top-4 duration-300">
      <CyberPanel
        title="Search"
        icon={Search}
        onClose={onClose}
        className="w-80"
        actions={
          searchTerm && (
            <span className="text-[9px] font-mono text-white/40 tracking-widest uppercase">
              {matchingNodes.length > 0 ? currentIndex + 1 : 0}/{matchingNodes.length}
            </span>
          )
        }
      >
        <div className="p-3 bg-black/40 flex flex-col gap-2">
          <div className="relative group">
            <input
              ref={inputRef}
              type="text"
              placeholder="Find node or data..."
              className="w-full bg-black/60 border border-white/10 rounded-lg pl-3 pr-8 py-2 text-sm text-white focus:outline-none focus:border-cyber-primary/40 transition-all font-sans"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white/20 hover:text-white"
              >
                <X />
              </button>
            )}
          </div>
          
          <div className="flex items-center justify-between border-t border-white/5 pt-2">
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : Math.max(0, matchingNodes.length - 1)))}
                disabled={matchingNodes.length === 0}
                className="p-1 px-2 bg-white/5 hover:bg-white/10 rounded border border-white/5 text-cyber-primary disabled:opacity-10 transition-all"
              >
                <ChevronUp size={16} />
              </button>
              <button
                onClick={() => setCurrentIndex((prev) => (prev < matchingNodes.length - 1 ? prev + 1 : 0))}
                disabled={matchingNodes.length === 0}
                className="p-1 px-2 bg-white/5 hover:bg-white/10 rounded border border-white/5 text-cyber-primary disabled:opacity-10 transition-all"
              >
                <ChevronDown size={16} />
              </button>
            </div>
            <span className="text-[8px] text-white/20 font-mono uppercase tracking-[0.2em]">
              {searchTerm && matchingNodes.length === 0 ? 'Not Found' : 'Nav Controls'}
            </span>
          </div>
        </div>
      </CyberPanel>
    </div>
  );
}
