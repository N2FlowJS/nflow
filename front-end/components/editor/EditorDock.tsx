import React from "react";
import { LucideIcon } from "lucide-react";

export type EditorDockTab = {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
};

interface EditorDockProps {
  tabs: EditorDockTab[];
  activeTab: string | null;
  onTabChange: (tabId: string | null) => void;
  children: React.ReactNode;
}

const EditorDock: React.FC<EditorDockProps> = ({
  tabs,
  activeTab,
  onTabChange,
  children,
}) => {
  return (
    <div className="fixed top-0 right-0 bottom-0 z-[70] flex pointer-events-none">
      <div className="pointer-events-auto absolute left-0 top-4 -translate-x-full flex flex-col gap-1.5 pr-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              title={tab.label}
              className={`group flex min-h-11 w-12 flex-col items-center justify-center gap-1 rounded-l-xl border border-r-0 px-1.5 py-2 transition-all ${
                isActive
                  ? "border-cyber-primary/30 bg-black text-cyber-primary shadow-[0_0_18px_rgba(0,240,255,0.15)]"
                  : "border-white/10 bg-black/75 text-white/35 hover:border-cyber-primary/20 hover:text-cyber-primary"
              }`}
            >
              <tab.icon size={14} className="transition-transform group-hover:scale-110" />
              {tab.badge ? (
                <span className={`rounded border px-1 py-0.5 text-[8px] font-black leading-none ${isActive ? "border-cyber-primary/30 bg-cyber-primary/10" : "border-white/10 bg-white/5"}`}>
                  {tab.badge}
                </span>
              ) : (
                <span className="text-[7px] font-black uppercase tracking-[0.18em]">
                  {tab.label.slice(0, 4)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activeTab && (
        <div className="pointer-events-auto h-full w-[min(420px,calc(100vw-3rem))] animate-in slide-in-from-right duration-200 relative">
          <button
            type="button"
            onClick={() => onTabChange(null)}
            className="absolute right-2 top-2 z-50 h-6 w-6 rounded-md flex items-center justify-center border border-white/5 bg-black/30 text-white/40 hover:text-white hover:border-cyber-primary"
            title="Close"
          >
            ✕
          </button>
          {children}
        </div>
      )}
    </div>
  );
};

export default EditorDock;