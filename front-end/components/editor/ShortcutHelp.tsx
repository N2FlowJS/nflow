import React from "react";
import { CyberBadge, CyberListItem, CyberPanel } from "../shared/CyberUI";
import { Keyboard } from "lucide-react";

const SHORTCUTS = [
  { label: "Save", key: "Ctrl/Cmd+S" },
  { label: "Run flow", key: "Ctrl/Cmd+Enter" },
  { label: "Auto layout", key: "Ctrl+Shift+L" },
  { label: "Minimap", key: "Ctrl+Shift+M" },
  { label: "Command palette", key: "Ctrl/Cmd+K" },
  { label: "Copy / Paste", key: "Ctrl+C / V" },
  { label: "Undo / Redo", key: "Ctrl+Z / Y" },
  { label: "Delete", key: "Del / BS" },
];

interface ShortcutHelpProps {
  showShortcutHelp: boolean;
  setShowShortcutHelp: React.Dispatch<React.SetStateAction<boolean>>;
}

const ShortcutHelp: React.FC<ShortcutHelpProps> = ({
  showShortcutHelp,
  setShowShortcutHelp,
}) => {
  if (!showShortcutHelp) return null;

  const content = (
    <CyberPanel
      title="Shortcuts"
      icon={Keyboard}
      onClose={() => setShowShortcutHelp(false)}
      className="h-full rounded-none border-y-0 border-r-0"
      maxHeight="100%"
    >
      <div className="p-2 space-y-0.5">
        {SHORTCUTS.map((s) => (
          <CyberListItem
            key={s.key}
            className="items-center justify-between rounded-lg px-3 py-1.5 hover:bg-white/5"
            action={<CyberBadge label={s.key} size="sm" />}
          >
            <span className="text-[9px] text-white/40 font-black tracking-[0.18em] group-hover:text-white/60 transition-colors">
              {s.label}
            </span>
          </CyberListItem>
        ))}
      </div>
    </CyberPanel>
  );

  return <div className="h-full w-full">{content}</div>;
};

export default ShortcutHelp;

