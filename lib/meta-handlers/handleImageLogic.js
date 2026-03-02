import { detectBrand, processImageQuery} from "../actions/geminiDescribeImage";
import { getShopByPlatformId } from "../actions/shopActions";
import { supabaseAdmin } from "../supabaseAdmin";
import { sendToMeta } from "./handleMessageEvent";

export async function handleImageLogic(body){
   const entry = body.entry?.[0];
   const messaging = entry?.messaging?.[0];
   const senderId = messaging?.sender?.id;
   const platformId = entry?.id;
   const attachment = messaging.message.attachments.at(0)
   const imageUrl = attachment.payload.url
   
   const shop = await getShopByPlatformId(platformId);
     if (!shop) return;
   
     const { id: shopId, facebook_access_token: token } = shop;
   
     if (shop.bot_enabled === false) {
       console.log(`ℹ️ ბოტი გათიშულია მაღაზიისთვის: ${shop.name}`);
       return;
     }
   
     const { data: quota, error: quotaErr } = await supabaseAdmin.rpc(
       "check_shop_quota",
       {
         target_shop_id: shop.id,
       },
     );
     console.log("Quota:", quota);
     if (quotaErr || !quota) {
       console.error("❌ Quota RPC failed:", quotaErr);
   
       return;
     }
   
 
     if (quota.can_proceed === false) { 
       return;
     }
    
    const imageResponse = "გთხოვთ მომწეროთ, მოდელის დასახელება."
    await sendToMeta(token, senderId, imageResponse);     
   
}