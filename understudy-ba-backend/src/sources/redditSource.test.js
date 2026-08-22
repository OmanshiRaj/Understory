import { fetchRedditReviews } from "./redditSource.js";

const reviews = await fetchRedditReviews();
console.log(`Fetched ${reviews.length} reviews:\n`);
console.log(JSON.stringify(reviews, null, 2));
