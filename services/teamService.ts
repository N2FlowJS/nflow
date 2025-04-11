import { apiRequest } from "./apiUtils";

export interface Team {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  users: {
    id: string;
    name: string;
  }[];
}

export const fetchAllTeams = async () => {
  return apiRequest<Team[]>("/api/team");
};

export const createTeam = async (data: { name: string; description: string }) => {
  return apiRequest<Team>("/api/team", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateTeam = async (id: string, data: { name?: string; description?: string }) => {
  return apiRequest<Team>(`/api/team/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const deleteTeam = async (id: string) => {
  return apiRequest<void>(`/api/team/${id}`, {
    method: "DELETE",
  });
};
