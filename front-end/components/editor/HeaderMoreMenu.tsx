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
import { Button } from '../ui';

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
      <Button
        variant="outline"
        onClick={() => setOpen((s) => !s)}
        className="h-9 w-9 p-0"
        title="More"
      >
        <MoreHorizontal size={16} />
      </Button>

      {open && (
        <div className="absolute right-0 top-12 w-[300px] bg-cyber-panel/95 backdrop-blur-md border border-cyber-border rounded-xl shadow-2xl p-3 z-40 space-y-3">
          <div className="text-[10px] uppercase tracking-wider text-cyber-muted font-bold px-1">General</div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsFlowManagerOpen(true);
                setOpen(false);
              }}
              className="justify-start px-2 py-2"
            >
              <FolderOpen size={12} className="text-cyber-primary" />
              Flows
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsVariablesPanelOpen((p) => !p);
                setOpen(false);
              }}
              className="justify-start px-2 py-2"
            >
              <DollarSign size={12} className="text-cyber-primary" />
              Variables
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsVersionHistoryOpen((p) => !p);
                setOpen(false);
              }}
              className="justify-start px-2 py-2"
            >
              <History size={12} className="text-cyber-primary" />
              History
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsPlaygroundOpen(true);
                setOpen(false);
              }}
              className="justify-start px-2 py-2"
            >
              <Terminal size={12} className="text-cyber-primary" />
              Playground
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onValidateFlow();
                setOpen(false);
              }}
              className="justify-start px-2 py-2"
            >
              <AlertTriangle size={12} className="text-orange-400" />
              Check
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowShortcutHelp((p) => !p);
                setOpen(false);
              }}
              className="justify-start px-2 py-2"
            >
              <Keyboard size={12} className="text-cyber-primary" />
              Keys
            </Button>
          </div>

          <div className="text-[10px] uppercase tracking-wider text-cyber-muted font-bold px-1">Editor Actions</div>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onCopy();
                setOpen(false);
              }}
              className="px-2 h-8"
              title="Copy"
            >
              <Copy size={12} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onPaste();
                setOpen(false);
              }}
              className="px-2 h-8"
              title="Paste"
            >
              <ClipboardPaste size={12} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onDuplicate();
                setOpen(false);
              }}
              className="px-2 h-8"
              title="Duplicate"
            >
              <Copy size={12} className="rotate-90 text-yellow-500" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                undo();
                setOpen(false);
              }}
              className="px-2 h-8"
              title="Undo"
            >
              <Undo2 size={12} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                redo();
                setOpen(false);
              }}
              className="px-2 h-8"
              title="Redo"
            >
              <Redo2 size={12} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowCommandPalette(true);
                setOpen(false);
              }}
              className="px-2 h-8"
              title="Commands"
            >
              <Wand2 size={12} className="text-purple-400" />
            </Button>
          </div>

          <div className="text-[10px] uppercase tracking-wider text-cyber-muted font-bold px-1">View & IO</div>
          <div className="relative space-y-2">
            <LayoutDropdown onLayout={onLayout} setIsToolsMenuOpen={() => setOpen(false)} />
            
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowMinimap((p) => !p);
                  setOpen(false);
                }}
                className="px-2 h-8"
                title="MiniMap"
              >
                <MapIcon size={12} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  reactFlowInstance?.fitView({ duration: 800 });
                  setOpen(false);
                }}
                className="px-2 h-8"
                title="Fit View"
              >
                <Maximize size={12} />
              </Button>
              <Button
                variant={isLiveMode ? "primary" : "outline"}
                size="sm"
                onClick={() => {
                  setIsLiveMode((p) => !p);
                  setOpen(false);
                }}
                className="px-2 h-8"
                title="Live Mode"
              >
                <Activity size={12} />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onGroupNodes();
                  setOpen(false);
                }}
                className="justify-start px-2"
              >
                <Layers size={12} />
                Group
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onUngroupNodes();
                  setOpen(false);
                }}
                className="justify-start px-2"
              >
                <Ungroup size={12} />
                Ungroup
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onExport();
                  setOpen(false);
                }}
                className="justify-start px-2"
              >
                <FileDown size={12} />
                JSON
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  importInputRef.current?.click();
                  setOpen(false);
                }}
                className="justify-start px-2"
              >
                <Upload size={12} />
                Import
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onDownloadImage();
                  setOpen(false);
                }}
                className="justify-start px-2"
              >
                <ImageIcon size={12} />
                Image
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  if (confirm("Reset canvas?")) onClear();
                  setOpen(false);
                }}
                className="justify-start px-2"
              >
                <Trash2 size={12} />
                Reset
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderMoreMenu;
