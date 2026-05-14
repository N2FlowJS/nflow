import React from "react";
import { Panel } from "@xyflow/react";
import { CyberBadge, CyberListItem, CyberPanel } from "../shared/CyberUI";
import { Keyboard } from "lucide-react";

interface ShortcutHelpProps {
  showShortcutHelp: boolean;
  setShowShortcutHelp: React.Dispatch<React.SetStateAction<boolean>>;
}

const ShortcutHelp: React.FC<ShortcutHelpProps> = ({
  showShortcutHelp,
  setShowShortcutHelp,
}) => {
  if (!showShortcutHelp) return null;

  const shortcuts = [
    { label: "Save", key: "Ctrl/Cmd+S" },
    { label: "Run Flow", key: "Ctrl/Cmd+Enter" },
    { label: "Smart Layout", key: "Ctrl+Shift+L" },
    { label: "Minimap", key: "Ctrl+Shift+M" },
    { label: "Command Palette", key: "Ctrl/Cmd+K" },
    { label: "Copy / Paste", key: "Ctrl+C / V" },
    { label: "Undo / Redo", key: "Ctrl+Z / Y" },
    { label: "Delete", key: "Del / BS" },
  ];

  return (
    <Panel position="bottom-left" className="m-4 z-40 animate-in slide-in-from-bottom-4 duration-300">
      <CyberPanel
        title="SHORTCUTS"
        icon={Keyboard}
        onClose={() => setShowShortcutHelp(false)}
        className="w-72"
      >
        <div className="p-2 space-y-0.5">
          {shortcuts.map((s, idx) => (
            <CyberListItem
              key={idx}
              className="items-center justify-between rounded px-3 py-1.5 hover:bg-white/5"
              action={<CyberBadge label={s.key} size="sm" />}
            >
              <span className="text-[9px] text-white/40 uppercase font-black tracking-wider group-hover:text-white/60 transition-colors">
                {s.label}
              </span>
            </CyberListItem>
          ))}
        </div>
      </CyberPanel>
    </Panel>
  );
};

export default ShortcutHelp;

