import React from "react";
import { LucideIcon, X } from "lucide-react";
import { Button } from "../ui";

/**
 * Standardized status dot with ring and glow
 */
export const StatusIndicator: React.FC<{
  status: 'idle' | 'running' | 'success' | 'error';
  size?: number;
}> = ({ status, size = 8 }) => {
  const configs = {
    idle: "bg-gray-500/50 border-gray-500/30",
    running: "bg-yellow-400 border-yellow-400 animate-pulse shadow-[0_0_8px_rgba(250,204,21,1)]",
    success: "bg-green-500 border-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]",
    error: "bg-red-500 border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]",
  };

  return (
    <div 
      className={`rounded-full border ${configs[status]}`} 
      style={{ width: size, height: size }} 
    />
  );
};

interface CyberActionProps {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  icon?: LucideIcon;
  label?: string;
  colorClass?: string;
  title?: string;
  className?: string;
  showLabel?: boolean;
  active?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
}

/**
 * A highly reusable action button styled for the Cyberpunk UI.
 * Standardized design with fixed ghost/outline behavior.
 */
export const CyberAction: React.FC<CyberActionProps> = ({
  onClick,
  icon: Icon,
  label = "",
  colorClass = "text-cyber-primary",
  title,
  className = "",
  showLabel = true,
  active = false,
  disabled = false,
  children,
}) => {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      disabled={disabled}
      className={`group flex items-center justify-start gap-2 transition-all 
                 ${active ? 'bg-cyber-primary/20 border-cyber-primary/50' : 'bg-white/5 border-white/5'}
                 hover:bg-cyber-primary/10 border 
                 hover:border-cyber-primary/30 rounded-lg active:scale-95 ${className}
                 ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
      title={title || label}
    >
      {Icon && (
        <Icon 
          size={14} 
          className={`${colorClass} group-hover:drop-shadow-[0_0_5px_currentColor] transition-all ${active ? 'drop-shadow-[0_0_5px_currentColor]' : ''}`} 
        />
      )}
      {showLabel && label && (
        <span className="text-[10px] font-bold uppercase tracking-wider truncate">
          {label}
        </span>
      )}
      {children}
    </Button>
  );
};

interface CyberPanelProps {
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  onClose?: () => void;
  actions?: React.ReactNode;
  className?: string;
  maxHeight?: string;
}

/**
 * Standardized container with Cyberpunk aesthetics.
 * Used for modals, side panels, and overlays.
 */
export const CyberPanel: React.FC<CyberPanelProps> = ({
  title,
  icon: Icon,
  children,
  onClose,
  actions,
  className = "",
  maxHeight = "80vh",
}) => {
  return (
    <div className={`bg-cyber-panel border border-cyber-primary/20 rounded-xl shadow-2xl overflow-hidden flex flex-col bg-black/80 backdrop-blur-xl ${className}`} style={{ maxHeight }}>
      <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between bg-black/40">
        <div className="flex items-center gap-2 text-cyber-primary">
          {Icon && <Icon size={14} />}
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {actions}
          {onClose && (
            <button
              onClick={onClose}
              className="flex h-5 w-5 items-center justify-center rounded border border-white/5 text-white/20 transition-colors hover:border-cyber-primary/20 hover:text-cyber-primary"
            >
              <X size={10} />
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {children}
      </div>
    </div>
  );
};

interface TooltipBadgeProps {
  label: string;
  status?: "online" | "offline" | "syncing";
  className?: string;
}

/**
 * A reusable status indicator badge with pulse effects.
 */
export const StatusBadge: React.FC<TooltipBadgeProps> = ({ label, status = "online", className = "" }) => {
  const statusStyles = {
    online: "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse",
    offline: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]",
    syncing: "bg-cyber-primary shadow-[0_0_8px_rgba(34,211,238,0.6)] animate-spin-slow",
  };

  return (
    <div className={`flex items-center gap-1.5 leading-none ${className}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${statusStyles[status as keyof typeof statusStyles]}`} />
      <span className="text-[9px] text-white/40 font-black uppercase tracking-[0.2em]">
        {label}
      </span>
    </div>
  );
};

export const CyberBadge: React.FC<{
  label: string;
  variant?: 'primary' | 'success' | 'error' | 'warning' | 'info' | 'purple';
  size?: 'xs' | 'sm';
  className?: string;
}> = ({ label, variant = 'primary', size = 'xs', className = '' }) => {
  const variantStyles = {
    primary: 'bg-cyber-primary/10 text-cyber-primary border-cyber-primary/20',
    success: 'bg-green-500/10 text-green-400 border-green-500/20',
    error: 'bg-red-500/10 text-red-400 border-red-500/20',
    warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    info: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };

  const sizeStyles = {
    xs: 'px-1.5 py-0.5 text-[8px]',
    sm: 'px-2 py-1 text-[10px]',
  };

  return (
    <span className={`inline-flex items-center font-black uppercase tracking-wider rounded border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
      {label}
    </span>
  );
};

export const CyberSectionLabel: React.FC<{
  label: string;
  className?: string;
}> = ({ label, className = "" }) => {
  return (
    <div className={`border-b border-white/5 px-1 pb-1 text-[7px] font-black uppercase tracking-[0.2em] text-white/20 ${className}`}>
      {label}
    </div>
  );
};

export const CyberFieldShell: React.FC<{
  label: React.ReactNode;
  leading?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
}> = ({
  label,
  leading,
  action,
  children,
  className = "",
  headerClassName = "",
}) => {
  return (
    <div className={`space-y-1 px-0.5 ${className}`}>
      <div className={`flex items-center justify-between text-[9px] font-bold uppercase tracking-tighter text-white/30 transition-colors ${headerClassName}`}>
        <div className="flex items-center gap-1">
          {leading}
          {label}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
};

export const CyberPanelSection: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => {
  return (
    <div className={`bg-black/40 ${className}`}>
      {children}
    </div>
  );
};

export const CyberPanelFooter: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => {
  return (
    <div className={`flex items-center justify-between border-t border-white/5 bg-black/50 px-4 py-2 ${className}`}>
      {children}
    </div>
  );
};

export const CyberOverlay: React.FC<{
  children: React.ReactNode;
  className?: string;
  onMouseDown?: React.MouseEventHandler<HTMLDivElement>;
}> = ({ children, className = "", onMouseDown }) => {
  return (
    <div
      className={`fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 ${className}`}
      onMouseDown={onMouseDown}
    >
      {children}
    </div>
  );
};

export const CyberEmptyState: React.FC<{
  label: string;
  className?: string;
}> = ({ label, className = "" }) => {
  return (
    <div className={`flex items-center justify-center text-white/10 font-black uppercase tracking-[0.5em] text-[8px] ${className}`}>
      {label}
    </div>
  );
};

export const CyberMetaText: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => {
  return (
    <div className={`px-1 text-[8px] font-mono text-white/20 truncate uppercase ${className}`}>
      {children}
    </div>
  );
};

export const CyberToggleSwitch: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}> = ({ checked, onChange, className = "" }) => {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`nodrag flex h-4 w-8 items-center rounded-full px-0.5 transition-all ${checked ? "bg-cyber-primary" : "bg-white/10"} ${className}`}
    >
      <div
        className={`h-3 w-3 rounded-full bg-white transition-transform ${checked ? "translate-x-4" : "translate-x-0"}`}
      />
    </button>
  );
};

export const CyberListItem: React.FC<{
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  onDragStart?: React.DragEventHandler<HTMLDivElement>;
  draggable?: boolean;
  action?: React.ReactNode;
  accentClassName?: string;
  className?: string;
}> = ({
  children,
  onClick,
  onDragStart,
  draggable = false,
  action,
  accentClassName = "bg-cyber-primary",
  className = "",
}) => {
  return (
    <div
      className={`group relative flex transition-all ${onClick ? "cursor-pointer" : ""} ${className}`}
      onClick={onClick}
      onDragStart={onDragStart}
      draggable={draggable}
    >
      {children}
      {action}
      <div className={`absolute left-0 w-0.5 h-0 group-hover:h-full transition-all duration-300 ${accentClassName}`} />
    </div>
  );
};

export const CyberMenuItem: React.FC<{
  icon?: LucideIcon;
  label: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  danger?: boolean;
  disabled?: boolean;
  active?: boolean;
  trailing?: React.ReactNode;
  className?: string;
}> = ({
  icon: Icon,
  label,
  onClick,
  danger = false,
  disabled = false,
  active = false,
  trailing,
  className = "",
}) => {
  const toneClass = danger
    ? "text-red-400/70 hover:text-red-400 hover:bg-red-500/10"
    : active
      ? "text-cyber-primary bg-cyber-primary/10"
      : "text-white/45 hover:text-cyber-primary hover:bg-cyber-primary/10";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group/item flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-all ${toneClass} ${disabled ? "cursor-not-allowed opacity-20" : "cursor-pointer"} ${className}`}
    >
      {Icon && <Icon size={14} className="transition-transform group-hover/item:scale-110" />}
      <span className="flex-1 truncate text-[10px] font-black uppercase tracking-[0.18em]">
        {label}
      </span>
      {trailing}
    </button>
  );
};

export const CyberMenuSurface = React.forwardRef<HTMLDivElement, {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onContextMenu?: React.MouseEventHandler<HTMLDivElement>;
}>(({ children, className = "", style, onContextMenu }, ref) => {
  return (
    <div
      ref={ref}
      className={`rounded-xl border border-white/10 bg-black/90 py-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl ${className}`}
      style={style}
      onContextMenu={onContextMenu}
    >
      {children}
    </div>
  );
});

CyberMenuSurface.displayName = "CyberMenuSurface";

export const CyberIconTile: React.FC<{
  icon: LucideIcon;
  label: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  colorClass?: string;
  active?: boolean;
  indicator?: React.ReactNode;
  className?: string;
}> = ({
  icon: Icon,
  label,
  onClick,
  colorClass = "text-white/60",
  active = false,
  indicator,
  className = "",
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex flex-col items-center justify-center gap-2 rounded-lg border p-3 transition-all ${active ? "border-cyber-primary/20 bg-cyber-primary/10" : "border-transparent hover:border-cyber-primary/20 hover:bg-cyber-primary/10"} ${colorClass} ${className}`}
    >
      <div className="rounded-lg border border-white/5 bg-black/40 p-2 shadow-inner transition-all group-hover:border-cyber-primary/40 group-hover:text-cyber-primary">
        <Icon size={18} />
      </div>
      <span className="text-center text-[9px] font-black uppercase leading-tight tracking-wider transition-colors group-hover:text-cyber-primary">
        {label}
      </span>
      {indicator && <div className="absolute right-1.5 top-1.5">{indicator}</div>}
    </button>
  );
};

export const CyberToolbar: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => {
  return (
    <div className={`flex items-center gap-1 rounded-full border border-white/5 bg-black/40 p-1 shadow-2xl backdrop-blur-md ${className}`}>
      {children}
    </div>
  );
};

export const CyberToolbarDivider: React.FC<{
  className?: string;
}> = ({ className = "" }) => {
  return <div className={`h-4 w-px bg-white/5 ${className}`} />;
};
