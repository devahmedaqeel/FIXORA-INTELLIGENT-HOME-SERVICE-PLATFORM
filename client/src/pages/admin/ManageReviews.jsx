import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import ListState from '../../components/dashboard/ListState';
import ReviewCard from '../../components/reviews/ReviewCard';
import { usePagedList } from '../../hooks/usePagedList';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../context/ToastContext';
import { listReviews, moderateReview } from '../../services/admin.service';

export default function ManageReviews() {
  useDocumentTitle('Reviews');
  const toast = useToast();
  const list = usePagedList(listReviews, { status: '' });
  const [target, setTarget] = useState(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const apply = async () => {
    setBusy(true);
    const status = target.status === 'published' ? 'removed' : 'published';
    try {
      await moderateReview(target.id, status, note);
      list.replaceItem(target.id, { status, moderationNote: note });
      toast.success(status === 'removed' ? 'Review removed; provider rating recalculated' : 'Review restored');
      setTarget(null);
      setNote('');
    } catch (err) {
      toast.error(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="stack stack--lg">
      <PageHeader title="Reviews" description="Remove inappropriate reviews. Provider ratings update automatically." />
      <div className="toolbar">
        <Select
          label="Status"
          value={list.filters.status}
          onChange={(e) => list.setFilter('status', e.target.value)}
          placeholder="All"
          options={[
            { value: 'published', label: 'Published' },
            { value: 'removed', label: 'Removed' },
          ]}
        />
      </div>
      <ListState list={list} emptyTitle="No reviews yet." emptyIcon="star">
        <div className="card-grid">
          {list.items.map((r) => (
            <ReviewCard
              key={r.id}
              review={r}
              showStatus
              actions={
                <Button size="sm" variant={r.status === 'published' ? 'danger' : 'secondary'} onClick={() => setTarget(r)}>
                  {r.status === 'published' ? 'Remove' : 'Restore'}
                </Button>
              }
            />
          ))}
        </div>
      </ListState>
      <ConfirmDialog
        open={Boolean(target)}
        title={target?.status === 'published' ? 'Remove this review?' : 'Restore this review?'}
        confirmLabel={target?.status === 'published' ? 'Remove' : 'Restore'}
        variant={target?.status === 'published' ? 'danger' : 'primary'}
        loading={busy}
        onConfirm={apply}
        onCancel={() => setTarget(null)}
      >
        <Input label="Moderation note (internal)" value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} />
      </ConfirmDialog>
    </div>
  );
}
