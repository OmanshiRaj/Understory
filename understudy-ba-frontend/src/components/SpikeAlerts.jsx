import "./SpikeAlerts.css";

export default function SpikeAlerts({ spikes }) {
  if (!spikes || spikes.length === 0) {
    return (
      <section className="spikes">
        <h2 className="spikes__heading">Spike Alerts</h2>
        <p className="spikes__empty">No spikes detected today</p>
      </section>
    );
  }

  return (
    <section className="spikes">
      <h2 className="spikes__heading">Spike Alerts</h2>
      <div className="spikes__list">
        {spikes.map((s, i) => (
          <div className="spike-card" key={i}>
            <div className="spike-card__left">
              <span className="spike-card__name">{s.theme}</span>
              <span className="spike-card__counts">
                Today: <strong>{s.today_count}</strong> &nbsp;vs&nbsp; Avg:
                <strong>{s.average_count}</strong>
              </span>
            </div>
            <span
              className={
                s.is_new
                  ? "spike-card__tag spike-card__tag--new"
                  : "spike-card__tag spike-card__tag--spiking"
              }
            >
              {s.is_new ? "NEW" : "SPIKING"}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
