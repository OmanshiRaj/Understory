import { fetchRedditReviews } from "./sources/redditSource.js";
import { fetchPlayStoreReviews } from "./sources/playStoreSource.js";

/**
 * Dynamically imports fetchFeedbackReviews so the module doesn't crash if
 * feedbackSource.js doesn't exist yet. Returns a wrapper that rejects
 * cleanly if the import fails.
 */
async function safeFetchFeedback() {
  const { fetchFeedbackReviews } = await import("./sources/feedbackSource.js");
  return fetchFeedbackReviews();
}

const SOURCE_LABELS = ["reddit", "playstore", "feedback-form"];

/**
 * Fetches reviews from all sources in parallel, combines them into a single
 * array sorted by date descending.
 *
 * - Uses Promise.allSettled so one failing source doesn't kill the others.
 * - Filters out entries with missing/empty/whitespace-only text.
 * - Every entry matches the shared shape: { source, text, rating, date, user }
 *
 * @returns {Promise<Array>} Combined, filtered, sorted review array
 */
export async function getAllReviews() {
  const results = await Promise.allSettled([
    fetchRedditReviews(),
    fetchPlayStoreReviews(),
    safeFetchFeedback(),
  ]);

  const combined = [];

  results.forEach((result, i) => {
    const label = SOURCE_LABELS[i];
    if (result.status === "rejected") {
      console.warn(
        `Source "${label}" failed: ${result.reason?.message || result.reason} — skipping`
      );
      return;
    }
    combined.push(...result.value);
  });

  // Filter out entries with missing, empty, or whitespace-only text
  const filtered = combined.filter(
    (entry) => typeof entry.text === "string" && entry.text.trim().length > 0
  );

  // Sort by date descending (most recent first)
  filtered.sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return b.date.localeCompare(a.date);
  });

  return filtered;
}
