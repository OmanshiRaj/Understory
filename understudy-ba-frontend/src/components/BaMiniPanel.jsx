import SentimentSummary from "./SentimentSummary.jsx";
import "./BaMiniPanel.css";

export default function BaMiniPanel({ ba }) {
  if (!ba) return null;

  return (
    <section className="ba-mini">
      <h3 className="ba-mini__heading">BA Overview</h3>
      <SentimentSummary {...ba.sentiment_summary} />
      <div className="ba-mini__meta">
        <span>{ba.themes?.length ?? 0} themes</span>
        <span>{ba.spikes?.length ?? 0} spikes</span>
      </div>
    </section>
  );
}
