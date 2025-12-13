import fetch from "node-fetch";

// 🔹 Paste your Discord bot token here
const BOT_TOKEN = "YOUR_BOT_TOKEN_HERE";

// 🔹 Google Apps Script Web App URL
const SHEET_URL = "https://script.google.com/macros/s/AKfycbwz7EmU9e7wPdBFD9de7ZdoCh1bmh2mLZuxxGoaCG_H5tQ4QxdAr9UEehaIS6AuqNiw/exec";

export default async function handler(req, res) {
  try {
    const data = req.body;

    // Send user messages to Google Sheet
    if (data.content && data.author && !data.author.bot) {
      await fetch(SHEET_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: data.author.id,
          username: data.author.username,
          channelId: data.channel_id,
          message: data.content
        })
      });
    }

    // Get replies from Google Sheet
    const replyRes = await fetch(SHEET_URL);
    const replies = await replyRes.json();

    for (const r of replies) {
      await fetch(`https://discord.com/api/v10/channels/${r.channelId}/messages`, {
        method: "POST",
        headers: {
          "Authorization": `Bot ${BOT_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          content: `<@${r.userId}> ${r.botReply}`
        })
      });
    }

    res.status(200).json({ status: "ok" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
}
