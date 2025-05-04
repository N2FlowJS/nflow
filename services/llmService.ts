import { CreateLLMModelRequest, LLMModel, LLMProvider, TestLLMProviderRequest, TestLLMProviderResponse, UpdateLLMModelRequest } from '../models/llm';
import { apiRequest } from './apiUtils';

export interface CreateLLMProviderRequest {
  name: string;
  description?: string;
  providerType: string;
  endpointUrl: string;
  apiKey?: string;
  config?: Record<string, any>;
  ownerType?: string;
  teamOwnerId?: string;
}


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

export const updateLLMProvider = async (id: string, data: unknown) => {
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



export interface CreateDefaultLLMProviderRequest {
  apiKey: string;
  ownerType?: string;
  teamOwnerId?: string;
}



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

export const updateUserLLMProvider = async (providerId: string, data: any) => {
  return apiRequest<LLMProvider>(`/api/llm/providers/${providerId}`, {
    method: 'PUT',
    body: JSON.stringify({
      ...data,
      ownerType: 'user', // Ensure it keeps user ownership type
    }),
  });
};

export const deleteUserLLMProvider = async (providerId: string) => {
  return apiRequest<{ success: boolean }>(`/api/llm/providers/${providerId}`, {
    method: 'DELETE',
  });
};

// User provider model management
export const fetchUserProviderModels = async (userId: string, providerId: string) => {
  return apiRequest<LLMModel[]>(`/api/user/${userId}/llm/providers/${providerId}/models`);
};

export const createUserProviderModel = async (userId: string, providerId: string, data: CreateLLMModelRequest) => {
  return apiRequest<LLMModel>(`/api/user/${userId}/llm/providers/${providerId}/models`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateUserProviderModel = async (userId: string, providerId: string, modelId: string, data: UpdateLLMModelRequest) => {
  return apiRequest<LLMModel>(`/api/user/${userId}/llm/providers/${providerId}/models/${modelId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteUserProviderModel = async (userId: string, providerId: string, modelId: string) => {
  return apiRequest<{ success: boolean }>(`/api/user/${userId}/llm/providers/${providerId}/models/${modelId}`, {
    method: 'DELETE',
  });
};

/**
 * Get a response from an LLM model - use only from client-side code
 * For server-side processing, use the direct implementation in the node handlers
 */
export async function getLLMResponse(modelId: string, prompt: string): Promise<string> {
  try {
    // Call to your LLM API with the model ID and prompt
    return apiRequest('/api/llm/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        modelId,
        prompt,
      }),
    });
  } catch (error: unknown) {
    console.error('Error calling LLM API:', error);
    throw error;
  }
}
