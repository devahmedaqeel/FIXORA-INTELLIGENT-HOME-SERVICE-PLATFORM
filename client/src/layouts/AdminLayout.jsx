import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';
import { useMetaRobots } from '../hooks/useMetaRobots';

/**
 * Independent shell for the admin portal. Deliberately separate from DashboardLayout (used
 * by customer/provider) — own sidebar, own header, no chatbot widget, no notification bell,
 * no bottom mobile tab bar. Route access is still enforced by ProtectedRoute + the server.
 */
export default function AdminLayout() {
  const [navOpen, setNavOpen] = useState(false);
  useMetaRobots();
  return (
    <div className="admin-shell">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <AdminSidebar open={navOpen} onClose={() => setNavOpen(false)} />
      <div className="admin-shell__content">
        <AdminHeader onMenu={() => setNavOpen(true)} />
        <main id="main" className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
