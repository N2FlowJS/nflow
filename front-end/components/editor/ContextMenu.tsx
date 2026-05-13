import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import type { Node as FlowNode } from '@xyflow/react';
import { 
  Copy, 
  Trash2, 
  Play, 
  Settings, 
  Info,
  Layout,
  PlusCircle,
  Zap,
  ClipboardPaste,
  StickyNote,
  Ungroup,
  Maximize2
} from 'lucide-react';
import { Button } from '../ui';

export type ContextMenuProps = {
  x: number;
  y: number;
  node?: FlowNode;
  onClose: () => void;
  actions: {
    onRun?: () => void;
    onFocus?: () => void;
    onOpenConfig?: () => void;
    onOpenData?: () => void;
    onCopy?: () => void;
    onPaste?: (pos: { x: number, y: number }) => void;
    onDuplicate?: () => void;
    onDelete?: () => void;
    onLayout?: (type?: string) => void;
    onAddNode?: (pos: { x: number, y: number }) => void;
    onAddNote?: (pos: { x: number, y: number }) => void;
    onUngroup?: () => void;
    onSelectAll?: () => void;
  };
};

const ContextMenu = ({ x, y, node, onClose, actions }: ContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState<{ left: number; top: number }>({ left: x, top: y });

  const isGroup = node?.type === 'cyberGroup';
  const [showLayoutSubmenu, setShowLayoutSubmenu] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const submenuRef = useRef<HTMLDivElement | null>(null);
  const hoverTimeoutRef = useRef<number | null>(null);
  const [submenuFlipLeft, setSubmenuFlipLeft] = useState(false);
  const [submenuTopOffset, setSubmenuTopOffset] = useState(0);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as globalThis.Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside, true);
    return () => document.removeEventListener('mousedown', handleClickOutside, true);
  }, [onClose]);

  useLayoutEffect(() => {
    const MARGIN = 8;
    const menuEl = menuRef.current;
    if (!menuEl) return;

    const rect = menuEl.getBoundingClientRect();
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    let left = x;
    let top = y;

    if (left + rect.width + MARGIN > viewportW) left = viewportW - rect.width - MARGIN;
    if (top + rect.height + MARGIN > viewportH) top = viewportH - rect.height - MARGIN;

    setMenuPos({ left: Math.max(MARGIN, left), top: Math.max(MARGIN, top) });
  }, [x, y]);

  const MenuItem = ({ icon: Icon, label, onClick, danger = false, disabled = false, noClose = false }: any) => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) {
          onClick();
          if (!noClose) onClose();
        }
      }}
      disabled={disabled}
      className={`w-full flex items-center gap-2.5 px-3 py-2 transition-all group/item ${
        danger 
          ? "hover:bg-red-500/10 text-red-500/60 hover:text-red-500" 
          : "hover:bg-cyber-primary/10 text-white/40 hover:text-cyber-primary"
      } ${disabled ? "opacity-20 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <Icon size={14} className="group-hover/item:scale-110 transition-transform" />
      <span className="flex-1 text-left text-[11px] font-black uppercase tracking-wider">{label}</span>
    </button>
  );

  return (
    <div
      ref={menuRef}
      className="fixed z-[2000] min-w-[180px] bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] py-1.5 animate-in fade-in zoom-in-95 duration-100"
      style={{ top: menuPos.top, left: menuPos.left }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {node ? (
        <>
          <div className="px-3 py-1 mb-1 border-b border-white/5 opacity-20">
            <div className="text-[8px] uppercase font-black truncate tracking-[0.2em] italic">
              Node_Ref_{node.id.slice(0, 8)}
            </div>
          </div>
          {!isGroup && <MenuItem icon={Play} label="Execute_Sequence" onClick={actions.onRun} />}
          <MenuItem icon={Maximize2} label="Focus_Target" onClick={actions.onFocus} />
          <MenuItem icon={Settings} label="Configure_IO" onClick={actions.onOpenConfig} />
          
          <div className="h-px bg-white/5 my-1 mx-2" />
          
          {isGroup && <MenuItem icon={Ungroup} label="Decluster_Group" onClick={actions.onUngroup} />}
          <MenuItem icon={Copy} label="Clone_Data" onClick={actions.onCopy} />
          <MenuItem icon={Zap} label="Replicate" onClick={actions.onDuplicate} />
          
          <div className="h-px bg-white/5 my-1 mx-2" />
          <MenuItem icon={Trash2} label="Purge_Object" onClick={actions.onDelete} danger />
        </>
      ) : (
        <>
          <MenuItem icon={PlusCircle} label="Inject_Node" onClick={() => actions.onAddNode?.({ x, y })} />
          <MenuItem icon={StickyNote} label="Add_Data_Note" onClick={() => actions.onAddNote?.({ x, y })} />
          <div className="h-px bg-white/5 my-1 mx-2" />
          <MenuItem icon={Maximize2} label="Select_All_Units" onClick={actions.onSelectAll} />
          <MenuItem icon={ClipboardPaste} label="Paste_Buffer" onClick={() => actions.onPaste?.({ x, y })} />
          <div className="h-px bg-white/5 my-1 mx-2" />
          
          <div 
            className="relative"
            onMouseEnter={() => setShowLayoutSubmenu(true)}
            onMouseLeave={() => setShowLayoutSubmenu(false)}
          >
            <MenuItem icon={Layout} label="Auto_Layout" onClick={() => {}} noClose />
            {showLayoutSubmenu && (
              <div className="absolute left-full top-0 ml-1 min-w-[160px] bg-black/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-1 animate-in fade-in slide-in-from-left-2 duration-150">
                <MenuItem icon={Layout} label="Layered" onClick={() => actions.onLayout?.("LAYERED")} />
                <MenuItem icon={Layout} label="Radial" onClick={() => actions.onLayout?.("RADIAL")} />
                <MenuItem icon={Layout} label="Tree" onClick={() => actions.onLayout?.("TREE")} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
               
export default ContextMenu;

