import { getShopByPlatformId } from "@/lib/actions/shopActions";
import {
  getSearchTerm,
  getGeminiResponse,
} from "@/lib/actions/geminiServiceForComments"; // დარწმუნდი რომ აქედან მოგაქვს
import { searchInventory } from "../actions/productActions";
import { addMessageToSession, saveSessionDraft,  getLatestSession,
  createNewSession } from "../actions/sessionActions";

// --- Helper Functions ---

// 1. საჯარო პასუხი კომენტარზე
async function sendPublicComment(commentId, text, token) {
  console.log("📢 Sending public comment:", text);
  try {
    await fetch(
      `https://graph.facebook.com/v24.0/${commentId}/comments?access_token=${token}`,
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
async function sendPrivateReply(commentId, text, token) {
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
      `https://graph.facebook.com/v24.0/${postId}?fields=message,full_picture&access_token=${token}`,
    );
    return await res.json();
  } catch (error) {
    console.error("❌ Error fetching post details:", error);
    return null;
  }
}

// --- Main Logic ---

export async function handleFeedLogic(body) {
  const entry = body.entry?.[0];
  const change = entry?.changes?.[0];
  const value = change?.value;

  // ფილტრები: მხოლოდ კომენტარები, არა ლაიქები/ედიტები
  if (value.item !== "comment" || value.verb !== "add") return;

  const platformId = entry.id;
  const senderId = value.from?.id;
  const commentId = value.comment_id || value.id;
  const commentText = value.message;
  const postId = value.post_id;

  // საკუთარ თავზე არ ვპასუხობთ
  if (senderId === platformId) return;

  // მაღაზიის შემოწმება
  const shop = await getShopByPlatformId(platformId);
  if (!shop || !shop.bot_enabled) return;
  const shopId = shop.id;

  console.log(`💬 Processing Comment from ${senderId}: "${commentText}"`);

    // 1. ვიღებთ პოსტის კონტექსტს
    let session = await getLatestSession(shopId, senderId);


if (!session) {
  session = await createNewSession(shopId, senderId);
}

  try {
  

    await addMessageToSession(session.id, {
      role: "user",
      content: `Comment on post: "${commentText}"`,
    });

    const postDetails = await getPostDetails(
      postId,
      shop.facebook_access_token,
    );
    const postCaption = postDetails?.message || ""; // ტექსტი შეიძლება არ იყოს
    console.log("📄 Post Caption:", postCaption);

    // 2. AI არკვევს, რას ეძებს იუზერი (Intent + Search Term)
    const productName = await getSearchTerm(postCaption);
    console.log("🕵️ Extracted Product Name:", productName);

    try {
        await saveSessionDraft(
          session.id,
          { product: productName}, // Draft Data
          "collecting" // State-ს ვაბრუნებთ საწყისზე
        );
        console.log(`✅ Session Draft updated for term: ${productName}`);
      } catch (e) {
        console.error("⚠️ Draft save error:", e);
      }
    

    // 3. ვეძებთ ბაზაში (Inventory Search)
    let foundProducts = [];
    if (productName && productName !== "none") {
      // აქ ვიძახებთ შენს ახალ "search_products_optimized" ლოგიკას
      foundProducts = await searchInventory(productName, shop.id);
      console.log(`📦 Found ${foundProducts.length} matching products in DB.`);
    }

    // 4. Gemini აგენერირებს პასუხებს (ინვენტარის გათვალისწინებით)
    const aiResponse = await getGeminiResponse(
      commentText,
      postCaption,
      foundProducts,
    );

    try {
      await addMessageToSession(session.id, {
        role: "model",
        text: JSON.stringify(aiResponse),
      });
    } catch (e) {
      console.error("History save error (Bot):", e);
    }

  
    let publicAnswer;

    if (shop.answer_publicly) {
      publicAnswer = aiResponse.answer;
    } else {
      publicAnswer =
        shop.custom_public_text ||
        "მოგწერეთ პირადში, დეტალებს მალე მოგწერთ! 😊";
    }

    // 6. პასუხების გაგზავნა

    // ა) საჯაროდ (სტატიკური ან AI)
    await sendPublicComment(
      commentId,
      publicAnswer,
      shop.facebook_access_token,
    );

    // ბ) პირადში (ყოველთვის AI - სრული დეტალებით)
    await sendPrivateReply(
      commentId,
      aiResponse.answer,
      shop.facebook_access_token,
    );

    console.log("✅ Cycle Completed Successfully!");
  } catch (err) {
    console.error("❌ Feed Logic Critical Error:", err);
  }
}
