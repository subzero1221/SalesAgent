"use server"
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";

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


export async function incrementMessagesSpent(shopId) {
  await supabaseAdmin.rpc("increment_message_count", {
    row_id: shopId,
  });
}

export async function toggleBotStatus(shopId, enabled) {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from("shops")
      .update({ bot_enabled: enabled })
      .eq("id", shopId)
      .select()
      .single();

    if (error) {
      console.error("❌ Supabase Error:", error);
      throw new Error(error.message);
    }

    // ეს ხაზი აიძულებს Next.js-ს, რომ Dashboard-ის მონაცემები ხელახლა წამოიღოს
    revalidatePath("/dashboard");

    return data;
  } catch (err) {
    console.error("❌ Action Error:", err);
    throw err;
  }
}

export async function getShopWithActiveSubscription(shopId) {
  // იყენებს ქუქიებს -> RLS მუშაობს -> უსაფრთხოა!
  const supabase = await createClient();

  const { data: shop, error } = await supabase
    .from("shops")
    .select(
      `
      *,
      subscriptions (
        plan_type,
        end_date,
        status
      )
    `,
    )
    .eq("id", shopId)
    .single();

  if (error) {
    console.error("Error fetching shop subscription:", error);
    return null;
  }

  return shop;
}
// ეს დაალაგებს, რომ shop.subscriptions[0] იყოს აქტიური პლანი