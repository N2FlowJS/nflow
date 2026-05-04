import React, { memo, useState } from 'react';
import { NodeProps, Handle, Position } from '@xyflow/react';
import { StickyNote, X } from 'lucide-react';

const CyberNoteNode = ({ id, data, selected }: NodeProps) => {
  const [text, setText] = useState(String(data.label || ''));

  return (
    <div className={`group relative min-w-[180px] min-h-[120px] bg-yellow-500/10 backdrop-blur-md border-2 ${selected ? 'border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.4)]' : 'border-yellow-500/30'} rounded-lg p-3 transition-all duration-300`}>
      <div className="flex items-center gap-2 mb-2 border-b border-yellow-500/20 pb-1">
        <StickyNote size={14} className="text-yellow-500" />
        <span className="text-[10px] font-bold text-yellow-500/80 uppercase tracking-widest">Note</span>
      </div>
      
      <textarea
        className="nodrag nowheel w-full bg-transparent border-none outline-none text-sm text-yellow-100/90 placeholder:text-yellow-500/20 resize-none min-h-[80px] custom-scrollbar"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          data.label = e.target.value; 
        }}
        placeholder="Type your notes here..."
      />

      {/* No handles for notes by default, but we can add them if needed */}
      <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-yellow-500/20 rounded-full border border-yellow-500/40 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};

export default memo(CyberNoteNode);
