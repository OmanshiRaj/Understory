import gplay from "google-play-scraper";

/**
 * Fetches recent Play Store reviews for a given package.
 *
 * Returns an array of objects in the shared review shape:
 *   { source: "playstore", text: string, rating: number, date: string, user: string }
 *
 * To swap scraping strategies later, rewrite only the internals of this
 * function — the name, signature, and return shape must stay identical.
 *
 * @param {string} [packageName] - Android package name (falls back to PLAYSTORE_APP_ID env var)
 * @returns {Promise<Array>} Mapped review array, or [] on failure
 */
export async function fetchPlayStoreReviews(packageName) {
  const appId = packageName || process.env.PLAYSTORE_APP_ID;
  if (!appId) {
    console.warn(
      "No package name provided and PLAYSTORE_APP_ID is not set — returning empty array"
    );
    return [];
  }

  try {
    const result = await gplay.reviews({
      appId,
      sort: gplay.sort.NEWEST,
      num: 50,
    });

    return result.data.map((review) => ({
      source: "playstore",
      text: review.text || "",
      rating: review.score,
      date: review.date
        ? new Date(review.date).toISOString().split("T")[0]
        : null,
      user: review.userName || "Anonymous",
    }));
  } catch (err) {
    console.warn(
      `Failed to fetch Play Store reviews for "${appId}": ${err.message} — returning empty array`
    );
    return [];
  }
}
