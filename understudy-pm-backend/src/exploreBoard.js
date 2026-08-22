import "dotenv/config";
import { execSync } from "child_process";

/**
 * Shells out to webcmd CLI to fetch raw Trello board data as JSON.
 * @returns {Promise<any>} Parsed JSON output from webcmd
 */
export async function exploreBoardRaw() {
  const url = process.env.TRELLO_BOARD_URL;
  if (!url) {
    throw new Error(
      "TRELLO_BOARD_URL is missing. Please set TRELLO_BOARD_URL in your .env file."
    );
  }

  // Starting point for webcmd execution:
  // General command shape: webcmd trello board --url "<url>" -f json
  // Note: Adjust the exact command or flags below based on what your installed webcmd version actually expects.
  const command = `webcmd trello board --url "${url}" -f json`;

  const output = execSync(command, { encoding: "utf-8" });
  return JSON.parse(output);
}
