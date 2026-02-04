"use server"
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";
import { createDemoSubscription } from "@/lib/actions/subscriptionActions";

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
  // 1. ვეძებთ არსებულ მაღაზიას
  const { data: existingShop } = await supabaseAdmin
    .from("shops")
    .select("id, status")
    .eq("facebook_page_id", page.id)
    .single();

  // 2. Upsert მაღაზიის ცხრილში (ლიმიტების ჩათვლით)
  const { data: shopData, error: shopError } = await supabaseAdmin
    .from("shops")
    .upsert(
      {
        owner_user_id: ownerId,
        facebook_page_id: page.id,
        facebook_access_token: page.access_token,
        name: page.name,
        bot_enabled: true,
        status: "active",
      
        ...(!existingShop && {
          message_limit: 50,
          messages_sent_this_month: 0, 
          product_limit: 50,
        }),
      },
      { onConflict: "facebook_page_id" },
    )
    .select()
    .single();

  if (shopError) throw shopError;

  // 3. Subscription ჩანაწერის შექმნა მხოლოდ ახალი მაღაზიისთვის
  if (!existingShop) {
    console.log("Creating new shop and demo sub...");
    await createDemoSubscription(shopData.id);
  }

  return shopData;
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