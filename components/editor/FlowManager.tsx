import React from "react";
import { Trash2, FolderOpen, Wand2 } from "lucide-react";
import { SavedFlow } from "../../types/editor";

interface FlowManagerProps {
  isFlowManagerOpen: boolean;
  setIsFlowManagerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  savedFlows: SavedFlow[];
  onDeleteFlow: (id: string) => void;
  navigate: (path: string) => void;
}

const FlowManager: React.FC<FlowManagerProps> = ({
  isFlowManagerOpen,
  setIsFlowManagerOpen,
  savedFlows,
  onDeleteFlow,
  navigate,
}) => {
  if (!isFlowManagerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-cyber-panel border border-cyber-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-2 text-cyber-primary">
            <FolderOpen size={20} />
            <span className="font-bold uppercase tracking-widest text-lg">
              Saved Flows
            </span>
          </div>
          <button
            onClick={() => setIsFlowManagerOpen(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Esc
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {savedFlows.length === 0 ? (
            <div className="text-center py-12 text-gray-500 italic">
              No saved flows found on server.
            </div>
          ) : (
            savedFlows.map((flow) => (
              <div
                key={flow.id}
                className="group flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:border-cyber-primary/40 hover:bg-white/10 transition-all cursor-pointer"
                onClick={() => {
                  navigate(`/flow/${flow.id}`);
                  setIsFlowManagerOpen(false);
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-cyber-primary/10 flex items-center justify-center text-cyber-primary border border-cyber-primary/20">
                    <Wand2 size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white group-hover:text-cyber-primary transition-colors">
                      {flow.name}
                    </h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-tight">
                      ID: {flow.id} · Updated:{" "}
                      {new Date(flow.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (
                      confirm(
                        `Are you sure you want to delete "${flow.name}"?`,
                      )
                    ) {
                      onDeleteFlow(flow.id);
                    }
                  }}
                  className="p-2 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-black/40 border-t border-white/10 flex justify-end gap-3">
          <button
            onClick={() => {
              navigate("/flow/new");
              setIsFlowManagerOpen(false);
            }}
            className="px-4 py-2 bg-cyber-primary text-black font-bold uppercase tracking-widest text-xs rounded-lg hover:bg-cyan-300 transition-colors"
          >
            Create New Flow
          </button>
          <button
            onClick={() => setIsFlowManagerOpen(false)}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold uppercase tracking-widest text-xs rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlowManager;
