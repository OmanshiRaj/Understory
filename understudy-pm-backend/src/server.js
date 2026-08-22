import "dotenv/config";
import express from "express";
import cors from "cors";
import { runPmPipeline } from "./index.js";

const app = express();
app.use(cors());

/**
 * GET /api/health
 * Quick liveness check — returns { status: "ok" }
 */
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

/**
 * GET /api/pm-digest
 * Runs the full PM pipeline and returns the digest as JSON.
 * Returns 500 with { error: ... } on failure.
 */
app.get("/api/pm-digest", async (_req, res) => {
  try {
    const digest = await runPmPipeline();
    res.json(digest);
  } catch (err) {
    console.error("Pipeline error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Understudy PM API running on http://localhost:${PORT}`);
});
