import { Bot, webhookCallback, Context, GrammyError, HttpError } from "grammy";
import { VercelRequest, VercelResponse } from "@vercel/node";

// 1. Initialize Bot
const token = process.env.TOKEN;
if (!token) throw new Error("TOKEN is unset");

const bot = new Bot(token);

// 2. The "Crash-Proof" Error Handler
// This effectively catches ANY error that happens in your bot.
// Instead of crashing the process, it logs the error and keeps the bot alive.
bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;
  
  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("Unknown error:", e);
  }
});

// 3. Your Bot Logic
bot.command("start", async (ctx) => {
    await ctx.reply("I am a robust TypeScript bot! 🛡️");
});

bot.on("message", async (ctx) => {
    // Even if this line fails (e.g. text is null), bot.catch will handle it!
    await ctx.reply(`You said: ${ctx.message.text}`);
});

// 4. Export the Webhook Handler for Vercel
// We use "std/http" adapter which works perfectly on Vercel
export default async (req: VercelRequest, res: VercelResponse) => {
    // Validate that the token exists (Vercel warm-up check)
    if (!token) {
        return res.status(500).json({ error: "Bot token not set" });
    }
    
    // Pass the request to grammY
    // This helper function handles all the JSON parsing and response logic
    return webhookCallback(bot, "std/http")(req, res);
};