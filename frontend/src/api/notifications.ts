import { api } from './client';
import type { Notification } from './types';

export function listNotifications() {
  return api.get<Notification[]>('/notifications');
}

export function markAsRead(id: string) {
  return api.put<Notification>(`/notifications/${id}/read`);
}

export function markAllAsRead() {
  return api.put<{ count: number }>('/notifications/read-all');
}
