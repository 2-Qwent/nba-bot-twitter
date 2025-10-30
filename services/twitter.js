import { TwitterApi } from "twitter-api-v2";


export const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

export async function postTweet(message) {
    try {
        const tweet = await twitterClient.v2.tweet(message);
        console.log("Tweet posted successfully:", tweet);
    } catch (error) {
        console.error("Error posting tweet:", error);
    }
}