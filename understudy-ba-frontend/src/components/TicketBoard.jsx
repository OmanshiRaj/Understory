import TicketCard from "./TicketCard.jsx";
import "./TicketBoard.css";

const COLUMNS = ["pending", "approved", "rejected"];
const COLUMN_LABELS = { pending: "Pending", approved: "Approved", rejected: "Rejected" };

export default function TicketBoard({ tickets, onTicketClick }) {
  const grouped = COLUMNS.reduce((acc, col) => {
    acc[col] = tickets.filter((t) => t.status === col);
    return acc;
  }, {});

  return (
    <div className="board">
      {COLUMNS.map((col) => (
        <div className="board__column" key={col}>
          <div className="board__col-header">
            {COLUMN_LABELS[col]} ({grouped[col].length})
          </div>
          <div className="board__col-body">
            {grouped[col].length === 0 && (
              <div className="board__empty">No tickets</div>
            )}
            {grouped[col].map((t) => (
              <TicketCard key={t.id} ticket={t} onClick={onTicketClick} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}