import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Resets scroll on navigation (except when only the query string changes). */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
