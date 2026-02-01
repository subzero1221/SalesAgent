import { supabaseAdmin } from "../supabaseAdmin";

export async function sendOrderNotification(chatId, orderData) {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!chatId) return;

  // ვაწყობთ დამატებით ინფორმაციას (რაოდენობა, ფერი, ზომა და ა.შ.)
  const message = `
🚀 *ახალი შეკვეთა!*
-------------------------
🏪 *მაღაზია:* ${orderData.shopName}
📦 *პროდუქტი:* ${orderData.product}
${orderData.details ? orderData.details + "\n-------------------------" : ""}
📞 *ტელეფონი:* ${orderData.phone}
📍 *მისამართი:* ${orderData.address}
-------------------------
✅ დაუკავშირდით კლიენტს!
  `;

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "Markdown",
        }),
      },
    );

    if (!res.ok) {
      const errData = await res.json();
      console.error("❌ Telegram API error:", errData);
    } else {
      console.log("✅ Telegram notification sent!");
    }
  } catch (err) {
    console.error("❌ Telegram fetch error:", err);
  }
}

export async function handleTelegramUpdate(update) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  console.log("Received Telegram update:", update);
  console.log("Using Telegram bot token:", token ? "Present" : "Missing");

  // ვამოწმებთ არის თუ არა ეს /start ბრძანება
  const message = update.message;
  if (!message || !message.text) return;

  const text = message.text;
  const chatId = message?.chat?.id;

  if ( !chatId ) return;

  if (text.startsWith("/start")) {
    const parts = text.split(" ");
    const shopId = parts[1]; // აი აქ ვიღებთ იმ ID-ს რაც ლინკში ჩავსვით

    if (shopId) {
      // 1. ვაახლებთ ბაზაში მაღაზიის ჩათის ID-ს
      const { error } = await supabaseAdmin
        .from("shops")
        .update({ telegram_chat_id: chatId })
        .eq("id", shopId);

      if (error) {
        console.error("❌ Error linking telegram:", error);
        return;
      }

      // 2. ვუგზავნით დასტურს იუზერს ტელეგრამში
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: "✅ გილოცავთ! თქვენი მაღაზია წარმატებით დაუკავშირდა. შეკვეთებს მიიღებთ ამ ჩათში. 🚀",
        }),
      });
    }
  }
}