import { useEffect, useState } from 'react';
import { listNotifications, markAllAsRead, markAsRead } from '../api/notifications';
import type { Notification } from '../api/types';
import { ApiError } from '../api/client';

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    listNotifications()
      .then(setNotifications)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load notifications'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleMarkRead(id: string) {
    try {
      await markAsRead(id);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update notification');
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllAsRead();
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update notifications');
    }
  }

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div>
      <div className="section-header">
        <h1>Notifications</h1>
        {hasUnread && (
          <button className="btn btn-secondary btn-sm" onClick={handleMarkAllRead}>
            Mark all as read
          </button>
        )}
      </div>
      {error && <div className="error-banner">{error}</div>}
      {loading ? (
        <p className="page-status">Loading...</p>
      ) : notifications.length === 0 ? (
        <p className="page-status">No notifications.</p>
      ) : (
        <div className="card">
          {notifications.map((n) => (
            <div key={n.id} className={`notification-item ${n.read ? '' : 'unread'}`}>
              <span>{n.message}</span>
              {!n.read && (
                <button className="btn btn-secondary btn-sm" onClick={() => handleMarkRead(n.id)}>
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
