import { getShopByPlatformId } from "@/lib/actions/shopActions";
import {
  getSearchTerm,
  getGeminiResponse,
} from "@/lib/actions/geminiServiceForComments"; // დარწმუნდი რომ აქედან მოგაქვს
import { searchInventory } from "../actions/productActions";
import {
  addMessageToSession,
  saveSessionDraft,
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


export async function handleInstagramCommentLogic(body) {
  const entry = body.entry?.[0];
  const change = entry?.changes?.[0];
  const value = change?.value;
  const senderId = value.from?.id;
  const platformId = entry?.id; // Instagram Business Account ID

  
   if (value.from?.id === platformId) {
     // 🛑 2. თუ კომენტარის ავტორი თვითონ ჩვენი ბიზნესია (საკუთარ თავს არ ვპასუხობთ)
     console.log("⏩ Ignoring self-comment (Bot reply)");
     return;
   }



  const userText = value.text;
  const commentId = value.id;
  const postId = value.media?.id; // ინსტაგრამზე პოსტის აიდი აქ არის

  const shop = await safeGetShopByPlatformId(platformId);
  if (!shop || !shop.bot_enabled) {
    console.log("ℹ️ Shop not found or bot disabled.");
    return;
  }

  
  await safeAddMessage(shop.id, senderId, {
    role: "user",
    text: userText,
  });

  try {
    // 2. მაღაზიის პოვნა
    const shop = await safeGetShopByPlatformId(platformId);
    if (!shop || !shop.bot_enabled) {
      console.log("ℹ️ Shop not found or bot disabled.");
      return;
    }

    // 3. პოსტის კონტექსტის წამოღება (რომ ბოტმა იცოდეს რაზეა საუბარი)
    const postDetails = await safeGetPostDetails(
      postId,
      shop.facebook_access_token,
    );
    const postContext = postDetails
      ? `Post Caption: ${postDetails.caption}`
      : "";

    // 4. Gemini-ს ვეკითხებით რას ეძებს იუზერი
    const searchTerm = await safeGetSearchTerm(postContext);
    let inventoryInfo = "";

    if (searchTerm && searchTerm !== "none") {
      // 5. ინვენტარში ძებნა
      const products = await safeSearchInventory(searchTerm, shop.id);
      inventoryInfo = JSON.stringify(products);
    }

     safeSaveDraft(
       shop.id,
       senderId,
       { product: searchTerm }, 
       "collecting", 
     );

    // 6. Gemini-ს საბოლოო პასუხის გენერაცია
    
    const ai = await getGeminiResponse(
      userText,
      postContext,
      inventoryInfo
    );

   safeAddMessage(shop.id, senderId, {
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

    // ა) საჯარო პასუხი
   
      await safeSendPublic(
        commentId,
        answer,
        shop.facebook_access_token,
      );
    

    // ბ) პირადი პასუხი (თუ AI-მ გადაწყვიტა ან მაღაზიას უნდა)
   
      await safeSendPrivate(
        commentId,
        ai.answer,
        shop.facebook_access_token,
      );
    

    console.log("✅ Instagram Comment Processed Successfully");
  } catch (error) {
    console.error("❌ Critical IG Comment Logic Error:", error);
  }
}
