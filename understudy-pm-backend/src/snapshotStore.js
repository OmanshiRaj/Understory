import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "data");

/**
 * Writes the cards array as JSON to data/snapshot-<dateStr>.json.
 * Creates the data folder if it doesn't exist.
 *
 * @param {Array} cards - Array of card objects to persist
 * @param {string} dateStr - Date string used in the filename (e.g. "2026-08-22")
 */
export function saveSnapshot(cards, dateStr) {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  const filePath = join(DATA_DIR, `snapshot-${dateStr}.json`);
  writeFileSync(filePath, JSON.stringify(cards, null, 2), "utf-8");
}

/**
 * Reads data/snapshot-<dateStr>.json and returns the parsed array.
 * Returns null if the file doesn't exist (e.g. first run ever).
 *
 * @param {string} dateStr - Date string used in the filename (e.g. "2026-08-22")
 * @returns {Array|null} Parsed card array, or null if no snapshot exists
 */
export function loadSnapshot(dateStr) {
  const filePath = join(DATA_DIR, `snapshot-${dateStr}.json`);
  if (!existsSync(filePath)) {
    return null;
  }
  const raw = readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

/**
 * Compares yesterday's and today's card arrays to find cards that changed lists.
 *
 * - If yesterdayCards is null, returns an empty array (nothing to diff on first run).
 * - Cards that exist in only one of the two arrays are ignored.
 * - Only cards present in both arrays whose "list" field differs are returned.
 *
 * @param {Array|null} yesterdayCards - Yesterday's card array (or null)
 * @param {Array} todayCards - Today's card array
 * @returns {Array<{title: string, from: string, to: string}>} Cards that moved lists
 */
export function diffMovedCards(yesterdayCards, todayCards) {
  if (yesterdayCards === null) {
    return [];
  }

  // Build a lookup of yesterday's list-by-title
  const yesterdayByTitle = new Map();
  for (const card of yesterdayCards) {
    yesterdayByTitle.set(card.title, card.list);
  }

  const moved = [];
  for (const card of todayCards) {
    const yesterdayList = yesterdayByTitle.get(card.title);
    // Ignore cards that didn't exist yesterday
    if (yesterdayList === undefined) {
      continue;
    }
    // Only include cards whose list actually changed
    if (card.list !== yesterdayList) {
      moved.push({ title: card.title, from: yesterdayList, to: card.list });
    }
  }

  return moved;
}
