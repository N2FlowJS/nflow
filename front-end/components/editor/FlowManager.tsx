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
  mode?: "floating" | "dock";
}

const FlowManager: React.FC<FlowManagerProps> = ({
  isFlowManagerOpen,
  setIsFlowManagerOpen,
  savedFlows,
  onDeleteFlow,
  navigate,
  mode = "floating",
}) => {
  const closeManager = () => setIsFlowManagerOpen(false);
  const isDock = mode === "dock";

  if (!isFlowManagerOpen) return null;

  const content = (
    <CyberPanel
      title="Flows"
      icon={FolderOpen}
      onClose={closeManager}
      className={isDock ? "h-full rounded-none border-y-0 border-r-0" : "w-[300px] max-w-full border-white/5"}
      maxHeight={isDock ? "100%" : "80vh"}
      scrollable={!isDock}
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
      <div className={`p-1 space-y-1 overflow-y-auto scrollbar-hide min-h-0 ${isDock ? "h-full" : "max-h-[60vh]"}`}>
        {savedFlows.length === 0 ? (
          <CyberEmptyState label="No saved flows" className="py-10 tracking-[0.2em]" />
        ) : (
          savedFlows.map((flow) => (
            <CyberListItem
              key={flow.id}
              className="px-3 py-2 hover:bg-white/5 rounded-lg"
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
                    if (confirm(`Delete \"${flow.name}\"?`)) onDeleteFlow(flow.id);
                  }}
                />
              }
            >
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-black text-white/60 group-hover:text-cyber-primary transition-colors tracking-[0.18em] truncate">
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
  );

  if (isDock) return <div className="h-full w-full min-h-0">{content}</div>;

  return <CyberOverlay className="z-[100]">{content}</CyberOverlay>;
};

export default FlowManager;
