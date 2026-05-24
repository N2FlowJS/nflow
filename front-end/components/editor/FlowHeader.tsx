import React, { memo, useMemo } from "react";
import {
  Activity,
  AlertTriangle,
  Check,
  ClipboardPaste,
  Copy,
  DollarSign,
  FileDown,
  FolderOpen,
  History,
  Image as ImageIcon,
  Keyboard,
  Layers,
  LayoutGrid,
  Loader2,
  Map as MapIcon,
  Save,
  Terminal,
  Trash2,
  Undo2,
  Wand2,
  Zap,
} from "lucide-react";
import LayoutDropdown, { DropdownItem } from "./LayoutDropdown";
import { EditorContextProps } from "../../types/editor-ui";
import { CyberAction, CyberToolbar, CyberToolbarDivider, StatusIndicator } from "../shared/CyberUI";


const FlowHeader: React.FC<EditorContextProps> = memo((props) => {
  const {
    currentFlowName,
    setCurrentFlowName,
    isSaving,
    isAutoSaving,
    lastAutoSave,
    onSave,
    onRunAll,
    onValidateFlow,
    setIsFlowManagerOpen,
    setIsVariablesPanelOpen,
    setIsVersionHistoryOpen,
    setIsPlaygroundOpen,
    setShowShortcutHelp,
    onCopy,
    onPaste,
    undo,
    onLayout,
    onExport,
    onDownloadImage,
    onClear,
  } = props;

  // Determine save status for indicator
  const saveStatus = isSaving || isAutoSaving
    ? 'saving'
    : lastAutoSave
      ? 'saved'
      : 'unsaved';

  const handleAction = (id: string) => {
    switch (id) {
      case "FLOWS_LIBRARY": setIsFlowManagerOpen(true); break;
      case "VARIABLES": setIsVariablesPanelOpen(prev => !prev); break;
      case "HISTORY": setIsVersionHistoryOpen(prev => !prev); break;
      case "PLAYGROUND": setIsPlaygroundOpen(prev => !prev); break;
      case "CHECK_FLOW": onValidateFlow(true); break;
      case "SHORTCUTS": setShowShortcutHelp(true); break;
      case "COPY": onCopy(); break;
      case "PASTE": onPaste(); break;
      case "UNDO": undo(); break;
      case "EXPORT_JSON": onExport(); break;
      case "EXPORT_PNG": onDownloadImage(); break;
      case "CLEAR_CANVAS": onClear(); break;
      default: onLayout?.(id);
    }
  };

  const menuItems: DropdownItem[] = useMemo(() => [
    {
      id: "WORKSPACE",
      label: "Workspace",
      icon: Activity,
      children: [
        { id: "FLOWS_LIBRARY", label: "Flows", icon: FolderOpen },
        { id: "VARIABLES", label: "Variables", icon: DollarSign },
        { id: "HISTORY", label: "History", icon: History },
        { id: "PLAYGROUND", label: "Playground", icon: Terminal },
        { id: "SHORTCUTS", label: "Shortcuts", icon: Keyboard },
      ]
    },
    {
      id: "EDIT",
      label: "Edit",
      icon: Zap,
      children: [
        { id: "CHECK_FLOW", label: "Validate", icon: AlertTriangle },
        { id: "COPY", label: "Copy", icon: Copy },
        { id: "PASTE", label: "Paste", icon: ClipboardPaste },
        { id: "UNDO", label: "Undo", icon: Undo2 },
        { id: "CLEAR_CANVAS", label: "Clear canvas", icon: Trash2, tone: "danger" },
      ]
    },
    {
      id: "LAYOUT",
      label: "Layout",
      icon: LayoutGrid,
      children: [
        { id: "SMART", label: "Auto", icon: Wand2 },
        { id: "LAYERED", label: "Layered", icon: LayoutGrid },
        { id: "RADIAL", label: "Radial", icon: MapIcon },
        { id: "TREE", label: "Tree", icon: Layers },
      ]
    },
    {
      id: "EXPORTS",
      label: "Export",
      icon: FileDown,
      children: [
        { id: "EXPORT_JSON", label: "JSON", icon: FileDown },
        { id: "EXPORT_PNG", label: "Image", icon: ImageIcon },
      ]
    }
  ], []);

  return (
    <CyberToolbar className="fixed top-2 left-1/2 z-[100] -translate-x-1/2">
      <div className="flex items-center gap-2 px-3 py-1 border-r border-white/5 group">
        <StatusIndicator status="running" size={6} />
        <input
          value={currentFlowName}
          onChange={(e) => setCurrentFlowName(e.target.value)}
          className="bg-transparent border-none text-[9px] font-black uppercase tracking-[0.2em] text-white/40 focus:text-white focus:outline-none transition-all w-20 focus:w-32"
          placeholder="UNNAMED"
        />
        {/* Save status indicator */}
        <div
          title={
            saveStatus === 'saving' ? 'Saving…' :
            saveStatus === 'saved' ? `Saved ${lastAutoSave ? new Date(lastAutoSave).toLocaleTimeString() : ''}` :
            'Unsaved changes — will auto-save in 5s'
          }
          className="flex items-center transition-all duration-300"
        >
          {saveStatus === 'saving' ? (
            <Loader2 size={8} className="text-cyber-primary animate-spin" />
          ) : saveStatus === 'saved' ? (
            <Check size={8} className="text-green-400 opacity-60" />
          ) : (
            <span className="block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          )}
        </div>
      </div>

      <div className="flex items-center gap-0.5 pr-1">
        {menuItems.map((item) => (
          <LayoutDropdown
            key={item.id}
            triggerIcon={item.icon}
            items={item.children || []}
            onSelect={handleAction}
            title={item.label}
          />
        ))}

        <CyberToolbarDivider className="mx-0.5" />
        
        <CyberAction 
          icon={Save} 
          onClick={() => onSave(currentFlowName)} 
          disabled={isSaving}
          className={`h-7 w-7 border-none bg-transparent opacity-40 hover:opacity-100 ${isSaving ? "animate-pulse" : ""}`}
        />
        
        <CyberAction 
          icon={Zap} 
          onClick={onRunAll}
          className="h-7 w-7 !rounded-full bg-cyber-primary/10 text-cyber-primary border-none hover:bg-cyber-primary hover:text-black transition-all"
        />
      </div>
    </CyberToolbar>
  );
}); 
         

export default FlowHeader;
  