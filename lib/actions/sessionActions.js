import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { supabaseAuth } from "@/lib/supabaseClient";
import { createClient } from "../supabaseServer";

export async function getOrCreateSession(shopId, senderId) {
  // 1) Try get
  const { data: existing } = await supabaseAdmin
    .from("sessions")
    .select("*")
    .eq("shop_id", shopId)
    .eq("sender_id", senderId)
    .single();

  if (existing) return existing;

  // 2) Create if not exists
  const { data: created, error } = await supabaseAdmin
    .from("sessions")
    .insert({
      shop_id: shopId,
      sender_id: senderId,
      draft: {},
      state: "browsing",
    })
    .select()
    .single();

  if (error) throw error;
  return created;
}

export async function getLatestSession(shopId, senderId) {
  const { data: session } = await supabaseAdmin
    .from("sessions")
    .select("*")
    .eq("shop_id", shopId)
    .eq("sender_id", senderId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return session;
}

export async function createNewSession(shopId, senderId) {
  const { data: session, error } = await supabaseAdmin
    .from("sessions")
    .insert({
      shop_id: shopId,
      sender_id: senderId,
      draft: {},
      state: "collecting",
    })
    .select()
    .single();
 
  console.log("Created new session:", session, "Error:", error);

  if (error) {
    console.error("Error creating new session:", error);
    return null;  
  }
  return session;
}

export async function saveSessionDraft(sessionId, draft, state) {
  const payload = {
    draft: draft,
    updated_at: new Date().toISOString(),
  };

  if (state) payload.state = state;

  const { error } = await supabaseAdmin
    .from("sessions")
    .update(payload) // 👈 Simple update
    .eq("id", sessionId); // 👈 Targeting the exact session!

  if (error) throw error;
}

export async function addMessageToSession(sessionId, message) {
  const { data: session, error: fetchError } = await supabaseAdmin
    .from("sessions")
    .select("messages")
    .eq("id", sessionId) 
    .single();

  if (fetchError) throw fetchError;

  const currentMessages = session?.messages || [];

 
  const updatedMessages = [
    ...currentMessages,
    { ...message, timestamp: new Date().toISOString() },
  ];

 
  const { error: updateError } = await supabaseAdmin
    .from("sessions")
    .update({
      messages: updatedMessages,
      updated_at: new Date().toISOString(),
    })
    .eq("id", sessionId); 

  if (updateError) throw updateError;
  return updatedMessages;
}


export async function getSessionsCount(shopId) {
  const supabse = await createClient()
  const { count, error } = await supabse.from("sessions")
    .select("*", { count: "exact", head: true })
    .eq("shop_id", shopId);
  if (error) {
    console.error("Error getting sessions count:", error);
    return 0;
  }
  return count || 0;
}