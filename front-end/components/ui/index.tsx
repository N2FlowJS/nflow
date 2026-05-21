import React from 'react';

type ControlVariant = 'default' | 'dense' | 'micro';

const inputVariantClasses: Record<ControlVariant, string> = {
  default: 'rounded-lg px-3 py-1.5 text-xs',
  dense: 'rounded-lg px-3 py-0 text-[10px] h-7',
  micro: 'rounded px-2 py-0 text-[8px] h-5',
};

const textAreaVariantClasses: Record<ControlVariant, string> = {
  default: 'rounded-lg px-3 py-2 text-xs min-h-[100px]',
  dense: 'rounded px-2 py-1 text-[10px] min-h-[50px]',
  micro: 'rounded px-2 py-1 text-[8px] min-h-[32px]',
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ElementType;
  error?: string;
  helperText?: string;
  variant?: ControlVariant;
  endAdornment?: React.ReactNode;
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: ControlVariant;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ElementType;
  variant?: ControlVariant;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon: Icon, error, helperText, className = '', variant = 'default', endAdornment, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="block text-[10px] font-bold text-cyber-primary/70 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              <Icon size={14} />
            </div>
          )}
          <input
            ref={ref}
            className={`w-full bg-black/40 border ${
              error ? 'border-red-500/50' : 'border-white/10'
            } ${inputVariantClasses[variant]} ${
              Icon ? 'pl-9' : variant === 'micro' ? 'pl-2' : 'pl-3'
            } ${endAdornment ? (variant === 'micro' ? 'pr-7' : 'pr-10') : variant === 'micro' ? 'pr-2' : 'pr-3'} text-white placeholder-gray-600 focus:outline-none focus:border-cyber-primary/50 transition-all ${className}`}
            {...props}
          />
          {endAdornment && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              {endAdornment}
            </div>
          )}
        </div>
        {error && <p className="text-[10px] text-red-400">{error}</p>}
        {!error && helperText && <p className="text-[10px] text-gray-500">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, helperText, className = '', variant = 'default', ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="block text-[10px] font-bold text-cyber-primary/70 uppercase tracking-wider">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`w-full bg-black/40 border ${
            error ? 'border-red-500/50' : 'border-white/10'
          } ${textAreaVariantClasses[variant]} text-white placeholder-gray-600 focus:outline-none focus:border-cyber-primary/50 transition-all ${className}`}
          {...props}
        />
        {error && <p className="text-[10px] text-red-400">{error}</p>}
        {!error && helperText && <p className="text-[10px] text-gray-500">{helperText}</p>}
      </div>
    );
  }
);
TextArea.displayName = 'TextArea';

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, icon: Icon, className = '', children, variant = 'default', ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="block text-[10px] font-bold text-cyber-primary/70 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative group">
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyber-primary transition-colors">
              <Icon size={14} />
            </div>
          )}
          <select
            ref={ref}
            className={`w-full bg-black/40 border ${
              error ? 'border-red-500/50' : 'border-white/10'
            } ${inputVariantClasses[variant]} ${Icon ? 'pl-9' : variant === 'micro' ? 'pl-2' : 'pl-3'} ${variant === 'micro' ? 'pr-7' : 'pr-10'} text-white appearance-none focus:outline-none focus:border-cyber-primary/50 transition-all cursor-pointer ${className}`}
            {...props}
          >
            {children}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        {error && <p className="text-[10px] text-red-400">{error}</p>}
        {!error && helperText && <p className="text-[10px] text-gray-500">{helperText}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';

export const Button = ({
  children,
  className = '',
  loading,
  variant = 'primary',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  variant?: 'primary' | 'ghost' | 'outline' | 'danger';
}) => {

  const variants = {
    primary: 'bg-cyber-primary text-black hover:bg-cyber-primary/90 font-bold shadow-[0_0_8px_rgba(0,240,255,0.08)]',
    ghost: 'text-cyber-primary hover:bg-cyber-primary/10 font-bold',
    outline: 'border border-cyber-primary/30 text-cyber-primary hover:bg-cyber-primary/10 font-bold',
    danger: 'bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white font-bold',
  };

  return (
    <button
      className={`rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${variants[variant]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <>
          <span className="animate-spin text-sm">⏳</span>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};
