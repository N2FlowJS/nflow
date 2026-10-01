import { NodeIcon } from './NodeIcon';
import { getNodeFieldValue, type NodeRegistryEntry } from '../../../back-end/node-registry';
import type { NodeData } from '@n2flow/types';
import { StatusIndicator, CyberBadge, type NodeStatus } from '../shared/CyberUI';

/** `NodeData['status']` uses `cancelled`; the indicator's palette uses `skipped`. */
const toIndicatorStatus = (status: NodeData['status']): NodeStatus =>
  status === 'cancelled' ? 'skipped' : status ?? 'idle';

interface NodeHeaderProps {
  data: NodeData & { registryEntry?: NodeRegistryEntry | undefined };
  selected?: boolean;
  isAgent?: boolean;
  isLLM?: boolean;
}

export const NodeHeader = ({ data, selected }: NodeHeaderProps) => {
  const modelType =
    (getNodeFieldValue(data, 'modelType') as string) ||
    (data.type.includes('Embedding') ? 'Embedding' : 'Chat');
  const typeLabel = data.type.replace(/Component|Model/g, '');

  return (
    <div className="flex items-center gap-2.5 p-2.5 border-b border-white/5 bg-gradient-to-r from-white/[0.02] to-transparent">
      <div
        className={`shrink-0 p-1.5 rounded-lg border transition-colors ${
          selected
            ? 'bg-cyber-primary/10 border-cyber-primary/30 text-cyber-primary shadow-[0_0_10px_rgba(34,211,238,0.1)]'
            : 'bg-white/5 border-white/5 text-gray-400'
        }`}
      >
        <NodeIcon {...(data.registryEntry?.icon ? { name: data.registryEntry.icon } : {})} size={16} />
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-white/90 truncate leading-none">
            {data.label}
          </span>
          <StatusIndicator status={toIndicatorStatus(data.status)} size={6} />
        </div>

        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-[8px] font-black uppercase tracking-widest text-gray-500 font-mono">
            {typeLabel}
          </span>
          {data.type.includes('LLM') && (
            <CyberBadge label={modelType} variant={modelType === 'Embedding' ? 'info' : 'purple'} />
          )}
        </div>
      </div>
    </div>
  );
};
