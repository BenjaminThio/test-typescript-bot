import { Bot, webhookCallback, GrammyError, HttpError } from "grammy";
import { VercelRequest, VercelResponse } from "@vercel/node";

const token = process.env.TOKEN;
if (!token) throw new Error("TOKEN is unset");

const bot = new Bot(token);

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

bot.command("start", async (ctx) => {
    await ctx.reply("I am working now! 🚀");
});

bot.on("message", async (ctx) => {
    await ctx.reply("I got your message!");
});

// FIXED: Using "http" adapter for Vercel Node.js environment
export default async (req: VercelRequest, res: VercelResponse) => {
    // Add a simple log to prove the request reached the server
    console.log("Incoming Webhook Request");

    try {
        return webhookCallback(bot, "http")(req, res);
    } catch (e) {
        console.error("Webhook processing error:", e);
        return res.status(500).send("Error");
    }
};