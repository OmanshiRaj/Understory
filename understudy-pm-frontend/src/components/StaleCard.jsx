export default function StaleCard({ items }) {
  return (
    <div className="card card--stale">
      <h2 className="card__heading">
        🕐 Stale
        <span className="card__count">{items.length}</span>
      </h2>
      {items.length === 0 ? (
        <p className="card__empty">None 🎉</p>
      ) : (
        <ul className="card__list">
          {items.map((item, i) => (
            <li key={i}>
              <strong>{item.title}</strong>
              <br />
              <span className="card__label">
                {item.days_since_update}d stale · {item.assignee}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
