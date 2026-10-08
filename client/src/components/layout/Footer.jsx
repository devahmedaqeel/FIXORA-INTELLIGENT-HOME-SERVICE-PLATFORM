import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <Logo light />
          <p>Verified home-service professionals across the UK — booked in minutes, by area or postcode.</p>
        </div>
        <nav aria-label="Customers">
          <h2 className="footer__heading">Customers</h2>
          <ul>
            <li><Link to="/services">Browse services</Link></li>
            <li><Link to="/search">Find a provider</Link></li>
            <li><Link to="/register">Create an account</Link></li>
          </ul>
        </nav>
        <nav aria-label="Providers">
          <h2 className="footer__heading">Providers</h2>
          <ul>
            <li><Link to="/register?role=provider">Join as a provider</Link></li>
            <li><Link to="/about">How verification works</Link></li>
            <li><Link to="/login">Provider sign in</Link></li>
          </ul>
        </nav>
        <nav aria-label="Company">
          <h2 className="footer__heading">Fixora</h2>
          <ul>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/contact">Contact & support</Link></li>
            <li><Link to="/terms">Terms of service</Link></li>
            <li><Link to="/privacy">Privacy policy</Link></li>
          </ul>
        </nav>
      </div>
      <div className="container footer__bottom">
        <p>© {year} Fixora. Made for homes across the UK.</p>
      </div>
    </footer>
  );
}
