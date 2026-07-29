import { api } from './client';
import type { Resource } from './types';

export function listResources(skip = 0, take = 20) {
  return api.get<Resource[]>(`/resources?skip=${skip}&take=${take}`);
}

export function getResource(id: string) {
  return api.get<Resource>(`/resources/${id}`);
}

export interface CreateResourceInput {
  title: string;
  description?: string;
  resourceType: string;
  visibility?: string;
  subjectId?: string;
  gradeId?: string;
  categoryId?: string;
  file?: File | null;
}

export function createResource(input: CreateResourceInput) {
  const formData = new FormData();
  formData.append('title', input.title);
  if (input.description) formData.append('description', input.description);
  formData.append('resourceType', input.resourceType);
  if (input.visibility) formData.append('visibility', input.visibility);
  if (input.subjectId) formData.append('subjectId', input.subjectId);
  if (input.gradeId) formData.append('gradeId', input.gradeId);
  if (input.categoryId) formData.append('categoryId', input.categoryId);
  if (input.file) formData.append('file', input.file);
  return api.postForm<Resource>('/resources', formData);
}

export interface UpdateResourceInput {
  title?: string;
  description?: string;
  resourceType?: string;
  visibility?: string;
  status?: string;
  subjectId?: string;
  gradeId?: string;
  categoryId?: string;
}

export function updateResource(id: string, input: UpdateResourceInput) {
  return api.put<Resource>(`/resources/${id}`, input);
}

export function deleteResource(id: string) {
  return api.delete<Resource>(`/resources/${id}`);
}
