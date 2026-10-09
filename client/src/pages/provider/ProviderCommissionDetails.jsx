import { useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import Badge from '../../components/common/Badge';
import Icon from '../../components/common/Icon';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../features/auth/auth.context';
import { getMyCommission, submitCommissionPayment, disputeCommission } from '../../services/finance.service';
import { uploadCommissionProof } from '../../services/storage.service';
import { COMMISSION_STATUS_LABELS, COMMISSION_STATUS_TONES, PAYMENT_METHOD_OPTIONS } from '../../constants';
import { formatDate, formatDateTime, formatGBP } from '../../utils/format';

const SUBMITTABLE = ['due', 'partially_paid', 'overdue', 'rejected'];

export default function ProviderCommissionDetails() {
  useDocumentTitle('Commission');
  const { id } = useParams();
  const toast = useToast();
  const { user } = useAuth();
  const { data, loading, error, reload, setData } = useAsync(() => getMyCommission(id), [id]);
  const fileRef = useRef(null);

  const [method, setMethod] = useState('bank_transfer');
  const [reference, setReference] = useState('');
  const [amountGBP, setAmountGBP] = useState('');
  const [file, setFile] = useState(null);
  const [disputing, setDisputing] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  if (loading) return <Loader />;
  if (error) return <ErrorMessage error={error} onRetry={reload} />;
  const { commission, timeline } = data;

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      let proof = { proofUrl: '', proofPath: '' };
      if (file) proof = await uploadCommissionProof(user.uid, commission.bookingId, file);
      const updated = await submitCommissionPayment(id, {
        method,
        reference,
        amountGBP: Number(amountGBP || commission.remainingAmountGBP),
        proofUrl: proof.url || '',
        proofPath: proof.path || '',
      });
      setData((d) => ({ ...d, commission: updated }));
      reload();
      toast.success('Payment submitted for review');
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) {
      toast.error(err);
    } finally {
      setBusy(false);
    }
  };

  const submitDispute = async () => {
    if (reason.trim().length < 10) {
      toast.error('Please describe the issue in at least 10 characters');
      return;
    }
    setBusy(true);
    try {
      const updated = await disputeCommission(id, reason.trim());
      setData((d) => ({ ...d, commission: updated }));
      setDisputing(false);
      toast.success('Dispute submitted — our team will review it');
    } catch (err) {
      toast.error(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="stack stack--lg">
      <PageHeader
        title={commission.serviceTitle}
        actions={
          <Button to="/provider/commissions" variant="ghost" icon="chevron-left">
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
        </dl>
        {commission.rejectionReason && (
          <div className="notice notice--danger">
            <Icon name="alert" size={18} />
            <p>Your last submission was rejected: {commission.rejectionReason}</p>
          </div>
        )}
      </section>

      {SUBMITTABLE.includes(commission.status) && (
        <form className="card stack" onSubmit={submit}>
          <h2 className="card__title">Submit your payment</h2>
          <p className="muted">Pay the commission owed to Fixora via bank transfer or cash, then submit the details below for verification.</p>
          <div className="form-grid">
            <Select label="Payment method" value={method} onChange={(e) => setMethod(e.target.value)} options={PAYMENT_METHOD_OPTIONS} required />
            <Input
              label="Amount paid (£)"
              type="number"
              min="0.01"
              max={commission.remainingAmountGBP}
              step="0.01"
              placeholder={String(commission.remainingAmountGBP)}
              value={amountGBP}
              onChange={(e) => setAmountGBP(e.target.value)}
            />
            <Input label="Reference (optional)" value={reference} onChange={(e) => setReference(e.target.value)} maxLength={120} />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="proof-file">
              Payment proof (optional) — screenshot or PDF receipt
            </label>
            <input ref={fileRef} id="proof-file" type="file" accept="image/jpeg,image/png,application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </div>
          <div className="row row--end">
            <Button type="submit" loading={busy} icon="upload">
              Submit payment
            </Button>
          </div>
        </form>
      )}

      {!['paid', 'waived'].includes(commission.status) && (
        <section className="card stack">
          {!disputing ? (
            <button type="button" className="btn-link small" onClick={() => setDisputing(true)}>
              Dispute this commission
            </button>
          ) : (
            <div className="stack">
              <Input as="textarea" rows={3} label="Why are you disputing this commission?" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={1000} />
              <div className="row row--end">
                <Button variant="ghost" size="sm" onClick={() => setDisputing(false)}>
                  Cancel
                </Button>
                <Button variant="danger" size="sm" loading={busy} onClick={submitDispute}>
                  Submit dispute
                </Button>
              </div>
            </div>
          )}
        </section>
      )}

      <section className="card">
        <h2 className="card__title">Timeline</h2>
        <ol className="timeline">
          {timeline.map((entry) => (
            <li key={entry.id} className="timeline__item">
              <span className="timeline__dot" aria-hidden="true" />
              <div>
                <p className="timeline__status">{entry.details || entry.action.replace(/_/g, ' ')}</p>
                <p className="muted small">{formatDateTime(entry.createdAt)}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
