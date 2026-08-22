import "dotenv/config";
import { getAllReviews } from "./combineSources.js";

const reviews = await getAllReviews();

// Total count
console.log(`\nTotal combined reviews: ${reviews.length}\n`);

// Breakdown per source
const counts = {};
for (const r of reviews) {
  counts[r.source] = (counts[r.source] || 0) + 1;
}
console.log("Count per source:", counts, "\n");

// First 2 entries from each source
const sources = [...new Set(reviews.map((r) => r.source))];
for (const src of sources) {
  const samples = reviews.filter((r) => r.source === src).slice(0, 2);
  console.log(`--- ${src} (first 2) ---`);
  console.log(JSON.stringify(samples, null, 2), "\n");
}
