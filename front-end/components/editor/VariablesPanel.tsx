import React from "react";
import { DollarSign, Plus, Trash2 } from "lucide-react";
import { CyberPanel, CyberAction } from "../shared/CyberUI";
import { GlobalVariable } from "../../types/editor";

interface VariablesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  variables: GlobalVariable[];
  onVariablesChange: (variables: GlobalVariable[]) => void;
}

export const VariablesPanel: React.FC<VariablesPanelProps> = React.memo(({
  isOpen,
  onClose,
  variables,
  onVariablesChange,
}) => {
  if (!isOpen) return null;
  const content = (
    <CyberPanel
      title="Variables"
      icon={DollarSign}
      onClose={onClose}
      className="h-full rounded-none border-y-0 border-r-0 border-cyber-primary/20 bg-black/80 backdrop-blur-xl"
      maxHeight={"100%"}
      scrollable={false}
      actions={
        <CyberAction
          icon={Plus}
          onClick={() =>
            onVariablesChange([
              ...variables,
              { id: `v-${Date.now()}`, name: "KEY", value: "" },
            ])
          }
        />
      }
    >
    <div className="p-2 space-y-1.5 scrollbar-hide overflow-y-auto min-h-0 h-full">
        {variables.length === 0 ? (
          <div className="text-center py-8 opacity-20 text-[10px] font-black uppercase tracking-[0.18em]">
            No variables
          </div>
        ) : (
          variables.map((v) => (
            <div key={v.id} className="flex items-center gap-1 group/v">
              <input
                value={v.name}
                onChange={(e) =>
                  onVariablesChange(
                    variables.map((x) =>
                      x.id === v.id ? { ...x, name: e.target.value } : x
                    )
                  )
                }
                className="w-24 bg-black/40 border border-white/5 rounded px-2 py-1 text-[10px] font-mono text-cyber-primary focus:outline-none focus:border-cyber-primary/40"
                placeholder="KEY"
              />
              <input
                value={v.value}
                onChange={(e) =>
                  onVariablesChange(
                    variables.map((x) =>
                      x.id === v.id ? { ...x, value: e.target.value } : x
                    )
                  )
                }
                className="flex-1 bg-black/40 border border-white/5 rounded px-2 py-1 text-[10px] font-mono text-white/50 focus:outline-none focus:border-cyber-primary/40"
                placeholder="VALUE"
              />
              <button
                onClick={() =>
                  onVariablesChange(variables.filter((x) => x.id !== v.id))
                }
                className="p-1 opacity-10 group-hover/v:opacity-100 hover:text-red-500 transition-all"
              >
                <Trash2 size={10} />
              </button>
            </div>
          ))
        )}
      </div>
    </CyberPanel>
  );

  return <div className="h-full w-full min-h-0">{content}</div>;
});

VariablesPanel.displayName = "VariablesPanel";
export default VariablesPanel;
