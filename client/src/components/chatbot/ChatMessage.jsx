import { Link } from 'react-router-dom';

/** One chat bubble. Bot messages may carry action links to app pages. */
export default function ChatMessage({ message, onNavigate }) {
  const isUser = message.role === 'user';
  return (
    <div className={`chat-msg ${isUser ? 'chat-msg--user' : 'chat-msg--bot'}`}>
      <div className={`chat-bubble ${message.resolved === false ? 'chat-bubble--unresolved' : ''}`}>
        <p className="prewrap">{message.content}</p>
        {message.links?.length > 0 && (
          <div className="chat-links">
            {message.links.map((link) => (
              <Link key={link.to + link.label} to={link.to} className="chat-link" onClick={onNavigate}>
                {link.label} →
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
