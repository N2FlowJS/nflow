import React, { useEffect, useRef, useState } from 'react';
import { useReactFlow, Node } from '@xyflow/react';
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react';

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
    return nodes.filter((n) => {
      if (!searchTerm) return false;
      const term = searchTerm.toLowerCase();
      const label = String(n.data?.label || "").toLowerCase();
      const type = String(n.data?.type || "").toLowerCase();
      const description = String(n.data?.description || "").toLowerCase();

      // Search in common fields
      if (label.includes(term) || type.includes(term) || description.includes(term))
        return true;

      // Search in configSchema values if available
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
      // Clear highlighting when closed
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
      // Highlight the target node
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

      // Pan to the target node
      const x = targetNode.position.x + (targetNode.measured?.width || 200) / 2;
      const y = targetNode.position.y + (targetNode.measured?.height || 100) / 2;
      setCenter(x, y, { zoom: Math.max(1.2, getZoom()), duration: 200 });
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
    <div className="absolute top-4 right-4 z-50 bg-cyber-panel border border-cyber-border rounded-lg shadow-2xl overflow-hidden flex items-center p-2 w-80 animate-in slide-in-from-top-4 fade-in duration-200">
      <Search size={16} className="text-cyber-primary ml-2 mr-3 opacity-70" />
      <input
        ref={inputRef}
        type="text"
        placeholder="Find in canvas..."
        className="flex-1 bg-transparent border-none outline-none text-white text-sm placeholder:text-gray-500"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      
      {searchTerm && (
        <span className="text-xs text-gray-400 mr-3 tabular-nums">
          {matchingNodes.length > 0 ? currentIndex + 1 : 0}/{matchingNodes.length}
        </span>
      )}

      <div className="flex items-center gap-1 border-l border-white/10 pl-2">
        <button
          onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : Math.max(0, matchingNodes.length - 1)))}
          disabled={matchingNodes.length === 0}
          className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
        >
          <ChevronUp size={16} />
        </button>
        <button
          onClick={() => setCurrentIndex((prev) => (prev < matchingNodes.length - 1 ? prev + 1 : 0))}
          disabled={matchingNodes.length === 0}
          className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
        >
          <ChevronDown size={16} />
        </button>
        <button
          onClick={onClose}
          className="p-1 hover:bg-red-500/20 rounded text-gray-400 hover:text-red-400 transition-colors ml-1"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
