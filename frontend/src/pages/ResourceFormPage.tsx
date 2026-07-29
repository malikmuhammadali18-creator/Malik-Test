import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createResource, getResource, updateResource } from '../api/resources';
import { listCategories, listGrades, listSubjects } from '../api/taxonomy';
import type { Category, Grade, ResourceType, Subject } from '../api/types';
import { RESOURCE_TYPES, VISIBILITIES } from '../api/types';
import { ApiError } from '../api/client';

export function ResourceFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [resourceType, setResourceType] = useState(RESOURCE_TYPES[0]);
  const [visibility, setVisibility] = useState('SchoolOnly');
  const [subjectId, setSubjectId] = useState('');
  const [gradeId, setGradeId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
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
    if (!id) return;
    getResource(id)
      .then((r) => {
        setTitle(r.title);
        setDescription(r.description ?? '');
        setResourceType(r.resourceType);
        setVisibility(r.visibility);
        setSubjectId(r.subjectId ?? '');
        setGradeId(r.gradeId ?? '');
        setCategoryId(r.categoryId ?? '');
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load resource'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (isEdit && id) {
        await updateResource(id, {
          title,
          description: description || undefined,
          resourceType,
          visibility,
          subjectId: subjectId || undefined,
          gradeId: gradeId || undefined,
          categoryId: categoryId || undefined,
        });
        navigate(`/resources/${id}`);
      } else {
        const created = await createResource({
          title,
          description: description || undefined,
          resourceType,
          visibility,
          subjectId: subjectId || undefined,
          gradeId: gradeId || undefined,
          categoryId: categoryId || undefined,
          file,
        });
        navigate(`/resources/${created.id}`);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save resource');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="page-status">Loading...</p>;

  return (
    <div>
      <h1>{isEdit ? 'Edit resource' : 'New resource'}</h1>
      {error && <div className="error-banner">{error}</div>}
      <form onSubmit={handleSubmit} className="card">
        <div className="form-field">
          <label htmlFor="title">Title</label>
          <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="form-field">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="resourceType">Type</label>
            <select
              id="resourceType"
              value={resourceType}
              onChange={(e) => setResourceType(e.target.value as ResourceType)}
            >
              {RESOURCE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="visibility">Visibility</label>
            <select id="visibility" value={visibility} onChange={(e) => setVisibility(e.target.value)}>
              {VISIBILITIES.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="subjectId">Subject</label>
            <select id="subjectId" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
              <option value="">None</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="gradeId">Grade</label>
            <select id="gradeId" value={gradeId} onChange={(e) => setGradeId(e.target.value)}>
              <option value="">None</option>
              {grades.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="categoryId">Category</label>
            <select id="categoryId" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        {!isEdit && (
          <div className="form-field">
            <label htmlFor="file">Attachment (optional)</label>
            <input
              id="file"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
        )}
        <button className="btn" type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : isEdit ? 'Save changes' : 'Create resource'}
        </button>
      </form>
    </div>
  );
}
