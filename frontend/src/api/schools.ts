import { api } from './client';
import type { School } from './types';

export function listSchools() {
  return api.get<School[]>('/schools');
}

export function getSchool(id: string) {
  return api.get<School>(`/schools/${id}`);
}

export interface SchoolInput {
  name: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  principal?: string;
}

export function createSchool(input: SchoolInput) {
  return api.post<School>('/schools', input);
}

export function updateSchool(id: string, input: Partial<SchoolInput>) {
  return api.put<School>(`/schools/${id}`, input);
}

export function deleteSchool(id: string) {
  return api.delete<School>(`/schools/${id}`);
}
