import { NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions"; 
import { handleChatLogic } from "@/lib/meta-handlers/handleMessageEvent";
import { handleFeedLogic } from "@/lib/meta-handlers/handdleFeedEvents";

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const VERIFY_TOKEN = "tbilisi_hustle_2026";

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("WEBHOOK_VERIFIED");
    return new Response(challenge ?? "", { status: 200 });
  }

  return new Response("ok", { status: 200 });
}



export async function POST(request) {
  console.log("!!! REQ INCOMING !!!");
  try {
    const body = await request.json();
    const entry = body.entry?.[0];

    console.log("Received webhook event:", JSON.stringify(body));

    // 🛑 ეგრევე ვპასუხობთ Meta-ს
    const response = NextResponse.json({ status: "EVENT_RECEIVED" });

    // 🚀 ვარკვევთ რა ტიპის ივენთია
    if (entry?.messaging) {
      // ეს არის პირადი მესიჯი (Messenger)
      waitUntil(
        handleChatLogic(body)
          .then(() => console.log("✅ Message processed"))
          .catch((err) => console.error("❌ Messenger Error:", err)),
      );
    } else if (entry?.changes?.[0]?.field === "feed") {
      console.log("Processing feed event...");
      // ეს არის პოსტის კომენტარი (Feed)
      // აქ დავაიმპორტებთ ახალ ფუნქციას, რომელსაც ქვემოთ შევქმნით
      waitUntil(
        handleFeedLogic(body)
          .then(() => console.log("✅ Feed event processed"))
          .catch((err) => console.error("❌ Feed Error:", err)),
      );
    }

    return response;
  } catch (error) {
    console.error("Webhook POST Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
