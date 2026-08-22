import "dotenv/config";
import { getAllReviews } from "./combineSources.js";
import { classifyReviews } from "./classifyReviews.js";

console.log("Fetching all reviews...\n");
const reviews = await getAllReviews();
console.log(`Combined ${reviews.length} reviews. Sending to Claude for classification...\n`);

const result = await classifyReviews(reviews);
console.log("Classification result:");
console.log(JSON.stringify(result, null, 2));
