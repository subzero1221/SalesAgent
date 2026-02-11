import { supabaseClient } from "@/lib/supabaseClient"; // შენი კლიენტის სახელით

// 1. პროდუქტის დამატება ბაზაში
export async function uploadProduct(productData, shopId, userId) {
  console.log("Uploading product data:", productData);
  
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
          visual_appearance: productData?.visual_appearance,
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


export async function getShopProducts(shopId, page = 1, pageSize = 20) {
  try {
 
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabaseClient
      .from("products")
      .select("*", { count: "exact" }) 
      .eq("shop_id", shopId)
      .order("created_at", { ascending: false })
      .range(from, to); 

    if (error) throw error;

    return {
      data,
      count, 
      error: null,
    };
  } catch (error) {
    console.error("Error fetching products:", error.message);
    return { data: null, count: 0, error: error.message };
  }
}

export async function deleteProduct(productId) {
  const { error } = await supabaseClient
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

export const updateProductDetails = async (id, updates) => {

  const { data, error } = await supabaseClient
    .from("products")
    .update(updates)
    .eq("id", id)
    .select();

  if (error) throw error;
  return data;
};
