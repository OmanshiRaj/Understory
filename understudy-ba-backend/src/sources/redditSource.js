import { readFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DUMMY_FILE = join(__dirname, "..", "..", "data", "dummy-reddit.json");

/**
 * Fetches Reddit reviews from the dummy data file.
 *
 * Returns an array of objects in the shared review shape:
 *   { source: "reddit", text: string, rating: null, date: string, user: string }
 *
 * To swap in the real Reddit API later (snoowrap / OAuth fetch), rewrite only
 * the internals of this function — keep the name, zero-argument signature, and
 * return shape identical so nothing else in the codebase needs to change.
 *
 * @returns {Promise<Array>} Mapped review array, or [] on failure
 */
export async function fetchRedditReviews() {
  try {
    const raw = await readFile(DUMMY_FILE, "utf-8");
    const posts = JSON.parse(raw);

    return posts.map((entry) => ({
      source: "reddit",
      text: entry.text,
      rating: null,
      date: entry.date,
      user: entry.user,
    }));
  } catch (err) {
    console.warn(
      "dummy-reddit.json not found or invalid — returning empty array"
    );
    return [];
  }
}
