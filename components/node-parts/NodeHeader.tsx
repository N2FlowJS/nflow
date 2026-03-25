import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { NodeIcon } from './NodeIcon';
import { getNodeFieldValue } from '../../node-registry';

interface NodeHeaderProps {
  data: any;
  selected: boolean;
  isAgent: boolean;
  isLLM: boolean;
}

export const NodeHeader = ({ data, selected, isAgent, isLLM }: NodeHeaderProps) => {
  return (
    <div className={`flex items-center gap-3 p-3 border-b border-white/5 ${isAgent ? 'bg-cyber-secondary/10' : ''}`}>
      <div className={`p-2 rounded-lg bg-white/5 ${selected ? 'text-cyber-primary' : 'text-gray-400'}`}>
        <NodeIcon name={data.registryEntry?.icon} size={20} />
      </div>
      <div className="flex flex-col flex-1 overflow-hidden">
        <span className="text-sm font-bold text-gray-100 truncate">{data.label}</span>
        <span className="text-[9px] uppercase tracking-wider text-gray-500 font-mono flex items-center gap-1">
          {data.type.replace(/Component|Model/g, '')}
          {isLLM && (
            <>
              <span className="w-1 h-1 rounded-full bg-gray-500"></span>
              {(() => {
                const modelType = (getNodeFieldValue(data, 'modelType') as string) || (data.type.includes('Embedding') ? 'Embedding' : 'Chat');
                return (
                  <span className={modelType === 'Embedding' ? 'text-blue-400' : 'text-purple-400'}>
                    {modelType}
                  </span>
                );
              })()}
            </>
          )}
        </span>
      </div>
      {data.status === 'success' && <CheckCircle2 size={16} className="text-green-500" />}
      {data.status === 'running' && <div className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />}
      {data.status === 'error' && <AlertCircle size={16} className="text-red-500" />}
    </div>
  );
};
