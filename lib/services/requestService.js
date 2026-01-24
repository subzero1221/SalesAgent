import { createClient } from "../supabaseServer";
import { supabaseAuth } from "../supabaseClient";

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
