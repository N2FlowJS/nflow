import React, { useEffect, useRef, useState } from 'react';
import { useReactFlow, Node } from '@xyflow/react';
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react';
import { CyberAction, CyberMetaText, CyberPanel, CyberPanelFooter, CyberPanelSection } from '../shared/CyberUI';
import { Input } from '../ui/index';

const ACTIVE_NODE_CLASS = ' outline outline-4 outline-cyber-primary shadow-[0_0_30px_rgba(0,240,255,0.8)]';

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

  const moveMatchIndex = React.useCallback((direction: 1 | -1) => {
    setCurrentIndex((prev) => {
      if (matchingNodes.length === 0) return 0;
      return direction < 0
        ? (prev > 0 ? prev - 1 : Math.max(0, matchingNodes.length - 1))
        : (prev < matchingNodes.length - 1 ? prev + 1 : 0);
    });
  }, [matchingNodes.length]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSearchTerm('');
      setCurrentIndex(0);
    } else {
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          className: n.className?.replace(ACTIVE_NODE_CLASS, ''),
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
          const baseClass = n.className?.replace(ACTIVE_NODE_CLASS, '') || '';
          if (n.id === targetNode.id) {
            return {
              ...n,
              className: `${baseClass}${ACTIVE_NODE_CLASS}`,
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
      moveMatchIndex(e.shiftKey ? -1 : 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      moveMatchIndex(-1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      moveMatchIndex(1);
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
            <CyberMetaText className="px-0 text-[9px] text-white/40 tracking-widest">
              {matchingNodes.length > 0 ? currentIndex + 1 : 0}/{matchingNodes.length}
            </CyberMetaText>
          )
        }
      >
        <CyberPanelSection className="flex flex-col gap-2 p-3">
          <Input
            ref={inputRef}
            type="text"
            icon={Search}
            placeholder="Find node or data..."
            className="!bg-black/60 !text-sm !border-white/10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            endAdornment={searchTerm ? (
              <button 
                onClick={() => setSearchTerm('')}
                className="text-white/20 hover:text-white"
                type="button"
              >
                <X size={16} />
              </button>
            ) : undefined}
          />
          
          <CyberPanelFooter className="bg-transparent px-0 pb-0 pt-2">
            <div className="flex gap-1">
              <CyberAction
                icon={ChevronUp}
                showLabel={false}
                onClick={() => moveMatchIndex(-1)}
                disabled={matchingNodes.length === 0}
                className="h-7 w-8 justify-center border-white/5 bg-white/5 px-2"
              />
              <CyberAction
                icon={ChevronDown}
                showLabel={false}
                onClick={() => moveMatchIndex(1)}
                disabled={matchingNodes.length === 0}
                className="h-7 w-8 justify-center border-white/5 bg-white/5 px-2"
              />
            </div>
            <CyberMetaText className="px-0 tracking-[0.2em]">
              {searchTerm && matchingNodes.length === 0 ? 'Not Found' : 'Nav Controls'}
            </CyberMetaText>
          </CyberPanelFooter>
        </CyberPanelSection>
      </CyberPanel>
    </div>
  );
}
