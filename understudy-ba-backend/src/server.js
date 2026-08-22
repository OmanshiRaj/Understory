import "dotenv/config";
import express from "express";
import cors from "cors";
import { runPipeline } from "./index.js";

const app = express();
app.use(cors());

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

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Understudy BA backend listening on port ${PORT}`);
});
