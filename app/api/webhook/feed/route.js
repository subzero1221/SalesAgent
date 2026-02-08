import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const VERIFY_TOKEN = "tbilisi_hustle_2026";

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const response = NextResponse.json({ status: "OK" });

    // ვამოწმებთ, რომ ნამდვილად Page-ის ივენთია (Facebook)
    if (body.object !== "page") return response;

    const entry = body.entry?.[0];
    const change = entry?.changes?.[0];

    if (change?.field !== "feed") return response;

    const value = change.value;
    const commentId = value.comment_id || value.id; // FB ხან ასე აგზავნის, ხან ისე
    const senderId = value.from?.id;
    const platformId = entry.id; // შენი გვერდის ID

    // დუბლიკატების ფილტრი: თუ გვერდმა თავად დააკომენტარა, ვაიგნორებთ
    if (senderId === platformId) return response;

    // აქ უკვე შენი მაღაზიის პოვნა და ტოკენის გამოყენება
    const shop = await getShopByPlatformId(platformId);
    if (!shop) return response;

    console.log(`🔵 FB Comment: ${value.message}`);

    // საჯარო და პირადი პასუხების გაგზავნა
    await sendPublicComment(
      commentId,
      "მადლობა კომენტარისთვის! მოგწერეთ პირადში. 😊",
      shop.facebook_access_token,
    );
    await sendPrivateReply(
      commentId,
      "გამარჯობა! აი დეტალური ინფო...",
      shop.facebook_access_token,
    );

    return response;
  } catch (error) {
    console.error("FB Feed Error:", error);
    return response;
  }
}

async function sendPrivateReply(commentId, text, token) {
  await fetch(
    `https://graph.facebook.com/v21.0/me/messages?access_token=${token}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: { comment_id: commentId }, // 👈 აი, მთავარი საიდუმლო!
        message: { text: text },
      }),
    },
  );
}

async function sendPublicComment(commentId, text, token) {
  await fetch(
    `https://graph.facebook.com/v21.0/${commentId}/comments?access_token=${token}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    },
  );
}