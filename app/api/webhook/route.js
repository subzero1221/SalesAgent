import { NextResponse } from "next/server";
import { getShopByFacebookId } from "@/lib/actions/shopActions";
import { aiResponse } from "@/lib/actions/geminiService";
import { waitUntil } from "@vercel/functions"; 
import {
  getOrCreateSession,
  saveSessionDraft,
  addMessageToSession,
  resetSessionState,
} from "@/lib/actions/sessionActions";
import { isComplete, smartMergeDraft } from "@/lib/helpers/tools";
import { extractPhone } from "@/lib/helpers/extractor";
import { createRequest } from "@/lib/actions/requestActions";
import { sendOrderNotification } from "@/lib/actions/telegramActions";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

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

async function sendToMeta(facebookAccessToken, senderId, text) {
  const response = await fetch(
    `https://graph.facebook.com/v21.0/me/messages?access_token=${facebookAccessToken}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: { id: senderId },
        message: { text },
      }),
    },
  );

  const result = await response.json();
  if (result.error) console.error("Meta Send Error:", result.error);
}


export async function POST(request) {
  try {
    const body = await request.json();

    // 🛑 ეგრევე ვაბრუნებთ პასუხს Meta-სთვის, რომ არ დაგვბლოკოს
    const response = NextResponse.json({ status: "EVENT_RECEIVED" });

    // 🚀 ფონურ რეჟიმში ვუშვებთ დამუშავებას
    waitUntil(
      handleChatLogic(body)
        .then(() => console.log("✅ Message processed"))
        .catch((err) => console.error("❌ Background Error:", err)),
    );

    return response;
  } catch (error) {
    console.error("Webhook POST Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

 async function handleChatLogic(body) {
   const entry = body.entry?.[0];
   const messaging = entry?.messaging?.[0];
   const senderId = messaging?.sender?.id;
   const userText = messaging?.message?.text;
   const facebookPageId = entry?.id;

   if (!userText || !senderId) return;

   // 1. მაღაზიის პოვნა
   const shop = await getShopByFacebookId(facebookPageId);
   if (!shop) return;

   const { id: shopId, facebook_access_token: token } = shop;

   if (shop.bot_enabled === false) {
     console.log(`ℹ️ ბოტი გათიშულია მაღაზიისთვის: ${shop.name}`);
     return; 
   }  

const { data: quota, error: quotaErr } = await supabaseAdmin.rpc(
  "check_shop_quota", 
  {
    target_shop_id: shop.id, 
  },
);

if (quotaErr || !quota) {
  console.error("❌ Quota RPC failed:", quotaErr);
 
  return;
}

// ვამოწმებთ პასუხს
if (quota.can_proceed === false) {
  const quotaMsg =
    quota.reason === "plan_expired"
      ? "უკაცრავად უმოკლეს დროში დაგიკავშირდებათ ოპერატორი⏳."
      : "უკაცრავად უმოკლეს დროში დაგიკავშირდებათ ოპერატორი 🛑.";

  await sendToMeta(token, senderId, quotaMsg);
  return;
}

   // 3. სესიის მართვა
   let session = await getOrCreateSession(shopId, senderId);
   if (session?.state === "completed") {
     const minutesPast = (new Date() - new Date(session.updated_at)) / 60000;
     if (minutesPast > 1) {
       session = await resetSessionState(session.id);
     } else {
       await sendToMeta(
         token,
         senderId,
         "მოთხოვნა უკვე მივიღეთ 😊 მალე დაგიკავშირდებიან.",
       );
       return;
     }
   }

   // 4. იუზერის მესიჯის შენახვა
   await addMessageToSession(shopId, senderId, {
     role: "user",
     content: userText,
   });

   // 5. AI და ბიზნეს ლოგიკა (შენი ორიგინალი)
   try {
     let draft = { ...(session.draft ?? {}) };
     const phone = extractPhone(userText);
     if (!draft.phone && phone) draft.phone = phone;

     // Gemini-ს გამოძახება
     const ai = await aiResponse(shop, { ...session, draft }, userText);

     if (ai.extracted) {
       draft = smartMergeDraft(draft, ai.extracted);
     }

     // ✅ LEAD COMPLETION (შენი ლოგიკა)
     if (isComplete(shop.required_fields, draft)) {
       await createRequest(shopId, senderId, draft);

       if (shop.telegram_chat_id) {
         const specsInfo = [];
         if (draft.quantity > 1)
           specsInfo.push(`🔢 რაოდენობა: ${draft.quantity}`);
         if (draft.specs?.visual_appearance)
           specsInfo.push(`🎨 ფერი: ${draft.specs.visual_appearance}`);
         if (draft.specs?.size) specsInfo.push(`📏 ზომა: ${draft.specs.size}`);
         if (draft.specs?.volume)
           specsInfo.push(`🧴 მოცულობა: ${draft.specs.volume}ml`);

         await sendOrderNotification(shop.telegram_chat_id, {
           shopName: shop.name,
           product: draft.product || "პროდუქტი",
           phone: draft.phone,
           address: draft.address || "მისამართი არ წერია",
           details: specsInfo.join("\n"),
         });
       }

       // სესიის დასრულება
       await saveSessionDraft(shopId, senderId, {}, "completed");

       const finalNote =
         "მადლობა 🙌 მოთხოვნა მივიღეთ და მალე დაგიკავშირდებიან.";
       await addMessageToSession(shopId, senderId, {
         role: "model",
         content: finalNote,
       });
       await sendToMeta(token, senderId, finalNote);
       return;
     }

     // პროგრესის შენახვა (თუ არ დასრულებულა)
     await saveSessionDraft(shopId, senderId, draft, "collecting");

     // პასუხის გაგზავნა
     const botReply =
       ai.reply || "ვერ გავიგე 😅 გთხოვ დამიზუსტე რას გულისხმობ?";
     await addMessageToSession(shopId, senderId, {
       role: "model",
       content: botReply,
     });
     await sendToMeta(token, senderId, botReply);
   } catch (aiErr) {
     console.error("❌ AI/Business Error:", aiErr);
     await sendToMeta(
       token,
       senderId,
       "ბოდიში, ტექნიკური ხარვეზია. ცოტა ხანში შემეხმიანე.",
     );
   }
 }
