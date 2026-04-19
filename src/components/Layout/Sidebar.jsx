import { NavLink, useNavigate } from 'react-router-dom';
import { FiSearch, FiBell, FiCalendar, FiUser, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import StatusBadge from '../UI/StatusBadge';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { pendingCount } = useNotifications() || { pendingCount: 0 };
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark">🏠</div>
        <div className="brand-name">LeaseTogether</div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">User Portal</div>
        <NavLink to="/browse" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">
            <FiSearch />
          </span>
          Browse Community
        </NavLink>
        <NavLink to="/notifications" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">
            <FiBell />
          </span>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <span>Notifications</span>
            {pendingCount > 0 && (
              <span
                style={{
                  minWidth: 18,
                  height: 18,
                  padding: '0 6px',
                  borderRadius: 999,
                  background: '#D95F5F',
                  color: '#fff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {pendingCount}
              </span>
            )}
          </span>
        </NavLink>
        <NavLink to="/meetups" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">
            <FiCalendar />
          </span>
          My Meet-Ups
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">
            <FiUser />
          </span>
          My Profile
        </NavLink>
      </nav>

      <div style={{ padding: '16px 14px', borderTop: '1px solid var(--line)' }}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 6 }}>
            {user?.firstName} {user?.lastInitial}.
          </div>
          <StatusBadge isOpen={!!user?.isOpenToRoommate} />
        </div>
        {user?.role === 'admin' && (
          <button
            className="btn btn-ghost-accent btn-sm btn-full"
            style={{ marginBottom: 10 }}
            onClick={() => navigate('/admin')}
          >
            ⚙️ Admin Panel
          </button>
        )}
        <button className="btn btn-secondary btn-sm btn-full" onClick={onLogout}>
          <FiLogOut /> Logout
        </button>
      </div>
    </aside>
  );
}

