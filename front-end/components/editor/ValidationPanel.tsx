import React from "react";

import { FlowValidationIssue } from "../../../back-end/flow-validation";
import { CyberBadge, CyberEmptyState, CyberListItem, CyberPanel } from "../shared/CyberUI";
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
  const isDock = true;

  const content = (
    <CyberPanel
      title="Validation"
      icon={hasError ? AlertTriangle : ShieldCheck}
      className="h-full rounded-none border-y-0 border-r-0"
      maxHeight="100%"
      scrollable={false}
      onClose={onClose}
      actions={
        <div className="flex items-center gap-1 font-mono text-[9px] opacity-40">
          <span className={errors.length > 0 ? "text-red-400 opacity-100" : ""}>{errors.length} error</span>
          <span>/</span>
          <span className={warnings.length > 0 ? "text-amber-400 opacity-100" : ""}>{warnings.length} warning</span>
        </div>
      }
    >
      <div className={`p-2 space-y-1 overflow-y-auto scrollbar-hide min-h-0 ${isDock ? "h-full" : ""}`}>
        {flowIssues.length === 0 ? (
          <CyberEmptyState label="No issues found" className="h-full min-h-40 tracking-[0.18em]" />
        ) : (
          <>
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
                      label="Go to"
                      className="self-start"
                    />
                  ) : undefined
                }
              >
                <div className="flex items-center justify-between pointer-events-none">
                  <span className={`text-[8px] font-bold uppercase tracking-[0.18em] ${issue.level === "error" ? "text-red-400" : "text-amber-400"}`}>
                    {issue.level} {issue.nodeId ? `- ${issue.nodeId.slice(-4)}` : ""}
                  </span>
                </div>
                <div className="text-[10px] leading-tight text-white/60 font-medium">
                  {issue.message}
                </div>
              </CyberListItem>
            ))}
            {flowIssues.length > 10 && (
              <div className="text-center py-2 text-[8px] text-white/20 font-black uppercase tracking-[0.18em]">
                + {flowIssues.length - 10} more issues
              </div>
            )}
          </>
        )}
      </div>
    </CyberPanel>
  );

  return <div className="h-full w-full min-h-0">{content}</div>;
};

export default ValidationPanel;
