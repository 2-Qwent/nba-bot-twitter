import dotenv from "dotenv";
import { getYesterdaysCloseGames } from "./services/nbaApi.js";
import { postTweet } from "./services/twitter.js";
import { formatTweet } from "./utils/formatTweet.js";
import cron from "node-cron";
import http from "http";

dotenv.config();

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('NBA Bot is running! 🏀\n');
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

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