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
    <div className={`bg-cyber-panel border border-cyber-border rounded-xl shadow-2xl overflow-hidden flex flex-col ${className}`} style={{ maxHeight }}>
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
