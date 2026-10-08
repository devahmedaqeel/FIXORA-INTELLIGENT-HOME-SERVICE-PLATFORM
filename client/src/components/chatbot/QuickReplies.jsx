export default function QuickReplies({ options = [], onSelect, disabled }) {
  if (!options.length) return null;
  return (
    <div className="quick-replies" aria-label="Suggested questions">
      {options.map((option) => (
        <button key={option} type="button" className="quick-reply" onClick={() => onSelect(option)} disabled={disabled}>
          {option}
        </button>
      ))}
    </div>
  );
}
