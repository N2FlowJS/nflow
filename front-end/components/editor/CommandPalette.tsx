import React from "react";
import { CommandAction } from "../../types/editor";
import { CyberBadge, CyberEmptyState, CyberListItem, CyberMetaText, CyberOverlay, CyberPanel, CyberPanelFooter, CyberPanelSection } from "../shared/CyberUI";
import { Command } from "lucide-react";
import { Input } from "../ui/index";

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
    <CyberOverlay className="z-[100] items-start pt-[12vh] animate-in fade-in duration-300">
      <div className="w-full max-w-[600px] pointer-events-auto">
        <CyberPanel
          title="COMMANDS"
          icon={Command}
          onClose={() => setShowCommandPalette(false)}
          className="border-cyber-primary/20 bg-black/80 shadow-[0_0_100px_rgba(0,0,0,0.8)] backdrop-blur-xl"
          actions={
            <CyberMetaText className="px-0 text-[9px] text-white/20 tracking-[0.2em]">
              Exec: Enter
            </CyberMetaText>
          }
        >
          <div className="flex flex-col h-full">
            <CyberPanelSection className="border-b border-white/5 p-4">
              <Input
                ref={commandInputRef}
                value={commandQuery}
                onChange={(e) => {
                  setCommandQuery(e.target.value);
                  setCommandIndex(0);
                }}
                icon={Command}
                placeholder="Initialize instruction: save, layout, export..."
                className="!rounded-xl !border-cyber-primary/20 !bg-black/60 !py-4 !pl-12 !pr-5 !text-lg placeholder:!text-white/10 focus:!border-cyber-primary focus:!shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                autoFocus
                onKeyDown={(e) => {
                   if (e.key === 'Escape') setShowCommandPalette(false);
                }}
              />
            </CyberPanelSection>
            
            <div className="flex-1 overflow-y-auto max-h-[400px] p-2 space-y-1 bg-black/20 scrollbar-hide">
              {filteredCommands.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center gap-2 opacity-20">
                  <Command size={48} />
                  <CyberEmptyState label="Command_Not_Found" className="text-[9px] tracking-[0.35em]" />
                </div>
              ) : (
                filteredCommands.map((command, idx) => {
                  const isActive = idx === commandIndex;
                  return (
                    <CyberListItem
                      key={command.id}
                      onClick={() => {
                        command.run();
                        setShowCommandPalette(false);
                      }}
                      accentClassName={isActive ? "bg-cyber-primary" : "bg-white/10"}
                      className={`items-center justify-between gap-4 rounded-xl border px-5 py-3 text-left transition-all active:scale-[0.99] ${
                        isActive
                          ? "bg-cyber-primary/10 border-cyber-primary/40 shadow-[inset_0_0_15px_rgba(0,240,255,0.05)] scale-[1.01]"
                          : "bg-transparent border-transparent hover:bg-white/5"
                      }`}
                      action={command.shortcut ? (
                        <CyberBadge
                          label={command.shortcut}
                          size="sm"
                          className={isActive ? "border-cyber-primary bg-cyber-primary text-black shadow-[0_0_10px_rgba(0,240,255,0.5)]" : "bg-black/40 text-white/20 border-white/5"}
                        />
                      ) : undefined}
                    >
                      <div className="flex min-w-0 flex-col">
                        <div className={`text-sm font-black tracking-wide transition-colors ${isActive ? "text-cyber-primary" : "text-white/60"}`}>
                          {command.label}
                        </div>
                        <CyberMetaText className="px-0 text-[9px] tracking-[0.15em]">
                          {command.group}
                        </CyberMetaText>
                      </div>
                    </CyberListItem>
                  );
                })
              )}
            </div>
            <CyberPanelFooter>
              <CyberMetaText className="px-0 text-white/15 tracking-[0.2em]">Navigate: Up/Down</CyberMetaText>
              <CyberMetaText className="px-0 text-white/15 tracking-[0.2em]">Close: Esc</CyberMetaText>
            </CyberPanelFooter>
          </div>
        </CyberPanel>
      </div>
    </CyberOverlay>
  );
};

export default CommandPalette;
