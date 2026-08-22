import "dotenv/config";
import { getAllReviews } from "./combineSources.js";
import { classifyReviews } from "./classifyReviews.js";
import {
  loadThemeHistory,
  appendThemeHistory,
  detectSpikes,
} from "./spikeDetector.js";

/**
 * Runs the full BA digest pipeline:
 *   1. Fetch & combine reviews from all sources
 *   2. Classify sentiment + themes via Claude
 *   3. Load theme history and detect spikes
 *   4. Persist today's themes for future runs
 *   5. Return combined digest object
 *
 * @returns {Promise<Object>} The BA digest
 */
export async function runPipeline() {
  let reviews;
  let classified;
  let todayDateStr;
  let history;
  let spikes;

  // Step 1: Fetch all reviews
  try {
    reviews = await getAllReviews();
  } catch (err) {
    throw new Error("Failed during getAllReviews: " + err.message);
  }

  // Step 2: Classify reviews
  try {
    classified = await classifyReviews(reviews);
  } catch (err) {
    throw new Error("Failed during classifyReviews: " + err.message);
  }

  // Step 3: Compute today's date
  try {
    todayDateStr = new Date().toISOString().split("T")[0];
  } catch (err) {
    throw new Error("Failed during date computation: " + err.message);
  }

  // Step 4: Load theme history
  try {
    history = loadThemeHistory();
  } catch (err) {
    throw new Error("Failed during loadThemeHistory: " + err.message);
  }

  // Step 5: Detect spikes
  try {
    spikes = detectSpikes(classified.themes, history);
  } catch (err) {
    throw new Error("Failed during detectSpikes: " + err.message);
  }

  // Step 6: Persist today's themes
  try {
    appendThemeHistory(todayDateStr, classified.themes);
  } catch (err) {
    throw new Error("Failed during appendThemeHistory: " + err.message);
  }

  // Step 7: Combine into digest
  return {
    date: todayDateStr,
    sentiment_summary: classified.sentiment_summary,
    themes: classified.themes,
    spikes,
    run_type: "explored",
  };
}
