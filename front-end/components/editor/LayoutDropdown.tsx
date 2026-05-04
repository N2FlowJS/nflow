import React, { useState, useRef, useEffect } from "react";
import {
  Wand2,
  Zap,
  LayoutGrid,
  Map as MapIcon,
  Layers,
  ArrowRight,
  ArrowDown,
} from "lucide-react";

type Props = {
  onLayout: (type: string) => void;
  setIsToolsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const LayoutDropdown: React.FC<Props> = ({ onLayout, setIsToolsMenuOpen }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handle, true);
    return () => document.removeEventListener("mousedown", handle, true);
  }, []);

  const click = (mode: string) => {
    onLayout(mode);
    setOpen(false);
    setIsToolsMenuOpen(false);
  };

  return (
    <div ref={ref} className="inline-block relative">
      <button
        onClick={() => setOpen((s) => !s)}
        className="px-2 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs flex items-center justify-center"
        title="Layout options"
      >
        <LayoutGrid size={12} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[340px] bg-cyber-panel/95 backdrop-blur-md border border-cyber-border rounded-xl shadow-2xl p-3 z-40">
          <div className="grid grid-cols-4 gap-2">
            <button onClick={() => click("SMART")} className="px-2 py-2 rounded-md bg-white/5 hover:bg-white/10 text-xs flex flex-col items-center gap-1">
              <Wand2 size={14} />
              <span className="text-[10px]">Smart</span>
            </button>
            <button onClick={() => click("SMART_FORCE")} className="px-2 py-2 rounded-md bg-white/5 hover:bg-white/10 text-xs flex flex-col items-center gap-1">
              <Zap size={14} />
              <span className="text-[10px]">Force</span>
            </button>
            <button onClick={() => click("LAYERED")} className="px-2 py-2 rounded-md bg-white/5 hover:bg-white/10 text-xs flex flex-col items-center gap-1">
              <LayoutGrid size={14} />
              <span className="text-[10px]">Layered</span>
            </button>
            <button onClick={() => click("RADIAL")} className="px-2 py-2 rounded-md bg-white/5 hover:bg-white/10 text-xs flex flex-col items-center gap-1">
              <MapIcon size={14} />
              <span className="text-[10px]">Radial</span>
            </button>

            <button onClick={() => click("ORTHOGONAL")} className="px-2 py-2 rounded-md bg-white/5 hover:bg-white/10 text-xs flex flex-col items-center gap-1">
              <ArrowRight size={14} />
              <span className="text-[10px]">Orthogonal</span>
            </button>
            <button onClick={() => click("TREE")} className="px-2 py-2 rounded-md bg-white/5 hover:bg-white/10 text-xs flex flex-col items-center gap-1">
              <Layers size={14} />
              <span className="text-[10px]">Tree</span>
            </button>
            <button onClick={() => click("DAGRE_LR")} className="px-2 py-2 rounded-md bg-white/5 hover:bg-white/10 text-xs flex flex-col items-center gap-1">
              <ArrowRight size={14} />
              <span className="text-[10px]">Dagre LR</span>
            </button>
            <button onClick={() => click("DAGRE_TB")} className="px-2 py-2 rounded-md bg-white/5 hover:bg-white/10 text-xs flex flex-col items-center gap-1">
              <ArrowDown size={14} />
              <span className="text-[10px]">Dagre TB</span>
            </button>
            <button onClick={() => click("DAGRE_RL")} className="px-2 py-2 rounded-md bg-white/5 hover:bg-white/10 text-xs flex flex-col items-center gap-1">
              <ArrowRight size={14} style={{ transform: "rotate(180deg)" }} />
              <span className="text-[10px]">Dagre RL</span>
            </button>
            <button onClick={() => click("DAGRE_BT")} className="px-2 py-2 rounded-md bg-white/5 hover:bg-white/10 text-xs flex flex-col items-center gap-1">
              <ArrowDown size={14} style={{ transform: "rotate(180deg)" }} />
              <span className="text-[10px]">Dagre BT</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LayoutDropdown;
