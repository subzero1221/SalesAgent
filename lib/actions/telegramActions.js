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
