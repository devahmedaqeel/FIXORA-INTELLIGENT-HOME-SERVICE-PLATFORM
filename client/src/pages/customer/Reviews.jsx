import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import ReviewCard from '../../components/reviews/ReviewCard';
import ReviewForm from '../../components/reviews/ReviewForm';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../context/ToastContext';
import { getMyReviews } from '../../features/reviews/review.service';
import { formatDate } from '../../utils/format';

export default function Reviews() {
  useDocumentTitle('Reviews');
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(getMyReviews, []);
  const [modal, setModal] = useState(null); // { bookingId } | { review }

  const onSaved = () => {
    setModal(null);
    toast.success('Review saved');
    reload();
  };

  return (
    <div className="stack stack--xl">
      <PageHeader title="Reviews" description="Rate providers after completed bookings. Your feedback helps other customers." />
      {loading && <Loader />}
      <ErrorMessage error={error} onRetry={reload} />
      {data && (
        <>
          <section className="stack" aria-labelledby="awaiting-heading">
            <h2 id="awaiting-heading">Waiting for your review</h2>
            {data.awaitingReview.length === 0 ? (
              <p className="muted">You&apos;re all caught up.</p>
            ) : (
              <ul className="simple-list">
                {data.awaitingReview.map((b) => (
                  <li key={b.bookingId} className="simple-list__item">
                    <div>
                      <p className="strong">{b.serviceTitle}</p>
                      <p className="muted small">
                        {b.providerName} · {formatDate(b.bookingDate)}
                      </p>
                    </div>
                    <Button size="sm" icon="star" onClick={() => setModal({ bookingId: b.bookingId, title: b.providerName })}>
                      Write review
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="stack" aria-labelledby="mine-heading">
            <h2 id="mine-heading">Your reviews</h2>
            {data.reviews.length === 0 ? (
              <EmptyState icon="star" title="No reviews yet." />
            ) : (
              <div className="card-grid">
                {data.reviews.map((r) => (
                  <ReviewCard
                    key={r.id}
                    review={r}
                    showStatus={r.status === 'removed'}
                    actions={
                      r.status === 'published' && (
                        <Button size="sm" variant="ghost" icon="edit" onClick={() => setModal({ review: r, title: r.serviceTitle })}>
                          Edit
                        </Button>
                      )
                    }
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
      <Modal open={Boolean(modal)} onClose={() => setModal(null)} title={modal?.review ? 'Edit review' : `Review ${modal?.title || ''}`}>
        {modal && <ReviewForm bookingId={modal.bookingId} review={modal.review} onSaved={onSaved} onCancel={() => setModal(null)} />}
      </Modal>
    </div>
  );
}
