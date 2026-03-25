import React from "react";
import { Panel } from "@xyflow/react";

interface ShortcutHelpProps {
  showShortcutHelp: boolean;
  setShowShortcutHelp: React.Dispatch<React.SetStateAction<boolean>>;
}

const ShortcutHelp: React.FC<ShortcutHelpProps> = ({
  showShortcutHelp,
  setShowShortcutHelp,
}) => {
  if (!showShortcutHelp) return null;

  return (
    <Panel position="bottom-left" className="m-4 max-w-[360px]">
      <div className="bg-cyber-panel/95 border border-cyber-border rounded-xl shadow-2xl overflow-hidden">
        <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between bg-black/30">
          <span className="text-[10px] font-mono uppercase tracking-widest text-cyber-primary">
            Keyboard Shortcuts
          </span>
          <button
            onClick={() => setShowShortcutHelp(false)}
            className="text-[10px] text-gray-400 hover:text-white"
          >
            ESC
          </button>
        </div>
        <div className="p-3 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
          <span className="text-gray-300">Save</span>
          <span className="text-cyber-primary">Ctrl/Cmd+S</span>
          <span className="text-gray-300">Validate</span>
          <span className="text-cyber-primary">Ctrl/Cmd+Shift+K</span>
          <span className="text-gray-300">Deploy</span>
          <span className="text-cyber-primary">Ctrl/Cmd+Enter</span>
          <span className="text-gray-300">Smart Layout</span>
          <span className="text-cyber-primary">Ctrl/Cmd+Shift+L</span>
          <span className="text-gray-300">Group/Ungroup</span>
          <span className="text-cyber-primary">Ctrl/Cmd+Shift+G/U</span>
          <span className="text-gray-300">Minimap/Fit</span>
          <span className="text-cyber-primary">Ctrl/Cmd+Shift+M/F</span>
          <span className="text-gray-300">Export/Import</span>
          <span className="text-cyber-primary">Ctrl/Cmd+Shift+E/I</span>
          <span className="text-gray-300">Copy/Paste</span>
          <span className="text-cyber-primary">Ctrl+C/V</span>
          <span className="text-gray-300">Duplicate</span>
          <span className="text-cyber-primary">Ctrl+D</span>
          <span className="text-gray-300">Delete</span>
          <span className="text-cyber-primary">Del/BS</span>
          <span className="text-gray-300">Undo/Redo</span>
          <span className="text-cyber-primary">Ctrl+Z/Y</span>
          <span className="text-gray-300">Toggle Help</span>
          <span className="text-cyber-primary">Ctrl/Cmd+Shift+/</span>
          <span className="text-gray-300">Command Palette</span>
          <span className="text-cyber-primary">Ctrl/Cmd+K</span>
        </div>
      </div>
    </Panel>
  );
};

export default ShortcutHelp;
