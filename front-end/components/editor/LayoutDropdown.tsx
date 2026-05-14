import React, { useEffect, useRef, useState } from "react";
import { LucideIcon } from "lucide-react";
import { CyberAction, CyberIconTile, CyberPanel } from "../shared/CyberUI";

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
  columns?: 1 | 2 | 3 | 4;
};

const LayoutDropdown: React.FC<Props> = ({
  items,
  onSelect,
  triggerLabel,
  triggerIcon,
  onCloseParent,
  title,
  columns = 3,
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

  const gridColumnClass = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  }[columns];

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
          <CyberPanel
            title={title || "MENU"}
            className="min-w-[400px] shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
            actions={
              activeSubMenu ? (
                <CyberAction
                  onClick={() => setActiveSubMenu(null)}
                  label="Back"
                  showLabel
                  className="h-5 px-1.5 border-none bg-transparent text-[8px] opacity-60 hover:opacity-100"
                />
              ) : undefined
            }
          >
            <div className={`grid gap-1 p-2 ${gridColumnClass}`}>
              {(activeSubMenu ? activeSubMenu.children! : items).map((item) => {
                return (
                  <CyberIconTile
                    key={item.id}
                    icon={item.icon}
                    label={item.label}
                    onClick={() => handleItemClick(item)}
                    colorClass={item.colorClass || "text-white/60"}
                    indicator={item.children ? <div className="h-1 w-1 rounded-full bg-cyber-primary animate-pulse" /> : undefined}
                  />
                );
              })}
            </div>
          </CyberPanel>
        </div>
      )}
    </div>
  );
};

export default LayoutDropdown;
