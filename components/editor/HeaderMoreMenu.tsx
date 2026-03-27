import React, { useEffect, useRef, useState } from 'react';
import {
  MoreHorizontal,
  FolderOpen,
  DollarSign,
  History,
  Terminal,
  AlertTriangle,
  Keyboard,
  Wand2,
  Copy,
  ClipboardPaste,
  Undo2,
  Redo2,
  Map as MapIcon,
  Maximize,
  Activity,
  Layers,
  Ungroup,
  FileDown,
  Upload,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react';
import LayoutDropdown from './LayoutDropdown';

type Props = {
  setIsFlowManagerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsVariablesPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsVersionHistoryOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsPlaygroundOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onValidateFlow: () => void;
  setShowShortcutHelp: React.Dispatch<React.SetStateAction<boolean>>;
  setShowCommandPalette: React.Dispatch<React.SetStateAction<boolean>>;
  onCopy: () => void;
  onPaste: () => void;
  onDuplicate: () => void;
  undo: () => void;
  redo: () => void;
  onLayout: (type: string) => void;
  setShowMinimap: React.Dispatch<React.SetStateAction<boolean>>;
  reactFlowInstance: any;
  setIsLiveMode: React.Dispatch<React.SetStateAction<boolean>>;
  isLiveMode: boolean;
  onGroupNodes: () => void;
  onUngroupNodes: () => void;
  onExport: () => void;
  importInputRef: React.RefObject<HTMLInputElement>;
  onDownloadImage: () => void;
  onClear: () => void;
  setIsToolsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const HeaderMoreMenu: React.FC<Props> = ({
  setIsFlowManagerOpen,
  setIsVariablesPanelOpen,
  setIsVersionHistoryOpen,
  setIsPlaygroundOpen,
  onValidateFlow,
  setShowShortcutHelp,
  setShowCommandPalette,
  onCopy,
  onPaste,
  onDuplicate,
  undo,
  redo,
  onLayout,
  setShowMinimap,
  reactFlowInstance,
  setIsLiveMode,
  isLiveMode,
  onGroupNodes,
  onUngroupNodes,
  onExport,
  importInputRef,
  onDownloadImage,
  onClear,
  setIsToolsMenuOpen,
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (open && rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside, true);
    return () => document.removeEventListener('mousedown', handleOutside, true);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={() => setOpen((s) => !s)}
        className={`p-2 rounded-lg border transition-colors bg-white/5 border-white/10 text-gray-300 hover:bg-white/10`}
        title="More"
      >
        <MoreHorizontal size={16} />
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-[300px] bg-cyber-panel/95 backdrop-blur-md border border-cyber-border rounded-xl shadow-2xl p-3 z-40 space-y-3">
          <div className="text-[10px] uppercase tracking-wider text-cyber-muted">General</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setIsFlowManagerOpen(true);
                setOpen(false);
              }}
              className="px-2 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs flex items-center gap-1"
            >
              <FolderOpen size={12} />
              Flows
            </button>
            <button
              onClick={() => {
                setIsVariablesPanelOpen((p) => !p);
                setOpen(false);
              }}
              className="px-2 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs flex items-center gap-1"
            >
              <DollarSign size={12} />
              Variables
            </button>
            <button
              onClick={() => {
                setIsVersionHistoryOpen((p) => !p);
                setOpen(false);
              }}
              className="px-2 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs flex items-center gap-1"
            >
              <History size={12} />
              History
            </button>
            <button
              onClick={() => {
                setIsPlaygroundOpen(true);
                setOpen(false);
              }}
              className="px-2 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs flex items-center gap-1"
            >
              <Terminal size={12} />
              Playground
            </button>
            <button
              onClick={() => {
                onValidateFlow();
                setOpen(false);
              }}
              className="px-2 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs flex items-center gap-1"
            >
              <AlertTriangle size={12} />
              Validate
            </button>
            <button
              onClick={() => {
                setShowShortcutHelp((p) => !p);
                setOpen(false);
              }}
              className="px-2 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs flex items-center gap-1"
            >
              <Keyboard size={12} />
              Shortcuts
            </button>
            <button
              onClick={() => {
                setShowCommandPalette(true);
                setOpen(false);
              }}
              className="px-2 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs flex items-center gap-1"
            >
              <Wand2 size={12} />
              Command Palette
            </button>
          </div>

          <div className="text-[10px] uppercase tracking-wider text-cyber-muted">Edit</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onCopy();
                setOpen(false);
              }}
              className="px-2 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs flex items-center gap-1"
            >
              <Copy size={12} />
              Copy
            </button>
            <button
              onClick={() => {
                onPaste();
                setOpen(false);
              }}
              className="px-2 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs flex items-center gap-1"
            >
              <ClipboardPaste size={12} />
              Paste
            </button>
            <button
              onClick={() => {
                onDuplicate();
                setOpen(false);
              }}
              className="px-2 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs flex items-center gap-1"
            >
              <Copy size={12} className="text-yellow-500" />
              Duplicate
            </button>
            <button
              onClick={() => {
                undo();
                setOpen(false);
              }}
              className="px-2 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs flex items-center gap-1"
            >
              <Undo2 size={12} />
              Undo
            </button>
            <button
              onClick={() => {
                redo();
                setOpen(false);
              }}
              className="px-2 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs flex items-center gap-1"
            >
              <Redo2 size={12} />
              Redo
            </button>
          </div>

          <div className="text-[10px] uppercase tracking-wider text-cyber-muted">Layout / View</div>
          <div className="relative">
            <LayoutDropdown onLayout={onLayout} setIsToolsMenuOpen={setIsToolsMenuOpen} />
            <div className="inline-flex items-center gap-2 ml-2 mt-2">
              <button
                onClick={() => {
                  setShowMinimap((p) => !p);
                  setOpen(false);
                }}
                className="px-2 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs flex items-center justify-center"
              >
                <MapIcon size={12} />
              </button>
              <button
                onClick={() => {
                  reactFlowInstance?.fitView({ duration: 800 });
                  setOpen(false);
                }}
                className="px-2 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs flex items-center justify-center"
              >
                <Maximize size={12} />
              </button>
              <button
                onClick={() => {
                  setIsLiveMode((p) => !p);
                  setOpen(false);
                }}
                className="px-2 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs flex items-center justify-center"
              >
                <Activity size={12} />
              </button>
            </div>
          </div>

          <div className="text-[10px] uppercase tracking-wider text-cyber-muted">Canvas / IO</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onGroupNodes();
                setOpen(false);
              }}
              className="px-2 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs flex items-center gap-1"
            >
              <Layers size={12} />
              Group
            </button>
            <button
              onClick={() => {
                onUngroupNodes();
                setOpen(false);
              }}
              className="px-2 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs flex items-center gap-1"
            >
              <Ungroup size={12} />
              Ungroup
            </button>
            <button
              onClick={() => {
                onExport();
                setOpen(false);
              }}
              className="px-2 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs flex items-center gap-1"
            >
              <FileDown size={12} />
              Export
            </button>
            <button
              onClick={() => {
                importInputRef.current?.click();
                setOpen(false);
              }}
              className="px-2 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs flex items-center gap-1"
            >
              <Upload size={12} />
              Import
            </button>
            <button
              onClick={() => {
                onDownloadImage();
                setOpen(false);
              }}
              className="px-2 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs flex items-center gap-1"
            >
              <ImageIcon size={12} />
              Image
            </button>
            <button
              onClick={() => {
                onClear();
                setOpen(false);
              }}
              className="px-2 py-1.5 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs flex items-center gap-1"
            >
              <Trash2 size={12} />
              Clear
            </button>
            <button
              onClick={() => {
                onClear();
                setOpen(false);
              }}
              className="px-2 py-1.5 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs flex items-center justify-center gap-1 col-span-2 border border-red-500/20"
            >
              <Trash2 size={12} />
              Clear Canvas
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderMoreMenu;
