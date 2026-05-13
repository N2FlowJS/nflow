import React from 'react';
import { useApiMonitor, ApiActivity } from '../hooks/useApiMonitor';
import { Activity, Clock, Terminal, ChevronDown, ChevronUp, X, Filter, Trash2, Search } from 'lucide-react';
import { Button, Input } from './ui';

export const ApiMonitorPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { activities, clear } = useApiMonitor(100);
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [filter, setFilter] = React.useState<string>('');

  const filtered = activities.filter(a => 
    a.url.toLowerCase().includes(filter.toLowerCase()) || 
    a.method.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className={`fixed bottom-0 right-0 w-full md:w-[480px] bg-cyber-panel border-l border-t border-cyber-border shadow-2xl z-50 transition-all ${isExpanded ? 'h-[400px]' : 'h-12'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-12 bg-black/40 border-b border-white/10 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center gap-2">
          <Activity size={16} className={activities.some(a => !a.ok) ? 'text-red-500' : 'text-cyber-primary underline-glow'} />
          <span className="text-xs font-bold uppercase tracking-wider">Network Monitor</span>
          <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-gray-400">{activities.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => { e.stopPropagation(); clear(); }}
            className="p-1 min-h-0 text-gray-400 hover:text-red-400"
          >
            <Trash2 size={14} />
          </Button>
          {isExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="p-1 min-h-0 text-gray-400 hover:text-white"
          >
            <X size={14} />
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="flex flex-col h-[352px]">
          {/* Toolbar */}
          <div className="p-2 border-b border-white/5 bg-black/20">
            <Input 
              icon={Search}
              placeholder="Filter requests..." 
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="bg-black/40 border-white/5"
            />
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filtered.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-600 text-xs italic">
                No activity recorded
              </div>
            ) : (
              <table className="w-full text-left text-[11px]">
                <thead className="sticky top-0 bg-cyber-panel text-gray-500 uppercase text-[9px]">
                  <tr>
                    <th className="px-3 py-2 font-medium">Method</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium">URL</th>
                    <th className="px-3 py-2 font-medium text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map((activity) => (
                    <tr key={activity.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-3 py-2">
                        <span className={`font-bold ${getMethodColor(activity.method)}`}>{activity.method}</span>
                      </td>
                      <td className="px-3 py-2">
                        <span className={activity.ok ? 'text-green-500' : 'text-red-500'}>
                          {activity.status || 'ERR'}
                        </span>
                      </td>
                      <td className="px-3 py-2 truncate max-w-[180px] text-gray-300" title={activity.url}>
                        {activity.url.replace('/api/', '/')}
                      </td>
                      <td className="px-3 py-2 text-right text-gray-500 font-mono">
                         {activity.duration}ms
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

function getMethodColor(method: string) {
  switch (method.toUpperCase()) {
    case 'GET': return 'text-blue-400';
    case 'POST': return 'text-green-400';
    case 'PUT': return 'text-yellow-400';
    case 'DELETE': return 'text-red-400';
    default: return 'text-gray-400';
  }
}
