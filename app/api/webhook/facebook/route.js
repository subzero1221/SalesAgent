import { NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions"; 
import { handleChatLogic } from "@/lib/meta-handlers/handleMessageEvent";
import { handleFeedLogic } from "@/lib/meta-handlers/handleFeedEvents";
import { handlePostLogic } from "@/lib/meta-handlers/handlePostEvent";
import { handleImageLogic } from "@/lib/meta-handlers/handleImageLogic";

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
    const change = entry?.changes?.[0];
    const value = change?.value; 

    console.log("Received webhook event:", JSON.stringify(body));

    // 🛑 ეგრევე ვპასუხობთ Meta-ს
    const response = NextResponse.json({ status: "EVENT_RECEIVED" });

    // 🚀 ვარკვევთ რა ტიპის ივენთია
    if (entry?.messaging) {
      const messagingEvent = entry.messaging[0];
      const message = messagingEvent.message;

      // 🔍 ვამოწმებთ: არის თუ არა სურათი?
      const isImage = message?.attachments?.[0]?.type === "image";

      if (isImage) {
        console.log("📸 Image Message Detected! Routing to Image Handler...");

        // 👉 აქ ვიძახებთ ახალ, სპეციალურ ფუნქციას სურათებისთვის
        waitUntil(
          handleImageLogic(body)
            .then(() => console.log("✅ Image Logic processed"))
            .catch((err) => console.error("❌ Image Logic Error:", err)),
        );
      } else {
        console.log("💬 Text Message Detected! Routing to Chat Handler...");

        // 👉 ეს რჩება ძველი ტექსტისთვის
        waitUntil(
          handleChatLogic(body)
            .then(() => console.log("✅ Chat Logic processed"))
            .catch((err) => console.error("❌ Chat Logic Error:", err)),
        );
      }
    }

    // 2. Feed (აქ შემოდის პოსტიც და კომენტარიც!)
    else if (change?.field === "feed") {
      console.log(`Processing feed event: ${value?.item}`);

      // ა) თუ ეს არის კომენტარი
      if (value?.item === "comment" && value?.verb === "add") {
        console.log("💬 Handling Comment Logic...");
        waitUntil(
          handleFeedLogic(body)
            .then(() => console.log("✅ Feed/Comment processed"))
            .catch((err) => console.error("❌ Feed Error:", err)),
        );
      }

      // ბ) თუ ეს არის ახალი პოსტი (ფოტო, სტატუსი, ვიდეო)
      else if (
        ["photo", "status", "post", "video"].includes(value?.item) &&
        value?.verb === "add"
      ) {
        console.log("📸 Handling New Post Logic...");
        waitUntil(
          handlePostLogic(body)
            .then(() => console.log("✅ Post Logic processed"))
            .catch((err) => console.error("❌ Post Logic Error:", err)),
        );
      }

      // გ) სხვა რამე (მაგ: ლაიქი)
      else {
        console.log("⚠️ Ignored feed item:", value?.item);
      }
    }

    return response;
  } catch (error) {
    console.error("Webhook POST Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
