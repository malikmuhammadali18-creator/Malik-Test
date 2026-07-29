import { api } from './client';
import type { User } from './types';

export function getMe() {
  return api.get<User>('/users/me');
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

export function updateUser(id: string, input: UpdateUserInput) {
  return api.put<User>(`/users/${id}`, input);
}
