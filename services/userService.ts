import { apiRequest } from './apiUtils';
import { IUser } from '../models/IUser';

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

export const updateUserPreferences = async (userId: string, preferences: any) => {
  try {
    const response = await fetch(`/api/user/${userId}/preferences`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferences),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update user preferences');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw error;
  }
};

export const fetchUserPreferences = async (userId: string) => {
  return apiRequest<any>(`/api/user/${userId}/preferences`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
