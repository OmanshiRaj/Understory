import {
  saveSnapshot,
  loadSnapshot,
  diffMovedCards,
} from "./snapshotStore.js";

// --- Test 1: Save and load a snapshot, then diff moved cards ---

const fakeYesterday = [
  { title: "Fix login page crash", list: "In Progress", assignee: "Alice" },
  { title: "Update API docs", list: "To Do", assignee: "Bob" },
  { title: "Design onboarding flow", list: "In Progress", assignee: "Charlie" },
];

const fakeToday = [
  { title: "Fix login page crash", list: "Done", assignee: "Alice" },           // moved: In Progress → Done
  { title: "Update API docs", list: "In Progress", assignee: "Bob" },           // moved: To Do → In Progress
  { title: "Design onboarding flow", list: "In Progress", assignee: "Charlie" }, // unchanged
  { title: "New card added today", list: "To Do", assignee: "Diana" },          // new card, should be ignored
];

const FAKE_YESTERDAY_DATE = "1999-01-01";
const FAKE_TODAY_DATE = "1999-01-02";
const NONEXISTENT_DATE = "1900-12-31";

console.log("=== Test 1: Save yesterday's snapshot ===");
saveSnapshot(fakeYesterday, FAKE_YESTERDAY_DATE);
console.log(`Saved snapshot for ${FAKE_YESTERDAY_DATE}\n`);

console.log("=== Test 2: Load yesterday's snapshot back ===");
const loaded = loadSnapshot(FAKE_YESTERDAY_DATE);
console.log(JSON.stringify(loaded, null, 2), "\n");

console.log("=== Test 3: Diff moved cards (yesterday → today) ===");
const moved = diffMovedCards(loaded, fakeToday);
console.log("Moved cards:");
console.log(JSON.stringify(moved, null, 2), "\n");

console.log("=== Test 4: Load a snapshot that was never saved ===");
const missing = loadSnapshot(NONEXISTENT_DATE);
console.log(`loadSnapshot("${NONEXISTENT_DATE}") returned:`, missing, "\n");

console.log("=== Test 5: Diff when yesterdayCards is null (first run) ===");
const firstRunDiff = diffMovedCards(null, fakeToday);
console.log("diffMovedCards(null, todayCards) returned:", firstRunDiff, "\n");

// Cleanup: save today too so we can inspect the file if needed
saveSnapshot(fakeToday, FAKE_TODAY_DATE);
console.log(`Saved snapshot for ${FAKE_TODAY_DATE}`);
console.log("\n✅ All tests completed.");
