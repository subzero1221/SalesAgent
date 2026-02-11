import { NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { handleInstagramCommentLogic } from "@/lib/meta-handlers/handleFeedEventsInstagram";
import { handleChatLogic } from "@/lib/meta-handlers/handleMessageEvent";


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
  try {
    const body = await request.json();
    const entry = body.entry?.[0];
    const change = entry?.changes?.[0];
   
    
    const response = NextResponse.json({ status: "EVENT_RECEIVED" });

     if (entry?.messaging && entry.messaging[0].message.is_echo) {
       return new Response("EVENT_RECEIVED", { status: 200 });
     }
    

    // 🚀 ფონურ რეჟიმში ვუშვებთ დამუშავებას
    if (entry?.messaging) {
      waitUntil(
        handleChatLogic(body)
          .then()
          .catch((err) => console.error("❌ Messenger Error:", err)),
      );
    }else if(change?.field === "comments"){
      
      waitUntil(
        handleInstagramCommentLogic(body)
          .then()
          .catch((err) => console.error("❌ Instagram Comment Error:", err)),
      );
    }

    return response;
  } catch (error) {
    console.error("Webhook POST Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

