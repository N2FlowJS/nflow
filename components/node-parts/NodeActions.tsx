import React from "react";
import { Play, Settings, Info, Trash2 } from "lucide-react";

interface NodeActionsProps {
  onRun: (e: React.MouseEvent) => void;
  onOpenConfig: () => void;
  onOpenData: () => void;
  onDelete: (e: React.MouseEvent) => void;
  isConfigOpen: boolean;
  isDataOpen: boolean;
}

export const NodeActions = ({
  onRun,
  onOpenConfig,
  onOpenData,
  onDelete,
  isConfigOpen,
  isDataOpen,
}: NodeActionsProps) => {
  return (
    <div className="absolute -top-10 left-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRun(e);
        }}
        className="p-2 bg-black/60 border border-yellow-500/50 rounded-lg hover:bg-yellow-500 hover:text-black transition-all"
      >
        <Play size={14} fill="currentColor" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onOpenConfig();
        }}
        className={`p-2 bg-black/60 border border-cyber-primary/50 rounded-lg hover:bg-cyber-primary hover:text-black transition-all ${isConfigOpen ? "bg-cyber-primary text-black" : "text-cyber-primary"}`}
      >
        <Settings size={14} />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onOpenData();
        }}
        className={`p-2 bg-black/60 border border-cyan-500/50 rounded-lg hover:bg-cyan-500 hover:text-black transition-all ${isDataOpen ? "bg-cyan-500 text-black" : "text-cyan-400"}`}
      >
        <Info size={14} />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(e);
        }}
        className="p-2 bg-black/60 border border-red-500/50 rounded-lg hover:bg-red-500 hover:text-white transition-all text-red-400"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};
