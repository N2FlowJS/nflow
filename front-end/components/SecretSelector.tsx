import React, { useState } from 'react';
import { Shield, Key, ExternalLink, RefreshCw, ChevronDown } from 'lucide-react';
import { useSecrets } from '../hooks/useSecrets';
import { Button, Input } from './ui';

interface SecretSelectorProps {
  value?: string; // secretId or custom value
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  allowCustomInput?: boolean;
  required?: boolean;
}

/**
 * Component to select or input a secret value in flows
 * Allows choosing from stored secrets or entering a custom value
 */
export const SecretSelector: React.FC<SecretSelectorProps> = ({
  value = '',
  onChange,
  label = 'Secret',
  placeholder = 'Select or enter a secret',
  allowCustomInput = true,
  required = false,
}) => {
  const { secrets, loading } = useSecrets();
  const [isCustom, setIsCustom] = useState(() => {
    // Check if current value is a secret ID or custom input
    return !secrets.some((s) => s.id === value);
  });

  const handleSecretSelect = (secretId: string) => {
    setIsCustom(false);
    onChange(secretId);
  };

  const handleCustomInput = (customValue: string) => {
    setIsCustom(true);
    onChange(customValue);
  };

  return (
    <div className="space-y-3 p-3 bg-black/20 border border-white/5 rounded-xl">
      {label && (
        <label className="block text-[10px] font-bold text-cyber-primary/70 uppercase tracking-widest">
          {label}
        </label>
      )}

      {/* Mode toggle */}
      {allowCustomInput && (
        <div className="flex gap-1 p-1 bg-black/40 rounded-lg border border-white/5">
          <Button
            size="sm"
            variant={!isCustom ? 'primary' : 'ghost'}
            onClick={() => setIsCustom(false)}
            className="flex-1 text-[9px] min-h-0 uppercase"
          >
            <Shield size={10} className="mr-1" /> Stored Secret
          </Button>
          <Button
            size="sm"
            variant={isCustom ? 'primary' : 'ghost'}
            onClick={() => setIsCustom(true)}
            className="flex-1 text-[9px] min-h-0 uppercase"
          >
            <Key size={10} className="mr-1" /> Custom Value
          </Button>
        </div>
      )}

      {/* Secret selector */}
      {!isCustom && (
        <div className="space-y-2">
          {loading ? (
            <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
              <RefreshCw size={12} className="animate-spin text-cyber-primary" />
              Loading secure vault...
            </div>
          ) : secrets.length === 0 ? (
            <div className="p-3 border border-dashed border-white/10 rounded-lg bg-white/5 text-center">
              <p className="text-[10px] text-gray-500 mb-2">No stored secrets found.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('/secrets', '_blank')}
                className="w-full text-[9px]"
              >
                <ExternalLink size={10} className="mr-1" /> Open Secret Manager
              </Button>
            </div>
          ) : (
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-primary group-focus-within:animate-pulse">
                <Shield size={14} />
              </div>
              <select
                value={value}
                onChange={(e) => handleSecretSelect(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyber-primary/50 transition-all appearance-none cursor-pointer font-mono"
              >
                <option value="">{placeholder}</option>
                {secrets.map((secret) => (
                  <option key={secret.id} value={secret.id}>
                    {secret.name} {secret.label ? `(${secret.label})` : ''}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">
                <ChevronDown size={14} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Custom input */}
      {isCustom && allowCustomInput && (
        <div className="relative group">
          <div className="absolute left-3 top-3 text-amber-500/50 group-focus-within:text-amber-500 transition-colors">
            <Key size={14} />
          </div>
          <textarea
            value={value}
            onChange={(e) => handleCustomInput(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-black/60 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50 transition-all font-mono min-h-[80px]"
            required={required}
          />
        </div>
      )}

      <div className="flex items-center gap-1.5 px-1">
        <div className={`h-1 w-1 rounded-full ${isCustom ? 'bg-amber-500 animate-pulse' : 'bg-cyber-primary shadow-[0_0_5px_rgba(0,240,255,0.5)]'}`} />
        <p className="text-[9px] text-gray-500 uppercase tracking-tighter">
          {isCustom
            ? 'Plaintext Value (Warning: Not Encrypted)'
            : 'Secure Reference (AES-256 Encrypted)'}
        </p>
      </div>
    </div>
  );
};

export default SecretSelector;
