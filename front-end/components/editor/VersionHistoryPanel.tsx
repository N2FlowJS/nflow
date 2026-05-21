import React from "react";
import { History } from "lucide-react";
import { Panel } from "@xyflow/react";
import { CyberPanel } from "../shared/CyberUI";
import { FlowVersion } from "../../types/editor";

interface VersionHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  versions: FlowVersion[];
  onLoadVersion: (version: FlowVersion) => void;
  isRestoring?: boolean;
  mode?: "floating" | "dock";
}

export const VersionHistoryPanel: React.FC<VersionHistoryPanelProps> = React.memo(({
  isOpen,
  onClose,
  versions,
  onLoadVersion,
  isRestoring = false,
  mode = "floating",
}) => {
  if (!isOpen) return null;
  const isDock = mode === "dock";

  const content = (
    <CyberPanel
      title="History"
      icon={History}
      onClose={onClose}
      className={isDock ? "h-full rounded-none border-y-0 border-r-0 border-cyber-primary/20 bg-black/80 backdrop-blur-xl" : "border-cyber-primary/20 bg-black/80 backdrop-blur-xl"}
      maxHeight={isDock ? "100%" : "80vh"}
      scrollable={!isDock}
    >
      <div className={`p-2 space-y-1 scrollbar-hide overflow-y-auto min-h-0 ${isDock ? "h-full" : "max-h-[60vh]"}`}>
        {versions.length === 0 ? (
          <div className="text-center py-8 opacity-20 text-[10px] font-black uppercase tracking-[0.18em]">
            No saved versions
          </div>
        ) : (
          versions.map((v) => (
            <div
              key={v.id}
              className="group p-2 bg-black/40 border border-white/5 rounded hover:border-cyber-primary/40 cursor-pointer transition-all"
              onClick={() =>
                confirm(`Restore "${v.label || v.id}"?`) &&
                !isRestoring &&
                onLoadVersion(v)
              }
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-bold text-white/50 group-hover:text-cyber-primary truncate pr-2">
                  {v.label || "Auto backup"}
                </span>
                <span className="text-[9px] font-mono text-white/20">
                  {v.data?.nodes?.length || 0}N
                </span>
              </div>
              <div className="flex justify-between items-center text-[8px] font-mono opacity-30">
                <span>{new Date(v.timestamp).toLocaleDateString()}</span>
                <span>{new Date(v.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </CyberPanel>
  );

  if (isDock) return <div className="h-full w-full min-h-0">{content}</div>;

  return (
    <Panel
      position="top-right"
      className="m-4 w-[320px] z-50 animate-in fade-in slide-in-from-right-2 duration-200"
    >
      {content}
    </Panel>
  );
});

VersionHistoryPanel.displayName = "VersionHistoryPanel";
export default VersionHistoryPanel;
