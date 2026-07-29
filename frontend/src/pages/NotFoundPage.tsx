import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="page-status">
      <p>Page not found.</p>
      <Link to="/">Go back home</Link>
    </div>
  );
}
