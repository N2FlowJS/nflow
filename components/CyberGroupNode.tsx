import React, { memo } from 'react';
import { NodeProps, NodeResizer } from '@xyflow/react';
import { Layers } from 'lucide-react';
import { NodeData } from '../types';

const CyberGroupNode = ({ data, selected }: NodeProps) => {
  return (
    <>
      <NodeResizer 
        minWidth={200} 
        minHeight={200} 
        isVisible={selected} 
        lineStyle={{ border: '1px solid #00f0ff' }}
        handleStyle={{ width: 10, height: 10, backgroundColor: '#00f0ff', borderRadius: 2 }}
      />
      <div className={`
        w-full h-full rounded-xl
        border-2 border-dashed
        transition-all duration-300
        flex flex-col overflow-hidden
        ${selected ? 'border-cyber-primary bg-cyber-primary/5' : 'border-cyber-border bg-white/5'}
      `}>
        <div className={`
          px-4 py-2 border-b flex items-center gap-2 rounded-t-xl transition-colors
          ${selected ? 'bg-cyber-primary/10 border-cyber-primary/30' : 'bg-black/20 border-white/5'}
        `}>
           <Layers size={14} className={selected ? 'text-cyber-primary' : 'text-gray-500'} />
           <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${selected ? 'text-cyber-primary' : 'text-gray-500'}`}>
             {data.label as string || 'GROUP'}
           </span>
        </div>
        {/* Clickable area for dragging the group, but behind the child nodes */}
        <div className="flex-1 w-full h-full" />
      </div>
    </>
  );
};

export default memo(CyberGroupNode);