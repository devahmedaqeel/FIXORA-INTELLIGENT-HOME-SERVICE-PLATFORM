import PageHeader from '../../components/common/PageHeader';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ListState from '../../components/dashboard/ListState';
import { usePagedList } from '../../hooks/usePagedList';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../context/ToastContext';
import { listChatbotQueries, resolveChatbotQuery } from '../../services/admin.service';
import { formatDateTime } from '../../utils/format';

/** Questions the assistant could not answer — use them to improve FAQ entries. */
export default function ChatbotQueries() {
  useDocumentTitle('Chatbot queries');
  const toast = useToast();
  const list = usePagedList(listChatbotQueries, { resolved: 'false' });

  const toggle = async (q) => {
    try {
      const updated = await resolveChatbotQuery(q.id, !q.resolved);
      list.replaceItem(q.id, updated);
      toast.success(updated.resolved ? 'Marked as handled' : 'Marked as unanswered');
    } catch (err) {
      toast.error(err);
    }
  };

  return (
    <div className="stack stack--lg">
      <PageHeader title="Chatbot queries" description="Questions the assistant couldn't resolve. Review them to add FAQ answers or follow up with users." />
      <div className="toolbar">
        <Select
          label="Show"
          value={list.filters.resolved}
          onChange={(e) => list.setFilter('resolved', e.target.value)}
          placeholder="All queries"
          options={[
            { value: 'false', label: 'Unanswered' },
            { value: 'true', label: 'Resolved' },
          ]}
        />
      </div>
      <ListState list={list} emptyTitle="No queries in this view." emptyIcon="message">
        <ul className="stack">
          {list.items.map((q) => (
            <li key={q.id} className="card stack stack--sm">
              <div className="row row--between row--wrap">
                <p className="strong">“{q.question}”</p>
                <Badge tone={q.resolved ? 'success' : 'warning'}>{q.resolved ? 'Resolved' : 'Unanswered'}</Badge>
              </div>
              <p className="muted small">
                {q.userRole} {q.userId ? `· user ${q.userId}` : '· guest'} · {formatDateTime(q.createdAt)} · source: {q.source}
              </p>
              <details>
                <summary className="small">Assistant reply</summary>
                <p className="prewrap small">{q.response}</p>
              </details>
              <div>
                <Button size="sm" variant="secondary" onClick={() => toggle(q)}>
                  {q.resolved ? 'Reopen' : 'Mark handled'}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </ListState>
    </div>
  );
}
