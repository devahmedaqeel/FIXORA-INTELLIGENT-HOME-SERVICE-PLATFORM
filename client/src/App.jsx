import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './features/auth/auth.context';
import { ToastProvider } from './context/ToastContext';
import AppRoutes from './routes/AppRoutes';
import ScrollToTop from './routes/ScrollToTop';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <ScrollToTop />
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
