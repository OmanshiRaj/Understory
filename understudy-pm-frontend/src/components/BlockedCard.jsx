export default function BlockedCard({ items }) {
  return (
    <div className="card card--blocked">
      <h2 className="card__heading">
        🚧 Blocked
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
                {item.reason} · {item.assignee}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
