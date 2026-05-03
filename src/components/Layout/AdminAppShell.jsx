import { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import TopBar from './TopBar';

export default function AdminAppShell({ title, topRight, children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className={`app-layout admin-app-shell${menuOpen ? ' admin-app-shell--menu-open' : ''}`}>
      <div
        className="sidebar-backdrop"
        aria-hidden={!menuOpen}
        onClick={() => setMenuOpen(false)}
      />
      <AdminSidebar mobileOpen={menuOpen} onNavigate={() => setMenuOpen(false)} />
      <div className="main-content">
        <TopBar title={title} onMenuClick={() => setMenuOpen(true)}>
          {topRight}
        </TopBar>
        <div className="page-body admin-page-body-mobile">{children}</div>
      </div>
    </div>
  );
}
