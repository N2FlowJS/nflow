import React, { useEffect, useRef } from 'react';
import { 
  Copy, 
  Trash2, 
  Play, 
  Settings, 
  Info,
  Layout,
  PlusCircle,
  Zap,ClipboardPaste,
  StickyNote,
  Ungroup
} from 'lucide-react';

export type ContextMenuProps = {
  x: number;
  y: number;
  node?: any;
  onClose: () => void;
  actions: {
    onRun?: () => void;
    onOpenConfig?: () => void;
    onOpenData?: () => void;
    onCopy?: () => void;
    onPaste?: (pos: { x: number, y: number }) => void;
    onDuplicate?: () => void;
    onDelete?: () => void;
    onLayout?: () => void;
    onAddNode?: (pos: { x: number, y: number }) => void;
    onAddNote?: (pos: { x: number, y: number }) => void;
    onUngroup?: () => void;
  };
};

const ContextMenu = ({ x, y, node, onClose, actions }: ContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Use capture to ensure it runs before React Flow internal handlers
    document.addEventListener('mousedown', handleClickOutside, true);
    return () => document.removeEventListener('mousedown', handleClickOutside, true);
  }, [onClose]);

  const MenuItem = ({ icon: Icon, label, onClick, danger = false, disabled = false }: any) => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) {
          onClick();
          onClose();
        }
      }}
      disabled={disabled}
      className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium transition-colors
        ${danger ? 'text-red-400 hover:bg-red-500/10' : 'text-gray-300 hover:bg-white/5'}
        ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <Icon size={14} className={danger ? 'text-red-500' : 'text-cyber-primary'} />
      <span className="flex-1 text-left">{label}</span>
    </button>
  );

  const isGroup = node?.type === 'cyberGroup';

  return (
    <div
      ref={menuRef}
      className="fixed z-[2000] min-w-[160px] bg-cyber-panel/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl py-1 overflow-hidden"
      style={{ top: y, left: x }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {node ? (
        <>
          <div className="px-3 py-1.5 border-b border-white/5 mb-1">
            <div className="text-[10px] text-gray-500 uppercase font-bold truncate">{node.data?.label || 'Node'}</div>
          </div>
          {!isGroup && <MenuItem icon={Play} label="Run Node" onClick={actions.onRun} />}
          <MenuItem icon={Settings} label="Settings" onClick={actions.onOpenConfig} />
          {!isGroup && <MenuItem icon={Info} label="Execution Data" onClick={actions.onOpenData} />}
          
          <div className="h-px bg-white/5 my-1" />
          
          {isGroup && (
            <MenuItem icon={Ungroup} label="Ungroup" onClick={actions.onUngroup} />
          )}
          
          <MenuItem icon={Copy} label="Copy" onClick={actions.onCopy} />
          <MenuItem icon={Zap} label="Duplicate" onClick={actions.onDuplicate} />
          
          <div className="h-px bg-white/5 my-1" />
          <MenuItem icon={Trash2} label="Delete" onClick={actions.onDelete} danger />
        </>
      ) : (
        <>
          <MenuItem icon={PlusCircle} label="Add Node" onClick={() => actions.onAddNode?.({ x, y })} />
          <MenuItem icon={StickyNote} label="Add Sticky Note" onClick={() => actions.onAddNote?.({ x, y })} />
          <div className="h-px bg-white/5 my-1" />
          <MenuItem icon={ClipboardPaste} label="Paste" onClick={() => actions.onPaste?.({ x, y })} />
          <div className="h-px bg-white/5 my-1" />
          <MenuItem icon={Layout} label="Auto Layout" onClick={actions.onLayout} />
        </>
      )}
    </div>
  );
};

export default ContextMenu;

