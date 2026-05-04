import React from "react";
import { Terminal, ArrowDown, ArrowRight, Target } from "lucide-react";
import { LogEntry } from "../../types/editor";
import { useReactFlow } from "@xyflow/react";

interface LogViewerProps {
  isLogsOpen: boolean;
  setIsLogsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  executionLogs: LogEntry[];
}

const LogViewer: React.FC<LogViewerProps> = ({
  isLogsOpen,
  setIsLogsOpen,
  executionLogs,
}) => {
  const { setCenter, getNodes, setNodes } = useReactFlow();

  const zoomToNode = (nodeId?: string) => {
    if (!nodeId) return;
    const nodes = getNodes();
    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      const x = node.position.x + (node.measured?.width || 200) / 2;
      const y = node.position.y + (node.measured?.height || 100) / 2;
      setCenter(x, y, { zoom: 1.2, duration: 200 });

      // Highlight the node temporarily
      setNodes((nds) =>
        nds.map((n) => {
          const baseClass = n.className?.replace(' outline outline-4 outline-cyber-primary shadow-[0_0_30px_rgba(0,240,255,0.8)]', '') || '';
          if (n.id === nodeId) {
            return {
              ...n,
              className: `${baseClass} outline outline-4 outline-cyber-primary shadow-[0_0_30px_rgba(0,240,255,0.8)]`,
            };
          }
          return { ...n, className: baseClass };
        })
      );

      // Remove highlight after 2.5s
      setTimeout(() => {
        setNodes((nds) =>
          nds.map((n) => {
            if (n.id === nodeId) {
              return {
                ...n,
                className: n.className?.replace(' outline outline-4 outline-cyber-primary shadow-[0_0_30px_rgba(0,240,255,0.8)]', '') || '',
              };
            }
            return n;
          })
        );
      }, 2500);
    }
  };

  return (
    <div
      className={`fixed bottom-0 left-64 z-[20] transition-all duration-300 ${
        isLogsOpen ? "w-[calc(100vw-256px-320px)] h-[25vh]" : "w-40 h-8"
      } bg-cyber-panel/90 backdrop-blur-xl border-t border-r border-cyber-border rounded-tr-xl shadow-2xl flex flex-col overflow-hidden m-0`}
    >
      <div className="px-3 py-1.5 border-b border-white/10 flex items-center justify-between bg-black/40">
        <div className="flex items-center gap-2 text-cyber-primary">
          <Terminal size={12} />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            System Logs
          </span>
        </div>
        <button
          onClick={() => setIsLogsOpen(!isLogsOpen)}
          className="p-1 hover:bg-white/10 rounded text-gray-400 transition-colors"
        >
          {isLogsOpen ? <ArrowDown size={14} /> : <ArrowRight size={14} />}
        </button>
      </div>
      {isLogsOpen && (
        <div className="flex-1 overflow-y-auto p-2 font-mono text-[10px] space-y-1 custom-scrollbar">
          {executionLogs.length === 0 ? (
            <div className="text-gray-600 italic p-2">
              Ready for execution...
            </div>
          ) : (
            executionLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-2 leading-relaxed border-b border-white/5 pb-1 last:border-0 group"
              >
                <span className="text-gray-600 shrink-0">[{log.time}]</span>
                <span
                  className={`flex-1 ${
                    log.type === "error"
                      ? "text-red-400"
                      : log.type === "nodeUpdate"
                        ? "text-cyber-primary"
                        : "text-gray-300"
                  } break-all`}
                >
                  {log.message}
                </span>
                {log.nodeId && (
                  <button
                    onClick={() => zoomToNode(log.nodeId)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-white/10 rounded text-cyber-primary transition-all"
                    title="Zoom to node"
                  >
                    <Target size={12} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default LogViewer;
