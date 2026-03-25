import React, { memo, useState } from 'react';
import { NodeProps, NodeResizer, useReactFlow } from '@xyflow/react';
import { Layers, ChevronDown, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
import { NodeData } from '../types';

const CyberGroupNode = ({ id, data, selected }: NodeProps) => {
  const { setNodes } = useReactFlow();
  const isCollapsed = !!data.isCollapsed;

  const toggleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('takeSnapshot'));
    
    setNodes((nds) => 
      nds.map((node) => {
        if (node.id === id) {
          const expandedWidth = Number(node.data.expandedWidth || 400);
          const expandedHeight = Number(node.data.expandedHeight || 400);
          
          return {
            ...node,
            data: { ...node.data, isCollapsed: !isCollapsed },
            // If collapsing, shrink the group node
            style: !isCollapsed 
              ? { ...node.style, width: 200, height: 44 } 
              : { ...node.style, width: expandedWidth, height: expandedHeight }
          } as any;
        }
        // Hide/Show children
        if (node.parentId === id) {
          return {
            ...node,
            hidden: !isCollapsed
          };
        }
        return node;
      })
    );
  };

  return (
    <>
      {!isCollapsed && (
        <NodeResizer 
          minWidth={200} 
          minHeight={200} 
          isVisible={selected} 
          onResizeEnd={(_, { width, height }) => {
            setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, expandedWidth: width, expandedHeight: height } } : n));
          }}
          lineStyle={{ border: '1px solid #00f0ff' }}
          handleStyle={{ width: 10, height: 10, backgroundColor: '#00f0ff', borderRadius: 2 }}
        />
      )}
      <div className={`
        w-full h-full rounded-xl
        border-2 border-dashed
        transition-all duration-300
        flex flex-col overflow-hidden
        ${selected ? 'border-cyber-primary bg-cyber-primary/5' : 'border-cyber-border bg-white/5'}
        ${isCollapsed ? 'shadow-lg' : ''}
      `}>
        <div className={`
          px-3 py-2 border-b flex items-center gap-2 rounded-t-xl transition-colors
          ${selected ? 'bg-cyber-primary/10 border-cyber-primary/30' : 'bg-black/20 border-white/5'}
          cursor-pointer hover:bg-white/5
        `} onClick={toggleCollapse}>
           {isCollapsed ? <ChevronRight size={14} className="text-cyber-primary" /> : <ChevronDown size={14} className="text-cyber-primary" />}
           <Layers size={14} className={selected ? 'text-cyber-primary' : 'text-gray-500'} />
           <span className={`text-[10px] font-mono font-bold uppercase tracking-wider flex-1 truncate ${selected ? 'text-cyber-primary' : 'text-gray-500'}`}>
             {data.label as string || 'GROUP'}
             {isCollapsed && <span className="ml-2 opacity-50 text-[8px]">(Collapsed)</span>}
           </span>
           <button 
             onClick={toggleCollapse}
             className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-cyber-primary transition-colors"
             title={isCollapsed ? "Expand Group" : "Collapse Group"}
           >
             {isCollapsed ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
           </button>
        </div>
        {!isCollapsed && (
          <div className="flex-1 w-full h-full" />
        )}
      </div>
    </>
  );
};

export default memo(CyberGroupNode);