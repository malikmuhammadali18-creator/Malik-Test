import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function Layout() {
  const { user, logout } = useAuth();

  return (
    <div>
      <nav className="app-nav">
        <span className="app-nav__brand">EduResource</span>
        <div className="app-nav__links">
          <NavLink to="/" end>
            Resources
          </NavLink>
          <NavLink to="/schools">Schools</NavLink>
          <NavLink to="/notifications">Notifications</NavLink>
          {(user?.role === 'Admin' || user?.role === 'SchoolAdmin') && (
            <>
              <NavLink to="/reports">Reports</NavLink>
              <NavLink to="/audit-logs">Audit Logs</NavLink>
            </>
          )}
        </div>
        <div className="app-nav__user">
          <NavLink to="/profile">
            {user ? `${user.firstName} ${user.lastName} (${user.role})` : ''}
          </NavLink>
          <button className="btn btn-secondary btn-sm" onClick={logout}>
            Log out
          </button>
        </div>
      </nav>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
