export default function StandupCard({ moved }) {
  return (
    <div className="card standup-card">
      <h2 className="card__heading">📋 Standup — What Moved</h2>
      {moved.length === 0 ? (
        <p className="card__empty">Nothing moved since yesterday</p>
      ) : (
        <ul className="card__list">
          {moved.map((item, i) => (
            <li key={i}>
              <strong>{item.title}</strong>
              <span className="move-arrow"> : </span>
              <span className="move-from">{item.from}</span>
              <span className="move-arrow"> → </span>
              <span className="move-to">{item.to}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
