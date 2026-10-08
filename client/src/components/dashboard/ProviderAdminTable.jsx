import { useEffect, useState } from 'react';
import DataTable from '../common/DataTable';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import ListState from './ListState';
import ProviderReviewModal from './ProviderReviewModal';
import ProviderVerificationBadge from '../providers/ProviderVerificationBadge';
import { usePagedList } from '../../hooks/usePagedList';
import { useDebounce } from '../../hooks/useDebounce';
import { listProviders } from '../../services/admin.service';
import { formatDate } from '../../utils/format';

/** Provider table shared by "Providers" and "Verification" admin pages. */
export default function ProviderAdminTable({ initialStatus = '', lockStatus = false }) {
  const list = usePagedList(listProviders, { status: initialStatus, q: '' });
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search, 300);
  const [reviewing, setReviewing] = useState(null);

  useEffect(() => {
    if (debounced !== list.filters.q) list.setFilter('q', debounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <div className="stack">
      <div className="toolbar">
        <Input label="Search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name, business or city" className="toolbar__grow" />
        {!lockStatus && (
          <Select
            label="Verification"
            value={list.filters.status}
            onChange={(e) => list.setFilter('status', e.target.value)}
            placeholder="All statuses"
            options={['pending', 'verified', 'rejected', 'suspended'].map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) }))}
          />
        )}
      </div>
      <ListState list={list} emptyTitle={initialStatus === 'pending' ? 'No providers waiting for verification.' : 'No providers found.'} emptyIcon="briefcase">
        <DataTable
          caption="Providers"
          rows={list.items}
          columns={[
            { key: 'name', label: 'Provider', render: (p) => <strong>{p.businessName || p.displayName}</strong> },
            { key: 'email', label: 'Email' },
            { key: 'cities', label: 'Cities', render: (p) => (p.cities || []).join(', ') || '—' },
            { key: 'services', label: 'Services', render: (p) => p.activeServiceCount || 0 },
            { key: 'rating', label: 'Rating', render: (p) => (p.ratingCount ? `${p.ratingAverage.toFixed(1)} (${p.ratingCount})` : '—') },
            { key: 'status', label: 'Status', render: (p) => <ProviderVerificationBadge status={p.verificationStatus} /> },
            { key: 'createdAt', label: 'Joined', render: (p) => formatDate(p.createdAt) },
            {
              key: 'actions',
              label: 'Actions',
              render: (p) => (
                <Button size="sm" variant={p.verificationStatus === 'pending' ? 'primary' : 'secondary'} onClick={() => setReviewing(p.id)}>
                  {p.verificationStatus === 'pending' ? 'Review' : 'Manage'}
                </Button>
              ),
            },
          ]}
        />
      </ListState>
      <ProviderReviewModal providerId={reviewing} onClose={() => setReviewing(null)} onUpdated={() => list.reload()} />
    </div>
  );
}
