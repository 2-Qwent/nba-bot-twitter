import dotenv from "dotenv";
dotenv.config();
import { getYesterdaysCloseGames } from "./services/nbaApi.js";
import { postTweet } from "./services/twitter.js";
import { formatTweet } from "./utils/formatTweet.js";
import cron from "node-cron";


cron.schedule("0 8 * * *", async () => {
  try {
    const closeGames = await getYesterdaysCloseGames();
    const tweet = formatTweet(closeGames);
    await postTweet(tweet);
    console.log("Bot executed successfully!");
  } catch (error) {
    console.error("Error in bot execution:", error);
  }
}, {
  scheduled: true,
  timezone: "Europe/Paris"
});

console.log("NBA Bot started! Will tweet daily at 8:00 AM CET");