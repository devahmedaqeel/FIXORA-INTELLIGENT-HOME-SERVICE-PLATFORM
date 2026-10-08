import { useState } from 'react';
import Button from '../common/Button';
import Loader from '../common/Loader';
import ErrorMessage from '../common/ErrorMessage';
import EmptyState from '../common/EmptyState';
import { useAsync } from '../../hooks/useAsync';
import { useAuth } from '../../features/auth/auth.context';
import { useToast } from '../../context/ToastContext';
import { listBookingMessages, sendBookingMessage } from '../../features/booking/booking.service';
import { timeAgo } from '../../utils/format';

/** Message thread between the customer and provider on one booking. */
export default function MessageThread({ bookingId, counterpartName = 'the other party' }) {
  const { user } = useAuth();
  const toast = useToast();
  const { data: messages, loading, error, reload, setData } = useAsync(() => listBookingMessages(bookingId), [bookingId]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setSending(true);
    try {
      const sent = await sendBookingMessage(bookingId, text);
      setData((list) => [...(list || []), sent]);
      setDraft('');
    } catch (err) {
      toast.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="card stack" aria-labelledby="messages-heading">
      <h2 id="messages-heading" className="card__title">
        Messages
      </h2>
      {loading && <Loader />}
      {error && <ErrorMessage error={error} onRetry={reload} />}
      {messages && messages.length === 0 && (
        <EmptyState icon="message" title="No messages yet." message={`Send ${counterpartName} a message about this booking.`} />
      )}
      {messages && messages.length > 0 && (
        <ul className="message-thread" aria-live="polite">
          {messages.map((m) => (
            <li key={m.id} className={`message-bubble ${m.senderId === user.uid ? 'is-mine' : ''}`}>
              <p className="message-bubble__text">{m.text}</p>
              <p className="message-bubble__meta">{timeAgo(m.createdAt)}</p>
            </li>
          ))}
        </ul>
      )}
      <form className="row message-thread__form" onSubmit={submit}>
        <label htmlFor="message-draft" className="sr-only">
          Write a message
        </label>
        <textarea
          id="message-draft"
          className="field__control"
          rows={1}
          maxLength={2000}
          placeholder={`Message ${counterpartName}…`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <Button type="submit" icon="send" loading={sending} disabled={!draft.trim()}>
          Send
        </Button>
      </form>
    </section>
  );
}
