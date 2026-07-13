import { api } from './client';
import type { Category, Grade, Subject, Tag } from './types';

export function listSubjects() {
  return api.get<Subject[]>('/subjects');
}

export function listGrades() {
  return api.get<Grade[]>('/grades');
}

export function listCategories() {
  return api.get<Category[]>('/categories');
}

export function listTags() {
  return api.get<Tag[]>('/tags');
}
