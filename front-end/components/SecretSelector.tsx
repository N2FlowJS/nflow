import React, { useState } from 'react';
import { useSecrets } from '../hooks/useSecrets';

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
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium">{label}</label>}

      {/* Mode toggle */}
      {allowCustomInput && (
        <div className="flex gap-2 text-xs">
          <button
            onClick={() => setIsCustom(false)}
            className={`px-2 py-1 rounded ${
              !isCustom ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Select Secret
          </button>
          <button
            onClick={() => setIsCustom(true)}
            className={`px-2 py-1 rounded ${
              isCustom ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Custom Input
          </button>
        </div>
      )}

      {/* Secret selector */}
      {!isCustom && (
        <div>
          {loading ? (
            <div className="text-sm text-gray-500">Loading secrets...</div>
          ) : secrets.length === 0 ? (
            <div className="text-sm text-gray-500">
              No secrets available.{' '}
              <a href="/secrets" className="text-blue-600 hover:underline">
                Create one
              </a>
            </div>
          ) : (
            <select
              value={value}
              onChange={(e) => handleSecretSelect(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{placeholder}</option>
              {secrets.map((secret) => (
                <option key={secret.id} value={secret.id}>
                  {secret.name} {secret.label ? `- ${secret.label}` : ''} (${secret.key})
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Custom input */}
      {isCustom && allowCustomInput && (
        <textarea
          value={value}
          onChange={(e) => handleCustomInput(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          rows={3}
          required={required}
        />
      )}

      <p className="text-xs text-gray-500">
        {isCustom
          ? 'Enter your secret directly (not encrypted)'
          : 'Choose from your saved secrets (encrypted storage)'}
      </p>
    </div>
  );
};

export default SecretSelector;
