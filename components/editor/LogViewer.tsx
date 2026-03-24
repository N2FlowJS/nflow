import React from "react";
import { Terminal, ArrowDown, ArrowRight } from "lucide-react";
import { LogEntry } from "../../types/editor";

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
  return (
    <div
      className={`fixed bottom-0 left-0 z-50 transition-all duration-300 ${
        isLogsOpen ? "w-[45vw] h-[25vh]" : "w-40 h-8"
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
                className="flex gap-2 leading-relaxed border-b border-white/5 pb-1 last:border-0"
              >
                <span className="text-gray-600 shrink-0">[{log.time}]</span>
                <span
                  className={`${
                    log.type === "error"
                      ? "text-red-400"
                      : log.type === "nodeUpdate"
                        ? "text-cyber-primary"
                        : "text-gray-300"
                  } break-all`}
                >
                  {log.message}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default LogViewer;
