import "dotenv/config";
import { fetchPlayStoreReviews } from "./playStoreSource.js";

const appId = process.env.PLAYSTORE_APP_ID;
console.log(`Fetching Play Store reviews for: ${appId || "(not set)"}\n`);

const reviews = await fetchPlayStoreReviews();
console.log(`Total reviews fetched: ${reviews.length}\n`);
console.log("First 5 reviews:");
console.log(JSON.stringify(reviews.slice(0, 5), null, 2));
