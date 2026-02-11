const { supabaseAdmin } = require("../supabaseAdmin");

export async function syncShopLogoToStorage(shopId, metaUrl, ownerId) {
  try {
 
    const res = await fetch(metaUrl);
    const blob = await res.blob();

  
    const filePath = `${ownerId}/shop_${shopId}_logo.jpg`;

 
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("shop_assets")
      .upload(filePath, blob, { upsert: true });

    if (uploadError) throw uploadError;

    
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from("shop_assets").getPublicUrl(filePath);

    
    await supabaseAdmin
      .from("shops")
      .update({ logo_url: publicUrl })
      .eq("id", shopId);

    console.log(`✅ Logo secured for shop ${shopId}`);
  } catch (err) {
    console.error("❌ Sync failed:", err.message);
  }
}
