import "./ThemeList.css";

export default function ThemeList({ themes }) {
  if (!themes || themes.length === 0) return null;

  return (
    <section className="themes">
      <h2 className="themes__heading">Themes</h2>
      <div className="themes__grid">
        {themes.map((t, i) => (
          <div className="theme-card" key={i}>
            <div className="theme-card__header">
              <span className="theme-card__name">{t.name}</span>
              <span className="theme-card__count">{t.count}</span>
            </div>
            {t.sample_quotes && t.sample_quotes.length > 0 && (
              <ul className="theme-card__quotes">
                {t.sample_quotes.map((q, qi) => (
                  <li key={qi} className="theme-card__quote">
                    &ldquo;{q}&rdquo;
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
