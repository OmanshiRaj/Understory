import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "data");
const HISTORY_FILE = join(DATA_DIR, "theme-history.json");

// ────────────────────────────────────────────────
// PART 1 — History storage helpers
// ────────────────────────────────────────────────

/**
 * Reads data/theme-history.json and returns its parsed contents.
 * Returns [] if the file doesn't exist yet.
 *
 * File shape: [ { date: "YYYY-MM-DD", themes: [{ name, count }] }, ... ]
 *
 * @returns {Array} Array of daily theme snapshots
 */
export function loadThemeHistory() {
  if (!existsSync(HISTORY_FILE)) {
    return [];
  }
  try {
    const raw = readFileSync(HISTORY_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Appends (or replaces) a daily theme snapshot in data/theme-history.json.
 *
 * - Only stores { name, count } per theme (strips sample_quotes etc.)
 * - If an entry for the same date already exists, it's replaced (no dupes).
 * - Creates the data/ folder if missing.
 *
 * @param {string} date - "YYYY-MM-DD"
 * @param {Array<{name: string, count: number}>} themes - today's themes
 */
export function appendThemeHistory(date, themes) {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }

  const history = loadThemeHistory();

  const entry = {
    date,
    themes: themes.map((t) => ({ name: t.name, count: t.count })),
  };

  // Replace existing entry for the same date, or append
  const idx = history.findIndex((h) => h.date === date);
  if (idx !== -1) {
    history[idx] = entry;
  } else {
    history.push(entry);
  }

  writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), "utf-8");
}

// ────────────────────────────────────────────────
// PART 2 — Spike calculation
// ────────────────────────────────────────────────

/**
 * Detects theme spikes by comparing today's theme counts against historical
 * averages.
 *
 * A theme is flagged as a spike if:
 *   - It has no prior history (is_new: true), OR
 *   - today_count > 2 * average_count (where average_count is computed
 *     only over days where the theme actually appeared, not all days)
 *
 * @param {Array<{name: string, count: number}>} todayThemes
 * @param {Array<{date: string, themes: Array<{name: string, count: number}>}>} historyThemes
 * @returns {Array<{theme: string, today_count: number, average_count: number, is_new: boolean}>}
 */
export function detectSpikes(todayThemes, historyThemes) {
  const spikes = [];

  for (const today of todayThemes) {
    // Collect all historical counts for this theme by name
    const pastCounts = [];
    for (const day of historyThemes) {
      const match = day.themes.find((t) => t.name === today.name);
      if (match) {
        pastCounts.push(match.count);
      }
    }

    if (pastCounts.length === 0) {
      // Brand-new theme — no prior history at all
      spikes.push({
        theme: today.name,
        today_count: today.count,
        average_count: 0,
        is_new: true,
      });
    } else {
      // Compute average only over days the theme appeared
      const avg = pastCounts.reduce((sum, c) => sum + c, 0) / pastCounts.length;

      if (today.count > 2 * avg) {
        spikes.push({
          theme: today.name,
          today_count: today.count,
          average_count: parseFloat(avg.toFixed(2)),
          is_new: false,
        });
      }
    }
  }

  return spikes;
}
