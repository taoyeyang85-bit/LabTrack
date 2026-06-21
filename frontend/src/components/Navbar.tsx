import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        <Link to={user ? '/dashboard' : '/'} className="navbar-brand">
          LabTrack
        </Link>
        <div className="navbar-links">
          {user ? (
            <>
              <Link to="/upload" className={isActive('/upload') ? 'active' : ''}>
                Upload
              </Link>
              <button type="button" className="btn-link" onClick={handleLogout}>
                Sign out
              </button>
            </>
          ) : (
            <Link to="/auth" className="btn btn-primary btn-sm">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
