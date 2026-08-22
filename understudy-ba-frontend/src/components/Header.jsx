import "./Header.css";

export default function Header({ date, run_type, onRefresh }) {
  const badgeClass = run_type === "explored" ? "badge badge--explored" : "badge badge--cached";

  return (
    <header className="header">
      <div className="header__left">
        <h1 className="header__title">Understory BA Digest</h1>
        <span className={badgeClass}>{run_type}</span>
      </div>
      <div className="header__right">
        <span className="header__date">📅 {date}</span>
        <button className="header__refresh-btn" onClick={onRefresh}>
          ↻ Refresh
        </button>
      </div>
    </header>
  );
}
