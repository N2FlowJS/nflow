import React from "react";
import { Trash2, FolderOpen, Plus } from "lucide-react";
import { SavedFlow } from "../../types/editor";
import { CyberAction, CyberEmptyState, CyberListItem, CyberOverlay, CyberPanel } from "../shared/CyberUI";

interface FlowManagerProps {
  isFlowManagerOpen: boolean;
  setIsFlowManagerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  savedFlows: SavedFlow[];
  onDeleteFlow: (id: string) => void;
  navigate: (path: string) => void;
}

const FlowManager: React.FC<FlowManagerProps> = ({
  isFlowManagerOpen,
  setIsFlowManagerOpen,
  savedFlows,
  onDeleteFlow,
  navigate,
}) => {
  const closeManager = () => setIsFlowManagerOpen(false);

  if (!isFlowManagerOpen) return null;

  return (
    <CyberOverlay className="z-[100]">
      <CyberPanel
        title="ARCHIVE"
        icon={FolderOpen}
        onClose={closeManager}
        className="w-[320px] max-w-full border-white/5"
        actions={
          <CyberAction
            icon={Plus}
            showLabel={false}
            className="h-6 w-6 justify-center border-none bg-transparent opacity-50 hover:opacity-100"
            onClick={() => {
              navigate("/flow/new");
              closeManager();
            }}
          />
        }
      >
        <div className="p-1 space-y-1 max-h-[60vh] overflow-y-auto scrollbar-hide">
          {savedFlows.length === 0 ? (
            <CyberEmptyState label="Empty_Storage" className="py-10" />
          ) : (
            savedFlows.map((flow) => (
              <CyberListItem
                key={flow.id}
                className="px-3 py-2 hover:bg-white/5"
                onClick={() => {
                  navigate(`/flow/${flow.id}`);
                  closeManager();
                }}
                action={
                  <CyberAction
                    icon={Trash2}
                    showLabel={false}
                    colorClass="text-red-500"
                    className="h-5 w-5 justify-center border-none bg-transparent opacity-0 group-hover:opacity-100"
                    onClick={(event) => {
                      event.stopPropagation();
                      if (confirm(`PURGE: ${flow.name}?`)) onDeleteFlow(flow.id);
                    }}
                  />
                }
              >
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-black text-white/60 group-hover:text-cyber-primary transition-colors uppercase tracking-widest truncate">
                    {flow.name}
                  </div>
                  <div className="text-[7px] text-white/20 font-mono uppercase mt-0.5 truncate">
                    {new Date(flow.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </CyberListItem>
            ))
          )}
        </div>
      </CyberPanel>
    </CyberOverlay>
  );
};

export default FlowManager;
