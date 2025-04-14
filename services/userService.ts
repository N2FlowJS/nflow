import { apiRequest } from './apiUtils';
import { IUser } from '../types/IUser';

export const fetchAllUsers = async () => {
  return apiRequest<IUser[]>('/api/user');
};

export const fetchUserById = async (id: string) => {
  return apiRequest<IUser>(`/api/user/${id}`);
};

export const updateUser = async (id: string, data: { name?: string; description?: string }) => {
  return apiRequest<IUser>(`/api/user/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteUser = async (id: string) => {
  return apiRequest<void>(`/api/user/${id}`, {
    method: 'DELETE',
  });
};

export const fetchUserProfile = async (userId: string) => {
  return apiRequest<IUser>(`/api/users/${userId}/profile`);
};

export const updateUserProfile = async (
  userId: string,
  data: {
    name?: string;
    email?: string;
    description?: string;
    password?: string;
    currentPassword?: string;
  }
) => {
  return apiRequest<IUser>(`/api/users/${userId}/profile`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const getUserPreferences = async (userId: string) => {
  return apiRequest<any>(`/api/user/${userId}/preferences`);
};

export const updateUserPreferences = async (userId: string, data: any) => {
  return apiRequest<any>(`/api/user/${userId}/preferences`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const fetchUserPreferences = async (userId: string) => {
  return apiRequest<any>(`/api/user/${userId}/preferences`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
