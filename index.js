import dotenv from "dotenv";
dotenv.config();
import { getYesterdaysCloseGames } from "./services/nbaApi.js";
import { postTweet } from "./services/twitter.js";
import { formatTweet } from "./utils/formatTweet.js";
import cron from "node-cron";


cron.schedule("45 6 * * *", async () => {
  try {
    console.log("Fetching yesterday's close games...");
    const closeGames = await getYesterdaysCloseGames();
    console.log("Fetched games:", closeGames);
    console.log("Formatting tweet...");
    const tweet = formatTweet(closeGames);
    console.log("Formatted tweet:", tweet);
    console.log("Posting tweet...");
    await postTweet(tweet);
    console.log("Bot executed successfully!");
  } catch (error) {
    console.error("Error in bot execution:", error);
  }
}, {
  scheduled: true,
  timezone: "Europe/Paris"
});

console.log("NBA Bot started! Will tweet daily at 6:45 AM CET");