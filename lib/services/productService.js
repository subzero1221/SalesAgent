import { supabaseClient } from "@/lib/supabaseClient"; // შენი კლიენტის სახელით

// 1. პროდუქტის დამატება ბაზაში
export async function uploadProduct(productData, shopId, userId) {
  try {
    const { data, error } = await supabaseClient
      .from("products")
      .insert([
        {
          shop_id: shopId,
          user_id: userId,
          name: productData?.name,
          description: productData?.description,
          brand: productData?.brand,
          price: productData?.price,
          stock: productData?.stock,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error uploading product:", error.message);
    return { data: null, error: error.message };
  }
}

// 2. მაღაზიის ყველა პროდუქტის წამოღება
export async function getShopProducts(shopId) {
  try {
    const { data, error } = await supabaseClient
      .from("products")
      .select("*")
      .eq("shop_id", shopId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error fetching products:", error.message);
    return { data: null, error: error.message };
  }
}

export async function deleteProduct(productId) {
  const { error } = await supabaseAuth
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) throw error;
  return true;
}

export async function updateProductPrice(productId, newPrice) {
  if (newPrice < 0) throw new Error("ფასი არ შეიძლება იყოს უარყოფითი");
  const { data, error } = await supabaseClient
    .from("products")
    .update({ price: newPrice })
    .eq("id", productId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
