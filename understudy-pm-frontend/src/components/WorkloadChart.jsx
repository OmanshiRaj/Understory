export default function WorkloadChart({ data }) {
  const maxCards = Math.max(...data.map((d) => d.open_cards), 1);

  return (
    <div className="card workload-card">
      <h2 className="card__heading">📊 Workload per Assignee</h2>
      {data.map((item, i) => (
        <div className="workload-bar-row" key={i}>
          <span className="workload-name">{item.assignee}</span>
          <div className="workload-track">
            <div
              className="workload-fill"
              style={{ width: `${(item.open_cards / maxCards) * 100}%` }}
            />
          </div>
          <span className="workload-count">{item.open_cards}</span>
        </div>
      ))}
    </div>
  );
}
