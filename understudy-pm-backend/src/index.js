import "dotenv/config";
import { exploreBoardRaw } from "./exploreBoard.js";
import { classifyCards } from "./classifyCards.js";
import { saveSnapshot, loadSnapshot, diffMovedCards } from "./snapshotStore.js";

/**
 * Runs the full PM digest pipeline:
 *   1. Explore the Trello board for today's raw cards
 *   2. Classify cards (overdue, stale, blocked, workload)
 *   3. Load yesterday's snapshot and diff for moved cards
 *   4. Save today's snapshot for tomorrow's diff
 *   5. Return a combined digest object
 *
 * @returns {Promise<Object>} The digest object
 */
export async function runPmPipeline() {
  let todayCards;
  let classification;
  let todayDateStr;
  let yesterdayDateStr;
  let yesterdayCards;
  let moved;

  // Step a: Explore the board
  try {
    todayCards = await exploreBoardRaw();
  } catch (err) {
    throw new Error("Failed during board exploration: " + err.message);
  }

  // Step b: Classify cards
  try {
    classification = await classifyCards(todayCards);
  } catch (err) {
    throw new Error("Failed during card classification: " + err.message);
  }

  // Step c: Compute today's and yesterday's date strings
  try {
    const today = new Date();
    todayDateStr = today.toISOString().split("T")[0];
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterdayDateStr = yesterday.toISOString().split("T")[0];
  } catch (err) {
    throw new Error("Failed during date computation: " + err.message);
  }

  // Step d: Load yesterday's snapshot
  try {
    yesterdayCards = loadSnapshot(yesterdayDateStr);
  } catch (err) {
    throw new Error("Failed during snapshot loading: " + err.message);
  }

  // Step e: Diff moved cards
  try {
    moved = diffMovedCards(yesterdayCards, todayCards);
  } catch (err) {
    throw new Error("Failed during card diff: " + err.message);
  }

  // Step f: Save today's snapshot
  try {
    saveSnapshot(todayCards, todayDateStr);
  } catch (err) {
    throw new Error("Failed during snapshot saving: " + err.message);
  }

  // Step g: Combine into digest
  return {
    date: todayDateStr,
    moved,
    overdue: classification.overdue,
    stale: classification.stale,
    blocked: classification.blocked,
    workload_per_assignee: classification.workload_per_assignee,
    run_type: "explored",
  };
}
