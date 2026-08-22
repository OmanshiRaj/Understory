import { exploreBoardRaw } from "./exploreBoard.js";

async function runTest() {
  try {
    const data = await exploreBoardRaw();
    console.log("Explored Board Output:");
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error exploring board:", error.message);
    process.exit(1);
  }
}

runTest();
