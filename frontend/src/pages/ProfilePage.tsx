import { useEffect, useState, type FormEvent } from 'react';
import { getMe, updateUser } from '../api/users';
import type { User } from '../api/types';
import { ApiError } from '../api/client';

export function ProfilePage() {
  const [me, setMe] = useState<User | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getMe()
      .then((u) => {
        setMe(u);
        setFirstName(u.firstName);
        setLastName(u.lastName);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!me) return;
    setError(null);
    setSuccess(false);
    setSaving(true);
    try {
      const updated = await updateUser(me.id, { firstName, lastName });
      setMe(updated);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="page-status">Loading...</p>;
  if (!me) return <div className="error-banner">{error}</div>;

  return (
    <div className="auth-shell">
      <h1>My profile</h1>
      {error && <div className="error-banner">{error}</div>}
      <form onSubmit={handleSubmit} className="card">
        <div className="form-field">
          <label>Email</label>
          <input value={me.email} disabled />
        </div>
        <div className="form-field">
          <label>Role</label>
          <input value={me.role} disabled />
        </div>
        <div className="form-field">
          <label htmlFor="firstName">First name</label>
          <input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </div>
        <div className="form-field">
          <label htmlFor="lastName">Last name</label>
          <input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
        <button className="btn" type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save changes'}
        </button>
        {success && <p style={{ color: 'green', fontSize: '0.85rem' }}>Saved.</p>}
      </form>
    </div>
  );
}
