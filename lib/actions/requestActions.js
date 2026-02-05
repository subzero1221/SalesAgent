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

export async function getRequests(shopId, page = 1, pageSize = 10) {
  const supabase = await createClient();

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const {
    data: requests,
    error,
    count,
  } = await supabase
    .from("requests")
    .select(`*, shops ( name )`, { count: "exact" })
    .eq("shop_id", shopId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error fetching requests:", error);
    return { data: [], count: 0 };
  }

  return { data: requests, count };
}

export async function getRequestCount(shopId) {
  const supabase = await createClient();  
  const { count, error } = await supabase.from("requests")
    .select("*", { count: "exact", head: true })
    .eq("shop_id", shopId);
  if (error) {
    console.error("Error getting request count:", error);
    return 0;
  }
  return count || 0;
}