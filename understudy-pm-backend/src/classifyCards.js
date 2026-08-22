import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const STALE_DAYS_THRESHOLD = parseInt(process.env.STALE_DAYS_THRESHOLD, 10) || 5;

/**
 * Sends an array of Trello cards to Claude for classification.
 * Returns a structured JSON object with overdue, stale, blocked, and workload data.
 *
 * @param {Array} cards - Array of card objects from the Trello board
 * @returns {Promise<Object>} Classified card data
 */
export async function classifyCards(cards) {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const systemPrompt = `You are a project management assistant. You will receive an array of Trello cards as JSON. Classify them and respond with ONLY valid JSON — no prose, no markdown fences, no explanation.

Your output must match this exact schema:
{
  "overdue": [{ "title": string, "due_date": string, "assignee": string }],
  "stale": [{ "title": string, "days_since_update": number, "assignee": string }],
  "blocked": [{ "title": string, "reason": string, "assignee": string }],
  "workload_per_assignee": [{ "assignee": string, "open_cards": number }]
}

Rules:
- "overdue": cards whose due date is before today's date.
- "stale": cards not updated in the last ${STALE_DAYS_THRESHOLD} or more days (use days_since_update).
- "blocked": cards that appear blocked based on labels, comments, or title keywords like "blocked", "waiting", "stuck".
- "workload_per_assignee": count of all open (non-archived) cards per assignee.
- A card can appear in multiple categories (e.g. both overdue and stale).
- If no cards match a category, return an empty array for it.
- If a card has no assignee, use "Unassigned".`;

  const userMessage = `Today's date is ${today}.
Stale threshold is ${STALE_DAYS_THRESHOLD} days.

Here are the Trello cards to classify:
${JSON.stringify(cards, null, 2)}`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [{ role: "user", content: userMessage }],
    system: systemPrompt,
  });

  const text = response.content[0].text;

  try {
    return JSON.parse(text);
  } catch (parseError) {
    throw new Error(
      `Failed to parse Claude response as JSON.\nRaw response:\n${text}\nParse error: ${parseError.message}`
    );
  }
}
