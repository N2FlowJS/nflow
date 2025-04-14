import { LLMProvider } from '../types/llm';
import { apiRequest } from './apiUtils';
import { Agent, User, MemberTeam } from '@prisma/client';

export interface Team {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;

  createdById: string;
  createdBy: User;
  users: User[];
  members: MemberTeam[];
  ownedAgents?: Agent[];
}

export const fetchTeams = async () => {
  return apiRequest<Team[]>('/api/team');
};

export const createTeam = async (data: { name: string; description: string }) => {
  return apiRequest<Team>('/api/team', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateTeam = async (id: string, data: { name?: string; description?: string }) => {
  return apiRequest<Team>(`/api/team/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteTeam = async (id: string) => {
  return apiRequest<{ success: boolean }>(`/api/team/${id}`, {
    method: 'DELETE',
  });
};

export const fetchTeamById = async (id: string) => {
  return apiRequest<Team>(`/api/team/${id}`);
};

export const fetchTeamMembers = async (teamId: string) => {
  return apiRequest<any[]>(`/api/team/${teamId}/members`);
};

export const addTeamMember = async (teamId: string, data: { userId: string; role: string }) => {
  return apiRequest<any>(`/api/team/${teamId}/members`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateTeamMember = async (teamId: string, userId: string, data: { role: string }) => {
  return apiRequest<any>(`/api/team/${teamId}/members/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const removeTeamMember = async (teamId: string, userId: string) => {
  return apiRequest<{ success: boolean }>(`/api/team/${teamId}/members/${userId}`, {
    method: 'DELETE',
  });
};

// LLM Provider Management for Teams
export const fetchTeamLLMProviders = async (teamId: string) => {
  return apiRequest<LLMProvider[]>(`/api/team/${teamId}/llm-providers`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const createTeamLLMProvider = async (teamId: string, providerData: any) => {
  return apiRequest(`/api/team/${teamId}/llm-providers`, {
    method: 'POST',
    body: JSON.stringify(providerData),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const deleteTeamLLMProvider = async (teamId: string, providerId: string) => {
  return apiRequest(`/api/team/${teamId}/llm-providers/${providerId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const updateTeamLLMProvider = async (teamId: string, providerId: string, data: any) => {
  return apiRequest(`/api/team/${teamId}/llm-providers/${providerId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
