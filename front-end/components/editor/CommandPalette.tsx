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
          title="Commands"
          icon={Command}
          onClose={() => setShowCommandPalette(false)}
          className="border-cyber-primary/20 bg-black/80 shadow-[0_0_30px_rgba(0,0,0,0.45)] backdrop-blur-xl"
          actions={
            <CyberMetaText className="px-0 text-[9px] text-white/20 tracking-[0.2em]">
              Enter
            </CyberMetaText>
          }
        >
          <div className="flex flex-col h-full">
            <CyberPanelSection className="border-b border-white/5 p-3">
              <Input
                ref={commandInputRef}
                value={commandQuery}
                onChange={(e) => {
                  setCommandQuery(e.target.value);
                  setCommandIndex(0);
                }}
                icon={Command}
                placeholder="Search commands"
                className="!rounded-xl !border-cyber-primary/20 !bg-black/60 !py-3 !pl-11 !pr-4 !text-base placeholder:!text-white/15 focus:!border-cyber-primary focus:!shadow-[0_0_8px_rgba(0,240,255,0.12)]"
                autoFocus
                onKeyDown={(e) => {
                   if (e.key === 'Escape') setShowCommandPalette(false);
                }}
              />
            </CyberPanelSection>
            
            <div className="flex-1 overflow-y-auto max-h-[360px] p-2 space-y-1 bg-black/20 scrollbar-hide">
              {filteredCommands.length === 0 ? (
                <div className="py-14 flex flex-col items-center justify-center gap-2 opacity-20">
                  <Command size={40} />
                  <CyberEmptyState label="No commands found" className="text-[9px] tracking-[0.2em]" />
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
                      className={`items-center justify-between gap-3 rounded-xl border px-4 py-2.5 text-left transition-all active:scale-[0.99] ${
                        isActive
                          ? "bg-cyber-primary/10 border-cyber-primary/40 shadow-[inset_0_0_10px_rgba(0,240,255,0.03)]"
                          : "bg-transparent border-transparent hover:bg-white/5"
                      }`}
                      action={command.shortcut ? (
                        <CyberBadge
                          label={command.shortcut}
                          size="sm"
                          className={isActive ? "border-cyber-primary bg-cyber-primary text-black shadow-[0_0_8px_rgba(0,240,255,0.18)]" : "bg-black/40 text-white/20 border-white/5"}
                        />
                      ) : undefined}
                    >
                      <div className="flex min-w-0 flex-col">
                        <div className={`text-[13px] font-black tracking-wide transition-colors ${isActive ? "text-cyber-primary" : "text-white/60"}`}>
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
              <CyberMetaText className="px-0 text-white/15 tracking-[0.2em]">Up/Down to move</CyberMetaText>
              <CyberMetaText className="px-0 text-white/15 tracking-[0.2em]">Esc to close</CyberMetaText>
            </CyberPanelFooter>
          </div>
        </CyberPanel>
      </div>
    </CyberOverlay>
  );
};

export default CommandPalette;
