import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { searchResources } from '../api/search';
import { listCategories, listGrades, listSubjects } from '../api/taxonomy';
import type { Category, Grade, Resource, Subject } from '../api/types';
import { RESOURCE_TYPES } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';

const CAN_CREATE_ROLES = ['Admin', 'SchoolAdmin', 'Teacher'];

export function ResourcesPage() {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [total, setTotal] = useState(0);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [keyword, setKeyword] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [gradeId, setGradeId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [resourceType, setResourceType] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'downloads' | 'views' | 'title'>('createdAt');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([listSubjects(), listGrades(), listCategories()])
      .then(([s, g, c]) => {
        setSubjects(s);
        setGrades(g);
        setCategories(c);
      })
      .catch(() => {
        /* filters are optional; ignore taxonomy load failures */
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    searchResources({
      q: keyword || undefined,
      subjectId: subjectId || undefined,
      gradeId: gradeId || undefined,
      categoryId: categoryId || undefined,
      resourceType: resourceType || undefined,
      sortBy,
      sortOrder: 'desc',
    })
      .then((res) => {
        setResources(res.data);
        setTotal(res.total);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load resources'))
      .finally(() => setLoading(false));
  }, [keyword, subjectId, gradeId, categoryId, resourceType, sortBy]);

  return (
    <div>
      <div className="section-header">
        <h1>Resources</h1>
        {user && CAN_CREATE_ROLES.includes(user.role) && (
          <Link to="/resources/new" className="btn btn-sm">
            + New resource
          </Link>
        )}
      </div>

      <div className="filters-bar">
        <input
          placeholder="Search title or description..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
          <option value="">All subjects</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select value={gradeId} onChange={(e) => setGradeId(e.target.value)}>
          <option value="">All grades</option>
          {grades.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select value={resourceType} onChange={(e) => setResourceType(e.target.value)}>
          <option value="">All types</option>
          {RESOURCE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}>
          <option value="createdAt">Newest</option>
          <option value="downloads">Most downloaded</option>
          <option value="views">Most viewed</option>
          <option value="title">Title</option>
        </select>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {loading ? (
        <p className="page-status">Loading...</p>
      ) : resources.length === 0 ? (
        <p className="page-status">No resources found.</p>
      ) : (
        <div className="resource-list">
          {resources.map((r) => (
            <Link key={r.id} to={`/resources/${r.id}`} className="card resource-card">
              <div>
                <h3>{r.title}</h3>
                {r.description && <p>{r.description}</p>}
                <div className="resource-card__meta">
                  <span className="badge">{r.resourceType}</span>
                  {r.subject && <span className="badge">{r.subject.name}</span>}
                  {r.grade && <span className="badge">{r.grade.name}</span>}
                  <span className="badge">{r.views} views</span>
                  <span className="badge">{r.downloads} downloads</span>
                </div>
              </div>
            </Link>
          ))}
          <p className="page-status">{total} total result(s)</p>
        </div>
      )}
    </div>
  );
}
