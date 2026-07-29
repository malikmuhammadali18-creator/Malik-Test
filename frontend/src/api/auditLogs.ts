import { api } from './client';
import type { AuditLogResult } from './types';

export interface AuditLogParams {
  userId?: string;
  action?: string;
  entityType?: string;
  skip?: number;
  take?: number;
}

export function listAuditLogs(params: AuditLogParams) {
  const qs = new URLSearchParams();
  if (params.userId) qs.set('userId', params.userId);
  if (params.action) qs.set('action', params.action);
  if (params.entityType) qs.set('entityType', params.entityType);
  qs.set('skip', String(params.skip ?? 0));
  qs.set('take', String(params.take ?? 50));
  return api.get<AuditLogResult>(`/audit-logs?${qs.toString()}`);
}
