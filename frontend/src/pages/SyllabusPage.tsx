import { useEffect, useState } from 'react';
import { listGrades, listSubjects } from '../api/taxonomy';
import { searchResources } from '../api/search';
import { ApiError } from '../api/client';
import type { Grade, Subject, Resource } from '../api/types';

export function SyllabusPage() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [filterGrade, setFilterGrade] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([listSubjects(), listGrades()])
      .then(([subjectsList, gradesList]) => {
        setSubjects(subjectsList);
        setGrades(gradesList);
      })
      .catch(() => {
        /* ignore */
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    searchResources({
      gradeId: filterGrade || undefined,
      subjectId: filterSubject || undefined,
      resourceType: 'PDF',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      take: 50,
    })
      .then((result) => {
        setResources(result.data);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load syllabus resources'))
      .finally(() => setLoading(false));
  }, [filterGrade, filterSubject]);

  return (
    <div>
      <div className="section-header">
        <div>
          <p className="section-kicker">Syllabus</p>
          <h1>School syllabus library</h1>
          <p className="section-description">
            Access all syllabus documents by grade and subject for Bait ul Islam School.
          </p>
        </div>
      </div>

      <div className="filters-bar">
        <select value={filterGrade} onChange={(e) => setFilterGrade(e.target.value)}>
          <option value="">All grades</option>
          {grades.map((grade) => (
            <option key={grade.id} value={grade.id}>
              {grade.name}
            </option>
          ))}
        </select>
        <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}>
          <option value="">All subjects</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {loading ? (
        <p className="page-status">Loading syllabus...</p>
      ) : resources.length === 0 ? (
        <p className="page-status">No syllabus resources found.</p>
      ) : (
        <div className="resource-list">
          {resources.map((resource) => (
            <a key={resource.id} href={resource.file?.url ?? '#'} className="card resource-card" target="_blank" rel="noreferrer">
              <div>
                <h3>{resource.title}</h3>
                <p>{resource.description}</p>
                <div className="resource-card__meta">
                  {resource.subject && <span className="badge">{resource.subject.name}</span>}
                  {resource.grade && <span className="badge">{resource.grade.name}</span>}
                  <span className="badge">{resource.downloads} downloads</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
