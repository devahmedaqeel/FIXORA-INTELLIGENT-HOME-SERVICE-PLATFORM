import { Link } from 'react-router-dom';

export default function Logo({ to = '/', light = false }) {
  return (
    <Link to={to} className={`logo ${light ? 'logo--light' : ''}`} aria-label="Fixora home">
      <svg width="30" height="30" viewBox="0 0 64 64" aria-hidden="true">
        <rect width="64" height="64" rx="16" fill="currentColor" className="logo__mark" />
        <path d="M20 46V18h24v7H28v6h13v7H28v8z" fill="#fff" />
        <circle cx="46" cy="44" r="5" fill="#f2a541" />
      </svg>
      <span className="logo__text">Fixora</span>
    </Link>
  );
}
