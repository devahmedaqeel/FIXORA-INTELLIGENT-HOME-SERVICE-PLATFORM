import { useId, useState } from 'react';

/**
 * Single-series bar chart (SVG, no dependencies).
 *   data: [{ label, value }] · formatValue(v) for tooltip/axis
 * Accessible: the figure has a title, every bar is focusable with a tooltip, and an
 * equivalent data table is rendered for screen readers.
 */
export default function BarChart({ title, data = [], formatValue = (v) => String(v), height = 200 }) {
  const id = useId();
  const [active, setActive] = useState(null);
  const width = 600;
  const pad = { top: 16, right: 8, bottom: 28, left: 8 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const max = Math.max(...data.map((d) => d.value), 0);
  const niceMax = max === 0 ? 1 : max * 1.15;
  const slot = innerW / Math.max(data.length, 1);
  const barW = Math.min(44, slot - 2 * Math.max(slot * 0.18, 2));
  const gridLines = [0.25, 0.5, 0.75, 1];

  return (
    <figure className="chart" aria-labelledby={`${id}-title`}>
      <figcaption id={`${id}-title`} className="chart__title">
        {title}
      </figcaption>
      <div className="chart__plot">
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img" aria-label={title}>
          {gridLines.map((g) => (
            <line key={g} className="chart__grid" x1={pad.left} x2={width - pad.right} y1={pad.top + innerH * (1 - g)} y2={pad.top + innerH * (1 - g)} />
          ))}
          <line className="chart__axis" x1={pad.left} x2={width - pad.right} y1={pad.top + innerH} y2={pad.top + innerH} />
          {data.map((d, i) => {
            const h = Math.max((d.value / niceMax) * innerH, d.value > 0 ? 2 : 0);
            const x = pad.left + slot * i + (slot - barW) / 2;
            const y = pad.top + innerH - h;
            const r = Math.min(4, barW / 2, h);
            // Rounded data-end, square baseline.
            const path = h
              ? `M${x},${pad.top + innerH} V${y + r} Q${x},${y} ${x + r},${y} H${x + barW - r} Q${x + barW},${y} ${x + barW},${y + r} V${pad.top + innerH} Z`
              : '';
            return (
              <g
                key={d.label}
                tabIndex={0}
                className={`chart__bar-group ${active === i ? 'is-active' : ''}`}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                aria-label={`${d.label}: ${formatValue(d.value)}`}
              >
                <rect className="chart__hit" x={pad.left + slot * i} y={pad.top} width={slot} height={innerH} />
                {path && <path className="chart__bar" d={path} />}
                <text className="chart__label" x={x + barW / 2} y={height - 8} textAnchor="middle">
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>
        {active !== null && data[active] && (
          <div className="chart__tooltip" style={{ left: `${((pad.left + slot * active + slot / 2) / width) * 100}%` }} role="status">
            <span className="chart__tooltip-label">{data[active].label}</span>
            <strong>{formatValue(data[active].value)}</strong>
          </div>
        )}
      </div>
      <table className="sr-only">
        <caption>{title}</caption>
        <tbody>
          {data.map((d) => (
            <tr key={d.label}>
              <th scope="row">{d.label}</th>
              <td>{formatValue(d.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
