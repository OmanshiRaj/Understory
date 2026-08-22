import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "data");
const TICKETS_FILE = join(DATA_DIR, "candidate-tickets.json");

/**
 * Reads the candidate tickets store from disk.
 * Returns [] if the file doesn't exist.
 *
 * Ticket shape: {
 *   id: string,
 *   title: string,
 *   description: string,
 *   source_theme: string,
 *   today_count: number,
 *   average_count: number,
 *   is_new: boolean,
 *   status: "pending" | "approved" | "rejected",
 *   created_at: string (ISO)
 * }
 */
export function loadCandidateTickets() {
  if (!existsSync(TICKETS_FILE)) {
    return [];
  }
  try {
    const raw = readFileSync(TICKETS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveTickets(tickets) {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  writeFileSync(TICKETS_FILE, JSON.stringify(tickets, null, 2), "utf-8");
}

export function addCandidateTicket(ticket) {
  const tickets = loadCandidateTickets();
  const newTicket = {
    ...ticket,
    id: `TICKET-${Date.now()}`,
    status: "pending",
    created_at: new Date().toISOString(),
  };
  tickets.push(newTicket);
  saveTickets(tickets);
  return newTicket;
}

export function approveTicket(id) {
  const tickets = loadCandidateTickets();
  const ticket = tickets.find((t) => t.id === id);
  if (!ticket) throw new Error(`Ticket ${id} not found`);
  if (ticket.status !== "pending") throw new Error(`Ticket ${id} is not pending`);
  ticket.status = "approved";
  saveTickets(tickets);
  return ticket;
}

export function rejectTicket(id) {
  const tickets = loadCandidateTickets();
  const ticket = tickets.find((t) => t.id === id);
  if (!ticket) throw new Error(`Ticket ${id} not found`);
  if (ticket.status !== "pending") throw new Error(`Ticket ${id} is not pending`);
  ticket.status = "rejected";
  saveTickets(tickets);
  return ticket;
}
