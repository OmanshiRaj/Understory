import "./SentimentSummary.css";

export default function SentimentSummary({ positive, negative, neutral }) {
  const total = positive + negative + neutral;
  if (total === 0) return null;

  const pct = (v) => ((v / total) * 100).toFixed(1);

  return (
    <section className="sentiment">
      <h2 className="sentiment__heading">Sentiment Overview</h2>
      <div className="sentiment__bar-track">
        <span
          className="sentiment__bar sentiment__bar--pos"
          style={{ width: `${pct(positive)}%` }}
        />
        <span
          className="sentiment__bar sentiment__bar--neg"
          style={{ width: `${pct(negative)}%` }}
        />
        <span
          className="sentiment__bar sentiment__bar--neu"
          style={{ width: `${pct(neutral)}%` }}
        />
      </div>
      <div className="sentiment__counts">
        <span className="sentiment__stat">
          <span className="sentiment__dot sentiment__dot--pos" />
          Positive: <strong>{positive}</strong> ({pct(positive)}%)
        </span>
        <span className="sentiment__stat">
          <span className="sentiment__dot sentiment__dot--neg" />
          Negative: <strong>{negative}</strong> ({pct(negative)}%)
        </span>
        <span className="sentiment__stat">
          <span className="sentiment__dot sentiment__dot--neu" />
          Neutral: <strong>{neutral}</strong> ({pct(neutral)}%)
        </span>
      </div>
    </section>
  );
}
