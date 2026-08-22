import "./TicketCard.css";

export default function TicketCard({ ticket, onClick }) {
  const barClass = ticket.is_new
    ? "ticket-card ticket-card--new"
    : "ticket-card ticket-card--spike";

  return (
    <div className={barClass} onClick={() => onClick(ticket)}>
      <div className="ticket-card__body">
        <div className="ticket-card__title">{ticket.title}</div>
        <div className="ticket-card__meta">
          <span>{ticket.source_theme}</span>
          <span>
            Today: <strong>{ticket.today_count}</strong> vs Avg:{" "}
            <strong>{ticket.average_count}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
