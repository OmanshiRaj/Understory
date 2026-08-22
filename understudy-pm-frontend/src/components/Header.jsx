export default function Header({ date, runType, onRefresh }) {
  const badgeLabel =
    runType === "cached" ? "⚡ Understudy's got this" : "🔍 Learning the board";
  const badgeClass =
    runType === "cached" ? "badge badge--cached" : "badge badge--explored";

  return (
    <header className="header">
      <div className="header__left">
        <h1 className="header__title">Understudy</h1>
        <span className="header__date">{date}</span>
      </div>
      <div className="header__right">
        <span className={badgeClass}>{badgeLabel}</span>
        <button className="btn-refresh" onClick={onRefresh}>
          ↻ Refresh
        </button>
      </div>
    </header>
  );
}
