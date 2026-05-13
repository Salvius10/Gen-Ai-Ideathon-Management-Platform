import api from './client';
import { User } from '../types';

export interface AuthResponse {
  token: string;
  user: User;
}

export const authApi = {
  register: (data: { username: string; email: string; password: string }) =>
    api.post<AuthResponse>('/auth/register', data).then((r) => r.data),

  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data).then((r) => r.data),

  me: () => api.get<User>('/auth/me').then((r) => r.data),
};
