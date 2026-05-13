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

  // submenu state and refs (declared early to be available for layout/effects)
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
    // Use capture to ensure it runs before React Flow internal handlers
    document.addEventListener('mousedown', handleClickOutside, true);
    return () => document.removeEventListener('mousedown', handleClickOutside, true);
  }, [onClose]);

  // Ensure the context menu is positioned fully inside the viewport.
  useLayoutEffect(() => {
    const MARGIN = 8;
    const menuEl = menuRef.current;
    const viewportW = typeof window !== 'undefined' ? window.innerWidth : 0;
    const viewportH = typeof window !== 'undefined' ? window.innerHeight : 0;
    if (!menuEl) {
      setMenuPos({ left: Math.max(MARGIN, x), top: Math.max(MARGIN, y) });
      return;
    }

    // Measure after render to get accurate size (submenu may change layout)
    const rect = menuEl.getBoundingClientRect();
    let left = x;
    let top = y;

    // If menu would overflow right edge, shift left
    if (left + rect.width + MARGIN > viewportW) {
      left = Math.max(MARGIN, viewportW - rect.width - MARGIN);
    }

    // If menu would overflow bottom edge, shift up
    if (top + rect.height + MARGIN > viewportH) {
      top = Math.max(MARGIN, viewportH - rect.height - MARGIN);
    }

    // Ensure not off-screen on left/top
    left = Math.max(MARGIN, left);
    top = Math.max(MARGIN, top);

    setMenuPos({ left, top });
  }, [x, y, showLayoutSubmenu]);

  const MenuItem = ({ icon: Icon, label, onClick, danger = false, disabled = false, title, noClose = false }: any) => (
    <Button
      variant={danger ? "danger" : "ghost"}
      size="sm"
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) {
          onClick();
          if (!noClose) onClose();
        }
      }}
      disabled={disabled}
      title={title}
      className="w-full justify-start rounded-none px-3 py-2 bg-transparent border-none font-medium text-gray-300 hover:bg-white/5"
    >
      <Icon size={14} className={danger ? 'text-red-500' : 'text-cyber-primary'} />
      <span className="flex-1 text-left">{label}</span>
    </Button>
  );


  useEffect(() => {
    if (!showLayoutSubmenu) return;
    const compute = () => {
      try {
        const wrapper = wrapperRef.current;
        const submenuEl = submenuRef.current;
        const margin = 12;
        if (!wrapper) {
          setSubmenuFlipLeft(false);
          setSubmenuTopOffset(0);
          return;
        }

        const wRect = wrapper.getBoundingClientRect();
        const viewportW = (window?.innerWidth) || 0;
        const viewportH = (window?.innerHeight) || 0;

        const submenuRect = submenuEl ? submenuEl.getBoundingClientRect() : { width: 220, height: 200 };
        const submenuWidth = submenuRect.width;
        const submenuHeight = submenuRect.height;

        // horizontal flip decision
        if (wRect.right + submenuWidth + margin > viewportW) setSubmenuFlipLeft(true);
        else setSubmenuFlipLeft(false);

        // vertical positioning: compute top offset (relative to wrapper top)
        const defaultTop = 0; // align top by default
        const minTop = margin - wRect.top; // minimal top so submenu top >= margin
        const maxTop = viewportH - margin - submenuHeight - wRect.top; // maximal top so submenu bottom <= viewportH - margin
        let topOffset = Math.max(minTop, Math.min(defaultTop, maxTop));

        // If submenu taller than viewport, clamp so top at margin
        if (submenuHeight + 2 * margin > viewportH) {
          topOffset = Math.max(minTop, viewportH * 0.5 - wRect.top - submenuHeight / 2);
        }

        setSubmenuTopOffset(Math.round(topOffset));
      } catch (err) {
        setSubmenuFlipLeft(false);
        setSubmenuTopOffset(0);
      }
    };
    compute();
    window.addEventListener('resize', compute);
    window.addEventListener('scroll', compute, true);
    return () => {
      window.removeEventListener('resize', compute);
      window.removeEventListener('scroll', compute, true);
    };
  }, [showLayoutSubmenu]);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        window.clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={menuRef}
      className="fixed z-[2000] min-w-[160px] bg-cyber-panel/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl py-1 overflow-visible"
      style={{ top: menuPos.top, left: menuPos.left }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {node ? (
        <>
          <div className="px-3 py-1.5 border-b border-white/5 mb-1">
            <div className="text-[10px] text-gray-500 uppercase font-bold truncate">{String(node.data?.label || 'Node')}</div>
          </div>
          {!isGroup && <MenuItem icon={Play} label="Run Node" onClick={actions.onRun} />}
          <MenuItem icon={Maximize2} label="Focus Node" onClick={actions.onFocus} />
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
          <MenuItem icon={Maximize2} label="Select All" onClick={actions.onSelectAll} />
          <div className="h-px bg-white/5 my-1" />
          <MenuItem icon={ClipboardPaste} label="Paste" onClick={() => actions.onPaste?.({ x, y })} />
          <div className="h-px bg-white/5 my-1" />
          {/* Layout submenu: open on hover, small delay on close, flip left if near viewport right edge */}
          <div className="relative">
            {/* wrapperRef and hover timeout handling */}
            <div
              ref={(el) => { wrapperRef.current = el; }}
              className="relative"
              onMouseEnter={() => {
                if (hoverTimeoutRef.current) {
                  window.clearTimeout(hoverTimeoutRef.current);
                  hoverTimeoutRef.current = null;
                }
                setShowLayoutSubmenu(true);
              }}
              onMouseLeave={() => {
                // small delay before closing to avoid flicker when moving mouse quickly
                if (hoverTimeoutRef.current) window.clearTimeout(hoverTimeoutRef.current);
                hoverTimeoutRef.current = window.setTimeout(() => {
                  setShowLayoutSubmenu(false);
                  hoverTimeoutRef.current = null;
                }, 160);
              }}
            >
              <MenuItem icon={Layout} label="Layout" onClick={() => setShowLayoutSubmenu((s) => !s)} noClose title={"Layout options"} />
              {showLayoutSubmenu && (
                <div
                  ref={submenuRef}
                  className={submenuFlipLeft ? "absolute right-full top-0 mr-2 min-w-[200px] bg-cyber-panel/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl py-1 overflow-visible" : "absolute left-full top-0 ml-2 min-w-[200px] bg-cyber-panel/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl py-1 overflow-visible"}
                  style={{ top: `${submenuTopOffset}px` }}
                >
                  <MenuItem icon={Layout} label="Layered (ELK)" onClick={() => actions.onLayout?.("LAYERED")} />
                  <MenuItem icon={Layout} label="Force-directed" onClick={() => actions.onLayout?.("FORCE")} />
                  <MenuItem icon={Layout} label="Radial" onClick={() => actions.onLayout?.("RADIAL")} />
                  <MenuItem icon={Layout} label="Orthogonal / Box" onClick={() => actions.onLayout?.("ORTHOGONAL")} />
                  <MenuItem icon={Layout} label="Tree" onClick={() => actions.onLayout?.("TREE")} />
                  <div className="h-px bg-white/5 my-1" />
                  <MenuItem icon={Layout} label="Dagre: Left → Right" onClick={() => actions.onLayout?.("DAGRE_LR")} />
                  <MenuItem icon={Layout} label="Dagre: Top → Bottom" onClick={() => actions.onLayout?.("DAGRE_TB")} />
                  <MenuItem icon={Layout} label="Dagre: Right → Left" onClick={() => actions.onLayout?.("DAGRE_RL")} />
                  <MenuItem icon={Layout} label="Dagre: Bottom → Top" onClick={() => actions.onLayout?.("DAGRE_BT")} />
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ContextMenu;

