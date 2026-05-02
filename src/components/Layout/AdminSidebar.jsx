import { NavLink, useNavigate } from 'react-router-dom';
import { FiGrid, FiHome, FiUsers, FiCalendar, FiLogOut, FiKey, FiBookOpen, FiClipboard, FiMail } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

export default function AdminSidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark">⚙️</div>
        <div className="brand-name">Admin Panel</div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Admin</div>
        <NavLink to="/admin" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">
            <FiGrid />
          </span>
          Dashboard
        </NavLink>
        <NavLink to="/admin/apartments" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">
            <FiHome />
          </span>
          Apartments
        </NavLink>
        <NavLink to="/admin/users" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">
            <FiUsers />
          </span>
          Users
        </NavLink>
        <NavLink to="/admin/meetups" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">
            <FiCalendar />
          </span>
          Meet-Ups
        </NavLink>
        <NavLink to="/admin/access-codes" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">
            <FiKey />
          </span>
          Access Codes
        </NavLink>
        <NavLink to="/admin/schools" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">
            <FiBookOpen />
          </span>
          Schools
        </NavLink>
        <NavLink to="/admin/school-requests" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">
            <FiMail />
          </span>
          School Requests
        </NavLink>
        <NavLink to="/admin/listings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">
            <FiClipboard />
          </span>
          Listings
        </NavLink>
      </nav>

      <div style={{ padding: '16px 14px', borderTop: '1px solid var(--line)' }}>
        <button className="btn btn-secondary btn-sm btn-full" onClick={onLogout}>
          <FiLogOut /> Logout
        </button>
      </div>
    </aside>
  );
}

