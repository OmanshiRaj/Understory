import "dotenv/config";
import { classifyCards } from "./classifyCards.js";

// Hardcoded fake sample cards for testing classification.
// Mix of overdue, stale, blocked, and normal cards.
const sampleCards = [
  {
    title: "Fix login page crash",
    due_date: "2026-08-10",
    last_updated: "2026-08-05",
    assignee: "Alice",
    labels: ["bug", "high-priority"],
    status: "In Progress",
  },
  {
    title: "Update API documentation",
    due_date: "2026-09-01",
    last_updated: "2026-08-01",
    assignee: "Bob",
    labels: ["docs"],
    status: "To Do",
  },
  {
    title: "[BLOCKED] Waiting on third-party API credentials",
    due_date: "2026-08-25",
    last_updated: "2026-08-20",
    assignee: "Alice",
    labels: ["blocked", "backend"],
    status: "In Progress",
  },
  {
    title: "Design new onboarding flow",
    due_date: "2026-09-15",
    last_updated: "2026-08-21",
    assignee: "Charlie",
    labels: ["design"],
    status: "In Progress",
  },
  {
    title: "Refactor database queries",
    due_date: "2026-08-18",
    last_updated: "2026-08-12",
    assignee: "Bob",
    labels: ["tech-debt"],
    status: "To Do",
  },
];

async function runTest() {
  try {
    console.log("Sending sample cards to Claude for classification...\n");
    const result = await classifyCards(sampleCards);
    console.log("Classification result:");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Error classifying cards:", error.message);
    process.exit(1);
  }
}

runTest();
