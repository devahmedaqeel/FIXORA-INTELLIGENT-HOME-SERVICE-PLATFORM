import { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../context/ToastContext';
import { getPaymentSettings, updatePaymentSettings } from '../../services/finance.service';
import { fieldErrorsFromApi } from '../../utils/validation';

export default function AdminPaymentSettings() {
  useDocumentTitle('Payment settings');
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(getPaymentSettings, []);
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  if (loading || (!form && !error)) return <Loader />;
  if (error) return <ErrorMessage error={error} onRetry={reload} />;

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const setAccount = (field) => (e) => setForm((f) => ({ ...f, businessPaymentAccount: { ...f.businessPaymentAccount, [field]: e.target.value } }));
  const setMethod = (method) => (e) =>
    setForm((f) => ({ ...f, enabledCommissionPaymentMethods: { ...f.enabledCommissionPaymentMethods, [method]: e.target.checked } }));

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const saved = await updatePaymentSettings({
        commissionRatePercent: Number(form.commissionRatePercent),
        commissionPaymentDeadlineDays: Number(form.commissionPaymentDeadlineDays),
        businessPaymentAccount: form.businessPaymentAccount,
        enabledCommissionPaymentMethods: form.enabledCommissionPaymentMethods,
      });
      setForm(saved);
      setErrors({});
      toast.success('Payment settings saved');
    } catch (err) {
      setErrors(fieldErrorsFromApi(err));
      toast.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="stack stack--lg narrow-page" onSubmit={save} noValidate>
      <PageHeader title="Payment settings" description="Commission rate, payment deadline and the bank details providers pay commission to." />

      <section className="card stack">
        <h2 className="card__title">Commission</h2>
        <div className="form-grid">
          <Input
            label="Commission rate (%)"
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={form.commissionRatePercent}
            onChange={set('commissionRatePercent')}
            error={errors.commissionRatePercent}
          />
          <Input
            label="Payment deadline (days after booking)"
            type="number"
            min="1"
            max="90"
            value={form.commissionPaymentDeadlineDays}
            onChange={set('commissionPaymentDeadlineDays')}
            error={errors.commissionPaymentDeadlineDays}
          />
        </div>
      </section>

      <section className="card stack">
        <h2 className="card__title">Business bank account (shown to providers)</h2>
        <div className="form-grid">
          <Input label="Account name" value={form.businessPaymentAccount.accountName} onChange={setAccount('accountName')} />
          <Input label="Bank name" value={form.businessPaymentAccount.bankName} onChange={setAccount('bankName')} />
          <Input label="Sort code" value={form.businessPaymentAccount.sortCode} onChange={setAccount('sortCode')} />
          <Input label="Account number" value={form.businessPaymentAccount.accountNumber} onChange={setAccount('accountNumber')} />
          <Input label="IBAN (optional)" value={form.businessPaymentAccount.iban} onChange={setAccount('iban')} />
          <Input label="SWIFT/BIC (optional)" value={form.businessPaymentAccount.swiftBic} onChange={setAccount('swiftBic')} />
        </div>
      </section>

      <section className="card stack">
        <h2 className="card__title">Accepted commission payment methods</h2>
        <label className="checkbox">
          <input type="checkbox" checked={form.enabledCommissionPaymentMethods.bank_transfer} onChange={setMethod('bank_transfer')} />
          <span>Bank transfer</span>
        </label>
        <label className="checkbox">
          <input type="checkbox" checked={form.enabledCommissionPaymentMethods.cash} onChange={setMethod('cash')} />
          <span>Cash</span>
        </label>
        <label className="checkbox">
          <input type="checkbox" checked={form.enabledCommissionPaymentMethods.other} onChange={setMethod('other')} />
          <span>Other</span>
        </label>
      </section>

      <div className="row row--end sticky-actions">
        <Button type="submit" loading={saving} size="lg">
          Save settings
        </Button>
      </div>
    </form>
  );
}
