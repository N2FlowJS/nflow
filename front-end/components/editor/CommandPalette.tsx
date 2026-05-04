import React from "react";
import { CommandAction } from "../../types/editor";

interface CommandPaletteProps {
  showCommandPalette: boolean;
  setShowCommandPalette: React.Dispatch<React.SetStateAction<boolean>>;
  commandQuery: string;
  setCommandQuery: React.Dispatch<React.SetStateAction<string>>;
  commandIndex: number;
  setCommandIndex: React.Dispatch<React.SetStateAction<number>>;
  filteredCommands: CommandAction[];
  commandInputRef: React.RefObject<HTMLInputElement>;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({
  showCommandPalette,
  setShowCommandPalette,
  commandQuery,
  setCommandQuery,
  commandIndex,
  setCommandIndex,
  filteredCommands,
  commandInputRef,
}) => {
  if (!showCommandPalette) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[1px] flex items-start justify-center pt-[12vh] px-4">
      <div className="w-full max-w-[680px] bg-cyber-panel/95 border border-cyber-border rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3">
          <span className="text-xs font-mono uppercase tracking-widest text-cyber-primary">
            Command Palette
          </span>
          <span className="text-[10px] text-gray-400">
            Enter to run · Esc to close
          </span>
        </div>
        <div className="p-3 border-b border-white/10">
          <input
            ref={commandInputRef}
            value={commandQuery}
            onChange={(e) => {
              setCommandQuery(e.target.value);
              setCommandIndex(0);
            }}
            placeholder="Type a command: save, validate, layout, export..."
            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyber-primary/50"
          />
        </div>
        <div className="max-h-[420px] overflow-y-auto p-2 space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-gray-400">
              No command found.
            </div>
          ) : (
            filteredCommands.map((command, idx) => (
              <button
                key={command.id}
                onClick={() => {
                  command.run();
                  setShowCommandPalette(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                  idx === commandIndex
                    ? "bg-cyber-primary/20 border-cyber-primary/40"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-sm text-white">{command.label}</div>
                    <div className="text-[10px] uppercase tracking-wider text-cyber-muted">
                      {command.group}
                    </div>
                  </div>
                  <div className="text-[10px] font-mono text-cyber-primary/90">
                    {command.shortcut}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
