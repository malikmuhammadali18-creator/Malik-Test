import { api } from './client';
import type { AuthUser } from './types';

export interface AuthResponse {
  access_token: string;
  user: AuthUser;
}

export function login(email: string, password: string) {
  return api.post<AuthResponse>('/auth/login', { email, password });
}

export function register(firstName: string, lastName: string, email: string, password: string) {
  return api.post<AuthResponse>('/auth/register', { firstName, lastName, email, password });
}
