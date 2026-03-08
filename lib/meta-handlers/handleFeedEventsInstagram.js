import { getShopByPlatformId } from "@/lib/actions/shopActions";
import {
  getSearchTerm,
  getGeminiResponse,
} from "@/lib/actions/geminiServiceForComments"; // დარწმუნდი რომ აქედან მოგაქვს
import { searchInventory } from "../actions/productActions";
import {
  addMessageToSession,
  saveSessionDraft,
    getLatestSession,
  createNewSession,
} from "../actions/sessionActions";
import { safeTask } from "../helpers/tools";

// --- Helper Functions ---

// 1. საჯარო პასუხი კომენტარზე
async function sendInstagramPublicComment(commentId, text, token) {
  console.log("📢 Sending public comment:", text);
  try {
    await fetch(
      `https://graph.facebook.com/v24.0/${commentId}/replies?access_token=${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      },
    );
  } catch (e) {
    console.error("❌ Failed to send public comment:", e);
  }
}

// 2. პირადი პასუხი (Private Reply)
async function sendInstagramPrivateReply(commentId, text, token) {
  console.log("📩 Sending private reply...");
  try {
    await fetch(
      `https://graph.facebook.com/v24.0/me/messages?access_token=${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: { comment_id: commentId },
          message: { text: text },
        }),
      },
    );
  } catch (e) {
    console.error("❌ Failed to send private reply:", e);
  }
}

// 3. პოსტის ინფოს (სურათი + ტექსტი) წამოღება
async function getPostDetails(postId, token) {
  try {
    const res = await fetch(
      `https://graph.facebook.com/v24.0/${postId}?fields=caption,media_url&access_token=${token}`,
    );
    return await res.json();
  } catch (error) {
    console.error("❌ Error fetching post details:", error);
    return null;
  }
}

const safeSaveDraft = safeTask(saveSessionDraft);
const safeAddMessage = safeTask(addMessageToSession);
const safeSendPublic = safeTask(sendInstagramPublicComment);
const safeSendPrivate = safeTask(sendInstagramPrivateReply);
const safeGetShopByPlatformId = safeTask(getShopByPlatformId);
const safeGetPostDetails = safeTask(getPostDetails);
const safeGetSearchTerm = safeTask(getSearchTerm);
const safeSearchInventory = safeTask(searchInventory);
const safeGetLatestSession = safeTask(getLatestSession);
const safeCreateNewSession = safeTask(createNewSession);

export async function handleInstagramCommentLogic(body) {
  const entry = body.entry?.[0];
  const change = entry?.changes?.[0];
  const value = change?.value;
  const senderId = value.from?.id;
  const platformId = entry?.id; // Instagram Business Account ID

  if (value.from?.id === platformId) {
    console.log("⏩ Ignoring self-comment (Bot reply)");
    return;
  }

  const userText = value.text;
  const commentId = value.id;
  const postId = value.media?.id;

  const shop = await safeGetShopByPlatformId(platformId);
  if (!shop || !shop.bot_enabled) {
    console.log("ℹ️ Shop not found or bot disabled.");
    return;
  }

  let session = await safeGetLatestSession(shopId, senderId);


if (!session) {
  session = await safeCreateNewSession(shopId, senderId);
}

  await safeAddMessage(session.id, {
    role: "user",
    text: userText,
  });

  try {
    const shop = await safeGetShopByPlatformId(platformId);
    if (!shop || !shop.bot_enabled) {
      console.log("ℹ️ Shop not found or bot disabled.");
      return;
    }

    const postDetails = await safeGetPostDetails(
      postId,
      shop.facebook_access_token,
    );
    const postContext = postDetails
      ? `Post Caption: ${postDetails.caption}`
      : "";

    const searchTerm = await safeGetSearchTerm(postContext);
    let inventoryInfo = "";

    if (searchTerm && searchTerm !== "none") {
      const products = await safeSearchInventory(searchTerm, shop.id);
      inventoryInfo = JSON.stringify(products);
    }

    safeSaveDraft(session.id, { product: searchTerm }, "collecting");

    const ai = await getGeminiResponse(userText, postContext, inventoryInfo);

    safeAddMessage(session.id, {
      role: "model",
      text: JSON.stringify(ai),
    });

    let answer;

    if (shop.answer_publicly) {
      answer = ai.answer;
    } else {
      answer =
        shop.custom_public_text ||
        "მოგწერეთ პირადში, დეტალებს მალე მოგწერთ! 😊";
    }

    await safeSendPublic(commentId, answer, shop.facebook_access_token);

    await safeSendPrivate(commentId, ai.answer, shop.facebook_access_token);

    console.log("✅ Instagram Comment Processed Successfully");
  } catch (error) {
    console.error("❌ Critical IG Comment Logic Error:", error);
  }
}
