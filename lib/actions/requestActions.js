import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient } from "@/lib/supabaseServer";

export async function createRequest(shopId, senderId, draft) {
  const { error } = await supabaseAdmin.from("requests").insert({
    shop_id: shopId,
    sender_id: senderId,
    request: draft,
    status: "new",
  });

  if (error) throw error;
}

export async function getRecentRequests() {
  const supabase = await createClient(); //

  const { data: requests, error } = await supabase
    .from("requests")
    .select(
      `
      *,
      shops ( name )
    `,
    )
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("Error fetching requests:", error);
    return [];
  }
  return requests;
}
