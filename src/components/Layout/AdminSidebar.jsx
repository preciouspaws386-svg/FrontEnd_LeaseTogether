import { NavLink, useNavigate } from 'react-router-dom';
import { FiGrid, FiHome, FiUsers, FiCalendar, FiLogOut, FiKey, FiBookOpen, FiClipboard, FiMail } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

export default function AdminSidebar({ mobileOpen, onNavigate }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleNav = () => {
    onNavigate?.();
  };

  return (
    <aside className={`sidebar${mobileOpen ? ' open' : ''}`}>
      <div className="sidebar-brand">
        <div className="brand-mark">⚙️</div>
        <div className="brand-name">Admin Panel</div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Admin</div>
        <NavLink to="/admin" end onClick={handleNav} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">
            <FiGrid />
          </span>
          Dashboard
        </NavLink>
        <NavLink to="/admin/apartments" onClick={handleNav} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">
            <FiHome />
          </span>
          Apartments
        </NavLink>
        <NavLink to="/admin/users" onClick={handleNav} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">
            <FiUsers />
          </span>
          Users
        </NavLink>
        <NavLink to="/admin/meetups" onClick={handleNav} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">
            <FiCalendar />
          </span>
          Meet-Ups
        </NavLink>
        <NavLink to="/admin/access-codes" onClick={handleNav} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">
            <FiKey />
          </span>
          Access Codes
        </NavLink>
        <NavLink to="/admin/schools" onClick={handleNav} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">
            <FiBookOpen />
          </span>
          Schools
        </NavLink>
        <NavLink to="/admin/school-requests" onClick={handleNav} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">
            <FiMail />
          </span>
          School Requests
        </NavLink>
        <NavLink to="/admin/listings" onClick={handleNav} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
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
