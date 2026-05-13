import React, { useEffect, useRef, useState } from "react";
import { LucideIcon } from "lucide-react";
import { CyberAction } from "../shared/CyberUI";

export interface DropdownItem {
  id: string;
  label: string;
  icon: LucideIcon;
  colorClass?: string;
  children?: DropdownItem[];
}

type Props = {
  items: DropdownItem[];
  onSelect: (id: string) => void;
  triggerLabel?: string;
  triggerIcon: LucideIcon;
  onCloseParent?: () => void;
  title?: string;
};

const LayoutDropdown: React.FC<Props> = ({
  items,
  onSelect,
  triggerLabel,
  triggerIcon,
  onCloseParent,
  title,
}) => {
  const [open, setOpen] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState<DropdownItem | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setActiveSubMenu(null);
      }
    };
    document.addEventListener("mousedown", handle, true);
    return () => document.removeEventListener("mousedown", handle, true);
  }, []);

  const handleItemClick = (item: DropdownItem) => {
    if (item.children && item.children.length > 0) {
      setActiveSubMenu(item);
    } else {
      onSelect(item.id);
      setOpen(false);
      setActiveSubMenu(null);
      if (onCloseParent) onCloseParent();
    }
  };

  return (
    <div className="relative inline-block" ref={ref}>
      <CyberAction
        icon={triggerIcon}
        label={triggerLabel}
        showLabel={false}
        onClick={() => setOpen(!open)}
        active={open}
        className="h-7 w-7 justify-center border-none bg-transparent opacity-50 hover:opacity-100"
      />

      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-[100] animate-in fade-in zoom-in-95 duration-150 origin-top">
          <div className="min-w-[400px] bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden">
            {title && (
              <div className="px-3 py-2 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{title}</span>
                {activeSubMenu && (
                  <button 
                    onClick={() => setActiveSubMenu(null)}
                    className="text-[8px] font-black uppercase text-cyber-primary/70 hover:text-cyber-primary transition-colors"
                  >
                    Back
                  </button>
                )}
              </div>
            )}
            
            <div className="p-2 grid grid-cols-3 gap-1">
              {(activeSubMenu ? activeSubMenu.children! : items).map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={`flex flex-col items-center justify-center p-3 gap-2 rounded-lg transition-all group hover:bg-cyber-primary/10 border border-transparent hover:border-cyber-primary/20 ${item.colorClass || 'text-white/60'}`}
                  >
                    <div className="p-2 rounded-lg bg-black/40 border border-white/5 group-hover:border-cyber-primary/40 group-hover:text-cyber-primary transition-all shadow-inner">
                      <Icon size={18} />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-wider group-hover:text-cyber-primary transition-colors text-center leading-tight">
                      {item.label}
                    </span>
                    {item.children && (
                      <div className="absolute top-1.5 right-1.5">
                        <div className="w-1 h-1 rounded-full bg-cyber-primary animate-pulse" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LayoutDropdown;
