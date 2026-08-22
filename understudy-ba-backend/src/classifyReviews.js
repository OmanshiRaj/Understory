import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const EMPTY_RESULT = {
  sentiment_summary: { positive: 0, negative: 0, neutral: 0 },
  themes: [],
};

/**
 * Sends a combined reviews array to Claude for sentiment + theme classification.
 *
 * @param {Array<{source: string, text: string, rating: number|null, date: string, user: string}>} reviews
 * @returns {Promise<Object>} Classified result with sentiment_summary and themes
 */
export async function classifyReviews(reviews) {
  if (!reviews || reviews.length === 0) {
    return EMPTY_RESULT;
  }

  // Send only the fields the model needs — keep the prompt lean
  const lean = reviews.map((r) => ({
    source: r.source,
    text: r.text,
    rating: r.rating,
  }));

  const systemPrompt = `You are a product analytics assistant. You will receive an array of user reviews as JSON. Analyze them and respond with ONLY valid JSON — no prose, no markdown code fences, no explanation before or after the JSON.

Your output must match this exact schema:
{
  "sentiment_summary": { "positive": number, "negative": number, "neutral": number },
  "themes": [
    { "name": string, "count": number, "sample_quotes": string[] }
  ]
}

Rules:
- Classify each review's overall sentiment as positive, negative, or neutral. The three numbers in sentiment_summary must sum to the total number of reviews (${reviews.length}).
- Identify recurring themes or topics across the reviews (e.g. "battery drain", "sync issues", "great support", "crash on settings page"). Be specific — prefer concrete topic names over vague ones.
- For each theme, count how many reviews mention it. A single review can contribute to multiple themes.
- For each theme, include at most 2 entries in sample_quotes. These must be short PARAPHRASED snippets capturing the gist of what reviewers said — do NOT copy verbatim text from the original reviews.
- Sort themes by count descending (most mentioned first).
- If a review has a star rating, use it as additional signal: 1-2 stars leans negative, 4-5 stars leans positive, 3 stars is context-dependent.`;

  const userMessage = `Here are ${reviews.length} user reviews to classify:\n${JSON.stringify(lean, null, 2)}`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      messages: [{ role: "user", content: userMessage }],
      system: systemPrompt,
    });

    const rawText = response.content[0].text;
    return parseJsonResponse(rawText);
  } catch (err) {
    throw new Error(`Failed during review classification: ${err.message}`);
  }
}

/**
 * Attempts to parse a JSON string. If it fails, tries stripping markdown
 * code fences and retries once before throwing.
 */
function parseJsonResponse(text) {
  try {
    return JSON.parse(text);
  } catch (_firstError) {
    // Strip markdown code fences (```json ... ``` or ``` ... ```)
    const stripped = text
      .replace(/^```(?:json)?\s*\n?/i, "")
      .replace(/\n?```\s*$/i, "")
      .trim();

    try {
      return JSON.parse(stripped);
    } catch (secondError) {
      throw new Error(
        `Failed to parse Claude response as JSON even after stripping code fences.\nRaw response:\n${text}\nParse error: ${secondError.message}`
      );
    }
  }
}
