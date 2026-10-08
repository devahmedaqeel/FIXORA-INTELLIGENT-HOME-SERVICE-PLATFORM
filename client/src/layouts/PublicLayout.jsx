import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ChatbotWidget from '../components/chatbot/ChatbotWidget';

/** Public marketing/search pages. The assistant is shown on the home page. */
export default function PublicLayout() {
  const { pathname } = useLocation();
  return (
    <div className="public-shell">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Navbar />
      <main id="main" className="public-main">
        <Outlet />
      </main>
      <Footer />
      {pathname === '/' && <ChatbotWidget />}
    </div>
  );
}
