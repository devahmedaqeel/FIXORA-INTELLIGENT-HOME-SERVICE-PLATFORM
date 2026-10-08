import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import DashboardHeader from '../components/layout/DashboardHeader';
import MobileNavigation from '../components/layout/MobileNavigation';
import ChatbotWidget from '../components/chatbot/ChatbotWidget';

/** Shell for customer, provider and admin areas: sidebar, header, bottom nav (mobile), assistant. */
export default function DashboardLayout() {
  const [navOpen, setNavOpen] = useState(false);
  return (
    <div className="dash-shell">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />
      <div className="dash-shell__content">
        <DashboardHeader onMenu={() => setNavOpen(true)} />
        <main id="main" className="dash-main">
          <Outlet />
        </main>
      </div>
      <MobileNavigation onMore={() => setNavOpen(true)} />
      <ChatbotWidget />
    </div>
  );
}
