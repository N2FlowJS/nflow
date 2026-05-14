import React, { useEffect, useRef, useState } from "react";
import { ChevronRight, LucideIcon } from "lucide-react";
import { CyberAction, CyberMenuItem, CyberMenuSurface } from "../shared/CyberUI";

export interface DropdownItem {
  id: string;
  label: string;
  icon: LucideIcon;
  tone?: "default" | "danger";
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
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
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
      setActiveSubMenu((current) => (current === item.id ? null : item.id));
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
        label={triggerLabel || title}
        showLabel={false}
        onClick={() => {
          setOpen((current) => !current);
          setActiveSubMenu(null);
        }}
        active={open}
        className="h-7 w-7 justify-center border-none bg-transparent opacity-50 hover:opacity-100"
      />

      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-[100] animate-in fade-in zoom-in-95 duration-150 origin-top">
          <CyberMenuSurface className="min-w-[180px] p-1">
            {items.map((item) => {
              const hasChildren = Boolean(item.children?.length);
              const isSubMenuOpen = activeSubMenu === item.id;

              return (
                <div
                  key={item.id}
                  className="relative"
                  onMouseEnter={() => hasChildren && setActiveSubMenu(item.id)}
                  onMouseLeave={() => hasChildren && setActiveSubMenu((current) => (current === item.id ? null : current))}
                >
                  <CyberMenuItem
                    icon={item.icon}
                    label={item.label}
                    onClick={() => handleItemClick(item)}
                    danger={item.tone === "danger"}
                    active={isSubMenuOpen}
                    trailing={hasChildren ? <ChevronRight size={12} className="opacity-50" /> : undefined}
                  />

                  {hasChildren && isSubMenuOpen && (
                    <CyberMenuSurface className="absolute left-full top-0 ml-1 min-w-[180px] p-1 animate-in fade-in slide-in-from-left-2 duration-150">
                      {item.children!.map((child) => (
                        <CyberMenuItem
                          key={child.id}
                          icon={child.icon}
                          label={child.label}
                          onClick={() => handleItemClick(child)}
                          danger={child.tone === "danger"}
                        />
                      ))}
                    </CyberMenuSurface>
                  )}
                </div>
              );
            })}
          </CyberMenuSurface>
        </div>
      )}
    </div>
  );
};

export default LayoutDropdown;
