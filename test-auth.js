import dotenv from "dotenv";
import { TwitterApi } from "twitter-api-v2";

dotenv.config();

async function testAuth() {
  try {
    console.log("🔍 Testing Twitter authentication...");
    
    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_SECRET,
    });

    // Test simple : récupérer les infos du compte
    const user = await client.v2.me();
    console.log("✅ Authentication successful!");
    console.log("👤 User:", user.data.username);
    
  } catch (error) {
    console.error("❌ Authentication failed:", error.message);
    
    if (error.code === 401) {
      console.log("🕐 Possible causes:");
      console.log("   - Tokens not yet active (wait 10-15 minutes)");
      console.log("   - Wrong permissions (check Read & Write)");
      console.log("   - Wrong token values");
    }
  }
}

testAuth();