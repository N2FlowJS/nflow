import { apiRequest } from './apiUtils';
import { IAgent } from '../types/IAgent';

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

export const saveFlowConfig = async (agentId: string, flowConfig: string) => {
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
  } catch (error) {
    console.error('Error fetching agent count:', error);
    return 0;
  }
};

// Create a new agent
export const createAgent = async (agentData: { name: string; description: string; isActive: boolean; ownerType: string; userId?: string; teamId?: string; flowConfig?: string }): Promise<IAgent> => {
  return apiRequest<IAgent>('/api/agent', {
    method: 'POST',
    body: JSON.stringify(agentData),
  });
};

/**
 * Fetch an agent's flow configuration
 */
export async function fetchFlowConfig(agentId: string): Promise<string> {
  try {
    const data = await apiRequest<any>(`/api/agent/${agentId}/flow`, {
      method: 'GET',
    });

    return data.flowConfig || '{"nodes":[],"edges":[]}';
  } catch (error) {
    console.error('Error fetching agent flow config:', error);
    throw error;
  }
}

/**
 * Fetch a flow configuration by agent ID - used by server-side API routes
 * @param agentId The ID of the agent
 * @returns The flow configuration as a string
 */
export async function getFlowById(agentId: string): Promise<string> {
  try {
    const data = await apiRequest<any>(`/api/agent/${agentId}/flow`, {
      method: 'GET',
    });

    return data.flowConfig || '{"nodes":[],"edges":[]}';
  } catch (error) {
    console.error('Error fetching flow by ID:', error);
    throw error;
  }
}
