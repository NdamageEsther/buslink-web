import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  agencyId?: string;
  agencyName?: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<{ token: string; user: User }> {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },
  async register(data: RegisterData): Promise<{ token: string; user: User }> {
    const res = await api.post('/auth/register', data);
    return res.data;
  },
  async getMe(): Promise<User> {
    const res = await api.get('/auth/me');
    return res.data;
  },
};