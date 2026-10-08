import { useEffect, useRef, useState } from 'react';
import Icon from '../common/Icon';
import ChatMessage from './ChatMessage';
import QuickReplies from './QuickReplies';
import TypingIndicator from './TypingIndicator';
import { getQuickReplies, sendChatMessage } from '../../features/chatbot/chatbot.service';
import { useAuth } from '../../features/auth/auth.context';

const GREETINGS = {
  guest: "Hi! I'm the Fixora assistant. I can help you find and book home services. What do you need?",
  customer: 'Hi! I can help with searching, booking, cancellations, reviews and your booking status.',
  provider: 'Hi! I can help with your services, availability, bookings and earnings.',
  admin: 'Hi! Ask me about pending providers, bookings or unanswered chatbot queries.',
};

/** Floating assistant available on the home page and every dashboard. */
export default function ChatbotWidget() {
  const { user } = useAuth();
  const role = user?.role || 'guest';
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [quickReplies, setQuickReplies] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  // Reset the conversation when the signed-in user changes (privacy between accounts).
  useEffect(() => {
    setMessages([{ role: 'assistant', content: GREETINGS[role] }]);
    getQuickReplies()
      .then(setQuickReplies)
      .catch(() => setQuickReplies([]));
  }, [role, user?.uid]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const send = async (text) => {
    const message = text.trim();
    if (!message || sending) return;
    setInput('');
    const history = messages.slice(1).slice(-6).map(({ role: r, content }) => ({ role: r, content }));
    setMessages((list) => [...list, { role: 'user', content: message }]);
    setSending(true);
    try {
      const reply = await sendChatMessage(message, history);
      setMessages((list) => [...list, { role: 'assistant', content: reply.reply, links: reply.links, resolved: reply.resolved }]);
      if (reply.quickReplies) setQuickReplies(reply.quickReplies);
    } catch (error) {
      setMessages((list) => [
        ...list,
        { role: 'assistant', content: `Sorry, I couldn't reach the server (${error.message}). Please try again, or use the Contact page.`, resolved: false },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={`chatbot ${open ? 'is-open' : ''}`}>
      {open && (
        <section className="chatbot__panel" role="dialog" aria-label="Fixora assistant">
          <header className="chatbot__header">
            <span className="chatbot__avatar">
              <Icon name="bot" size={18} />
            </span>
            <div>
              <p className="chatbot__title">Fixora Assistant</p>
              <p className="chatbot__subtitle">Usually answers instantly</p>
            </div>
            <button type="button" className="icon-btn" onClick={() => setOpen(false)} aria-label="Close assistant">
              <Icon name="x" />
            </button>
          </header>
          <div className="chatbot__messages" ref={listRef} aria-live="polite">
            {messages.map((m, i) => (
              <ChatMessage key={i} message={m} onNavigate={() => setOpen(false)} />
            ))}
            {sending && <TypingIndicator />}
          </div>
          <QuickReplies options={quickReplies} onSelect={send} disabled={sending} />
          <form
            className="chatbot__form"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <label htmlFor="chatbot-input" className="sr-only">
              Type your question
            </label>
            <input
              id="chatbot-input"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question…"
              maxLength={500}
              autoComplete="off"
            />
            <button type="submit" className="icon-btn icon-btn--primary" disabled={!input.trim() || sending} aria-label="Send message">
              <Icon name="send" size={18} />
            </button>
          </form>
        </section>
      )}
      <button
        type="button"
        className="chatbot__launcher"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? 'Close Fixora assistant' : 'Open Fixora assistant'}
      >
        <Icon name={open ? 'x' : 'message'} size={24} />
      </button>
    </div>
  );
}
