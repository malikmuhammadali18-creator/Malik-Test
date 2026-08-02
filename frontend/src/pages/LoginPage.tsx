import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await Promise.race([
        login(email, password),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Login timed out')), 10000)),
      ]);
      navigate('/');
    } catch (err) {
      const message = err instanceof Error && err.message === 'Login timed out'
        ? 'Login is taking too long. Please check the server connection and try again.'
        : err instanceof ApiError
          ? err.message
          : 'Login failed';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-shell">
      <h1>Bait ul Islam School Portal</h1>
      <p className="auth-subtitle">Sign in to manage syllabus, worksheets, and parent communications.</p>
      <p className="auth-urdu">ایک سکول سب کی طرح مگر سب سے جُدا۔</p>
      {error && <div className="error-banner">{error}</div>}
      <form onSubmit={handleSubmit} className="card">
        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button className="btn" type="submit" disabled={submitting}>
          {submitting ? 'Logging in...' : 'Log in'}
        </button>
      </form>
      <p>
        No account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}
