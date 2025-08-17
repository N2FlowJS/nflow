import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchAllLLMProviders } from '../services/llmService';
import { LLMProvider } from '../models/llm';

export interface ChatModelInfo {
  id: string;
  name: string;
  providerId: string;
  providerName: string;
}

export interface UseLLMChatModelsResult {
  providers: LLMProvider[];
  models: ChatModelInfo[];
  groupedModels: { provider: LLMProvider; models: ChatModelInfo[] }[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

/**
 * Shared hook to fetch all LLM providers with their chat models and group them by provider.
 * Ensures consistent loading/error handling and stable memoized group structure for forms.
 */
export function useLLMChatModels(): UseLLMChatModelsResult {
  const [providers, setProviders] = useState<LLMProvider[]>([]);
  const [models, setModels] = useState<ChatModelInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const providersData = await fetchAllLLMProviders();
      setProviders(providersData);
      const allModels: ChatModelInfo[] = providersData.flatMap((provider) =>
        (provider.models || [])
          .filter((m) => m.modelType === 'chat')
          .map((m) => ({
            id: m.id,
            name: m.name,
            providerId: provider.id,
            providerName: provider.providerType,
          }))
      );
      setModels(allModels);
    } catch (e) {
      console.error('Failed to load LLM chat models', e);
      setError('Failed to load models');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const groupedModels = useMemo(
    () =>
      providers
        .map((provider) => ({
          provider,
            models: models.filter((m) => m.providerId === provider.id),
        }))
        .filter((g) => g.models.length > 0),
    [providers, models]
  );

  return { providers, models, groupedModels, loading, error, reload: load };
}

export default useLLMChatModels;
