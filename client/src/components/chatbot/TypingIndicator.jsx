export default function TypingIndicator() {
  return (
    <div className="chat-msg chat-msg--bot">
      <div className="chat-bubble typing" role="status" aria-label="Assistant is typing">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
