import React, { useState } from 'react';
import { Shield, Key, ExternalLink, RefreshCw, ChevronDown } from 'lucide-react';
import { useSecrets } from '../hooks/useSecrets';
import { CyberAction } from './shared/CyberUI';

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
  label = 'Credential',
  placeholder = 'Select encrypted secret...',
  allowCustomInput = true,
  required = false,
}) => {
  const { secrets, loading } = useSecrets();
  const [isCustom, setIsCustom] = useState(() => {
    // Check if current value is a secret ID or custom input
    return Boolean(value && !secrets.some((s) => s.id === value));
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
    <div className="space-y-2 p-2 bg-black/40 border border-white/5 rounded-xl">
      <div className="flex items-center justify-between px-1">
        {label && (
          <label className="text-[9px] font-black text-cyber-primary uppercase tracking-widest">
            {label}
          </label>
        )}
        
        {allowCustomInput && (
          <div className="flex gap-0.5 p-0.5 bg-black/40 rounded-md border border-white/5 h-6">
            <CyberAction
              active={!isCustom}
              icon={Shield}
              showLabel={false}
              onClick={() => setIsCustom(false)}
              className="w-6 h-full p-0 border-none rounded-sm"
            />
            <CyberAction
              active={isCustom}
              icon={Key}
              showLabel={false}
              onClick={() => setIsCustom(true)}
              className="w-6 h-full p-0 border-none rounded-sm"
            />
          </div>
        )}
      </div>

      {!isCustom ? (
        <div className="space-y-2">
          {loading ? (
            <div className="flex items-center gap-2 p-2 text-[9px] text-gray-500 font-mono italic">
              <RefreshCw size={10} className="animate-spin text-cyber-primary" />
              Syncing vault...
            </div>
          ) : secrets.length === 0 ? (
            <div className="p-2 border border-dashed border-white/10 rounded-lg bg-white/[0.02] text-center">
              <p className="text-[9px] text-gray-600 mb-2 uppercase font-bold">Vault Empty</p>
              <CyberAction
                icon={ExternalLink}
                label="Manage"
                onClick={() => window.open('/secrets', '_blank')}
                className="w-full text-[9px] h-7 justify-center border-cyber-primary/20"
              />
            </div>
          ) : (
            <div className="relative group">
              <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-cyber-primary/40 group-focus-within:text-cyber-primary transition-colors">
                <Shield size={12} />
              </div>
              <select
                value={value}
                onChange={(e) => handleSecretSelect(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-lg pl-8 pr-8 py-1.5 text-[11px] text-white focus:outline-none focus:border-cyber-primary/40 transition-all appearance-none cursor-pointer font-mono"
              >
                <option value="">{placeholder}</option>
                {secrets.map((secret) => (
                  <option key={secret.id} value={secret.id} className="bg-[#0a0a0a]">
                    {secret.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">
                <ChevronDown size={12} />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="relative group">
          <textarea
            value={value}
            onChange={(e) => handleCustomInput(e.target.value)}
            placeholder="Paste raw key here (Danger: Visible in flow JSON)"
            className="w-full bg-black/60 border border-amber-500/10 rounded-lg p-2.5 text-[11px] text-amber-200/80 focus:outline-none focus:border-amber-500/30 transition-all font-mono min-h-[60px] resize-none"
            required={required}
          />
          <Key size={10} className="absolute right-2 top-2 text-amber-500/20" />
        </div>
      )}

      <div className="flex items-center gap-1.5 px-1 opacity-50">
        <div className={`h-1 w-1 rounded-full ${isCustom ? 'bg-amber-500' : 'bg-cyber-primary shadow-[0_0_4px_currentColor]'}`} />
        <span className="text-[8px] text-gray-500 font-black uppercase tracking-tighter">
          {isCustom ? 'Insecure Plaintext' : 'Encrypted Reference'}
        </span>
      </div>
    </div>
  );
};

export default SecretSelector;
