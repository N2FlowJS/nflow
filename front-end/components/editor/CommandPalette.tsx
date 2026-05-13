import React from "react";
import { CommandAction } from "../../types/editor";
import { CyberPanel } from "../shared/CyberUI";
import { Command } from "lucide-react";

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
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-start justify-center pt-[12vh] px-4 animate-in fade-in duration-300">
      <div className="w-full max-w-[600px] pointer-events-auto">
        <CyberPanel
          title="Neural Command Interface"
          icon={Command}
          onClose={() => setShowCommandPalette(false)}
          className="shadow-[0_0_100px_rgba(0,0,0,0.8)] border-cyber-primary/20"
          actions={
            <span className="text-[9px] text-white/20 font-mono uppercase tracking-[0.2em]">
              Exec: Enter
            </span>
          }
        >
          <div className="flex flex-col h-full">
            <div className="p-4 bg-black/40 border-b border-white/5">
              <input
                ref={commandInputRef}
                value={commandQuery}
                onChange={(e) => {
                  setCommandQuery(e.target.value);
                  setCommandIndex(0);
                }}
                placeholder="Initialize instruction: save, layout, export..."
                className="w-full bg-black/60 border border-cyber-primary/20 rounded-xl px-5 py-4 text-lg text-white placeholder:text-white/10 focus:outline-none focus:border-cyber-primary focus:shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all font-sans"
                autoFocus
                onKeyDown={(e) => {
                   if (e.key === 'Escape') setShowCommandPalette(false);
                }}
              />
            </div>
            
            <div className="flex-1 overflow-y-auto max-h-[400px] p-2 space-y-1 bg-black/20 scrollbar-hide">
              {filteredCommands.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center opacity-10 gap-2">
                  <Command size={48} />
                  <span className="text-xs font-black uppercase tracking-[0.3em]">Command_Not_Found</span>
                </div>
              ) : (
                filteredCommands.map((command, idx) => {
                  const isActive = idx === commandIndex;
                  return (
                    <button
                      key={command.id}
                      onClick={() => {
                        command.run();
                        setShowCommandPalette(false);
                      }}
                      className={`w-full text-left px-5 py-3 rounded-xl transition-all flex items-center justify-between gap-4 border ${
                        isActive
                          ? "bg-cyber-primary/10 border-cyber-primary/40 shadow-[inset_0_0_15px_rgba(0,240,255,0.05)] scale-[1.01]"
                          : "bg-transparent border-transparent hover:bg-white/5"
                      }`}
                    >
                      <div className="flex flex-col min-w-0">
                        <div className={`text-sm font-black tracking-wide transition-colors ${isActive ? "text-cyber-primary" : "text-white/60"}`}>
                          {command.label}
                        </div>
                        <div className="text-[9px] uppercase tracking-[0.15em] text-white/20 font-black">
                          {command.group}
                        </div>
                      </div>
                      {command.shortcut && (
                        <div className={`text-[10px] font-mono px-2 py-1 rounded-lg border transition-all ${
                          isActive 
                            ? "bg-cyber-primary text-black border-cyber-primary font-black shadow-[0_0_10px_rgba(0,240,255,0.5)]" 
                            : "bg-black/40 text-white/20 border-white/5"
                        }`}>
                          {command.shortcut}
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
            
            <div className="p-3 bg-black/60 border-t border-white/5 flex justify-between items-center px-6">
              <div className="flex gap-4">
                <div className="flex items-center gap-2 opacity-30">
                  <span className="text-[9px] font-mono bg-white/10 px-1 rounded">↑↓</span>
                  <span className="text-[8px] font-black uppercase tracking-tighter">Navigate</span>
                </div>
                <div className="flex items-center gap-2 opacity-30">
                  <span className="text-[9px] font-mono bg-white/10 px-1 rounded">ESC</span>
                  <span className="text-[8px] font-black uppercase tracking-tighter">Close</span>
                </div>
              </div>
              <span className="text-[8px] text-white/10 font-black uppercase tracking-[0.3em]">Interface V2.4.0</span>
            </div>
          </div>
        </CyberPanel>
      </div>
    </div>
  );
};

export default CommandPalette;
