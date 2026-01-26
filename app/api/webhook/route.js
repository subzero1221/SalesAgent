import { NextResponse } from "next/server";
import { getShopById } from "@/lib/actions/shopActions";
import { aiResponse } from "@/lib/actions/geminiService";
import {
  getOrCreateSession,
  saveSessionDraft,
  addMessageToSession,
  resetSessionState,
} from "@/lib/actions/sessionActions";
import { isComplete, smartMergeDraft } from "@/lib/helpers/tools";
import { extractPhone } from "@/lib/helpers/extractor";
import { createRequest } from "@/lib/actions/requestActions";

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

    const entry = body.entry?.[0];
    const messaging = entry?.messaging?.[0];
    const senderId = messaging?.sender?.id;
    const userText = messaging?.message?.text;
    const facebookPageId = entry?.id;

    if (!userText || !senderId) {
      return NextResponse.json({ status: "no message" });
    }

    // 1. მაღაზიის პოვნა
    const shop = await getShopById(facebookPageId);
    if (!shop) {
      console.error(`❌ Shop not found for Page ID: ${facebookPageId}`);
      return NextResponse.json({ status: "shop not found" }, { status: 404 });
    }

    const shopId = shop.id;
    const facebookAccessToken = shop.facebook_access_token;

    // 2. სესიის წამოღება ან შექმნა (ეს აუცილებელია!)
    let session = await getOrCreateSession(shopId, senderId);
    if (session?.state === "completed") {
      const minutesPast = (new Date() - new Date(session.updated_at)) / 60000;

      if (minutesPast > 1) {
        session = await resetSessionState(session.id);
      }
    }

    // 3. ✅ ვინახავთ იუზერის გამოგზავნილ მესიჯს
    await addMessageToSession(shopId, senderId, {
      role: "user",
      content: userText,
    });

    // 🛑 თუ ჩატი დასრულებულია, აღარ ვაწვალებთ AI-ს
    if (session.state === "completed") {
      await sendToMeta(
        facebookAccessToken,
        senderId,
        "მოთხოვნა უკვე მივიღეთ 😊 მალე დაგიკავშირდებიან.",
      );
      return NextResponse.json({ status: "already_completed" });
    }

    // 4. AI ლოგიკა
    let ai;
    try {
      let draft = { ...(session.draft ?? {}) };
      const phone = extractPhone(userText);
      if (!draft.phone && phone) draft.phone = phone;

      // Gemini-ს ვაწვდით სესიას, რომელშიც უკვე არის წინა მესიჯები (კონტექსტისთვის)
      ai = await aiResponse(shop, { ...session, draft }, userText);

      if (ai.extracted) {
        draft = smartMergeDraft(draft, ai.extracted);
      }

      // ✅ თუ ყველა ველი შევსებულია (Lead Completion)
      if (isComplete(shop.required_fields, draft)) {
        await createRequest(shop.id, senderId, draft);
        await saveSessionDraft(shopId, senderId, {}, "completed");

        const finalNote =
          "მადლობა 🙌 მოთხოვნა მივიღეთ და მალე დაგიკავშირდებიან.";
        await addMessageToSession(shopId, senderId, {
          role: "model",
          content: finalNote,
        });
        await sendToMeta(facebookAccessToken, senderId, finalNote);

        return NextResponse.json({ status: "completed" });
      }

      // პროგრესის შენახვა
      await saveSessionDraft(shopId, senderId, draft, "collecting");
    } catch (aiErr) {
      console.error("❌ AI Error:", aiErr.message);
      await sendToMeta(
        facebookAccessToken,
        senderId,
        "ბოდიში, ტექნიკური ხარვეზია. ცოტა ხანში შემეხმიანე.",
      );
      return NextResponse.json({ status: "ai_fail" });
    }

    // 5. ბოტის პასუხის შენახვა და გაგზავნა
    const botReply = ai.reply || "ვერ გავიგე 😅 გთხოვ დამიზუსტე რას გულისხმობ?";

    // ✅ ვინახავთ ბოტის პასუხსაც ისტორიაში
    await addMessageToSession(shopId, senderId, {
      role: "model",
      content: botReply,
    });

    await sendToMeta(facebookAccessToken, senderId, botReply);

    return NextResponse.json({ status: "ok" });
  } catch (globalErr) {
    console.error("🚨 CRITICAL ERROR:", globalErr.message);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
