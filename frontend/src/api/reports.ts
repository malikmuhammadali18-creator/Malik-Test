import { api } from './client';
import type { Resource, SchoolStatistics, SystemOverview } from './types';

export function getSystemOverview() {
  return api.get<SystemOverview>('/reports/overview');
}

export function getSchoolStats(schoolId: string) {
  return api.get<SchoolStatistics>(`/reports/schools/${schoolId}`);
}

export function getRecentUploads(days = 7, schoolId?: string) {
  const qs = new URLSearchParams({ days: String(days) });
  if (schoolId) qs.set('schoolId', schoolId);
  return api.get<Resource[]>(`/reports/recent-uploads?${qs.toString()}`);
}
