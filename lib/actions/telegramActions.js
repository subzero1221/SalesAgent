export async function sendOrderNotification(chatId, orderData) {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  // თუ მაღაზიას არ აქვს გააქტიურებული ტელეგრამი, უბრალოდ გავჩერდეთ
  if (!chatId) return;

  const message = `
🚀 *ახალი შეკვეთა!*
-------------------------
🏪 *მაღაზია:* ${orderData.shopName}
📦 *პროდუქტი:* ${orderData.product}
📞 *ტელეფონი:* ${orderData.phone}
📍 *მისამართი:* ${orderData.address}
-------------------------
✅ დაუკავშირდით კლიენტს!
  `;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown",
      }),
    });
    console.log("✅ Telegram notification sent!");
  } catch (err) {
    console.error("❌ Telegram error:", err);
  }
}
