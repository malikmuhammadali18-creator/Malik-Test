import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import logoUrl from '../assets/bait-ul-islam-logo.svg';

export function Layout() {
  const { user, logout } = useAuth();

  return (
    <div>
      <nav className="app-nav">
        <div className="app-nav__brand-container">
          <img className="app-nav__logo" src={logoUrl} alt="Bait ul Islam School logo" />
          <div>
            <span className="app-nav__brand">Bait ul Islam School</span>
            <div className="app-nav__tagline">Parent & Teacher Resource Portal</div>
          </div>
        </div>
        <div className="app-nav__links">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : undefined)}>
            Dashboard
          </NavLink>
          <NavLink to="/syllabus" className={({ isActive }) => (isActive ? 'active' : undefined)}>
            Syllabus
          </NavLink>
          <NavLink to="/worksheets" className={({ isActive }) => (isActive ? 'active' : undefined)}>
            Worksheets
          </NavLink>
          <NavLink to="/schools" className={({ isActive }) => (isActive ? 'active' : undefined)}>
            Schools
          </NavLink>
          <NavLink to="/notifications" className={({ isActive }) => (isActive ? 'active' : undefined)}>
            Notifications
          </NavLink>
          {(user?.role === 'Admin' || user?.role === 'SchoolAdmin') && (
            <>
              <NavLink to="/reports" className={({ isActive }) => (isActive ? 'active' : undefined)}>
                Reports
              </NavLink>
              <NavLink to="/audit-logs" className={({ isActive }) => (isActive ? 'active' : undefined)}>
                Audit Logs
              </NavLink>
            </>
          )}
        </div>
        <div className="app-nav__user">
          <NavLink to="/profile">
            {user ? `${user.firstName} ${user.lastName} (${user.role})` : ''}
          </NavLink>
          <button className="btn btn-secondary btn-sm" onClick={logout}>
            Sign out
          </button>
        </div>
      </nav>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
