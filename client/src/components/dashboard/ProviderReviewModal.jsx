import { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Loader from '../common/Loader';
import ErrorMessage from '../common/ErrorMessage';
import Avatar from '../common/Avatar';
import Icon from '../common/Icon';
import ProviderVerificationBadge from '../providers/ProviderVerificationBadge';
import WeeklySchedule from '../providers/WeeklySchedule';
import { getProviderDetail, setProviderVerification } from '../../services/admin.service';
import { profileChecklist } from '../../features/providers/provider.utils';
import { formatDate, formatPrice } from '../../utils/format';
import { useToast } from '../../context/ToastContext';

/** Full provider dossier for admins with approve / reject / suspend actions (BR-8). */
export default function ProviderReviewModal({ providerId, onClose, onUpdated }) {
  const toast = useToast();
  const [state, setState] = useState({ loading: true, data: null, error: null });
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState('');

  useEffect(() => {
    if (!providerId) return;
    setNote('');
    setState({ loading: true, data: null, error: null });
    getProviderDetail(providerId)
      .then((data) => setState({ loading: false, data, error: null }))
      .catch((error) => setState({ loading: false, data: null, error }));
  }, [providerId]);

  const act = async (status) => {
    if (status === 'rejected' && !note.trim()) {
      toast.error('Add a note explaining why the provider was rejected');
      return;
    }
    setBusy(status);
    try {
      const updated = await setProviderVerification(providerId, status, note.trim());
      toast.success(`Provider ${status}`);
      onUpdated?.(updated);
      onClose();
    } catch (err) {
      toast.error(err);
    } finally {
      setBusy('');
    }
  };

  const d = state.data;
  const p = d?.provider;

  return (
    <Modal
      open={Boolean(providerId)}
      onClose={onClose}
      title="Review provider"
      size="lg"
      footer={
        p && (
          <>
            {p.verificationStatus !== 'suspended' && (
              <Button variant="ghost" onClick={() => act('suspended')} loading={busy === 'suspended'}>
                Suspend
              </Button>
            )}
            {p.verificationStatus !== 'rejected' && (
              <Button variant="danger" onClick={() => act('rejected')} loading={busy === 'rejected'}>
                Reject
              </Button>
            )}
            {p.verificationStatus !== 'verified' && (
              <Button onClick={() => act('verified')} loading={busy === 'verified'} icon="shield">
                Approve
              </Button>
            )}
          </>
        )
      }
    >
      {state.loading && <Loader />}
      <ErrorMessage error={state.error} />
      {p && (
        <div className="stack stack--lg">
          <div className="row row--center">
            <Avatar src={p.photoURL} name={p.displayName} size={64} />
            <div>
              <h3>{p.businessName || p.displayName}</h3>
              <p className="muted small">
                {d.user?.email} · {p.phone || 'no phone'} · joined {formatDate(p.createdAt)}
              </p>
              <ProviderVerificationBadge status={p.verificationStatus} />
            </div>
          </div>
          {p.verificationNote && <p className="notice notice--info">Previous note: {p.verificationNote}</p>}
          <ul className="checklist">
            {profileChecklist(p, d.services.filter((s) => s.active).length).map((item) => (
              <li key={item.label} className={item.done ? 'is-done' : ''}>
                <Icon name={item.done ? 'check-circle' : 'x'} size={16} /> {item.label}
              </li>
            ))}
          </ul>
          {p.bio && <p className="prewrap">{p.bio}</p>}
          <div className="form-grid">
            <div>
              <h4>Service areas</h4>
              <p className="small">{(p.serviceAreas || []).map((a) => `${a.areaName}, ${a.city} (${a.postalCode})`).join(' · ') || '—'}</p>
            </div>
            <div>
              <h4>Bookings</h4>
              <p className="small">
                {d.bookingStats.total} total · {d.bookingStats.completed} completed · {d.bookingStats.cancelled} cancelled
              </p>
            </div>
          </div>
          <div>
            <h4>Services</h4>
            {d.services.length === 0 ? (
              <p className="muted small">No services added.</p>
            ) : (
              <ul className="simple-list">
                {d.services.map((s) => (
                  <li key={s.id} className="simple-list__item">
                    <span>
                      {s.title} <span className="muted small">· {s.categoryName}</span>
                    </span>
                    <span>{formatPrice(s.price, s.pricingType)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h4>Verification documents</h4>
            {(p.verificationDocuments || []).length === 0 ? (
              <p className="muted small">None uploaded.</p>
            ) : (
              <ul className="simple-list">
                {p.verificationDocuments.map((doc) => (
                  <li key={doc.url}>
                    <a href={doc.url} target="_blank" rel="noreferrer" className="row">
                      <Icon name="file" size={16} /> {doc.name}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <details>
            <summary>Working hours</summary>
            <WeeklySchedule weekly={d.availability?.weekly} />
          </details>
          <Input as="textarea" rows={3} label="Note to provider (required when rejecting)" value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} />
        </div>
      )}
    </Modal>
  );
}
