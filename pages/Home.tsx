import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FolderOpen, Trash2, Clock, GitBranch, Copy, GitCommit, Search } from 'lucide-react';
import { FLOW_TEMPLATES, createSavedFlowFromTemplate } from '../flow-templates';

type SavedFlow = {
  id: string;
  name: string;
  data?: {
    nodes?: unknown[];
    edges?: unknown[];
  };
  nodeCount?: number;
  edgeCount?: number;
  updatedAt: number;
};

export default function Home() {
  const navigate = useNavigate();
  const [flows, setFlows] = useState<SavedFlow[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadFlows = async () => {
      try {
        const res = await fetch('http://localhost:8787/api/flows');
        if (res.ok) {
          const data = await res.json();
          setFlows(data);

          // One-time migration from localStorage
          const saved = localStorage.getItem('cyber-flows');
          if (saved) {
            const localFlows: SavedFlow[] = JSON.parse(saved);
            if (localFlows.length > 0 && confirm(`Found ${localFlows.length} flows in local storage. Migrating to server?`)) {
              for (const flow of localFlows) {
                await fetch('http://localhost:8787/api/flows', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(flow),
                });
              }
              localStorage.removeItem('cyber-flows');
              // Reload after migration
              const freshRes = await fetch('http://localhost:8787/api/flows');
              const freshData = await freshRes.json();
              setFlows(freshData);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load flows from server:', err);
      }
    };
    loadFlows();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this flow?')) {
      try {
        const res = await fetch(`http://localhost:8787/api/flows/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setFlows(flows.filter(f => f.id !== id));
        }
      } catch (err) {
        console.error('Failed to delete flow:', err);
      }
    }
  };

  const handleDuplicate = async (flow: SavedFlow, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      // Fetch full flow data if needed, but SavedFlow on home might already have it
      // Actually /api/flows only returns metadata (id, name, updatedAt)
      // We need the full flow data to duplicate properly
      const fullRes = await fetch(`http://localhost:8787/api/flows/${flow.id}`);
      if (!fullRes.ok) throw new Error('Failed to fetch full flow data');
      const fullFlow = await fullRes.json();

      const newFlow: SavedFlow = {
        ...fullFlow,
        id: `flow-${Date.now()}`,
        name: `${fullFlow.name} (copy)`,
        updatedAt: Date.now(),
      };

      const res = await fetch('http://localhost:8787/api/flows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFlow),
      });

      if (res.ok) {
        setFlows([newFlow, ...flows]);
      }
    } catch (err) {
      console.error('Failed to duplicate flow:', err);
    }
  };

  const handleCreateFromTemplate = async (templateId: string) => {
    const newFlow = createSavedFlowFromTemplate(templateId);
    if (!newFlow) return;
    
    try {
      const res = await fetch('http://localhost:8787/api/flows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFlow),
      });

      if (res.ok) {
        navigate(`/flow/${newFlow.id}`);
      }
    } catch (err) {
      console.error('Failed to create flow from template:', err);
    }
  };

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 60_000) return 'Just now';
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
    return new Date(ts).toLocaleDateString();
  };

  const totalNodes = flows.reduce((acc, f) => acc + (f.nodeCount || f.data?.nodes?.length || 0), 0);

  const filteredFlows = flows.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-cyber-dark text-white p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyber-primary/10 rounded-xl border border-cyber-primary/20">
              <GitBranch className="text-cyber-primary" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight uppercase">n2flow</h1>
              <p className="text-cyber-muted font-mono text-sm tracking-widest mt-1">AGENT ORCHESTRATION PLATFORM</p>
            </div>
          </div>

          <div className="flex gap-4 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input
                type="text"
                placeholder="Search flows..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:border-cyber-primary outline-none transition-all w-64"
              />
            </div>
            <button
              onClick={() => navigate('/flow/new')}
              className="flex items-center gap-2 px-6 py-3 bg-cyber-primary text-black font-bold rounded-xl hover:bg-cyan-300 transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(0,240,255,0.5)] uppercase tracking-wider"
            >
              <Plus size={20} />
              New Flow
            </button>
          </div>
        </div>

        {/* Stats bar */}
        {flows.length > 0 && (
          <div className="flex gap-6 mb-8 px-4 py-3 bg-cyber-panel border border-cyber-border rounded-xl font-mono text-[11px] text-cyber-muted">
            <span><span className="text-cyber-primary font-bold">{flows.length}</span> FLOWS</span>
            <span><span className="text-cyber-primary font-bold">{totalNodes}</span> TOTAL NODES</span>
            <span>LAST MODIFIED <span className="text-cyber-primary font-bold">{formatTime(Math.max(...flows.map(f => f.updatedAt)))}</span></span>
          </div>
        )}

        {/* Templates */}
        <div className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-cyber-primary mb-3">Flow Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FLOW_TEMPLATES.map((template) => (
              <div
                key={template.id}
                className="bg-cyber-panel border border-cyber-border rounded-xl p-4 flex items-start justify-between gap-4"
              >
                <div>
                  <div className="text-sm font-bold text-white">{template.name}</div>
                  <div className="text-xs text-cyber-muted mt-1">{template.description}</div>
                </div>
                <button
                  onClick={() => handleCreateFromTemplate(template.id)}
                  className="px-3 py-2 bg-cyber-primary/10 border border-cyber-primary/30 text-cyber-primary rounded-lg hover:bg-cyber-primary hover:text-black transition-all text-[11px] font-bold uppercase tracking-wider"
                >
                  Use
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Flow grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFlows.map(flow => (
            <div
              key={flow.id}
              onClick={() => navigate(`/flow/${flow.id}`)}
              className="bg-cyber-panel border border-cyber-border rounded-xl p-6 hover:border-cyber-primary/50 transition-all cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyber-primary to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-white/5 rounded-lg text-cyber-primary">
                  <FolderOpen size={24} />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleDuplicate(flow, e)}
                    className="p-2 text-gray-500 hover:text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-colors"
                    title="Duplicate"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    onClick={(e) => handleDelete(flow.id, e)}
                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-bold mb-1 text-white group-hover:text-cyber-primary transition-colors">{flow.name}</h3>
              <p className="text-[10px] text-cyber-muted font-mono">{flow.id}</p>

              <div className="flex items-center gap-4 mt-5 text-xs text-cyber-muted font-mono">
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  {formatTime(flow.updatedAt)}
                </div>
                <div className="flex items-center gap-1">
                  <GitBranch size={12} />
                  {flow.nodeCount ?? flow.data?.nodes?.length ?? 0} nodes
                </div>
                <div className="flex items-center gap-1">
                  <GitCommit size={12} />
                  {flow.edgeCount ?? flow.data?.edges?.length ?? 0} edges
                </div>
              </div>
            </div>
          ))}

          {filteredFlows.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-cyber-muted border-2 border-dashed border-cyber-border rounded-2xl">
              <FolderOpen size={48} className="mb-4 opacity-50" />
              <p className="text-lg font-medium">{searchTerm ? 'No matching flows found' : 'No flows yet'}</p>
              <p className="text-sm mt-2 mb-6">
                {searchTerm ? 'Try a different search term' : 'Create your first agent flow to get started'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => navigate('/flow/new')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-cyber-primary/10 border border-cyber-primary/30 text-cyber-primary font-bold rounded-xl hover:bg-cyber-primary hover:text-black transition-all uppercase tracking-wider text-sm"
                >
                  <Plus size={16} />
                  Create Flow
                </button>
              )}
            </div>
          )}
      </div>
    </div>
  </div>
);
}



