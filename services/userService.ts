import { apiRequest } from "./apiUtils";
import { IUser } from "../types/IUser";

export const fetchAllUsers = async () => {
  return apiRequest<IUser[]>("/api/user");
};

export const fetchUserById = async (id: string) => {
  return apiRequest<IUser>(`/api/user/${id}`);
};

export const updateUser = async (id: string, data: { name?: string; description?: string }) => {
  return apiRequest<IUser>(`/api/user/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const deleteUser = async (id: string) => {
  return apiRequest<void>(`/api/user/${id}`, {
    method: "DELETE",
  });
};
