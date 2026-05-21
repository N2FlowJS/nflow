import React from "react";
import { Terminal, Target, Trash2 } from "lucide-react";
import { LogEntry } from "../../types/editor";
import { useReactFlow } from "@xyflow/react";
import { CyberAction, CyberEmptyState, CyberListItem, CyberPanel } from "../shared/CyberUI";

const LOG_TYPE_STYLES: Record<
  string,
  { bar: string; text: string }
> = {
  error: {
    bar: "bg-red-500/50",
    text: "text-red-400/80",
  },
  nodeUpdate: {
    bar: "bg-cyber-primary/50",
    text: "text-cyber-primary/80",
  },
  skipped: {
    bar: "bg-indigo-400/30",
    text: "text-indigo-300/50",
  },
  default: {
    bar: "bg-white/10",
    text: "text-gray-500",
  },
};

interface LogViewerProps {
  isLogsOpen: boolean;
  setIsLogsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  executionLogs: LogEntry[];
  onClear?: () => void;
  mode?: "floating" | "dock";
}

const LogViewer: React.FC<LogViewerProps> = ({
  isLogsOpen,
  setIsLogsOpen,
  executionLogs,
  onClear,
  mode = "floating",
}) => {
  const { setCenter, getNodes, setNodes } = useReactFlow();
  const isDock = mode === "dock";

  const zoomToNode = (nodeId?: string) => {
    if (!nodeId) return;
    const nodes = getNodes();
    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      const x = node.position.x + (node.measured?.width || 200) / 2;
      const y = node.position.y + (node.measured?.height || 100) / 2;
      setCenter(x, y, { zoom: 1.2, duration: 400 });

      setNodes((nds) =>
        nds.map((n) => (n.id === nodeId ? { ...n, selected: true } : n))
      );
    }
  };

  return (
    <div
      className={isDock ? "h-full w-full min-h-0" : `fixed bottom-0 left-12 right-0 z-30 transition-all duration-300 ease-in-out ${
        isLogsOpen ? "h-[30vh]" : "h-6 pointer-events-none"
      }`}
    >
      <CyberPanel
        title="Logs"
        icon={Terminal}
        className={`h-full ${isDock ? "rounded-none border-y-0 border-r-0" : "border-x-0 border-b-0 rounded-none bg-black/90 backdrop-blur-2xl transition-all"} ${!isDock && !isLogsOpen ? 'opacity-0' : 'opacity-100'}`}
        maxHeight="100%"
        scrollable={!isDock}
        onClose={() => setIsLogsOpen(false)}
        actions={
          <CyberAction
            icon={Trash2}
            onClick={() => onClear?.()}
            className="h-5 w-5 opacity-40 hover:opacity-100 border-none bg-transparent"
            showLabel={false}
          />
        }
      >
        <div className="p-2 font-mono text-[9px] space-y-0.5 h-full overflow-y-auto scrollbar-hide min-h-0">
          {executionLogs.length === 0 ? (
            <CyberEmptyState label="No logs yet" className="h-full text-white/5 tracking-[0.18em]" />
          ) : (
            executionLogs.map((log) => {
              const styles = LOG_TYPE_STYLES[log.type] || LOG_TYPE_STYLES.default;

              return (
                <CyberListItem
                  key={log.id}
                  className="gap-2 py-0.5 px-1 border-b border-white/[0.02] last:border-0 hover:bg-white/[0.03]"
                  action={
                    log.nodeId ? (
                      <CyberAction
                        icon={Target}
                        showLabel={false}
                        className="h-4 w-4 justify-center border-none bg-transparent opacity-0 group-hover:opacity-100"
                        onClick={() => zoomToNode(log.nodeId)}
                      />
                    ) : undefined
                  }
                >
                  <span className="text-white/10 shrink-0 font-bold w-14">[{log.time}]</span>
                  <div className="flex-1 min-w-0 flex items-center gap-2">
                    <div className={`w-1 h-3 shrink-0 ${styles.bar}`} />
                    <span className={`truncate font-medium ${styles.text}`}>
                      {log.message}
                    </span>
                  </div>
                </CyberListItem>
              );
            })
          )}
        </div>
      </CyberPanel>
    </div>
  );
};

export default LogViewer;

