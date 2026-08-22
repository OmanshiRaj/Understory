import "./TicketDetailModal.css";

export default function TicketDetailModal({ ticket, onClose, onApprove, onReject, actionError }) {
  if (!ticket) return null;

  const isPending = ticket.status === "pending";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h3 className="modal__title">{ticket.title}</h3>
          <button className="modal__close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal__body">
          <div className="modal__field">
            <span className="modal__label">Status:</span>
            <span className={`modal__status modal__status--${ticket.status}`}>
              {ticket.status}
            </span>
          </div>
          <div className="modal__field">
            <span className="modal__label">Source Theme:</span>
            <span>{ticket.source_theme}</span>
          </div>
          <div className="modal__field">
            <span className="modal__label">Counts:</span>
            <span>
              Today {ticket.today_count} / Avg {ticket.average_count}
            </span>
          </div>
          <div className="modal__description">
            <span className="modal__label">Description:</span>
            <p>{ticket.description}</p>
          </div>
          {actionError && (
            <div className="modal__error">{actionError}</div>
          )}
        </div>
        {isPending && (
          <div className="modal__actions">
            <button
              className="modal__btn modal__btn--approve"
              onClick={() => onApprove(ticket.id)}
            >
              Approve
            </button>
            <button
              className="modal__btn modal__btn--reject"
              onClick={() => onReject(ticket.id)}
            >
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
}