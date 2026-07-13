import { useEffect, useState } from 'react';
import { getSchoolStats, getSystemOverview } from '../api/reports';
import { listSchools } from '../api/schools';
import { getMe } from '../api/users';
import type { School, SchoolStatistics, SystemOverview } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';

export function ReportsPage() {
  const { user } = useAuth();
  const [overview, setOverview] = useState<SystemOverview | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [schoolStats, setSchoolStats] = useState<SchoolStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        if (user?.role === 'Admin') {
          const [ov, schoolList] = await Promise.all([getSystemOverview(), listSchools()]);
          setOverview(ov);
          setSchools(schoolList);
        } else if (user?.role === 'SchoolAdmin') {
          const me = await getMe();
          if (me.schoolId) {
            setSelectedSchoolId(me.schoolId);
            setSchoolStats(await getSchoolStats(me.schoolId));
          }
        }
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Failed to load reports');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  async function handleSelectSchool(id: string) {
    setSelectedSchoolId(id);
    if (!id) {
      setSchoolStats(null);
      return;
    }
    try {
      setSchoolStats(await getSchoolStats(id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load school stats');
    }
  }

  if (loading) return <p className="page-status">Loading...</p>;

  return (
    <div>
      <h1>Reports</h1>
      {error && <div className="error-banner">{error}</div>}

      {overview && (
        <div className="stat-grid">
          <div className="stat-tile">
            <div className="stat-tile__value">{overview.totalSchools}</div>
            <div className="stat-tile__label">Schools</div>
          </div>
          <div className="stat-tile">
            <div className="stat-tile__value">{overview.totalUsers}</div>
            <div className="stat-tile__label">Users</div>
          </div>
          <div className="stat-tile">
            <div className="stat-tile__value">{overview.totalResources}</div>
            <div className="stat-tile__label">Resources</div>
          </div>
          <div className="stat-tile">
            <div className="stat-tile__value">{overview.totalDownloads}</div>
            <div className="stat-tile__label">Downloads</div>
          </div>
          <div className="stat-tile">
            <div className="stat-tile__value">{overview.totalViews}</div>
            <div className="stat-tile__label">Views</div>
          </div>
        </div>
      )}

      {user?.role === 'Admin' && (
        <div className="form-field" style={{ maxWidth: 300 }}>
          <label>View stats for a school</label>
          <select value={selectedSchoolId} onChange={(e) => handleSelectSchool(e.target.value)}>
            <option value="">Select a school</option>
            {schools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {schoolStats && (
        <>
          <div className="stat-grid">
            <div className="stat-tile">
              <div className="stat-tile__value">{schoolStats.resourceCount}</div>
              <div className="stat-tile__label">Resources</div>
            </div>
            <div className="stat-tile">
              <div className="stat-tile__value">{schoolStats.totalDownloads}</div>
              <div className="stat-tile__label">Downloads</div>
            </div>
            <div className="stat-tile">
              <div className="stat-tile__value">{schoolStats.totalViews}</div>
              <div className="stat-tile__label">Views</div>
            </div>
            <div className="stat-tile">
              <div className="stat-tile__value">{schoolStats.activeTeachers}</div>
              <div className="stat-tile__label">Active teachers</div>
            </div>
          </div>

          <h3>Recent uploads</h3>
          {schoolStats.recentUploads.length === 0 ? (
            <p className="page-status">No recent uploads.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Uploaded by</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {schoolStats.recentUploads.map((r) => (
                  <tr key={r.id}>
                    <td>{r.title}</td>
                    <td>
                      {r.uploader ? `${r.uploader.firstName} ${r.uploader.lastName}` : '—'}
                    </td>
                    <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}
