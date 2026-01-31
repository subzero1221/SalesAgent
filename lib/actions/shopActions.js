import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient } from "@/lib/supabaseServer";

export async function getShopByFacebookId(shopId) {
  console.log("getShopByFacebookId called with shopId:", shopId);
  if (!shopId) throw new Error("Missing shopId");
  console.log("supabaseAdmin has from:", typeof supabaseAdmin.from);

  const { data: shop, error } = await supabaseAdmin
    .from("shops")
    .select("*")
    .eq("facebook_page_id", shopId)
    .single();

    console.log("Fetched shop data:", shop, "Error:", error);

  if (error) throw error;
  return shop;
}

export async function getShopById(shopId) {

  if (!shopId) throw new Error("Missing shopId");
  
  const { data: shop, error } = await supabaseAdmin
    .from("shops")
    .select("*")
    .eq("id", shopId)
    .single();

  console.log("Fetched shop data:", shop, "Error:", error);

  if (error) throw error;
  return shop;
}

export async function saveShopData(page, ownerId) {
  const { data, error } = await supabaseAdmin
    .from("shops")
    .upsert(
      {
        owner_user_id: ownerId, // ეს არის "Key" სადაც ეძებს
        facebook_page_id: page.id,
        facebook_access_token: page.access_token,
        name: page.name,
        bot_enabled: true, // შეგიძლია Default მნიშვნელობებიც მიცე
        mode: "lead_only",
      },
      {
        onConflict: "facebook_page_id", // ეუბნები Supabase-ს: თუ ეს ID უკვე გვაქვს, უბრალოდ განაახლე
      },
    )
    .select();

  if (error) {
    console.error("Supabase Upsert Error:", error.message);
    throw error;
  }
  return data;
}

export async function getMyShops() {
  const supabase = await createClient();
  // 1. გავიგოთ მიმდინარე იუზერი
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // 2. წამოვიღოთ ამ იუზერის მაღაზიები
  const { data: shops, error } = await supabase
    .from("shops")
    .select("*")
    .eq("owner_user_id", user.id); // ვიყენებთ owner_user_id-ს

  if (error) {
    console.error("Error fetching shops:", error);
    return [];
  }

  return shops;
}

export async function checkAndGetQuota(shop) {
  const lastReset = new Date(shop.last_reset_at);
  const now = new Date();

  // ვიგებთ რამდენი დღე გავიდა ბოლო განულებიდან
  const daysDiff = (now - lastReset) / (1000 * 60 * 60 * 24);

  // თუ 30 დღეზე მეტია გასული
  if (daysDiff >= 30) {
    const { data, error } = await supabaseAdmin
      .from("shops")
      .update({
        messages_sent_this_month: 0,
        last_reset_at: now.toISOString(),
      })
      .eq("id", shop.id)
      .select()
      .single();

    return data; // აბრუნებს განულებულ shop-ს
  }

  return shop; // აბრუნებს უცვლელ shop-ს
}

export async function incrementMessagesSpent(shopId) {
  await supabaseAdmin.rpc("increment_message_count", {
    row_id: shopId,
  });
}

