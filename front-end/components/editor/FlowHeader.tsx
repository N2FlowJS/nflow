import React, { memo, useMemo } from "react";
import {
  Activity,
  AlertTriangle,
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
import { CyberAction } from "../shared/CyberUI";


const FlowHeader: React.FC<EditorContextProps> = memo((props) => {
  const {
    currentFlowName,
    setCurrentFlowName,
    isSaving,
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

  const handleAction = (id: string) => {
    switch (id) {
      case "FLOWS_LIBRARY": setIsFlowManagerOpen(true); break;
      case "VARIABLES": setIsVariablesPanelOpen(prev => !prev); break;
      case "HISTORY": setIsVersionHistoryOpen(prev => !prev); break;
      case "PLAYGROUND": setIsPlaygroundOpen(prev => !prev); break;
      case "CHECK_FLOW": onValidateFlow(); break;
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
      id: "SYSTEM_NODES",
      label: "System",
      icon: Activity,
      children: [
        { id: "FLOWS_LIBRARY", label: "Library", icon: FolderOpen },
        { id: "VARIABLES", label: "Heap", icon: DollarSign },
        { id: "HISTORY", label: "Temporal", icon: History },
        { id: "PLAYGROUND", label: "Terminal", icon: Terminal },
        { id: "SHORTCUTS", label: "Shortcuts", icon: Keyboard },
      ]
    },
    {
      id: "OPERATIONS",
      label: "Ops",
      icon: Zap,
      children: [
        { id: "CHECK_FLOW", label: "Validate", icon: AlertTriangle, colorClass: "text-orange-400" },
        { id: "COPY", label: "Clone", icon: Copy },
        { id: "PASTE", label: "Inject", icon: ClipboardPaste },
        { id: "UNDO", label: "Revert", icon: Undo2 },
        { id: "CLEAR_CANVAS", label: "Purge All", icon: Trash2, colorClass: "text-red-400" },
      ]
    },
    {
      id: "LAYOUT_ENGINES",
      label: "Layout",
      icon: LayoutGrid,
      children: [
        { id: "SMART", label: "Smart", icon: Wand2 },
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
    <div className="fixed top-2 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-1 p-1 bg-black/40 backdrop-blur-md border border-white/5 rounded-full shadow-2xl">
      {/* Brand / Status */}
      <div className="flex items-center gap-2 px-3 py-1 border-r border-white/5 group">
        <div className="w-1.5 h-1.5 rounded-full bg-cyber-primary animate-pulse shadow-[0_0_8px_rgba(0,240,255,0.4)]" />
        <input
          value={currentFlowName}
          onChange={(e) => setCurrentFlowName(e.target.value)}
          className="bg-transparent border-none text-[9px] font-black uppercase tracking-[0.2em] text-white/40 focus:text-white focus:outline-none transition-all w-20 focus:w-32"
          placeholder="UNNAMED"
        />
      </div>

      <div className="flex items-center gap-0.5 pr-1">
        {menuItems.map((item) => (
          <LayoutDropdown
            key={item.id}
            triggerIcon={item.icon}
            items={item.children || []}
            onSelect={handleAction}
            title={item.label.toUpperCase()}
          />
        ))}

        <div className="w-px h-4 bg-white/5 mx-0.5" />
        
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
    </div>
  );
}); 
         

export default FlowHeader;
  