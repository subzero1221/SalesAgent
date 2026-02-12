"use server"
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";
import { syncShopLogoToStorage } from "./mediaActions";


export async function getShopByPlatformId(platformId) {
  const { data, error } = await supabaseAdmin
    .from("shops")
    .select("*")
    .or(
      `facebook_page_id.eq.${platformId},instagram_page_id.eq.${platformId}`,
    )
    .single();

  if (error) {
    console.error("Shop lookup error:", error);
    return null;
  }
  return data;
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
  const instagramId = page.instagram_business_account?.id || null;

  // 1. ვიღებთ დროებით ლინკს Meta-დან
  const tempLogoUrl = page.picture?.data?.url || null;

  // 2. ვინახავთ/ვაახლებთ მაღაზიის მონაცემებს
  const { data, error } = await supabaseAdmin
    .from("shops")
    .upsert(
      {
        facebook_page_id: page.id,
        name: page.name,
        facebook_access_token: page.access_token,
        instagram_page_id: instagramId,
        owner_user_id: ownerId,
        logo_url: tempLogoUrl, // თავიდან ვინახავთ დროებითს
        updated_at: new Date(),
      },
      { onConflict: "facebook_page_id" },
    )
    .select()
    .single();

  if (error) throw error;

 
  if (tempLogoUrl) {
    syncShopLogoToStorage(data.id, tempLogoUrl, ownerId).catch(console.error);
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

export async function togglePublicReply(shopId, status) {
 const supabase = await createClient();

 const { data, error } = await supabase
   .from("shops")
   .update({ answer_publicly: status })
   .eq("id", shopId)
   .select()
   .single();

 if (error) {
   console.error("❌ Supabase Update Error:", error);
   throw new Error(error.message);
 }

 return data;
}

export async function toggleAutoImport(shopId, status) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shops")
    .update({ auto_import_products: status })
    .eq("id", shopId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateCustomPublicText(shopId, text) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shops")
    .update({ custom_public_text: text })
    .eq("id", shopId);
  if (error) throw error;
  return data;
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