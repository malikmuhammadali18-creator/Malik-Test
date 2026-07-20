import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { searchResources } from '../api/search';
import { listCategories, listGrades, listSubjects } from '../api/taxonomy';
import type { Category, Grade, Resource, Subject } from '../api/types';
import { RESOURCE_TYPES } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import logoUrl from '../assets/bait-ul-islam-logo.svg';

const CAN_CREATE_ROLES = ['Admin', 'SchoolAdmin', 'Teacher'];

interface ResourcesPageProps {
  defaultType?: string;
  pageTitle?: string;
  pageDescription?: string;
}

export function ResourcesPage({
  defaultType = '',
  pageTitle = 'Class resources',
  pageDescription = 'Browse your child’s syllabus, worksheets, and classroom materials in one secure place.',
}: ResourcesPageProps) {
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
  const [resourceType, setResourceType] = useState(defaultType);
  const [sortBy, setSortBy] = useState<'createdAt' | 'downloads' | 'views' | 'title'>('createdAt');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const greeting = user
    ? user.role === 'Teacher'
      ? `Welcome, ${user.firstName}.`
      : user.role === 'SchoolAdmin'
      ? 'Welcome, School Administration.'
      : user.role === 'Admin'
      ? 'Welcome, Admin.'
      : 'Welcome to Bait ul Islam School Portal.'
    : 'Welcome to Bait ul Islam School Portal.';

  const subGreeting = user
    ? user.role === 'Teacher'
      ? 'Share lesson plans, worksheets, and syllabus resources with parents and students.'
      : 'Manage school curriculum resources for teachers and parents.'
    : 'Access classroom resources, syllabus documents, and worksheets.';

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
        <div>
          <p className="section-kicker">Parent & Teacher Portal</p>
          <h1>School dashboard</h1>
          <p className="section-description">
            A single place for principals, teachers, and parents to access syllabus and worksheet materials.
          </p>
          <p className="hero-quote">ایک سکول سب کی طرح مگر سب سے جُدا۔</p>
          <div className="resource-welcome">
            <div>
              <h2>{greeting}</h2>
              <p>{subGreeting}</p>
            </div>
          </div>
        </div>
        {user && CAN_CREATE_ROLES.includes(user.role) && (
          <Link to="/resources/new" className="btn btn-sm">
            + New resource
          </Link>
        )}
      </div>

      <div className="dashboard-hero card">
        <div className="dashboard-hero__brand">
          <img className="dashboard-hero__logo" src={logoUrl} alt="Bait ul Islam School logo" />
          <div>
            <p className="section-kicker">Bait ul Islam School</p>
            <h2>Welcome to your curriculum hub</h2>
          </div>
        </div>
        <p>
          Keep syllabus materials, worksheets, and class resources organized for teachers,
          students, and parents. This dashboard helps you publish, review, and share school
          documents with one click.
        </p>
        <div className="stat-grid">
          <div className="stat-tile">
            <div className="stat-tile__value">{total}</div>
            <div className="stat-tile__label">Total resources</div>
          </div>
          <div className="stat-tile">
            <div className="stat-tile__value">{resources.filter((r) => r.resourceType === 'PDF').length}</div>
            <div className="stat-tile__label">Syllabus documents</div>
          </div>
          <div className="stat-tile">
            <div className="stat-tile__value">{resources.filter((r) => r.resourceType === 'Worksheet').length}</div>
            <div className="stat-tile__label">Worksheets</div>
          </div>
          <div className="stat-tile">
            <div className="stat-tile__value">{grades.length}</div>
            <div className="stat-tile__label">Supported grades</div>
          </div>
        </div>
      </div>

      <div className="dashboard-cards">
        <Link to="/syllabus" className="dashboard-card card">
          <h3>Syllabus library</h3>
          <p>Quick access to syllabus documents for each grade and subject.</p>
        </Link>
        <Link to="/worksheets" className="dashboard-card card">
          <h3>Worksheets</h3>
          <p>Download student worksheets and classroom practice material.</p>
        </Link>
        <Link to="/resources/new" className="dashboard-card card">
          <h3>Upload resources</h3>
          <p>Create and share new syllabus, worksheet, or class materials.</p>
        </Link>
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
