import { detectSpikes } from "./spikeDetector.js";

// ── Fake historical data: 4 past days ──
const fakeHistory = [
  {
    date: "2026-08-18",
    themes: [
      { name: "battery drain", count: 3 },
      { name: "great support", count: 5 },
      { name: "sync issues", count: 2 },
    ],
  },
  {
    date: "2026-08-19",
    themes: [
      { name: "battery drain", count: 4 },
      { name: "great support", count: 6 },
      // sync issues missing this day — sparse theme
    ],
  },
  {
    date: "2026-08-20",
    themes: [
      { name: "battery drain", count: 3 },
      { name: "great support", count: 5 },
      { name: "sync issues", count: 3 },
    ],
  },
  {
    date: "2026-08-21",
    themes: [
      { name: "battery drain", count: 5 },   // trending up slightly
      { name: "great support", count: 4 },
      { name: "sync issues", count: 2 },
    ],
  },
];

// ── Fake today's themes ──
const fakeToday = [
  // Similar to history average (~5) → should NOT spike
  { name: "great support", count: 5, sample_quotes: ["quick response", "helpful team"] },
  // Way above history average (~3.75) → 12 > 2*3.75=7.5 → SHOULD spike
  { name: "battery drain", count: 12, sample_quotes: ["phone overheats", "drains fast"] },
  // Brand-new theme, no history → SHOULD spike as is_new
  { name: "login crash", count: 8, sample_quotes: ["app crashes on login", "can't sign in"] },
  // Sync issues avg is (2+3+2)/3 = 2.33, today = 3 → 3 < 2*2.33=4.67 → should NOT spike
  { name: "sync issues", count: 3, sample_quotes: ["sync is slow", "data out of sync"] },
];

console.log("=== Spike Detection Test ===\n");
console.log("History covers 4 days with themes: battery drain, great support, sync issues");
console.log("Today has: great support (stable), battery drain (spiking), login crash (new), sync issues (stable)\n");

const spikes = detectSpikes(fakeToday, fakeHistory);

console.log(`Spikes detected: ${spikes.length}\n`);
console.log(JSON.stringify(spikes, null, 2));

// ── Edge case: empty history (first day) ──
console.log("\n=== Edge Case: Empty History (First Day) ===\n");
const firstDaySpikes = detectSpikes(fakeToday, []);
console.log(`All ${firstDaySpikes.length} themes flagged as new:`);
console.log(JSON.stringify(firstDaySpikes, null, 2));
