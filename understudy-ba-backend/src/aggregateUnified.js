import { runPipeline } from "./index.js";
import { loadCandidateTickets } from "./ticketStore.js";

const PM_DIGEST_URL = "http://localhost:3001/api/pm-digest";

/**
 * Builds a unified digest by combining:
 *   1. PM backend digest (fetched over HTTP from port 3001)
 *   2. BA backend digest (in-process pipeline, same codebase)
 *   3. Candidate tickets (in-process from ticketStore)
 *
 * If the PM backend is down, pm is set to null with pm_error flag.
 */
export async function getUnifiedDigest() {
  // 1. Fetch PM digest (tolerant of failure)
  let pm = null;
  let pm_error = null;
  try {
    const res = await fetch(PM_DIGEST_URL);
    if (!res.ok) throw new Error(`PM returned ${res.status}`);
    pm = await res.json();
  } catch (err) {
    console.warn(`PM backend unavailable: ${err.message}`);
    pm_error = "PM backend unavailable";
  }

  // 2. Run BA pipeline in-process
  const ba = await runPipeline();

  // 3. Load candidate tickets in-process
  const candidate_tickets = loadCandidateTickets();

  return {
    generated_at: new Date().toISOString(),
    pm,
    pm_error,
    ba,
    candidate_tickets,
  };
}
