import { apiRequest } from './apiUtils';
import { IAgent } from '../models/IAgent';

export const fetchAgent = async (agentId: string) => {
  return apiRequest<IAgent>(`/api/agent/${agentId}`);
};

export const fetchUserAgents = async (userId: string) => {
  return apiRequest<IAgent[]>(`/api/agent?userId=${userId}`);
};

export const updateAgent = async (agentId: string, updateData: any) => {
  return apiRequest<IAgent>(`/api/agent/${agentId}`, {
    method: 'PUT',
    body: JSON.stringify(updateData),
  });
};

export const deleteAgent = async (agentId: string) => {
  return apiRequest(`/api/agent/${agentId}`, {
    method: 'DELETE',
  });
};

export const saveFlowConfig = async (agentId: string, flowConfig: any) => {
  return apiRequest(`/api/agent/${agentId}`, {
    method: 'PUT',
    body: JSON.stringify({ flowConfig }),
  });
};

// Get agent count
export const getAgentCount = async (): Promise<number> => {
  try {
    const response = await apiRequest<{ count: number }>(`/api/agent/count`, {
      method: 'GET',
    });
    return response.count;
  } catch (error: unknown) {
    console.error('Error fetching agent count:', error);
    return 0;
  }
};

// Create a new agent
export const createAgent = async (agentData: any): Promise<IAgent> => {
  return apiRequest<IAgent>('/api/agent', {
    method: 'POST',
    body: JSON.stringify(agentData),
  });
};

