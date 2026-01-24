import { supabaseClient } from "@/lib/supabaseClient";



export async function getSessionsByShop(shopId) {
  const { data, error } = await supabaseClient
    .from("sessions")
    .select("*")
    .eq("shop_id", shopId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getSessionById(sessionId) {

  const { data, error } = await supabaseClient
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .single();
 
  if (error) throw error;
  return data;
}