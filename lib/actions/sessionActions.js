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

export async function saveSessionDraft(shopId, senderId, draft, state) {
  const update = { draft };

  if (state) update.state = state;

  const { error } = await supabaseAdmin
    .from("sessions")
    .update(update)
    .eq("shop_id", shopId)
    .eq("sender_id", senderId);

  if (error) throw error;
}

export async function addMessageToSession(shopId, senderId, message) {
  // 1. ჯერ წამოვიღოთ არსებული მესიჯები
  const { data: session } = await supabaseAdmin
    .from("sessions")
    .select("messages")
    .eq("shop_id", shopId)
    .eq("sender_id", senderId)
    .single();

  const currentMessages = session?.messages || [];

  // 2. დავამატოთ ახალი (message უნდა იყოს { role: 'user'/'model', content: '...' })
  const updatedMessages = [
    ...currentMessages,
    { ...message, timestamp: new Date().toISOString() },
  ];

  // 3. შევინახოთ
  const { error } = await supabaseAdmin
    .from("sessions")
    .update({ messages: updatedMessages, updated_at: new Date().toISOString() })
    .eq("shop_id", shopId)
    .eq("sender_id", senderId);

  if (error) throw error;
  return updatedMessages;
}

export async function resetSessionState(sessionId) {
 

  const { data, error } = await supabaseAdmin
    .from("sessions")
    .update({
      state: "collecting",
      draft: {}, // აქ შეგიძლია default მნიშვნელობები ჩაწერო
      updated_at: new Date().toISOString(),
    })
    .eq("id", sessionId)
    .select()
    .single();

  if (error) {
    console.error("Error resetting session:", error);
    return null;
  }

  return data;
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