/** Simple segmented filter: <Tabs value={v} onChange={setV} options={[{value,label,count}]} /> */
export default function Tabs({ value, onChange, options, label = 'Filter' }) {
  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={value === option.value}
          className={`tabs__item ${value === option.value ? 'is-active' : ''}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
          {option.count !== undefined && <span className="tabs__count">{option.count}</span>}
        </button>
      ))}
    </div>
  );
}
