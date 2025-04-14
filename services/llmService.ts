import { CreateLLMModelRequest, LLMModel, LLMProvider, TestLLMProviderRequest, TestLLMProviderResponse, UpdateLLMModelRequest } from '../types/llm';
import { apiRequest } from './apiUtils';

export interface CreateLLMProviderRequest {
  name: string;
  description?: string;
  providerType: string;
  endpointUrl: string;
  isActive?: boolean;
  isDefault?: boolean;
  apiKey?: string;
  config?: Record<string, any>;
  ownerType?: string;
  teamOwnerId?: string;
}

export interface UpdateLLMProviderRequest extends Partial<CreateLLMProviderRequest> {}

export const fetchAllLLMProviders = async () => {
  return apiRequest<LLMProvider[]>('/api/llm/providers');
};

export const fetchLLMProviderById = async (id: string) => {
  return apiRequest<LLMProvider>(`/api/llm/providers/${id}`);
};

export const createLLMProvider = async (data: CreateLLMProviderRequest) => {
  return apiRequest<LLMProvider>('/api/llm/providers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateLLMProvider = async (id: string, data: UpdateLLMProviderRequest) => {
  return apiRequest<LLMProvider>(`/api/llm/providers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteLLMProvider = async (id: string) => {
  return apiRequest<{ success: boolean }>(`/api/llm/providers/${id}`, {
    method: 'DELETE',
  });
};

export const setDefaultLLMProvider = async (id: string) => {
  return apiRequest<LLMProvider>(`/api/llm/providers/${id}/default`, {
    method: 'PUT',
  });
};

export interface CreateDefaultLLMProviderRequest {
  apiKey: string;
  ownerType?: string;
  teamOwnerId?: string;
}

export const createDefaultLLMProvider = async (data: CreateDefaultLLMProviderRequest) => {
  return apiRequest<{provider: LLMProvider, modelsCreated: number}>('/api/llm/providers/default', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const fetchLLMModelsByProvider = async (providerId: string) => {
  return apiRequest<LLMModel[]>(`/api/llm/providers/${providerId}/models`);
};

export const fetchLLMModelById = async (id: string) => {
  return apiRequest<LLMModel>(`/api/llm/models/${id}`);
};

export const createLLMModel = async (data: CreateLLMModelRequest) => {
  return apiRequest<LLMModel>('/api/llm/models', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateLLMModel = async (id: string, data: UpdateLLMModelRequest) => {
  return apiRequest<LLMModel>(`/api/llm/models/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteLLMModel = async (id: string) => {
  return apiRequest<{ success: boolean }>(`/api/llm/models/${id}`, {
    method: 'DELETE',
  });
};

export const setDefaultLLMModel = async (id: string) => {
  return apiRequest<LLMModel>(`/api/llm/models/${id}/default`, {
    method: 'PUT',
  });
};

export const testLLMProvider = async (data: TestLLMProviderRequest): Promise<TestLLMProviderResponse> => {
  return apiRequest<TestLLMProviderResponse>('/api/llm/test', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const fetchUserLLMProviders = async (userId: string) => {
  return apiRequest<LLMProvider[]>(`/api/user/${userId}/llm/providers`);
};

export const createUserLLMProvider = async (userId: string, data: CreateLLMProviderRequest) => {
  return apiRequest<LLMProvider>(`/api/user/${userId}/llm/providers`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateUserLLMProvider = async (providerId: string, data: UpdateLLMProviderRequest) => {
  return apiRequest<LLMProvider>(`/api/llm/providers/${providerId}`, {
    method: 'PUT',
    body: JSON.stringify({
      ...data,
      ownerType: 'user'  // Ensure it keeps user ownership type
    }),
  });
};

export const deleteUserLLMProvider = async (providerId: string) => {
  return apiRequest<{ success: boolean }>(`/api/llm/providers/${providerId}`, {
    method: 'DELETE',
  });
};
