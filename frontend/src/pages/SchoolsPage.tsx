import { useEffect, useState, type FormEvent } from 'react';
import { createSchool, deleteSchool, listSchools, updateSchool } from '../api/schools';
import type { School } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';

const emptyForm = { name: '', address: '', city: '', country: '' };

export function SchoolsPage() {
  const { user } = useAuth();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState(emptyForm);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);

  const canCreate = user?.role === 'Admin';
  const canEdit = user?.role === 'Admin' || user?.role === 'SchoolAdmin';
  const canDelete = user?.role === 'Admin';

  function load() {
    setLoading(true);
    listSchools()
      .then(setSchools)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load schools'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setCreating(true);
    try {
      await createSchool(createForm);
      setCreateForm(emptyForm);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create school');
    } finally {
      setCreating(false);
    }
  }

  function startEdit(school: School) {
    setEditingId(school.id);
    setEditForm({
      name: school.name,
      address: school.address ?? '',
      city: school.city ?? '',
      country: school.country ?? '',
    });
  }

  async function handleUpdate(e: FormEvent, id: string) {
    e.preventDefault();
    setError(null);
    try {
      await updateSchool(id, editForm);
      setEditingId(null);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update school');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this school?')) return;
    try {
      await deleteSchool(id);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete school');
    }
  }

  return (
    <div>
      <h1>Schools</h1>
      {error && <div className="error-banner">{error}</div>}

      {canCreate && (
        <form onSubmit={handleCreate} className="card">
          <h3 style={{ marginTop: 0 }}>Add a school</h3>
          <div className="form-row">
            <div className="form-field">
              <label>Name</label>
              <input
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                required
              />
            </div>
            <div className="form-field">
              <label>City</label>
              <input
                value={createForm.city}
                onChange={(e) => setCreateForm({ ...createForm, city: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label>Country</label>
              <input
                value={createForm.country}
                onChange={(e) => setCreateForm({ ...createForm, country: e.target.value })}
              />
            </div>
          </div>
          <button className="btn btn-sm" type="submit" disabled={creating}>
            {creating ? 'Adding...' : 'Add school'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="page-status">Loading...</p>
      ) : schools.length === 0 ? (
        <p className="page-status">No schools yet.</p>
      ) : (
        schools.map((school) =>
          editingId === school.id ? (
            <form key={school.id} onSubmit={(e) => handleUpdate(e, school.id)} className="card">
              <div className="form-row">
                <div className="form-field">
                  <label>Name</label>
                  <input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>City</label>
                  <input
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label>Country</label>
                  <input
                    value={editForm.country}
                    onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                  />
                </div>
              </div>
              <div className="btn-row">
                <button className="btn btn-sm" type="submit">
                  Save
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  type="button"
                  onClick={() => setEditingId(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div key={school.id} className="card resource-card">
              <div>
                <h3>{school.name}</h3>
                <p className="resource-card__meta">
                  {[school.city, school.country].filter(Boolean).join(', ') || 'No location set'}
                </p>
              </div>
              <div className="btn-row">
                {canEdit && (
                  <button className="btn btn-secondary btn-sm" onClick={() => startEdit(school)}>
                    Edit
                  </button>
                )}
                {canDelete && (
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(school.id)}>
                    Delete
                  </button>
                )}
              </div>
            </div>
          ),
        )
      )}
    </div>
  );
}
