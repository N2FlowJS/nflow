import React from "react";
import { Panel } from "@xyflow/react";
import { FlowValidationIssue } from "../../../back-end/flow-validation";
import { CyberBadge, CyberListItem, CyberPanel } from "../shared/CyberUI";
import { AlertTriangle, ShieldCheck } from "lucide-react";

interface ValidationPanelProps {
  flowIssues: FlowValidationIssue[];
  focusIssueNode: (nodeId?: string, fieldName?: string) => void;
  onClose?: () => void;
}

const ValidationPanel: React.FC<ValidationPanelProps> = ({
  flowIssues,
  focusIssueNode,
  onClose,
}) => {
  const errors = flowIssues.filter((i) => i.level === "error");
  const warnings = flowIssues.filter((i) => i.level === "warning");
  const hasError = errors.length > 0;

  if (flowIssues.length === 0) return null;

  return (
    <Panel position="top-left" className="m-4 z-50 animate-in fade-in slide-in-from-left-2 duration-200">
      <CyberPanel
        title="VALIDATION"
        icon={hasError ? AlertTriangle : ShieldCheck}
        className="w-[300px] border-cyber-primary/20 bg-black/80 backdrop-blur-xl"
        maxHeight="60vh"
        onClose={onClose}
        actions={
          <div className="flex items-center gap-1 font-mono text-[9px] opacity-40">
            <span className={errors.length > 0 ? "text-red-400 opacity-100" : ""}>{errors.length}E</span>
            <span>/</span>
            <span className={warnings.length > 0 ? "text-amber-400 opacity-100" : ""}>{warnings.length}W</span>
          </div>
        }
      >
        <div className="p-2 space-y-1.5 overflow-y-auto scrollbar-hide">
          {flowIssues.slice(0, 10).map((issue, idx) => (
            <CyberListItem
              key={`${issue.level}-${idx}`}
              onClick={() => focusIssueNode(issue.nodeId, issue.fieldName)}
              accentClassName={issue.level === "error" ? "bg-red-400" : "bg-amber-400"}
              className={`w-full flex-col gap-1 rounded border border-white/5 p-2 text-left active:scale-[0.98] ${
                issue.level === "error" ? "bg-red-500/5 hover:bg-red-500/10" : "bg-amber-500/5 hover:bg-amber-500/10"
              }`}
              action={
                issue.nodeId ? (
                  <CyberBadge
                    label="LOCATE"
                    className="self-start"
                  />
                ) : undefined
              }
            >
              <div className="flex items-center justify-between pointer-events-none">
                <span className={`text-[8px] font-bold uppercase tracking-tighter ${issue.level === "error" ? "text-red-400" : "text-amber-400"}`}>
                  {issue.level} {issue.nodeId ? `:: ${issue.nodeId.slice(-4)}` : ""}
                </span>
              </div>
              <div className="text-[10px] leading-tight text-white/60 font-medium">
                {issue.message}
              </div>
            </CyberListItem>
          ))}
          {flowIssues.length > 10 && (
            <div className="text-center py-2 text-[8px] text-white/20 font-black uppercase tracking-widest">
              + {flowIssues.length - 10} Signals Hidden
            </div>
          )}
        </div>
      </CyberPanel>
    </Panel>
  );
};

export default ValidationPanel;
