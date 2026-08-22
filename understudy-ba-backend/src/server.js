import "dotenv/config";
import express from "express";
import cors from "cors";
import { runPipeline } from "./index.js";
import { getUnifiedDigest } from "./aggregateUnified.js";
import {
  loadCandidateTickets,
  approveTicket,
  rejectTicket,
} from "./ticketStore.js";

const app = express();
app.use(cors());
app.use(express.json());

/**
 * GET /health
 * Basic liveness check.
 */
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

/**
 * GET /api/ba-digest
 * Runs the full BA pipeline and returns the digest as JSON.
 */
app.get("/api/ba-digest", async (_req, res) => {
  try {
    const digest = await runPipeline();
    res.json(digest);
  } catch (err) {
    console.error("Pipeline error:", err.message, err.stack);
    res.status(500).json({ error: "Failed to generate BA digest" });
  }
});

// ─── Unified Digest Route ─────────────────────────────────

/**
 * GET /api/unified-digest
 * Combines PM + BA digests + candidate tickets into one response.
 */
app.get("/api/unified-digest", async (_req, res) => {
  try {
    const unified = await getUnifiedDigest();
    res.json(unified);
  } catch (err) {
    console.error("Unified digest error:", err.message, err.stack);
    res.status(500).json({ error: "Failed to generate unified digest" });
  }
});

// ─── F1 Candidate Ticket Routes ───────────────────────────────

/**
 * GET /api/candidate-tickets
 * Returns all candidate tickets.
 */
app.get("/api/candidate-tickets", (_req, res) => {
  try {
    const tickets = loadCandidateTickets();
    res.json(tickets);
  } catch (err) {
    console.error("Failed to load candidate tickets:", err.message);
    res.status(500).json({ error: "Failed to load candidate tickets" });
  }
});

/**
 * POST /api/candidate-tickets/:id/approve
 * Approve a pending candidate ticket.
 */
app.post("/api/candidate-tickets/:id/approve", (req, res) => {
  try {
    const ticket = approveTicket(req.params.id);
    res.json(ticket);
  } catch (err) {
    console.error("Failed to approve ticket:", err.message);
    res.status(400).json({ error: err.message });
  }
});

/**
 * POST /api/candidate-tickets/:id/reject
 * Reject a pending candidate ticket.
 */
app.post("/api/candidate-tickets/:id/reject", (req, res) => {
  try {
    const ticket = rejectTicket(req.params.id);
    res.json(ticket);
  } catch (err) {
    console.error("Failed to reject ticket:", err.message);
    res.status(400).json({ error: err.message });
  }
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Understudy BA backend listening on port ${PORT}`);
});
