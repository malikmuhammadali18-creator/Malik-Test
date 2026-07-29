import { useEffect, useState } from 'react';
import { listAuditLogs } from '../api/auditLogs';
import type { AuditLog } from '../api/types';
import { ApiError } from '../api/client';

export function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [action, setAction] = useState('');
  const [entityType, setEntityType] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    listAuditLogs({ action: action || undefined, entityType: entityType || undefined })
      .then((res) => {
        setLogs(res.data);
        setTotal(res.total);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load audit logs'))
      .finally(() => setLoading(false));
  }, [action, entityType]);

  return (
    <div>
      <h1>Audit Logs</h1>
      <div className="filters-bar">
        <input
          placeholder="Filter by action..."
          value={action}
          onChange={(e) => setAction(e.target.value)}
        />
        <input
          placeholder="Filter by entity type..."
          value={entityType}
          onChange={(e) => setEntityType(e.target.value)}
        />
      </div>
      {error && <div className="error-banner">{error}</div>}
      {loading ? (
        <p className="page-status">Loading...</p>
      ) : logs.length === 0 ? (
        <p className="page-status">No audit log entries found.</p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>Action</th>
                <th>Entity</th>
                <th>User</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{log.action}</td>
                  <td>
                    {log.entityType ?? '—'}
                    {log.entityId ? ` (${log.entityId.slice(0, 8)}...)` : ''}
                  </td>
                  <td>{log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'}</td>
                  <td>{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="page-status">{total} total entries</p>
        </>
      )}
    </div>
  );
}
