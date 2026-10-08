import AreaPicker from './AreaPicker';
import Icon from '../common/Icon';

/** Pick multiple service areas; shown as removable chips. value: [{ id, areaName, city, postalCode }] */
export default function AreaMultiSelect({ value = [], onChange, label = 'Service areas', max = 50 }) {
  const add = (area) => {
    if (!area || value.some((a) => a.id === area.id) || value.length >= max) return;
    onChange([...value, { id: area.id, areaName: area.areaName, city: area.city, postalCode: area.postalCode }]);
  };
  return (
    <div className="stack stack--sm">
      <AreaPicker key={value.length} label={label} value={null} onChange={add} excludeIds={value.map((a) => a.id)} placeholder="Search and add an area or postal code" />
      {value.length === 0 ? (
        <p className="muted small">No areas selected. Customers search by area, so add every area you serve.</p>
      ) : (
        <ul className="chip-row" aria-label="Selected service areas">
          {value.map((area) => (
            <li key={area.id} className="chip chip--removable">
              {area.areaName}, {area.city} · {area.postalCode}
              <button type="button" onClick={() => onChange(value.filter((a) => a.id !== area.id))} aria-label={`Remove ${area.areaName}`}>
                <Icon name="x" size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
