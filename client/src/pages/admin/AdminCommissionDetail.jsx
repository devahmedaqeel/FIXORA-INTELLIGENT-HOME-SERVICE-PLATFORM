import { useState } from 'react';
import { useParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Icon from '../../components/common/Icon';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../context/ToastContext';
import { getCommissionDetail, verifyCommission, rejectCommission, recordPartialPayment, waiveCommission } from '../../services/finance.service';
import { COMMISSION_STATUS_LABELS, COMMISSION_STATUS_TONES } from '../../constants';
import { formatDate, formatDateTime, formatGBP } from '../../utils/format';

export default function AdminCommissionDetail() {
  useDocumentTitle('Commission');
  const { id } = useParams();
  const toast = useToast();
  const { data, loading, error, setData } = useAsync(() => getCommissionDetail(id), [id]);
  const [dialog, setDialog] = useState(null); // 'reject' | 'partial' | 'waive' | 'verify'
  const [note, setNote] = useState('');
  const [amountGBP, setAmountGBP] = useState('');
  const [busy, setBusy] = useState(false);

  if (loading) return <Loader />;
  if (error) return <ErrorMessage error={error} />;
  const { commission, timeline } = data;

  const closeDialog = () => {
    setDialog(null);
    setNote('');
    setAmountGBP('');
  };

  const applyUpdate = (updated) => setData((d) => ({ ...d, commission: updated }));

  const act = async (fn, successMessage) => {
    setBusy(true);
    try {
      const updated = await fn();
      applyUpdate(updated);
      toast.success(successMessage);
      closeDialog();
    } catch (err) {
      toast.error(err);
    } finally {
      setBusy(false);
    }
  };

  const canVerify = ['under_review', 'partially_paid', 'overdue', 'disputed'].includes(commission.status);
  const canReject = commission.status === 'under_review';
  const canRecordPayment = commission.status !== 'paid' && commission.status !== 'waived';
  const canWaive = commission.status !== 'paid' && commission.status !== 'waived';

  return (
    <div className="stack stack--lg">
      <PageHeader
        title={commission.serviceTitle}
        description={`Provider: ${commission.providerName}`}
        actions={
          <Button to="/admin/commissions" variant="ghost" icon="chevron-left">
            All commissions
          </Button>
        }
      />

      <section className="card stack">
        <div className="row row--between row--wrap">
          <h2 className="card__title">Commission</h2>
          <Badge tone={COMMISSION_STATUS_TONES[commission.status] || 'neutral'}>{COMMISSION_STATUS_LABELS[commission.status] || commission.status}</Badge>
        </div>
        <dl className="details-grid">
          <div>
            <dt>Service amount</dt>
            <dd>{formatGBP(commission.serviceAmountGBP)}</dd>
          </div>
          <div>
            <dt>Commission rate</dt>
            <dd>{commission.commissionRatePercent}%</dd>
          </div>
          <div>
            <dt>Commission owed</dt>
            <dd>{formatGBP(commission.commissionAmountGBP)}</dd>
          </div>
          <div>
            <dt>Paid so far</dt>
            <dd>{formatGBP(commission.paidAmountGBP)}</dd>
          </div>
          <div>
            <dt>Remaining</dt>
            <dd>
              <strong>{formatGBP(commission.remainingAmountGBP)}</strong>
            </dd>
          </div>
          <div>
            <dt>Due date</dt>
            <dd>{formatDate(commission.dueDate)}</dd>
          </div>
          <div>
            <dt>Booking</dt>
            <dd>{commission.bookingId}</dd>
          </div>
        </dl>

        {commission.paymentSubmission?.submittedAt && (
          <div className="notice notice--info">
            <Icon name="info" size={18} />
            <p>
              Provider submitted {commission.paymentSubmission.method?.replace('_', ' ')} payment of £{commission.paymentSubmission.amountGBP} on{' '}
              {formatDateTime(commission.paymentSubmission.submittedAt)}
              {commission.paymentSubmission.reference ? ` (ref: ${commission.paymentSubmission.reference})` : ''}.
              {commission.paymentSubmission.proofUrl && (
                <>
                  {' '}
                  <a href={commission.paymentSubmission.proofUrl} target="_blank" rel="noreferrer">
                    View proof
                  </a>
                </>
              )}
            </p>
          </div>
        )}
        {commission.disputeReason && (
          <div className="notice notice--danger">
            <Icon name="alert" size={18} />
            <p>Disputed: {commission.disputeReason}</p>
          </div>
        )}

        <div className="row row--wrap">
          {canVerify && (
            <Button icon="check" onClick={() => setDialog('verify')}>
              Verify payment
            </Button>
          )}
          {canReject && (
            <Button variant="danger" onClick={() => setDialog('reject')}>
              Reject submission
            </Button>
          )}
          {canRecordPayment && (
            <Button variant="secondary" onClick={() => setDialog('partial')}>
              Record a payment
            </Button>
          )}
          {canWaive && (
            <Button variant="ghost" onClick={() => setDialog('waive')}>
              Waive commission
            </Button>
          )}
        </div>
      </section>

      <section className="card">
        <h2 className="card__title">Timeline</h2>
        <ol className="timeline">
          {timeline.map((entry) => (
            <li key={entry.id} className="timeline__item">
              <span className="timeline__dot" aria-hidden="true" />
              <div>
                <p className="timeline__status">{entry.details || entry.action.replace(/_/g, ' ')}</p>
                <p className="muted small">
                  {formatDateTime(entry.createdAt)} {entry.actorName ? `· ${entry.actorName}` : ''}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <Modal
        open={dialog === 'verify'}
        onClose={closeDialog}
        title="Verify commission payment"
        footer={
          <>
            <Button variant="ghost" onClick={closeDialog}>
              Cancel
            </Button>
            <Button loading={busy} onClick={() => act(() => verifyCommission(id, note), 'Commission verified as paid')}>
              Verify as paid
            </Button>
          </>
        }
      >
        <p>This marks the full remaining amount of {formatGBP(commission.remainingAmountGBP)} as paid and notifies the provider.</p>
        <Input as="textarea" rows={3} label="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} />
      </Modal>

      <Modal
        open={dialog === 'reject'}
        onClose={closeDialog}
        title="Reject payment submission"
        footer={
          <>
            <Button variant="ghost" onClick={closeDialog}>
              Cancel
            </Button>
            <Button variant="danger" loading={busy} disabled={note.trim().length < 10} onClick={() => act(() => rejectCommission(id, note), 'Submission rejected')}>
              Reject
            </Button>
          </>
        }
      >
        <Input as="textarea" rows={3} label="Reason (shown to the provider)" value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} required />
      </Modal>

      <Modal
        open={dialog === 'partial'}
        onClose={closeDialog}
        title="Record a payment"
        footer={
          <>
            <Button variant="ghost" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              loading={busy}
              disabled={!amountGBP || Number(amountGBP) <= 0}
              onClick={() => act(() => recordPartialPayment(id, { amountGBP: Number(amountGBP), note }), 'Payment recorded')}
            >
              Record payment
            </Button>
          </>
        }
      >
        <p className="muted">Remaining: {formatGBP(commission.remainingAmountGBP)}</p>
        <Input label="Amount (£)" type="number" min="0.01" max={commission.remainingAmountGBP} step="0.01" value={amountGBP} onChange={(e) => setAmountGBP(e.target.value)} />
        <Input as="textarea" rows={2} label="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} />
      </Modal>

      <Modal
        open={dialog === 'waive'}
        onClose={closeDialog}
        title="Waive commission"
        footer={
          <>
            <Button variant="ghost" onClick={closeDialog}>
              Cancel
            </Button>
            <Button variant="danger" loading={busy} disabled={note.trim().length < 10} onClick={() => act(() => waiveCommission(id, note), 'Commission waived')}>
              Waive
            </Button>
          </>
        }
      >
        <p>This permanently waives the remaining {formatGBP(commission.remainingAmountGBP)} owed. The provider will be notified.</p>
        <Input as="textarea" rows={3} label="Reason" value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} required />
      </Modal>
    </div>
  );
}
