import dotenv from "dotenv";
import { getYesterdaysCloseGames } from "./services/nbaApi.js";
import { postTweet } from "./services/twitter.js";
import { formatTweet } from "./utils/formatTweet.js";

dotenv.config();

async function testBot() {
  try {
    console.log("🧪 Testing NBA bot...");
    
    console.log("📡 Fetching yesterday's close games...");
    const closeGames = await getYesterdaysCloseGames();
    console.log("🏀 Found games:", closeGames);
    
    console.log("📝 Formatting tweet...");
    const tweet = formatTweet(closeGames);
    console.log("💬 Tweet content:", tweet);
    
    console.log("🐦 Posting to Twitter...");
    await postTweet(tweet);
    
    console.log("✅ Test completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

testBot();