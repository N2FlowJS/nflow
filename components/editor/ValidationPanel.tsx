import React from "react";
import { Panel } from "@xyflow/react";
import { FlowValidationIssue } from "../../flow-validation";

interface ValidationPanelProps {
  flowIssues: FlowValidationIssue[];
  focusIssueNode: (nodeId?: string, fieldName?: string) => void;
}

const ValidationPanel: React.FC<ValidationPanelProps> = ({
  flowIssues,
  focusIssueNode,
}) => {
  const errors = flowIssues.filter((i) => i.level === "error");
  const warnings = flowIssues.filter((i) => i.level === "warning");
  const hasError = errors.length > 0;

  return (
    <>
      <Panel position="top-right" className="m-4">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-md ${
            hasError
              ? "bg-red-500/10 border-red-500/20"
              : "bg-green-500/10 border-green-500/20"
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full animate-pulse ${
              hasError ? "bg-red-500" : "bg-green-500"
            }`}
          ></div>
          <span
            className={`text-[10px] font-mono font-bold tracking-widest ${
              hasError ? "text-red-400" : "text-green-400"
            }`}
          >
            {hasError ? `FLOW_INVALID (${errors.length})` : "FLOW_READY"}
          </span>
        </div>
      </Panel>

      {flowIssues.length > 0 && (
        <Panel position="top-left" className="m-4 max-w-[420px]">
          <div className="bg-cyber-panel/90 border border-cyber-border rounded-xl shadow-2xl overflow-hidden">
            <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between bg-black/30">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyber-primary">
                Flow Validation
              </span>
              <span className="text-[10px] font-mono text-gray-400">
                {errors.length} ERR · {warnings.length} WARN
              </span>
            </div>

            <div className="max-h-[220px] overflow-y-auto p-2 space-y-1">
              {flowIssues.slice(0, 12).map((issue, idx) => (
                <button
                  key={`${issue.level}-${issue.nodeId || "global"}-${idx}`}
                  type="button"
                  onClick={() => focusIssueNode(issue.nodeId, issue.fieldName)}
                  className={`w-full text-left px-2 py-1.5 rounded-md border transition-colors ${
                    issue.level === "error"
                      ? "border-red-500/30 bg-red-500/10 text-red-200 hover:bg-red-500/20"
                      : "border-yellow-500/30 bg-yellow-500/10 text-yellow-100 hover:bg-yellow-500/20"
                  } ${issue.nodeId ? "cursor-pointer" : "cursor-default"}`}
                >
                  <div className="text-[9px] font-mono uppercase opacity-80">
                    {issue.level}
                    {issue.nodeId ? ` · ${issue.nodeId}` : ""}
                  </div>
                  <div className="text-[11px] leading-tight">
                    {issue.message}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Panel>
      )}
    </>
  );
};

export default ValidationPanel;
