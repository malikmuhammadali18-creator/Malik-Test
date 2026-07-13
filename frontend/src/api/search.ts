import { api } from './client';
import type { SearchResult } from './types';

export interface SearchParams {
  q?: string;
  subjectId?: string;
  gradeId?: string;
  categoryId?: string;
  resourceType?: string;
  tags?: string[];
  sortBy?: 'createdAt' | 'downloads' | 'views' | 'title';
  sortOrder?: 'asc' | 'desc';
  skip?: number;
  take?: number;
}

export function searchResources(params: SearchParams) {
  const qs = new URLSearchParams();
  if (params.q) qs.set('q', params.q);
  if (params.subjectId) qs.set('subjectId', params.subjectId);
  if (params.gradeId) qs.set('gradeId', params.gradeId);
  if (params.categoryId) qs.set('categoryId', params.categoryId);
  if (params.resourceType) qs.set('resourceType', params.resourceType);
  if (params.tags && params.tags.length > 0) qs.set('tags', params.tags.join(','));
  if (params.sortBy) qs.set('sortBy', params.sortBy);
  if (params.sortOrder) qs.set('sortOrder', params.sortOrder);
  qs.set('skip', String(params.skip ?? 0));
  qs.set('take', String(params.take ?? 20));
  return api.get<SearchResult>(`/search?${qs.toString()}`);
}
