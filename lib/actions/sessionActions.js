import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { supabaseAuth } from "@/lib/supabaseClient";

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
