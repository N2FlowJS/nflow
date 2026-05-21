import React from "react";
import { Play, Settings, Info, Trash2 } from "lucide-react";
import { CyberAction } from "../shared/CyberUI";

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
    <div className="absolute -top-12 left-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 bg-black/60 backdrop-blur-md p-1 rounded-lg border border-white/10 shadow-2xl scale-90 origin-bottom-left group-hover:scale-100">
      <CyberAction
        icon={Play}
        label="Run"
        showLabel={false}
        onClick={() => {
          const event = new MouseEvent("click") as unknown as React.MouseEvent;
          onRun(event);
        }}
        className="w-8 h-8 p-0 bg-transparent border-transparent hover:border-yellow-500/50 hover:bg-yellow-500/10"
        colorClass="text-yellow-500"
        title="Run Node"
      />

      <CyberAction
        icon={Settings}
        label="Settings"
        showLabel={false}
        onClick={onOpenConfig}
        className={`w-8 h-8 p-0 bg-transparent border-transparent hover:border-cyber-primary/50`}
        colorClass={isConfigOpen ? "text-black" : "text-cyber-primary"}
        title="Node Settings"
      />

      <CyberAction
        icon={Info}
        label="Data"
        showLabel={false}
        onClick={onOpenData}
        className={`w-8 h-8 p-0 ${isDataOpen ? "bg-cyan-500 text-black border-cyan-500" : "bg-transparent border-transparent hover:border-cyan-500/50"}`}
        colorClass={isDataOpen ? "text-black" : "text-cyan-400"}
        title="Execution Data"
      />

      <div className="w-px h-3 bg-white/10 mx-0.5" />

      <CyberAction
        icon={Trash2}
        label="Delete"
        showLabel={false}
        onClick={() => {
          const event = new MouseEvent("click") as unknown as React.MouseEvent;
          onDelete(event);
        }}
        className="w-8 h-8 p-0 bg-transparent border-transparent hover:bg-red-500/20"
        colorClass="text-red-400"
        title="Delete Node"
      />
    </div>
  );
};
