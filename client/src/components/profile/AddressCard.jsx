import Icon from '../common/Icon';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { ADDRESS_LABEL_OPTIONS } from '../../constants';

const labelText = (value) => ADDRESS_LABEL_OPTIONS.find((o) => o.value === value)?.label || 'Address';
const labelIcon = { home: 'home', work: 'briefcase', other: 'map-pin' };

/** One saved address with edit/delete/default actions. */
export default function AddressCard({ address, onEdit, onDelete }) {
  const line2 = [address.city, address.district, address.province].filter(Boolean).join(', ');
  return (
    <div className="card stack stack--sm">
      <div className="row row--between row--wrap">
        <p className="row strong">
          <Icon name={labelIcon[address.label] || 'map-pin'} size={16} />
          {labelText(address.label)}
          {address.isDefault && <Badge tone="success">Default</Badge>}
        </p>
        <div className="row">
          <Button variant="ghost" size="sm" icon="edit" onClick={() => onEdit(address)} aria-label={`Edit ${labelText(address.label)} address`} />
          <Button variant="ghost" size="sm" icon="trash" onClick={() => onDelete(address)} aria-label={`Delete ${labelText(address.label)} address`} />
        </div>
      </div>
      <p className="small">
        {[address.houseNumber, address.street].filter(Boolean).join(', ') || <span className="muted">No street details</span>}
      </p>
      <p className="muted small">
        {address.area}
        {line2 ? `, ${line2}` : ''}
        {address.postalCode ? ` · ${address.postalCode}` : ''}
      </p>
      {address.additionalDetails && <p className="muted small">{address.additionalDetails}</p>}
    </div>
  );
}
