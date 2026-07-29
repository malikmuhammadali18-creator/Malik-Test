import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteResource, getResource } from '../api/resources';
import type { Resource } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';

const CAN_MANAGE_ROLES = ['Admin', 'SchoolAdmin', 'Teacher'];

export function ResourceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resource, setResource] = useState<Resource | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getResource(id)
      .then(setResource)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load resource'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!id || !confirm('Delete this resource?')) return;
    setDeleting(true);
    try {
      await deleteResource(id);
      navigate('/');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete resource');
      setDeleting(false);
    }
  }

  if (loading) return <p className="page-status">Loading...</p>;
  if (error) return <div className="error-banner">{error}</div>;
  if (!resource) return null;

  const canManage = user && CAN_MANAGE_ROLES.includes(user.role);

  return (
    <div>
      <p>
        <Link to="/">&larr; Back to resources</Link>
      </p>
      <div className="card">
        <div className="section-header">
          <h1>{resource.title}</h1>
          {canManage && (
            <div className="btn-row">
              <Link to={`/resources/${resource.id}/edit`} className="btn btn-secondary btn-sm">
                Edit
              </Link>
              <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          )}
        </div>

        {resource.description && <p>{resource.description}</p>}

        <div className="resource-card__meta">
          <span className="badge">{resource.resourceType}</span>
          <span className="badge">{resource.visibility}</span>
          <span className="badge">{resource.status}</span>
          {resource.subject && <span className="badge">{resource.subject.name}</span>}
          {resource.grade && <span className="badge">{resource.grade.name}</span>}
          {resource.category && <span className="badge">{resource.category.name}</span>}
          {(resource.tags ?? []).map((t) => (
            <span key={t.id} className="badge">
              #{t.name}
            </span>
          ))}
        </div>

        <p style={{ marginTop: '1rem', color: 'var(--color-muted)', fontSize: '0.85rem' }}>
          {resource.views} views &middot; {resource.downloads} downloads
          {resource.uploader && (
            <>
              {' '}
              &middot; uploaded by {resource.uploader.firstName} {resource.uploader.lastName}
            </>
          )}
        </p>

        {resource.file && (
          <p>
            <a href={resource.file.url} target="_blank" rel="noreferrer">
              Download {resource.file.originalName}
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
