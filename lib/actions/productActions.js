"use server"
import { supabaseAdmin } from "../supabaseAdmin";
import { createClient } from "../supabaseServer";

export async function searchInventory(searchTerm, shopId) {
  
  if (!searchTerm || searchTerm === "none") return [];

  try {
    const { data, error } = await supabaseAdmin.rpc(
      "search_products_optimized",
      {
        search_term: searchTerm,
        target_shop_id: shopId, // 👈 ეს აუცილებელია ახალი SQL-ისთვის!
      },
    );

    // 2. ერორების დაჭერა
    if (error) {
      console.error("❌ Inventory Search Error:", error);
      return [];
    }

    // 3. ვაბრუნებთ შედეგს (SQL უკვე ალაგებს similarity_score-ის მიხედვით)
    return data || [];
  } catch (err) {
    console.error("🔥 Critical Search Error:", err);
    return [];
  }
}

export async function getAllProducts(shopId) {
  try {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select("id, name, brand, price, visual_appearance, stock, id, product_image_url")
      .eq("shop_id", shopId);

    if (error) {
      console.error("Error fetching names:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Unexpected error:", err);
    return [];
  }
}



export async function getShopProductCount(shopId) {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })

  if (error) {
    console.error("Error fetching product count:", error);
    return 0;
  }

  return count || 0;
}