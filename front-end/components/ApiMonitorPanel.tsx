import React from 'react';
import { useApiMonitor } from '../hooks/useApiMonitor';
import { Activity, Trash2, Search, Network } from 'lucide-react';
import { Input } from './ui';
import { CyberPanel, CyberAction, StatusBadge } from './shared/CyberUI';

export const ApiMonitorPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { activities, clear } = useApiMonitor(100);
  const [filter, setFilter] = React.useState<string>('');

  const filtered = activities.filter(a => 
    a.url.toLowerCase().includes(filter.toLowerCase()) || 
    a.method.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-right-4 duration-300">
      <CyberPanel
        title="Network Monitor"
        icon={Network}
        onClose={onClose}
        className="w-full md:w-[480px] shadow-[0_0_20px_rgba(0,0,0,0.5)]"
        maxHeight="450px"
        actions={
          <div className="flex items-center gap-1">
            <StatusBadge label={`${activities.length} REQS`} status={activities.some(a => !a.ok) ? "offline" : "online"} />
            <CyberAction
              icon={Trash2}
              label="Clear"
              showLabel={false}
              onClick={clear}
              className="h-7 w-7 p-0 hover:bg-red-500/10 hover:text-red-400"
            />
          </div>
        }
      >
        <div className="flex flex-col h-full bg-black/20">
          {/* Toolbar */}
          <div className="p-2 border-b border-white/5 bg-black/40">
            <Input 
              icon={Search}
              placeholder="Filter vault activity..." 
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="bg-black/20 border-white/5 h-8 text-[11px]"
            />
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar min-h-[300px]">
            {filtered.length === 0 ? (
              <div className="h-40 flex flex-col items-center justify-center text-gray-600 gap-2">
                <Activity size={24} className="opacity-10" />
                <span className="text-[10px] uppercase font-black tracking-widest opacity-30">No Data Captured</span>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {filtered.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3 px-3 py-2 hover:bg-cyber-primary/5 group transition-colors">
                    <div className={`text-[9px] font-black w-10 uppercase ${getMethodColor(activity.method)}`}>
                      {activity.method}
                    </div>
                    <div className={`text-[10px] font-mono w-8 ${activity.ok ? 'text-green-500' : 'text-red-500'}`}>
                      {activity.status || 'ERR'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] text-gray-300 truncate font-medium" title={activity.url}>
                        {activity.url.split('/').pop() || activity.url}
                      </div>
                      <div className="text-[8px] text-gray-600 truncate font-mono uppercase tracking-tighter">
                        {activity.url.replace(window.location.origin, '')}
                      </div>
                    </div>
                    <div className="text-[9px] text-gray-500 font-mono tabular-nums bg-black/40 px-1.5 py-0.5 rounded border border-white/5">
                      {activity.duration}ms
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CyberPanel>
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

