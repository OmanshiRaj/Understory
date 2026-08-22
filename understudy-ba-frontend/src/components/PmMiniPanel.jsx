import "./PmMiniPanel.css";

export default function PmMiniPanel({ pm, pm_error }) {
  if (pm_error || !pm) {
    return (
      <section className="pm-panel pm-panel--unavailable">
        <h3 className="pm-panel__heading">PM Overview</h3>
        <p className="pm-panel__unavailable-msg">PM data unavailable</p>
      </section>
    );
  }

  const overdue = pm.overdue?.length ?? 0;
  const stale = pm.stale?.length ?? 0;
  const blocked = pm.blocked?.length ?? 0;
  const workload = pm.workload_per_assignee ?? [];

  const maxItems = Math.max(...workload.map((w) => w.count), 1);

  return (
    <section className="pm-panel">
      <h3 className="pm-panel__heading">PM Overview</h3>
      <div className="pm-panel__counts">
        <div className="pm-panel__stat pm-panel__stat--overdue">
          <span className="pm-panel__stat-num">{overdue}</span>
          <span className="pm-panel__stat-label">Overdue</span>
        </div>
        <div className="pm-panel__stat pm-panel__stat--stale">
          <span className="pm-panel__stat-num">{stale}</span>
          <span className="pm-panel__stat-label">Stale</span>
        </div>
        <div className="pm-panel__stat pm-panel__stat--blocked">
          <span className="pm-panel__stat-num">{blocked}</span>
          <span className="pm-panel__stat-label">Blocked</span>
        </div>
      </div>
      {workload.length > 0 && (
        <div className="pm-panel__workload">
          <h4 className="pm-panel__subheading">Workload</h4>
          {workload.map((w, i) => (
            <div className="pm-panel__bar-row" key={i}>
              <span className="pm-panel__bar-label">{w.assignee}</span>
              <div className="pm-panel__bar-track">
                <span
                  className="pm-panel__bar-fill"
                  style={{ width: `${(w.count / maxItems) * 100}%` }}
                />
              </div>
              <span className="pm-panel__bar-count">{w.count}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
