import { initials } from '../../utils/format';

/** Photo avatar with initials fallback. */
export default function Avatar({ src, name = '', size = 48 }) {
  const style = { width: size, height: size, fontSize: Math.round(size * 0.38) };
  return src ? (
    <img className="avatar" src={src} alt={name ? `${name}'s photo` : ''} style={style} loading="lazy" />
  ) : (
    <span className="avatar avatar--initials" style={style} aria-hidden={name ? undefined : true} aria-label={name ? `${name}` : undefined}>
      {initials(name)}
    </span>
  );
}
