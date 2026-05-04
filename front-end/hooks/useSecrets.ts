import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../lib/api';

export interface Secret {
  id: string;
  name: string;
  label?: string;
  key: string; // preview
  createdAt: string;
  lastUsedAt?: string;
}

export const useSecrets = () => {
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSecrets = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchWithAuth('/api/secrets');
      if (response.ok) {
        setSecrets(response.secrets || []);
      } else {
        setError(response.error || 'Failed to load secrets');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load secrets');
    } finally {
      setLoading(false);
    }
  };

  const getSecretValue = async (secretId: string): Promise<string | null> => {
    try {
      const response = await fetchWithAuth(`/api/secrets/${secretId}`);
      if (response.ok) {
        return response.secret?.key || null;
      }
      return null;
    } catch (err) {
      console.error('Failed to get secret value:', err);
      return null;
    }
  };

  const getSecretByName = async (secretName: string): Promise<string | null> => {
    try {
      // Find secret by name and get its value
      const secret = secrets.find((s) => s.name === secretName);
      if (!secret) return null;
      return await getSecretValue(secret.id);
    } catch (err) {
      console.error('Failed to get secret by name:', err);
      return null;
    }
  };

  useEffect(() => {
    loadSecrets();
  }, []);

  return {
    secrets,
    loading,
    error,
    loadSecrets,
    getSecretValue,
    getSecretByName,
  };
};
