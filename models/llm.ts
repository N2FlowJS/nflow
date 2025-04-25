export interface LLMProvider {
    id: string;
    name: string;
    description: string | null;
    providerType: string;
    endpointUrl: string;
    apiKey: string;
    isActive: boolean;
    isDefault: boolean;
    models: LLMModel[];
    ownerType: string;
    userOwner?: {
      id: string;
      name: string;
    };
    teamOwner?: {
      id: string;
      name: string;
    };
    teamOwnerId?: string | null;
}

export type LLMProviderType = 'openai' | 'openai-compatible';

export interface LLMModel {
  id: string;
  name: string;
  displayName?: string;
  description?: string;
  modelType: LLMModelType;
  contextWindow?: number;
  isActive: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  config?: Record<string, any>;
  providerId: string;

}

export type LLMModelType = 'text' | 'chat' | 'embedding' | 'image';

export interface CreateLLMProviderRequest {
  name: string;
  description?: string;
  providerType: LLMProviderType;
  endpointUrl: string;
  isActive?: boolean;
  isDefault?: boolean;
  apiKey?: string;
  config?: Record<string, any>;
}

export interface UpdateLLMProviderRequest {
  name?: string;
  description?: string;
  endpointUrl?: string;
  isActive?: boolean;
  isDefault?: boolean;
  apiKey?: string;
  config?: Record<string, any>;
}

export interface CreateLLMModelRequest {
  name: string;
  displayName?: string;
  description?: string;
  modelType: LLMModelType;
  contextWindow?: number;
  isActive?: boolean;
  isDefault?: boolean;
  config?: Record<string, any>;
  providerId: string;
}

export interface UpdateLLMModelRequest {
  name?: string;
  displayName?: string;
  description?: string;
  modelType?: LLMModelType;
  contextWindow?: number;
  isActive?: boolean;
  isDefault?: boolean;
  config?: Record<string, any>;
}

export interface TestLLMProviderRequest {
  providerId: string;
  message: string;
  modelId?: string;
}

export interface TestLLMProviderResponse {
  success: boolean;
  response?: string;
  error?: string;
  latency?: number;
  tokens?: {
    input: number;
    output: number;
  };
}

// Add these types to the existing file

export interface UserLLMPreferences {
  models: {
    chat?: string;    // Model ID
    text?: string;    // Model ID
    embedding?: string; // Model ID
    image?: string;   // Model ID
  };
  settings?: {
    temperature?: number;
    topP?: number;
    maxTokens?: number;
  };
}

export interface UserPreferencesUpdateRequest {
  defaultLLMProviderId?: string | null;
  llmPreferences?: UserLLMPreferences;
}
