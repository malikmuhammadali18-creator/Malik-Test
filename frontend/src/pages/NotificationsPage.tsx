import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listNotifications, broadcastSms, markAllAsRead, markAsRead } from '../api/notifications';
import type { Notification } from '../api/types';
import { ApiError } from '../api/client';

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recipientNumbers, setRecipientNumbers] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastStatus, setBroadcastStatus] = useState<string | null>(null);

  function load() {
    setLoading(true);
    listNotifications()
      .then(setNotifications)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load notifications'))
      .finally(() => setLoading(false));
  }

  const navigate = useNavigate();

  useEffect(load, []);

  function handleRefreshPage() {
    window.location.reload();
  }

  function handleGoHome() {
    navigate('/');
  }

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

  async function handleSendBulkSms() {
    setError(null);
    setBroadcastStatus(null);

    const numbers = recipientNumbers
      .split(/[\s,;]+/)
      .map((value) => value.trim())
      .filter(Boolean);

    if (numbers.length === 0) {
      setBroadcastStatus('Enter at least one phone number to send the message.');
      return;
    }

    if (!broadcastMessage.trim()) {
      setBroadcastStatus('Enter a message before sending.');
      return;
    }

    try {
      const result = await broadcastSms(numbers, broadcastMessage.trim());
      setBroadcastStatus(`Broadcast request sent. SMS queued for ${result.sent} numbers.`);
      setRecipientNumbers('');
      setBroadcastMessage('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to send SMS broadcast.');
    }
  }

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div>
      <div className="section-header">
        <div>
          <h1>Notifications</h1>
        </div>
        <div className="btn-row">
          <button className="btn btn-secondary btn-sm" type="button" onClick={handleRefreshPage}>
            Refresh
          </button>
          <button className="btn btn-secondary btn-sm" type="button" onClick={handleGoHome}>
            Home
          </button>
          {hasUnread && (
            <button className="btn btn-secondary btn-sm" onClick={handleMarkAllRead}>
              Mark all as read
            </button>
          )}
        </div>
      </div>
      {error && <div className="error-banner">{error}</div>}

      <div className="card broadcast-card">
        <div className="broadcast-card__header">
          <div>
            <p className="section-kicker">Priority broadcast</p>
            <h2>Send bulk SMS</h2>
            <p className="section-description">
              Notify parents and teachers immediately using a bulk SMS broadcast. Enter phone numbers separated by commas, spaces, or semicolons.
            </p>
          </div>
        </div>
        <div className="form-field">
          <label htmlFor="recipientNumbers">Phone numbers</label>
          <textarea
            id="recipientNumbers"
            rows={3}
            value={recipientNumbers}
            onChange={(e) => setRecipientNumbers(e.target.value)}
            placeholder="0300xxxxxxx, 0312xxxxxxx, 0321xxxxxxx"
          />
        </div>
        <div className="form-field">
          <label htmlFor="broadcastMessage">Message</label>
          <textarea
            id="broadcastMessage"
            rows={4}
            value={broadcastMessage}
            onChange={(e) => setBroadcastMessage(e.target.value)}
            placeholder="Enter the message to send to all numbers"
          />
        </div>
        <button className="btn" type="button" onClick={handleSendBulkSms}>
          Send message to all numbers
        </button>
        {broadcastStatus && <p className="page-status">{broadcastStatus}</p>}
      </div>

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
