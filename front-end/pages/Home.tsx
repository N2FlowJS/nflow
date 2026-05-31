import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  FolderOpen,
  Trash2,
  Clock,
  GitBranch,
  Copy,
  GitCommit,
  Search,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import {
  FLOW_TEMPLATES,
  createSavedFlowFromTemplate,
} from "../../back-end/flow-templates";
import type { SavedFlow } from "@n2flow/types";
import { API_BASE } from "../lib/api";
import { apiService } from "../lib/apiService";
import { Button, Input } from "../components/ui";
import { GlobalHeader } from "../components/shared/GlobalHeader";

export default function Home() {
  const navigate = useNavigate();
  const [flows, setFlows] = useState<SavedFlow[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadFlows = async () => {
      try {
        const response = await apiService.get("/api/flows");
        if (response.ok) {
          setFlows(response.data || []);
        }
      } catch (err) {
        console.error("Failed to load flows from server:", err);
      }
    };
    loadFlows();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this flow?")) {
      try {
        const response = await apiService.delete(`/api/flows/${id}`);

        if (response.ok) {
          setFlows(flows.filter((f) => f.id !== id));
        }
      } catch (err) {
        console.error("Failed to delete flow:", err);
      }
    }
  };

  const handleDuplicate = async (flow: SavedFlow, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const fullResponse = await apiService.get(`/api/flows/${flow.id}`);
      if (!fullResponse.ok)
        throw new Error(fullResponse.error || "Failed to fetch full flow data");

      const fullFlow = fullResponse.data;
      const newId = `flow-${Date.now()}`;

      const response = await apiService.post("/api/flows", {
        id: newId,
        name: `${fullFlow.name} (copy)`,
        nodes: fullFlow.data?.nodes || [],
        edges: fullFlow.data?.edges || [],
        viewport: fullFlow.data?.viewport,
        globalVariables: fullFlow.data?.globalVariables || [],
      });

      if (response.ok) {
        const duplicatedFlow = {
          id: newId,
          name: `${fullFlow.name} (copy)`,
          updatedAt: Date.now(),
          data: fullFlow.data,
        };
        setFlows([duplicatedFlow as any, ...flows]);
      }
    } catch (err) {
      console.error("Failed to duplicate flow:", err);
    }
  };

  const handleCreateFromTemplate = async (templateId: string) => {
    const newFlow = createSavedFlowFromTemplate(templateId);
    if (!newFlow) return;

    try {
      const response = await apiService.post("/api/flows", {
        id: newFlow.id,
        name: newFlow.name,
        nodes: newFlow.data?.nodes || [],
        edges: newFlow.data?.edges || [],
        viewport: newFlow.data?.viewport,
        globalVariables: (newFlow.data as any)?.globalVariables || [],
      });

      if (response.ok) {
        navigate(`/flow/${newFlow.id}`);
      }
    } catch (err) {
      console.error("Failed to create flow from template:", err);
    }
  };

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 60_000) return "Just now";
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
    return new Date(ts).toLocaleDateString();
  };

  const filteredFlows = (flows || []).filter(
    (f) =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.id.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#030303] cyber-grid cyber-scanlines text-white relative overflow-hidden">
      <GlobalHeader />

      {/* Blurred Ambient Lights */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[5%] left-[20%] w-[500px] h-[500px] bg-cyber-primary/5 rounded-full blur-[140px] animate-pulse-glow"></div>
        <div className="absolute bottom-[5%] right-[20%] w-[500px] h-[500px] bg-cyber-secondary/5 rounded-full blur-[140px] animate-pulse-glow" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-5xl mx-auto p-8 relative z-10">
        {/* Sub Header / Control Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-white/5">
          <div>
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">
              Control <span className="text-cyber-primary">Dashboard</span>
            </h2>
            <p className="text-[9px] text-cyber-muted font-mono tracking-[0.2em] uppercase mt-0.5">
              PERSISTED_ENVIRONMENT_INTERFACE
            </p>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <Input
              icon={Search}
              placeholder="Query workflow terminal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 !bg-black/60 focus:!border-cyber-primary focus:!ring-1 focus:!ring-cyber-primary/20 text-white placeholder-white/20 transition-all font-mono"
            />
            <Button
              onClick={() => navigate("/flow/new")}
              className="px-5 py-2 bg-gradient-to-r from-cyber-primary to-cyber-primary/80 hover:from-cyber-primary hover:to-cyan-400 text-black font-black uppercase text-[10px] tracking-[0.18em] rounded-xl hover:shadow-[0_0_15px_rgba(0,240,255,0.25)] transition-all flex items-center gap-2"
            >
              <Plus size={14} className="stroke-[3]" />
              New Flow
            </Button>
          </div>
        </div>

        {/* Templates */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={14} className="text-cyber-primary" />
            <h2 className="text-xs font-black uppercase tracking-[0.25em] text-cyber-primary font-mono">
              PRE-CONFIGURED_FLOW_SCHEMAS
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FLOW_TEMPLATES.map((template) => (
              <div
                key={template.id}
                className="cyber-glass rounded-xl p-5 flex items-start justify-between gap-4 bg-black/40 backdrop-blur-md relative group overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-[2px] h-full bg-cyber-primary/20 group-hover:bg-cyber-primary transition-colors" />
                <div>
                  <div className="text-sm font-bold text-white group-hover:text-cyber-primary transition-colors">
                    {template.name}
                  </div>
                  <div className="text-xs text-white/50 font-medium mt-1 pr-6 leading-relaxed">
                    {template.description}
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => handleCreateFromTemplate(template.id)}
                  className="px-4 py-1.5 h-auto text-[9px] font-black uppercase tracking-widest border border-cyber-primary/30 text-cyber-primary hover:bg-cyber-primary/10 rounded-lg shrink-0"
                >
                  INITIALIZE
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Flow Grid */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FolderOpen size={14} className="text-cyber-primary" />
            <h2 className="text-xs font-black uppercase tracking-[0.25em] text-white/60 font-mono">
              PERSISTED_ACTIVE_WORKFLOWS
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFlows.map((flow) => (
              <div
                key={flow.id}
                onClick={() => navigate(`/flow/${flow.id}`)}
                className="cyber-glass cyber-hover-card rounded-2xl p-6 hover:border-cyber-primary/50 transition-all cursor-pointer group relative overflow-hidden bg-black/40 backdrop-blur-md"
              >
                {/* Top glow border on hover */}
                <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyber-primary via-cyber-secondary to-cyber-primary opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex justify-between items-start mb-4">
                  <div className="p-2.5 bg-white/5 rounded-xl text-cyber-primary border border-white/5 shadow-inner transition-colors group-hover:bg-cyber-primary/10">
                    <FolderOpen size={20} />
                  </div>
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
                    <Button
                      variant="ghost"
                      onClick={(e) => handleDuplicate(flow, e)}
                      className="p-2 h-auto rounded-lg text-white/40 hover:text-cyber-primary hover:bg-cyber-primary/10 border border-transparent hover:border-cyber-primary/20"
                      title="Duplicate"
                    >
                      <Copy size={13} />
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={(e) => handleDelete(flow.id, e)}
                      className="p-2 h-auto rounded-lg text-red-400/50 hover:text-red-400 hover:bg-red-400/10 border border-transparent hover:border-red-400/20"
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </div>

                <h3 className="text-lg font-bold mb-1 text-white group-hover:text-cyber-primary transition-colors truncate">
                  {flow.name}
                </h3>
                <p className="text-[9px] text-cyber-muted font-mono uppercase tracking-wider truncate mb-6">
                  ID: {flow.id}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/5 text-[9px] text-cyber-muted font-mono uppercase tracking-widest">
                  <div className="flex items-center gap-1 shrink-0 bg-white/5 px-2 py-1 rounded-md border border-white/5">
                    <Clock size={11} className="text-white/45" />
                    {formatTime(flow.updatedAt)}
                  </div>
                  <div className="flex items-center gap-1 shrink-0 bg-cyber-primary/5 text-cyber-primary px-2 py-1 rounded-md border border-cyber-primary/10">
                    <GitBranch size={11} />
                    {flow.nodeCount ?? 0} Nodes
                  </div>
                  <div className="flex items-center gap-1 shrink-0 bg-cyber-secondary/5 text-cyber-secondary px-2 py-1 rounded-md border border-cyber-secondary/10">
                    <GitCommit size={11} />
                    {flow.edgeCount ?? 0} Edges
                  </div>
                </div>
              </div>
            ))}

            {filteredFlows.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-cyber-muted border border-dashed border-white/10 rounded-2xl bg-black/20 backdrop-blur-md">
                <FolderOpen size={44} className="mb-4 text-cyber-primary/40 drop-shadow-[0_0_3px_rgba(0,240,255,0.1)]" />
                <p className="text-base font-bold uppercase tracking-widest text-white/80">
                  {searchTerm ? "NO_MATCHING_SCHEMAS_PERSISTED" : "DATABASE_EMPTY_NO_FLOWS"}
                </p>
                <p className="text-xs mt-1.5 mb-6 text-white/35 font-mono">
                  {searchTerm
                    ? "RE-QUERY THE REGISTER WITH AN ALTERNATE INDEX"
                    : "INITIALIZE YOUR OPERATIONAL WORKFLOW TO COMMENCE DATABASE PERSISTENCE"}
                </p>
                {!searchTerm && (
                  <Button
                    onClick={() => navigate("/flow/new")}
                    className="px-6 py-2.5 bg-gradient-to-r from-cyber-primary to-cyber-primary/80 hover:from-cyber-primary hover:to-cyan-400 text-black font-black uppercase text-[10px] tracking-[0.2em] rounded-xl hover:shadow-[0_0_15px_rgba(0,240,255,0.25)] transition-all flex items-center gap-2"
                  >
                    <Plus size={14} className="stroke-[3]" />
                    Create First Flow
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
