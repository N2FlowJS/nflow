import React from "react";
import LayoutDropdown from "./LayoutDropdown";
import HeaderMoreMenu from './HeaderMoreMenu';
import {
  Home,
  Save,
  Play,
  Terminal,
  AlertTriangle,
  Settings2,
  Copy,
  ClipboardPaste,
  Undo2,
  Redo2,
  Zap,
  ArrowRight,
  ArrowDown,
  LayoutGrid,
  Map as MapIcon,
  Maximize,
  Activity,
  Layers,
  Ungroup,
  FileDown,
  Upload,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";
import { ValidationLocale } from "../../flow-validation";
import { RuntimeStatus } from "../../types/editor";

interface FlowHeaderProps {
  currentFlowName: string;
  setCurrentFlowName: (name: string) => void;
  isSaving: boolean;
  onSave: (name: string, versionLabel?: string, isAutoSave?: boolean) => void;
  onRunAll: () => void;
  onValidateFlow: () => void;
  setIsPlaygroundOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsFlowManagerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsToolsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isToolsMenuOpen: boolean;
  setIsVariablesPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isVariablesPanelOpen: boolean;
  setIsVersionHistoryOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isVersionHistoryOpen: boolean;
  validationLocale: ValidationLocale;
  setValidationLocale: React.Dispatch<React.SetStateAction<ValidationLocale>>;
  showShortcutHelp: boolean;
  setShowShortcutHelp: React.Dispatch<React.SetStateAction<boolean>>;
  showCommandPalette: boolean;
  setShowCommandPalette: React.Dispatch<React.SetStateAction<boolean>>;
  importInputRef: React.RefObject<HTMLInputElement>;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onDuplicate: () => void;
  undo: () => void;
  redo: () => void;
  onLayout: (type: string) => void;
  onGroupNodes: () => void;
  onUngroupNodes: () => void;
  onDownloadImage: () => void;
  onClear: () => void;
  setShowMinimap: React.Dispatch<React.SetStateAction<boolean>>;
  setIsLiveMode: React.Dispatch<React.SetStateAction<boolean>>;
  isLiveMode: boolean;
  reactFlowInstance: any;
  navigate: (path: string) => void;
  lastAutoSave: number | null;
  isAutoSaving: boolean;
  isOnline?: boolean;
}

const FlowHeader: React.FC<FlowHeaderProps> = ({
  currentFlowName,
  setCurrentFlowName,
  isSaving,
  onSave,
  onRunAll,
  onValidateFlow,
  setIsPlaygroundOpen,
  setIsFlowManagerOpen,
  setIsToolsMenuOpen,
  isToolsMenuOpen,
  setIsVariablesPanelOpen,
  isVariablesPanelOpen,
  setIsVersionHistoryOpen,
  isVersionHistoryOpen,
  validationLocale,
  setValidationLocale,
  showShortcutHelp,
  setShowShortcutHelp,
  showCommandPalette,
  setShowCommandPalette,
  importInputRef,
  onImport,
  onExport,
  onCopy,
  onPaste,
  onDuplicate,
  undo,
  redo,
  onLayout,
  onGroupNodes,
  onUngroupNodes,
  onDownloadImage,
  onClear,
  setShowMinimap,
  setIsLiveMode,
  isLiveMode,
  reactFlowInstance,
  navigate,
  lastAutoSave,
  isAutoSaving,
  isOnline = true,
}) => {
  return (
    <div className="h-16 border-b border-cyber-border bg-cyber-panel/50 backdrop-blur-sm flex items-center justify-between px-6 z-10 relative">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/")}
          className="p-2 bg-cyber-primary/10 hover:bg-cyber-primary/20 rounded-lg border border-cyber-primary/20 transition-colors"
          title="Back to Home"
        >
          <Home className="text-cyber-primary" size={20} />
        </button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-bold text-lg tracking-tight uppercase text-white/90">n2flow</h1>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex flex-col">
              <input
                type="text"
                value={currentFlowName}
                onChange={(e) => setCurrentFlowName(e.target.value)}
                className="text-xs font-bold text-cyber-primary bg-transparent outline-none focus:text-white transition-colors w-48"
                placeholder="Flow Name"
              />
              <div className="flex items-center gap-2 mt-0.5">
                {isAutoSaving ? (
                  <div className="flex items-center gap-1.5 leading-none">
                    <Activity className="w-2.5 h-2.5 text-cyber-primary animate-pulse" />
                    <span className="text-[9px] text-cyber-primary font-bold uppercase tracking-widest translate-y-[0.5px]">
                      Syncing...
                    </span>
                  </div>
                ) : lastAutoSave ? (
                  <div className="flex items-center gap-1.5 leading-none">
                    <div className="w-1 h-1 rounded-full bg-green-500/80" />
                    <span className="text-[9px] text-white/40 font-medium uppercase tracking-tighter translate-y-[0.5px]">
                      Synced
                    </span>
                  </div>
                ) : (
                  <span className="text-[9px] text-white/20 font-medium italic uppercase tracking-tighter">
                    Local Draft
                  </span>
                )}
                <div className="h-2 w-px bg-white/5 mx-1" />
                <div className="flex items-center gap-1 leading-none">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      isOnline ? "bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.3)] animate-pulse" : "bg-red-500"
                    }`}
                  />
                  <span className="text-[8px] text-white/30 font-bold uppercase tracking-widest translate-y-[0.5px]">
                    {isOnline ? "Online" : "Offline"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 relative">
        <HeaderMoreMenu
          setIsFlowManagerOpen={setIsFlowManagerOpen}
          setIsVariablesPanelOpen={setIsVariablesPanelOpen}
          setIsVersionHistoryOpen={setIsVersionHistoryOpen}
          setIsPlaygroundOpen={setIsPlaygroundOpen}
          onValidateFlow={onValidateFlow}
          setShowShortcutHelp={setShowShortcutHelp}
          setShowCommandPalette={setShowCommandPalette}
          onCopy={onCopy}
          onPaste={onPaste}
          onDuplicate={onDuplicate}
          undo={undo}
          redo={redo}
          onLayout={onLayout}
          setShowMinimap={setShowMinimap}
          reactFlowInstance={reactFlowInstance}
          setIsLiveMode={setIsLiveMode}
          isLiveMode={isLiveMode}
          onGroupNodes={onGroupNodes}
          onUngroupNodes={onUngroupNodes}
          onExport={onExport}
          importInputRef={importInputRef}
          onDownloadImage={onDownloadImage}
          onClear={onClear}
          setIsToolsMenuOpen={setIsToolsMenuOpen}
        />

        <button
          onClick={(e) => {
            if (!isOnline) return;
            if (e.shiftKey) {
              const label = prompt("Enter version label:", "");
              if (label !== null) onSave(currentFlowName, label);
            } else {
              onSave(currentFlowName);
            }
          }}
          disabled={isSaving || !isOnline}
          className={`p-2 rounded-lg transition-colors border ${
            isSaving
              ? "bg-cyber-primary/40 text-white border-cyber-primary/50 cursor-wait"
              : !isOnline
              ? "bg-gray-500/10 text-gray-500 border-gray-500/20 cursor-not-allowed"
              : "bg-cyber-primary/20 hover:bg-cyber-primary/40 text-cyber-primary border-cyber-primary/30"
          }`}
          title={!isOnline ? "Offline - Reconnecting..." : "Save (Ctrl/Cmd+S) - Shift+Click to add label"}
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save size={16} />
          )}
        </button>

        <button
          onClick={onRunAll}
          disabled={!isOnline}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all border ${
            !isOnline
              ? "bg-gray-500/10 text-gray-500 border-gray-500/20 cursor-not-allowed"
              : "bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500 hover:text-black"
          }`}
          title={!isOnline ? "Offline - Execution disabled" : "Deploy (Ctrl/Cmd+Enter)"}
        >
          <Play size={14} fill="currentColor" />
        </button>

        <button
          onClick={() => setIsPlaygroundOpen(true)}
          disabled={!isOnline}
          className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
            !isOnline
              ? "bg-gray-500/20 text-gray-500 cursor-not-allowed"
              : "bg-cyber-primary text-black hover:bg-cyan-300"
          }`}
          title={!isOnline ? "Offline - Playground disabled" : "Open Playground"}
        >
          <Terminal size={16} />
        </button>

        <select
          value={validationLocale}
          onChange={(e) => setValidationLocale(e.target.value as ValidationLocale)}
          className="px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-[11px] font-bold uppercase tracking-wider text-gray-300 focus:outline-none focus:border-cyber-primary/50"
          title="Validation language"
        >
          <option value="vi" className="bg-cyber-panel text-white">
            VI
          </option>
          <option value="en" className="bg-cyber-panel text-white">
            EN
          </option>
        </select>

        <button
          onClick={onValidateFlow}
          disabled={!isOnline}
          className={`p-2 rounded-lg transition-colors flex items-center justify-center border ${
            !isOnline
              ? "bg-gray-500/10 text-gray-500 border-gray-500/20 cursor-not-allowed"
              : "bg-orange-500/10 border-orange-500/30 text-gray-300 hover:bg-orange-500 hover:text-black"
          }`}
          title={!isOnline ? "Offline - Validation disabled" : "Validate (Ctrl/Cmd+Shift+K)"}
        >
          <AlertTriangle size={16} />
        </button>

        <button
          onClick={() => setIsToolsMenuOpen((prev) => !prev)}
          className={`p-2 rounded-lg border transition-colors ${
            isToolsMenuOpen
              ? "bg-cyber-primary/20 border-cyber-primary/30 text-cyber-primary"
              : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
          }`}
          title="Advanced Tools"
        >
          <Settings2 size={16} />
        </button>

        <input ref={importInputRef} type="file" accept=".json" className="hidden" onChange={onImport} />

        {isToolsMenuOpen && (
          <div className="absolute right-0 top-14 w-[300px] bg-cyber-panel/95 backdrop-blur-md border border-cyber-border rounded-xl shadow-2xl p-3 z-30 space-y-3">
            <div className="text-[10px] uppercase tracking-wider text-cyber-muted">Edit</div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => { onCopy(); setIsToolsMenuOpen(false); }} className="px-2 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs flex items-center gap-1"><Copy size={12} />Copy</button>
              <button onClick={() => { onPaste(); setIsToolsMenuOpen(false); }} className="px-2 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs flex items-center gap-1"><ClipboardPaste size={12} />Paste</button>
              <button onClick={() => { onDuplicate(); setIsToolsMenuOpen(false); }} className="px-2 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs flex items-center gap-1"><Copy size={12} className="text-yellow-500" />Duplicate</button>
              <button onClick={() => { undo(); setIsToolsMenuOpen(false); }} className="px-2 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs flex items-center gap-1"><Undo2 size={12} />Undo</button>
              <button onClick={() => { redo(); setIsToolsMenuOpen(false); }} className="px-2 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs flex items-center gap-1"><Redo2 size={12} />Redo</button>
            </div>

            <div className="text-[10px] uppercase tracking-wider text-cyber-muted">Layout / View</div>
            <div className="relative">
              <LayoutDropdown onLayout={onLayout} setIsToolsMenuOpen={setIsToolsMenuOpen} />
              <div className="inline-flex items-center gap-2 ml-2">
                <button onClick={() => { setShowMinimap((prev) => !prev); setIsToolsMenuOpen(false); }} className="px-2 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs flex items-center justify-center"><MapIcon size={12} /></button>
                <button onClick={() => { reactFlowInstance?.fitView({ duration: 800 }); setIsToolsMenuOpen(false); }} className="px-2 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs flex items-center justify-center"><Maximize size={12} /></button>
                <button onClick={() => { setIsLiveMode((prev) => !prev); setIsToolsMenuOpen(false); }} className="px-2 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs flex items-center justify-center"><Activity size={12} /></button>
              </div>
            </div>

            <div className="text-[10px] uppercase tracking-wider text-cyber-muted">Canvas / IO</div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => { onGroupNodes(); setIsToolsMenuOpen(false); }} className="px-2 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs flex items-center gap-1"><Layers size={12} />Group</button>
              <button onClick={() => { onUngroupNodes(); setIsToolsMenuOpen(false); }} className="px-2 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs flex items-center gap-1"><Ungroup size={12} />Ungroup</button>
              <button onClick={() => { onExport(); setIsToolsMenuOpen(false); }} className="px-2 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs flex items-center gap-1"><FileDown size={12} />Export</button>
              <button onClick={() => { importInputRef.current?.click(); setIsToolsMenuOpen(false); }} className="px-2 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs flex items-center gap-1"><Upload size={12} />Import</button>
              <button onClick={() => { onDownloadImage(); setIsToolsMenuOpen(false); }} className="px-2 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs flex items-center gap-1"><ImageIcon size={12} />Image</button>
              <button onClick={() => { onClear(); setIsToolsMenuOpen(false); }} className="px-2 py-1.5 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs flex items-center gap-1"><Trash2 size={12} />Clear</button>
              <button onClick={() => { onClear(); setIsToolsMenuOpen(false); }} className="px-2 py-1.5 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs flex items-center justify-center gap-1 col-span-2 border border-red-500/20"><Trash2 size={12} />Clear Canvas</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlowHeader;
