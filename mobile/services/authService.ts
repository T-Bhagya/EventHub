import api from './api';
import { User, APIResponse } from '../types';

export const loginApi = async (email: string, password: string): Promise<{ user: User; token: string }> => {
  const response = await api.post<APIResponse<{ user: User; token: string }>>('/auth/login', {
    email,
    password,
  });
  return response.data.data!;
};

export const registerApi = async (data: {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'USER' | 'ORGANIZER';
}): Promise<{ user: User; token: string }> => {
  const response = await api.post<APIResponse<{ user: User; token: string }>>('/auth/register', data);
  return response.data.data!;
};

export const getProfileApi = async (): Promise<User> => {
  const response = await api.get<APIResponse<User>>('/users/me');
  return response.data.data!;
};

export const updateProfileApi = async (data: {
  name?: string;
  phone?: string;
  email?: string;
}): Promise<User> => {
  const response = await api.put<APIResponse<User>>('/users/me', data);
  return response.data.data!;
};
