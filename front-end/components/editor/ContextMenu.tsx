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
import { CyberMenuItem, CyberMenuSurface } from '../shared/CyberUI';

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
  const openLeft = menuPos.left > window.innerWidth / 2;

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

  const handleMenuAction = (callback?: () => void, keepOpen = false) => (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    callback?.();
    if (!keepOpen) onClose();
  };

  return (
    <div
      ref={menuRef}
      style={{ top: menuPos.top, left: menuPos.left }}
      className="fixed z-[2000] min-w-[180px] animate-in fade-in zoom-in-95 duration-100"
      onContextMenu={(e) => e.preventDefault()}
    >
      <CyberMenuSurface>
        {node ? (
          <>
            <div className="px-3 py-1 mb-1 border-b border-white/5 opacity-20">
              <div className="text-[8px] uppercase font-black truncate tracking-[0.18em]">
                Node {node.id.slice(0, 8)}
              </div>
            </div>
            {!isGroup && <CyberMenuItem icon={Play} label="Run node" onClick={handleMenuAction(actions.onRun)} />}
            <CyberMenuItem icon={Maximize2} label="Focus" onClick={handleMenuAction(actions.onFocus)} />
            <CyberMenuItem icon={Settings} label="Settings" onClick={handleMenuAction(actions.onOpenConfig)} />
            
            <div className="h-px bg-white/5 my-1 mx-2" />
            
            {isGroup && <CyberMenuItem icon={Ungroup} label="Ungroup" onClick={handleMenuAction(actions.onUngroup)} />}
            <CyberMenuItem icon={Copy} label="Copy" onClick={handleMenuAction(actions.onCopy)} />
            <CyberMenuItem icon={Zap} label="Duplicate" onClick={handleMenuAction(actions.onDuplicate)} />
            
            <div className="h-px bg-white/5 my-1 mx-2" />
            <CyberMenuItem icon={Trash2} label="Delete" onClick={handleMenuAction(actions.onDelete)} danger />
          </>
        ) : (
          <>
            <CyberMenuItem icon={PlusCircle} label="Add node" onClick={handleMenuAction(() => actions.onAddNode?.({ x, y }))} />
            <CyberMenuItem icon={StickyNote} label="Add note" onClick={handleMenuAction(() => actions.onAddNote?.({ x, y }))} />
            <div className="h-px bg-white/5 my-1 mx-2" />
            <CyberMenuItem icon={Maximize2} label="Select all" onClick={handleMenuAction(actions.onSelectAll)} />
            <CyberMenuItem icon={ClipboardPaste} label="Paste" onClick={handleMenuAction(() => actions.onPaste?.({ x, y }))} />
            <div className="h-px bg-white/5 my-1 mx-2" />
            
            <div 
              className="relative"
              onMouseEnter={() => setShowLayoutSubmenu(true)}
              onMouseLeave={() => setShowLayoutSubmenu(false)}
            >
              <CyberMenuItem
                icon={Layout}
                label="Layout"
                onClick={(e) => e.stopPropagation()}
                active={showLayoutSubmenu}
              />
              {showLayoutSubmenu && (
                <CyberMenuSurface className={`absolute top-0 min-w-[160px] animate-in fade-in duration-150 ${
                  openLeft 
                    ? 'right-full mr-1 slide-in-from-right-2' 
                    : 'left-full ml-1 slide-in-from-left-2'
                }`}>
                  <CyberMenuItem icon={Layout} label="Layered" onClick={handleMenuAction(() => actions.onLayout?.("LAYERED"))} />
                  <CyberMenuItem icon={Layout} label="Radial" onClick={handleMenuAction(() => actions.onLayout?.("RADIAL"))} />
                  <CyberMenuItem icon={Layout} label="Tree" onClick={handleMenuAction(() => actions.onLayout?.("TREE"))} />
                </CyberMenuSurface>
              )}
            </div>
          </>
        )}
      </CyberMenuSurface>
    </div>
  );
};
               
export default ContextMenu;

