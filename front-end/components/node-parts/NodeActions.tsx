import React from "react";
import { Play, Settings, Info, Trash2 } from "lucide-react";
import { Button } from "../ui";

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
    <div className="absolute -top-11 left-0 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-black/40 backdrop-blur-md p-1 rounded-xl border border-white/10 shadow-2xl">
      <Button
        size="sm"
        variant="outline"
        onClick={(e) => {
          e.stopPropagation();
          onRun(e);
        }}
        className="w-8 h-8 p-0 border-yellow-500/30 text-yellow-500 hover:bg-yellow-500 hover:text-black rounded-lg transition-all"
        title="Run Node"
      >
        <Play size={14} fill="currentColor" />
      </Button>
      <Button
        size="sm"
        variant={isConfigOpen ? "primary" : "outline"}
        onClick={(e) => {
          e.stopPropagation();
          onOpenConfig();
        }}
        className={`w-8 h-8 p-0 ${!isConfigOpen ? "border-cyber-primary/30 text-cyber-primary hover:bg-cyber-primary hover:text-black" : "text-black"} rounded-lg transition-all`}
        title="Node Settings"
      >
        <Settings size={14} />
      </Button>
      <Button
        size="sm"
        variant={isDataOpen ? "primary" : "outline"}
        onClick={(e) => {
          e.stopPropagation();
          onOpenData();
        }}
        className={`w-8 h-8 p-0 ${!isDataOpen ? "border-cyan-500/30 text-cyan-400 hover:bg-cyan-500 hover:text-black" : "text-black bg-cyan-500 border-cyan-500"} rounded-lg transition-all`}
        title="Execution Data"
      >
        <Info size={14} />
      </Button>
      <div className="w-px h-4 bg-white/10 my-auto mx-0.5" />
      <Button
        size="sm"
        variant="danger"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(e);
        }}
        className="w-8 h-8 p-0 border-transparent hover:bg-red-500 hover:text-white rounded-lg transition-all text-red-400"
        title="Delete Node"
      >
        <Trash2 size={14} />
      </Button>
    </div>
  );
};
