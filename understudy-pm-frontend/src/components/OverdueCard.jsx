export default function OverdueCard({ items }) {
  return (
    <div className="card card--overdue">
      <h2 className="card__heading">
        🚨 Overdue
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
                Due {item.due_date} · {item.assignee}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
