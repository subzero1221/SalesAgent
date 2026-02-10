
import { getShopByPlatformId } from "@/lib/actions/shopActions";
import { parseProductFromText } from "../actions/geminiServiceForMessages";
import { parsePostToProduct } from "../actions/geminiAutoUploadProductService";
import { supabaseAdmin } from "../supabaseAdmin";





async function getPostFullDetails(postId, token) {
  try {
    const res = await fetch(
      `https://graph.facebook.com/v24.0/${postId}?fields=message,full_picture&access_token=${token}`,
    );
    return await res.json();
  } catch (error) {
    return null;
  }
}

export async function handlePostLogic(body) {
  const entry = body.entry?.[0];
  const change = entry?.changes?.[0];
  const value = change?.value;

  // 🛑 FILTER: We only want NEW POSTS (Photos, Statuses, Links)
  // We ignore comments, likes, etc.
  // Usually item is 'photo', 'status', 'video', or 'post' and verb is 'add'
  const validItems = ["photo", "status", "share", "video", "post"];
  if (!validItems.includes(value.item) || value.verb !== "add") return;

  const platformId = entry.id; // Page ID

  // 1. Check Shop & Toggler
  const shop = await getShopByPlatformId(platformId);

  // If shop doesn't exist OR Auto-Import is OFF -> STOP.
  if (!shop || !shop.auto_import_products) {
    console.log(`✋ Auto-Import is OFF for shop ${shop?.name || platformId}`);
    return;
  }

  const postId = value.post_id;

  console.log(`📥 Processing New Post for Import: ${postId}`);

  try {
    // 2. Get Full Post Details (Caption + Image)
    const postDetails = await getPostFullDetails(
      postId,
      shop.facebook_access_token,
    );
    const caption = postDetails?.message || "";
    const imageUrl = postDetails?.full_picture || "";

    if (!caption) return; // Can't extract product from empty text

    // 3. Ask Gemini to extract data
    const productData = await parsePostToProduct(caption, imageUrl);

    // 4. Validate & Insert
    if (productData && productData.is_product) {

      
      
      // 4. ზომების გარდაქმნა {"KEY": "VALUE"} ფორმატში
      // მაგ: ["40", "41"] -> {"40": 1, "41": 1}
     


      // Prepare data for DB
   const variations =
     productData.visual_appearance?.length > 0
       ? productData.visual_appearance
       : [null];

   

   // ვქმნით პროდუქტების მასივს ბაზაში ჩასაწერად
   const productsToInsert = variations.map((appearance) => ({
     shop_id: shop.id,
     user_id: shop.owner_user_id, 
     name: productData.name,
     brand: productData.brand || productData.name.split(" ")[0],
     description: productData.description,
     price: productData.price,
     image_url: imageUrl,
     visual_appearance: appearance, 
     stock: productData.stock || {},
     created_at: new Date().toISOString(),
   }));

   // ერთიანად ვუშვებთ ბაზაში (Bulk Insert)
   const { error } = await supabaseAdmin
     .from("products")
     .insert(productsToInsert);

      if (error) {
        console.error("❌ Failed to insert product:", error);
      } else {
        console.log(
          `✅ AUTO-IMPORTED: ${productData.name} - ${productData.price} GEL`,
        );
        // Optional: Send Telegram Notification to Owner "New Product Added!"
      }
    } else {
      console.log("🤖 Gemini said this is not a product.");
    }
  } catch (err) {
    console.error("❌ Post Logic Error:", err);
  }
}
